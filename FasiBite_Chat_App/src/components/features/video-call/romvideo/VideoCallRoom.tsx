"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Room, RoomEvent, RoomOptions, VideoPresets, TrackPublishDefaults, RoomConnectOptions, Track } from "livekit-client";
import {
    RoomContext
} from "@livekit/components-react";
import {
    MessageCircle,
    Settings,
    Users
} from "lucide-react";
import { ParticipantsPanel } from "./ParticipantsPanel";
import { ChatPanel } from "./VideoChatPanel";
import { SettingsPanel } from "./SettingsPanel";
import { ScreenShareToggle } from "./ScreenShareToggle";
import { ScreenShareTextOverride } from "./ScreenShareTextOverride";
import { VideoConferenceWrapper } from "./VideoConferenceWrapper";
import { MicrophoneToggle } from "./MicrophoneToggle";
import { CameraToggle } from "./CameraToggle";
import { CallEndedScreen } from "./CallEndedScreen";
import { EndCallButton } from "./EndCallButton";
import { leaveVideoCall, checkVideoCallStatus, endVideoCallForAll } from "@/lib/api/customer/video-call";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoCallRoomProps {
    roomId: string;
    conversationId: number;
    groupName?: string;
    livekitToken?: string;
    livekitServerUrl?: string;
    settings?: string; // JSON string of settings from setup modal
    groupLeaderId?: string; // ID of the group leader
    onClose?: () => void;
}



