"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Room, RoomOptions, RoomConnectOptions, VideoPresets, Track } from "livekit-client";
import { RoomContext } from "@livekit/components-react";
import { joinVideoCall } from "@/lib/api/customer/video-call-api";
import { cn } from "@/lib/utils";
import { useLiveKitControls } from "@/hooks/useLiveKitControls";
import { stopAllMediaTracks } from "@/lib/utils/mediaCleanup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

// Component for 1-1 video layout
function VideoCall1v1Layout({
    room,
    partnerName,
    partnerAvatar,
    localUserName,
    localUserAvatar
}: {
    room: Room;
    partnerName?: string;
    partnerAvatar?: string;
    localUserName?: string;
    localUserAvatar?: string;
}) {
    const localParticipant = room.localParticipant;
    const remoteParticipants = Array.from(room.remoteParticipants.values());
    const remoteParticipant = remoteParticipants[0];

    // Get local video track
    const localVideoTrack = localParticipant.videoTrackPublications.values().next().value?.track;

    // Get remote video track
    const remoteVideoTrack = remoteParticipant?.videoTrackPublications.values().next().value?.track;

    // Check if camera is actually enabled (not just if track exists)
    const isLocalCameraEnabled = localParticipant.isCameraEnabled;
    const isRemoteCameraEnabled = remoteParticipant?.isCameraEnabled ?? false;

    // Create video elements
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Attach video tracks to video elements only when camera is enabled
    useEffect(() => {
        if (localVideoTrack && localVideoRef.current && isLocalCameraEnabled) {
            localVideoTrack.attach(localVideoRef.current);
        } else if (localVideoRef.current) {
            // Clear video element when camera is disabled
            localVideoRef.current.srcObject = null;
        }
        return () => {
            if (localVideoTrack) {
                localVideoTrack.detach();
            }
        };
    }, [localVideoTrack, isLocalCameraEnabled]);

    useEffect(() => {
        if (remoteVideoTrack && remoteVideoRef.current && isRemoteCameraEnabled) {
            remoteVideoTrack.attach(remoteVideoRef.current);
        } else if (remoteVideoRef.current) {
            // Clear video element when camera is disabled
            remoteVideoRef.current.srcObject = null;
        }
        return () => {
            if (remoteVideoTrack) {
                remoteVideoTrack.detach();
            }
        };
    }, [remoteVideoTrack, isRemoteCameraEnabled]);

    return (
        <div className="h-full w-full flex flex-col bg-gray-900">
            {/* Main video area - split screen for 1-1 */}
            <div className="flex-1 flex gap-2 p-2">
                {/* Remote participant (main view) */}
                <div className="flex-1 relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                    {remoteParticipant && remoteVideoTrack && isRemoteCameraEnabled ? (
                        <video
                            ref={remoteVideoRef}
                            className="h-full w-full object-cover"
                            autoPlay
                            playsInline
                            muted={false}
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="text-center">
                                <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-white/20">
                                    <AvatarImage src={partnerAvatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-xl font-bold">
                                        {partnerName?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <p className="text-white text-lg font-medium mb-1">{partnerName || 'Người dùng'}</p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Local participant (picture-in-picture) */}
                <div className="w-80 relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                    {localVideoTrack && isLocalCameraEnabled ? (
                        <video
                            ref={localVideoRef}
                            className="h-full w-full object-cover"
                            autoPlay
                            playsInline
                            muted={true}
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="text-center">
                                <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-white/20">
                                    <AvatarImage src={localUserAvatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-xl font-bold">
                                        {localUserName?.charAt(0) || <User className="w-10 h-10" />}
                                    </AvatarFallback>
                                </Avatar>
                                <p className="text-white text-lg font-medium mb-1">{localUserName || 'Bạn'}</p>
                            </div>
                        </div>
                    )}

                    {/* Local participant indicator */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                        Bạn
                    </div>
                </div>
            </div>
        </div>
    );
}

interface LiveKitVideoCall1v1Props {
    sessionId: string;
    conversationId: number;
    onClose: (isUserInitiated?: boolean) => void;
    partnerName?: string;
    partnerAvatar?: string;
    userId?: string;
    localUserName?: string;
    localUserAvatar?: string;
    className?: string;
    livekitToken?: string;
    livekitServerUrl?: string;
    onControlsChange?: (controls: {
        isVideoEnabled: boolean;
        isAudioEnabled: boolean;
        isScreenShareEnabled: boolean;
        toggleVideo: () => void;
        toggleAudio: () => void;
        toggleScreenShare: () => void;
    }) => void;
}

export function LiveKitVideoCall1v1({
    sessionId,
    conversationId,
    onClose,
    partnerName,
    partnerAvatar,
    userId,
    localUserName,
    localUserAvatar,
    className,
    livekitToken,
    livekitServerUrl,
    onControlsChange
}: LiveKitVideoCall1v1Props) {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const connectionAttemptedRef = useRef(false);
    const retryCountRef = useRef(0);

    // Reset state when component mounts
    useEffect(() => {
        setIsConnected(false);
        setError(null);
        setIsConnecting(false);
        connectionAttemptedRef.current = false;
        retryCountRef.current = 0;
    }, []);

    // Timeout to reset isConnecting if stuck
    useEffect(() => {
        if (isConnecting) {
            const timeout = setTimeout(() => {
                setIsConnecting(false);
            }, 10000); // 10 seconds timeout

            return () => clearTimeout(timeout);
        }
    }, [isConnecting]);

    const room = useMemo(() => {
        const roomOptions: RoomOptions = {
            publishDefaults: {
                videoSimulcastLayers: [VideoPresets.h720, VideoPresets.h540],
                red: true,
            },
            adaptiveStream: { pixelDensity: 'screen' },
            dynacast: true,
        };
        return new Room(roomOptions);
    }, []); // Empty dependency array - room should be created only once

    // Use LiveKit controls hook
    const controls = useLiveKitControls({ room, isConnected });

    // Pass controls to parent component
    useEffect(() => {
        if (onControlsChange) {
            onControlsChange(controls);
        }
    }, [controls, onControlsChange]);

    const connectOptions: RoomConnectOptions = {
        autoSubscribe: true,
    };

    useEffect(() => {
        let isMounted = true;
        let connectionAborted = false;

        const connectToLiveKit = async () => {
            try {
                setError(null);
                setIsConnecting(true);

                // Use provided token or get new one from backend
                let token = livekitToken;
                let serverUrl = livekitServerUrl;

                if (!token || !serverUrl) {
                    const joinResponse = await joinVideoCall(sessionId, conversationId, userId);
                    token = joinResponse.livekitToken;
                    serverUrl = joinResponse.livekitServerUrl;
                }

                if (isMounted && !connectionAborted && token && serverUrl) {
                    // Connect to LiveKit room with token
                    await room.connect(serverUrl, token, connectOptions);

                    // Check if connection was aborted during connect
                    if (connectionAborted || !isMounted) {
                        if (isMounted) {
                            setIsConnecting(false);
                        }
                        return;
                    }

                    // Keep camera and microphone off by default
                    try {
                        await room.localParticipant.setMicrophoneEnabled(false);
                        await room.localParticipant.setCameraEnabled(false);
                    } catch (deviceError) {
                        // Continue without camera/microphone if device is in use
                    }

                    if (isMounted && !connectionAborted) {
                        setIsConnected(true);
                        setIsConnecting(false);
                    }
                }
            } catch (err) {
                if (isMounted && !connectionAborted) {
                    const errorMessage = err instanceof Error ? err.message : "Failed to connect to LiveKit room";

                    // Check if it's a device error and we can retry
                    if (errorMessage.includes("Device in use") && retryCountRef.current < 3) {
                        retryCountRef.current++;
                        setTimeout(() => {
                            if (isMounted && !connectionAborted) {
                                connectionAttemptedRef.current = false;
                                connectToLiveKit();
                            }
                        }, 2000); // Retry after 2 seconds
                        return;
                    }

                    setError(errorMessage);
                    setIsConnecting(false);
                }
            }
        };

        // Only attempt connection if we have the required data and haven't connected yet
        if (sessionId && !isConnected && !isConnecting && !connectionAttemptedRef.current) {
            connectionAttemptedRef.current = true;
            connectToLiveKit();
        }

        return () => {
            isMounted = false;
            connectionAborted = true;
            // Reset connection attempted flag for next mount
            connectionAttemptedRef.current = false;
        };
    }, [sessionId, livekitToken, livekitServerUrl]); // Removed room and connectOptions from dependencies


    // Cleanup on unmount - only disconnect if we're actually unmounting, not in Strict Mode
    useEffect(() => {
        return () => {
            // Cleanup camera and microphone before disconnecting
            if (room && room.localParticipant) {
                try {
                    room.localParticipant.setCameraEnabled(false);
                    room.localParticipant.setMicrophoneEnabled(false);
                    room.localParticipant.setScreenShareEnabled(false);
                } catch (cleanupError) {
                    // Silent cleanup error handling
                }
            }

            // Also cleanup media tracks at the browser level
            stopAllMediaTracks().catch(() => {
                // Silent error handling
            });

            // Don't disconnect in development Strict Mode - let the room handle its own lifecycle
            if (process.env.NODE_ENV === 'production' && room) {
                room.disconnect();
            }
        };
    }, [room]);

    // Handle room disconnect
    useEffect(() => {
        if (!room) return;

        const handleDisconnected = async (reason?: any) => {
            setIsConnected(false);

            // Cleanup camera and microphone when disconnecting
            try {
                if (room && room.localParticipant) {
                    await room.localParticipant.setCameraEnabled(false);
                    await room.localParticipant.setMicrophoneEnabled(false);
                    await room.localParticipant.setScreenShareEnabled(false);
                }

                // Also cleanup media tracks at the browser level
                await stopAllMediaTracks();
            } catch (cleanupError) {
                // Silent cleanup error handling
            }

            // Only call onClose if it's a user-initiated disconnect
            // Don't auto-close on connection errors
            if (reason === 'CLIENT_INITIATED' || reason === 'SERVER_SHUTDOWN') {
                onClose(true); // User initiated
            } else {
                // For connection errors, just show error state
                setError("Kết nối bị ngắt. Vui lòng thử lại.");
                onClose(false); // Not user initiated
            }
        };

        room.on('disconnected', handleDisconnected);

        return () => {
            room.off('disconnected', handleDisconnected);
        };
    }, [room, onClose]);

    if (error) {
        return (
            <div className={cn("flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800", className)}>
                <div className="text-center p-6">
                    <div className="text-red-500 text-lg font-semibold mb-2">
                        Lỗi kết nối
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {error}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setError(null);
                                setIsConnecting(true);
                                connectionAttemptedRef.current = false;
                                retryCountRef.current = 0;
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Thử lại
                        </button>
                        <button
                            onClick={() => onClose(true)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isConnecting) {
        return (
            <div className={cn("flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800", className)}>
                <div className="text-center p-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <div className="text-gray-600 dark:text-gray-400">
                        Đang kết nối...
                    </div>
                </div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className={cn("flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800", className)}>
                <div className="text-center p-6">
                    <div className="text-gray-600 dark:text-gray-400">
                        Đang thiết lập cuộc gọi...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("h-full w-full overflow-hidden bg-gray-100 dark:bg-gray-800", className)}>
            <RoomContext.Provider value={room}>
                <VideoCall1v1Layout
                    room={room}
                    partnerName={partnerName}
                    partnerAvatar={partnerAvatar}
                    localUserName={localUserName}
                    localUserAvatar={localUserAvatar}
                />
            </RoomContext.Provider>
        </div>
    );
}