export function VideoCallRoom({ roomId, conversationId, groupName = "Video Call", livekitToken, livekitServerUrl, settings, groupLeaderId, onClose }: VideoCallRoomProps) {
    const [room, setRoom] = useState<Room | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [isLeavingCall, setIsLeavingCall] = useState(false);
    const [callStatus, setCallStatus] = useState<{
        isActive: boolean;
        message?: string;
        isLoading: boolean;
    }>({
        isActive: true,
        isLoading: true
    });


    // Determine if user is host or admin
    const isHostOrAdmin = useMemo(() => {
        // For testing purposes, always return true to enable admin features
        // In real implementation, this should check against current user's role
        return true; // Always enable admin features for testing
    }, [groupLeaderId]);

    // Parse settings from URL params
    const parsedSettings = useMemo(() => {
        if (!settings) {
            return {
                cameraEnabled: false,
                microphoneEnabled: false,
                selectedCamera: null,
                selectedMicrophone: null,
                selectedSpeaker: null,
                useComputerAudio: true,
                usePhoneAudio: false
            };
        }

        try {
            return JSON.parse(settings);
        } catch (error) {
            return {
                cameraEnabled: false,
                microphoneEnabled: false,
                selectedCamera: null,
                selectedMicrophone: null,
                selectedSpeaker: null,
                useComputerAudio: true,
                usePhoneAudio: false
            };
        }
    }, [settings]);

    // Check call status on mount and when roomId changes
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        // Reset call status when roomId changes
        setCallStatus({
            isActive: true,
            isLoading: true
        });

        const checkStatus = async () => {
            try {
                // Add timeout to prevent hanging
                const timeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => reject(new Error('Timeout')), 5000);
                });

                const statusPromise = checkVideoCallStatus(roomId);
                const status = await Promise.race([statusPromise, timeoutPromise]) as any;

                setCallStatus({
                    isActive: status.isActive,
                    message: status.message,
                    isLoading: false
                });
            } catch (error) {
                // If API is not available (404), assume call is active for new calls
                if (error instanceof Error && error.message.includes('404')) {
                    setCallStatus({
                        isActive: true,
                        message: undefined,
                        isLoading: false
                    });
                } else {
                    setCallStatus({
                        isActive: false,
                        message: error instanceof Error && error.message === 'Timeout'
                            ? "Hết thời gian chờ kiểm tra trạng thái cuộc gọi"
                            : "Không thể kiểm tra trạng thái cuộc gọi",
                        isLoading: false
                    });
                }
            }
        };

        checkStatus();

        // Cleanup timeout on unmount or roomId change
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [roomId]);

    // Monitor and enforce settings after connection
    useEffect(() => {
        if (!room || !isConnected) return;

        const enforceSettings = async () => {
            try {
                // Check current state
                const isCameraEnabled = room.localParticipant.isCameraEnabled;
                const isMicrophoneEnabled = room.localParticipant.isMicrophoneEnabled;

                // Enforce camera setting
                if (parsedSettings.cameraEnabled !== isCameraEnabled) {
                    await room.localParticipant.setCameraEnabled(parsedSettings.cameraEnabled);
                }

                // Enforce microphone setting
                if (parsedSettings.microphoneEnabled !== isMicrophoneEnabled) {
                    // Resume AudioContext if enabling microphone
                    if (parsedSettings.microphoneEnabled) {
                        try {
                            // Try to access AudioContext through room's internal structure
                            const audioContext = (room as any).engine?.client?.audioContext ||
                                (room as any).engine?.audioContext ||
                                (room as any).audioContext;

                            if (audioContext && audioContext.state === 'suspended') {
                                await audioContext.resume();
                            }
                        } catch (error) {
                            // Silent error handling
                        }
                    }

                    await room.localParticipant.setMicrophoneEnabled(parsedSettings.microphoneEnabled);
                }
            } catch (error) {
                // Silent error handling
            }
        };

        // Enforce settings after a delay to allow LiveKit to stabilize
        const timeoutId = setTimeout(enforceSettings, 2000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [room, isConnected, parsedSettings.cameraEnabled, parsedSettings.microphoneEnabled]);

    // Handle AudioContext on mount
    useEffect(() => {
        const handleUserInteraction = async () => {
            // Resume AudioContext on any user interaction
            if (window.AudioContext || (window as any).webkitAudioContext) {
                try {
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                    if (audioContext.state === 'suspended') {
                        await audioContext.resume();
                    }
                } catch (error) {
                    // Silent error handling
                }
            }
        };

        // Add event listeners for user interaction
        const events = ['click', 'touchstart', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, handleUserInteraction, { once: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleUserInteraction);
            });
        };
    }, []);

    // Monitor track publications and enforce settings
    useEffect(() => {
        if (!room || !isConnected) return;

        const handleTrackPublished = (publication: any) => {
            // If microphone is disabled but audio track is published, unpublish it
            if (publication.kind === 'audio' && !parsedSettings.microphoneEnabled) {
                room.localParticipant.unpublishTrack(publication.track);
            }

            // If camera is disabled but video track is published, unpublish it
            if (publication.kind === 'video' && !parsedSettings.cameraEnabled) {
                room.localParticipant.unpublishTrack(publication.track);
            }
        };

        room.on(RoomEvent.TrackPublished, handleTrackPublished);

        return () => {
            room.off(RoomEvent.TrackPublished, handleTrackPublished);
        };
    }, [room, isConnected, parsedSettings.cameraEnabled, parsedSettings.microphoneEnabled]);

    const roomRef = useRef<Room | null>(null);

    // Room options
    const roomOptions = useMemo((): RoomOptions => {
        return {
            publishDefaults: {
                videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
                red: true,
                videoCodec: 'vp9',
            } as TrackPublishDefaults,
            adaptiveStream: { pixelDensity: 'screen' },
            dynacast: true,
        };
    }, []);

    // Connect options
    const connectOptions = useMemo((): RoomConnectOptions => {
        return {
            autoSubscribe: true,
        };
    }, []);

    // Initialize room
    useEffect(() => {
        const newRoom = new Room(roomOptions);
        roomRef.current = newRoom;
        setRoom(newRoom);

        // Event listeners
        const handleConnected = () => {
            setIsConnected(true);
        };

        const handleDisconnected = () => {
            setIsConnected(false);
            if (onClose) {
                onClose();
            }
        };


        newRoom.on(RoomEvent.Connected, handleConnected);
        newRoom.on(RoomEvent.Disconnected, handleDisconnected);

        // Connect to LiveKit room if token and server URL are provided and call is still active
        if (livekitToken && livekitServerUrl && (callStatus.isActive || callStatus.message?.includes("Không thể kiểm tra")) && !callStatus.isLoading) {
            newRoom.connect(livekitServerUrl, livekitToken, connectOptions)
                .then(async () => {
                    // Apply camera and microphone settings after connection
                    try {
                        // Wait for LiveKit to fully initialize
                        await new Promise(resolve => setTimeout(resolve, 1500));

                        // Force disable both camera and mic first
                        await newRoom.localParticipant.setCameraEnabled(false);
                        await newRoom.localParticipant.setMicrophoneEnabled(false);

                        // Wait for disable to take effect
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // Unpublish any existing tracks
                        const videoTracks = Array.from(newRoom.localParticipant.videoTrackPublications.values());
                        const audioTracks = Array.from(newRoom.localParticipant.audioTrackPublications.values());

                        for (const track of videoTracks) {
                            if (track.track) {
                                await newRoom.localParticipant.unpublishTrack(track.track);
                            }
                        }

                        for (const track of audioTracks) {
                            if (track.track) {
                                await newRoom.localParticipant.unpublishTrack(track.track);
                            }
                        }

                        // Wait for unpublish to complete
                        await new Promise(resolve => setTimeout(resolve, 500));

                        // Apply user settings
                        if (parsedSettings.cameraEnabled) {
                            await newRoom.localParticipant.setCameraEnabled(true);
                        }

                        if (parsedSettings.microphoneEnabled) {
                            // Resume AudioContext if needed
                            try {
                                const audioContext = (newRoom as any).engine?.client?.audioContext ||
                                    (newRoom as any).engine?.audioContext ||
                                    (newRoom as any).audioContext;

                                if (audioContext && audioContext.state === 'suspended') {
                                    await audioContext.resume();
                                }
                            } catch (error) {
                                // Silent error handling
                            }

                            await newRoom.localParticipant.setMicrophoneEnabled(true);
                        }

                        // Final wait to ensure settings are applied
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (error) {
                        // Silent error handling
                    }
                })
                .catch((error) => {
                    // Silent error handling for production
                });
        }

        return () => {
            newRoom.off(RoomEvent.Connected, handleConnected);
            newRoom.off(RoomEvent.Disconnected, handleDisconnected);

            // Proper cleanup to prevent layout errors
            try {
                // Stop all tracks first
                const videoTracks = Array.from(newRoom.localParticipant.videoTrackPublications.values());
                const audioTracks = Array.from(newRoom.localParticipant.audioTrackPublications.values());

                for (const track of videoTracks) {
                    if (track.track) {
                        track.track.stop();
                    }
                }

                for (const track of audioTracks) {
                    if (track.track) {
                        track.track.stop();
                    }
                }

                // Disconnect from room
                newRoom.disconnect();
            } catch (error) {
                // Silent error handling
            }
        };
    }, [roomOptions, connectOptions, livekitToken, livekitServerUrl, onClose, callStatus.isActive, callStatus.isLoading]);





    // Handle leave call
    const handleLeaveCall = async () => {
        if (isLeavingCall) return; // Prevent multiple clicks

        setIsLeavingCall(true);
        try {
            // Call API to leave the video call
            await leaveVideoCall(roomId);

            // Update call status to inactive
            setCallStatus({
                isActive: false,
                message: "Bạn đã rời khỏi cuộc gọi",
                isLoading: false
            });

            // Properly cleanup LiveKit room to prevent layout errors
            if (room) {
                try {
                    // Stop all tracks first
                    const videoTracks = Array.from(room.localParticipant.videoTrackPublications.values());
                    const audioTracks = Array.from(room.localParticipant.audioTrackPublications.values());

                    for (const track of videoTracks) {
                        if (track.track) {
                            track.track.stop();
                            await room.localParticipant.unpublishTrack(track.track);
                        }
                    }

                    for (const track of audioTracks) {
                        if (track.track) {
                            track.track.stop();
                            await room.localParticipant.unpublishTrack(track.track);
                        }
                    }

                    // Wait for cleanup to complete
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Disconnect from room
                    await room.disconnect();
                } catch (error) {
                    // Silent error handling
                }
            }

            // Close the room
            if (onClose) {
                onClose();
            }
        } catch (error) {
            // Still close the room even if API call fails
            if (room) {
                try {
                    await room.disconnect();
                } catch (disconnectError) {
                    // Silent error handling
                }
            }
            if (onClose) {
                onClose();
            }
        } finally {
            setIsLeavingCall(false);
        }
    };

    // Handle ending call for all participants
    const handleEndCallForAll = (message?: string, reason?: "ended_by_host" | "ended_by_user" | "connection_lost" | "unknown") => {
        // Update call status to inactive with custom message
        setCallStatus({
            isActive: false,
            message: message || "Cuộc gọi đã được kết thúc cho tất cả người tham gia",
            isLoading: false
        });

        // Properly cleanup LiveKit room to prevent layout errors
        if (room) {
            try {
                // Stop all tracks first
                const videoTracks = Array.from(room.localParticipant.videoTrackPublications.values());
                const audioTracks = Array.from(room.localParticipant.audioTrackPublications.values());

                for (const track of videoTracks) {
                    if (track.track) {
                        track.track.stop();
                        room.localParticipant.unpublishTrack(track.track);
                    }
                }

                for (const track of audioTracks) {
                    if (track.track) {
                        track.track.stop();
                        room.localParticipant.unpublishTrack(track.track);
                    }
                }

                // Wait for cleanup to complete
                setTimeout(() => {
                    room.disconnect();
                }, 500);
            } catch (error) {
                // Silent error handling
            }
        }
    };


    // Show loading state while checking call status
    if (callStatus.isLoading) {
        return (
            <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-cyan-500 mx-auto mb-4"></div>
                    <h2 className="text-white text-2xl font-semibold mb-2">Đang kiểm tra trạng thái cuộc gọi...</h2>
                    <p className="text-gray-400 text-lg">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    // Show call ended message if call is not active
    if (!callStatus.isActive) {
        // Determine reason based on message
        const reason = callStatus.message?.includes("rời khỏi") ? "ended_by_user" : "ended_by_host";
        return <CallEndedScreen message={callStatus.message} reason={reason} />;
    }

    if (!room) {
        return (
            <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-cyan-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Đang khởi tạo phòng...</p>
                </div>
            </div>
        );
    }

    if (!livekitToken || !livekitServerUrl) {
        return (
            <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-cyan-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Đang tải thông tin cuộc gọi...</p>
                    <p className="text-gray-400 text-sm mt-2">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="lk-room-container"
            data-lk-theme="default"
            data-lk-disconnected={!isConnected || !callStatus.isActive}
        >
            <RoomContext.Provider value={room}>
                <ScreenShareTextOverride />
                <div className="h-screen w-screen bg-background relative">
                    {/* Main Video Area */}
                    <div className={`h-full flex flex-col transition-all duration-300 ease-in-out ${showParticipants || showChat || showSettings ? 'pr-80' : ''}`}>
                        {/* Header */}
                        <div className="z-50 bg-gradient-to-b from-background/80 to-transparent p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-foreground font-medium">{groupName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Right side controls */}
                                    <Button
                                        onClick={() => setShowParticipants(!showParticipants)}
                                        className="rounded-full w-10 h-10 bg-muted hover:bg-accent text-muted-foreground"
                                        size="sm"
                                    >
                                        <Users className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        onClick={() => setShowChat(!showChat)}
                                        className="rounded-full w-10 h-10 bg-muted hover:bg-accent text-muted-foreground"
                                        size="sm"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        onClick={() => setShowSettings(!showSettings)}
                                        className="rounded-full w-10 h-10 bg-muted hover:bg-accent text-muted-foreground"
                                        size="sm"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Video Conference Area */}
                        <div className="flex-1 relative pb-20">
                            <VideoConferenceWrapper
                                chatMessageFormatter={(message: string) => message}
                                className="h-full w-full"
                            />
                        </div>

                        {/* Footer Controls */}
                        <div className="footer-controls">
                            <div className="flex items-center justify-center gap-6">
                                {/* Microphone Toggle */}
                                <MicrophoneToggle />
                                {/* Screen Share */}
                                <ScreenShareToggle />
                                {/* Camera Toggle */}
                                <CameraToggle />
                                {/* End Call Button */}
                                <EndCallButton
                                    sessionId={roomId}
                                    conversationId={conversationId}
                                    isHostOrAdmin={isHostOrAdmin}
                                    onCallEnded={(message, reason) => {
                                        setCallStatus({ isActive: false, isLoading: false, message: message || "Cuộc gọi đã kết thúc" });
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side Panels */}
                    <ParticipantsPanel
                        groupLeaderId={groupLeaderId}
                        onClose={() => setShowParticipants(false)}
                        isVisible={showParticipants}
                        sessionId={roomId}
                        isAdmin={isHostOrAdmin}
                    />

                    <ChatPanel
                        onClose={() => setShowChat(false)}
                        isVisible={showChat}
                    />

                    <SettingsPanel
                        onClose={() => setShowSettings(false)}
                        onEndCallForAll={handleEndCallForAll}
                        isLeavingCall={isLeavingCall}
                        isVisible={showSettings}
                        sessionId={roomId}
                        initialSettings={{
                            selectedCamera: parsedSettings.selectedCamera,
                            selectedMicrophone: parsedSettings.selectedMicrophone,
                            selectedSpeaker: parsedSettings.selectedSpeaker,
                        }}
                    />
                </div>
            </RoomContext.Provider>
        </div>
    );
}

