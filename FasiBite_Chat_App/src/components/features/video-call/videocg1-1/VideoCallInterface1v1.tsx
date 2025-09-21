"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Room, RoomEvent } from "livekit-client";
import {
    useLocalParticipant,
    useRemoteParticipant,
    RoomContext,
} from "@livekit/components-react";
import { useVideoManagerDirect as useVideoManager } from "./VideoManagerDirect";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Video,
    PhoneOff,
    Monitor,
    MonitorOff,
    Maximize2,
    Minimize2,
    VolumeX,
} from "lucide-react";
import { getAvatarGradient, getInitials } from "@/lib/utils/formatters";
import { useVideoCallContext } from "@/providers/VideoCallProvider";
import { toast } from "sonner";
import { CameraToggle } from "../romvideo/CameraToggle";
import { MicrophoneToggle } from "../romvideo/MicrophoneToggle";

interface VideoCallInterface1v1Props {
    sessionId: string;
    conversationId: number;
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
    currentUserName: string;
    currentUserAvatar?: string;
    livekitToken: string;
    livekitServerUrl: string;
    onEndCall: () => void;
    onMinimize?: () => void;
    className?: string;
}

export function VideoCallInterface1v1({
    sessionId,
    partnerId,
    partnerName,
    partnerAvatar,
    currentUserName,
    currentUserAvatar,
    livekitToken,
    livekitServerUrl,
    onEndCall,
    className = "",
}: VideoCallInterface1v1Props) {
    console.log('[VideoCallInterface1v1] Component rendered with:', {
        sessionId,
        partnerId,
        partnerName,
        livekitToken: !!livekitToken,
        livekitServerUrl
    });
    // State
    const [room, setRoom] = useState<Room | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    // Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const roomRef = useRef<Room | null>(null);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectingRef = useRef(false);
    const isConnectedRef = useRef(false);

    const maxRetries = 3;
    const { endCall } = useVideoCallContext();

    // Room options - Allow camera/mic to be enabled without disconnecting
    const roomOptions = useMemo(
        () => ({
            adaptiveStream: true,
            dynacast: true,
            publishDefaults: {
                videoCodec: "h264" as const,
                audioCodec: "opus",
                // Don't set videoEnabled/audioEnabled to false - let LiveKit handle it
            },
            reconnectPolicy: {
                nextRetryDelayInMs: (ctx: any) => {
                    if (ctx.retryCount < 3) return 1000;
                    if (ctx.retryCount < 6) return 5000;
                    return 10000;
                },
            },
        }),
        []
    );

    // Request media permissions before connecting
    const requestMediaPermissions = useCallback(async () => {
        try {
            // Request camera and microphone permissions
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Stop the stream immediately - we just needed permissions
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.warn('[VideoCallInterface1v1] Media permissions not granted:', error);
            return false;
        }
    }, []);

    // Connect to LiveKit room
    const connectToRoom = useCallback(async () => {
        if (isConnectingRef.current || isConnectedRef.current) return;

        isConnectingRef.current = true;
        setIsConnecting(true);
        setConnectionError(null);

        try {
            // Request media permissions first
            await requestMediaPermissions();

            const newRoom = new Room(roomOptions);
            roomRef.current = newRoom;

            newRoom.on(RoomEvent.Connected, () => {
                isConnectedRef.current = true;
                isConnectingRef.current = false;
                setIsConnected(true);
                setIsConnecting(false);
                setConnectionError(null);

                durationIntervalRef.current = setInterval(
                    () => setCallDuration((prev) => prev + 1),
                    1000
                );
            });

            newRoom.on(RoomEvent.Disconnected, (reason) => {
                console.log('[VideoCallInterface1v1] Room disconnected:', reason);
                isConnectedRef.current = false;
                isConnectingRef.current = false;
                setIsConnected(false);
                setIsConnecting(false);
                if (durationIntervalRef.current) {
                    clearInterval(durationIntervalRef.current);
                    durationIntervalRef.current = null;
                }

                // Don't auto-reconnect if it's a client-initiated disconnect
                if (reason && reason.toString() === 'CLIENT_INITIATED') {
                    console.log('[VideoCallInterface1v1] Client initiated disconnect - not reconnecting');
                    return;
                }
            });

            // Add track event handlers to prevent disconnection issues
            newRoom.on(RoomEvent.LocalTrackPublished, (publication) => {
                console.log('[VideoCallInterface1v1] Local track published:', publication.kind);
            });

            newRoom.on(RoomEvent.LocalTrackUnpublished, (publication) => {
                console.log('[VideoCallInterface1v1] Local track unpublished:', publication.kind);
            });

            newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                console.log('[VideoCallInterface1v1] Track subscribed:', track.kind, participant.identity);
            });

            newRoom.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
                console.log('[VideoCallInterface1v1] Track unsubscribed:', track.kind, participant.identity);
            });

            await newRoom.connect(livekitServerUrl, livekitToken);
            setRoom(newRoom);
        } catch (err) {
            isConnectingRef.current = false;
            setIsConnecting(false);

            const msg = err instanceof Error ? err.message : "Failed to connect";
            setConnectionError(msg);

            if (retryCount < maxRetries) {
                setRetryCount((p) => p + 1);
                setTimeout(() => {
                    if (!isConnectedRef.current) connectToRoom();
                }, 2000 * (retryCount + 1));
            } else {
                toast.error("Không thể kết nối", {
                    description: "Đã thử kết nối nhiều lần nhưng thất bại",
                });
            }
        }
    }, [livekitServerUrl, livekitToken, roomOptions, retryCount, requestMediaPermissions]);

    // Toggle screen share
    const toggleScreenShare = useCallback(async () => {
        if (!room) return;
        try {
            await room.localParticipant.setScreenShareEnabled(!isScreenSharing);
            setIsScreenSharing((v) => !v);
        } catch {
            toast.error("Không thể chia sẻ màn hình");
        }
    }, [room, isScreenSharing]);

    // End call
    const handleEndCall = useCallback(async () => {
        try {
            if (room) await room.disconnect();
            if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
            await endCall(sessionId);
        } finally {
            onEndCall();
        }
    }, [room, sessionId, endCall, onEndCall]);

    const formatDuration = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
            2,
            "0"
        )}`;

    useEffect(() => {
        connectToRoom();

        // Fixed cleanup function to prevent premature disconnection
        return () => {
            // Only disconnect if the component is actually being unmounted
            // Not during re-renders
            if (roomRef.current && isConnectedRef.current) {
                roomRef.current.disconnect();
            }
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
                durationIntervalRef.current = null;
            }
        };
    }, []); // only once

    const avatarGradient = getAvatarGradient();
    const currentUserInitials = getInitials(currentUserName);
    const partnerInitials = getInitials(partnerName);

    // Nội dung hiển thị video
    const VideoCallContent = () => {
        const local = useLocalParticipant();
        const remote = useRemoteParticipant(partnerId);

        // Debug logging
        console.log('[VideoCallInterface1v1] Hooks state:', {
            local: local ? {
                localParticipant: !!local.localParticipant,
                isCameraEnabled: local.isCameraEnabled,
                isMicrophoneEnabled: local.isMicrophoneEnabled
            } : null,
            remote: remote ? {
                isCameraEnabled: remote.isCameraEnabled,
                isMicrophoneEnabled: remote.isMicrophoneEnabled,
                videoTrackPublications: Array.from(remote.videoTrackPublications.values()).map(p => ({
                    track: !!p.track,
                    isSubscribed: p.isSubscribed,
                    isMuted: p.isMuted
                }))
            } : null,
            room: room ? {
                localParticipant: !!room.localParticipant,
                remoteParticipants: Array.from(room.remoteParticipants.keys())
            } : null
        });

        // Use the new VideoManager hook with room object directly
        const { hasLocalVideo, hasRemoteVideo } = useVideoManager({
            room: room,
            localVideoRef,
            remoteVideoRef,
        });

        // Debug final state
        console.log('[VideoCallInterface1v1] Final video state:', {
            hasLocalVideo,
            hasRemoteVideo,
            localCameraEnabled: local?.isCameraEnabled,
            remoteCameraEnabled: remote?.isCameraEnabled
        });

        if (isMinimized) {
            return (
                <div className="fixed top-4 right-4 bg-card border rounded-lg shadow-lg p-3 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Video className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-medium">{partnerName}</span>
                            <span className="text-xs text-muted-foreground block">
                                {formatDuration(callDuration)}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMinimized(false)}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEndCall}
                            className="text-red-500"
                        >
                            <PhoneOff className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-black/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <Video className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-semibold">{partnerName}</h2>
                            <div className="flex gap-2 items-center">
                                <span className="text-green-400 text-sm">
                                    {formatDuration(callDuration)}
                                </span>
                                {isConnected ? (
                                    <Badge variant="outline" className="text-green-400 border-green-400">
                                        Đã kết nối
                                    </Badge>
                                ) : isConnecting ? (
                                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                        Đang kết nối...
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-red-400 border-red-400">
                                        Mất kết nối
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMinimized(true)}
                        className="text-white"
                    >
                        <Minimize2 className="h-4 w-4" />
                    </Button>
                </div>

                {/* Video area */}
                <div className="flex-1 relative">
                    {/* Remote */}
                    <div className="absolute inset-0 bg-gray-900">
                        {!hasRemoteVideo ? (
                            <div className="flex items-center justify-center h-full text-white">
                                <div className="text-center">
                                    <div
                                        className={`w-32 h-32 ${avatarGradient} rounded-full flex items-center justify-center mx-auto mb-4`}
                                    >
                                        {partnerAvatar ? (
                                            <Avatar className="w-full h-full">
                                                <AvatarImage src={partnerAvatar} alt={partnerName} />
                                                <AvatarFallback>{partnerInitials}</AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <span className="text-2xl font-bold">{partnerInitials}</span>
                                        )}
                                    </div>
                                    <p>Camera đã tắt</p>
                                </div>
                            </div>
                        ) : (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        )}
                        {!remote?.isMicrophoneEnabled && (
                            <div className="absolute top-4 left-4 bg-black/50 rounded-full p-2">
                                <VolumeX className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Local */}
                    <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
                        {!hasLocalVideo ? (
                            <div className="flex items-center justify-center h-full text-white">
                                <div className="text-center">
                                    <div
                                        className={`w-16 h-16 ${avatarGradient} rounded-full flex items-center justify-center mx-auto mb-2`}
                                    >
                                        {currentUserAvatar ? (
                                            <Avatar className="w-full h-full">
                                                <AvatarImage src={currentUserAvatar} alt={currentUserName} />
                                                <AvatarFallback>{currentUserInitials}</AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <span className="text-sm font-bold">
                                                {currentUserInitials}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs">Camera đã tắt</p>
                                </div>
                            </div>
                        ) : (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 p-6 bg-black/50">
                    <MicrophoneToggle />
                    <CameraToggle />
                    <Button
                        onClick={toggleScreenShare}
                        className={`w-12 h-12 rounded-full ${isScreenSharing
                            ? "bg-blue-500 text-white"
                            : "bg-white text-black hover:bg-gray-200"
                            }`}
                    >
                        {isScreenSharing ? (
                            <MonitorOff className="h-5 w-5" />
                        ) : (
                            <Monitor className="h-5 w-5" />
                        )}
                    </Button>
                    <Button
                        onClick={handleEndCall}
                        className="w-12 h-12 rounded-full bg-red-500 text-white"
                    >
                        <PhoneOff className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <RoomContext.Provider value={room || undefined}>
            {room ? (
                <VideoCallContent />
            ) : (
                <div
                    className={`fixed inset-0 bg-black z-50 flex items-center justify-center ${className}`}
                >
                    <div className="text-center text-white">
                        {isConnecting ? (
                            <>
                                <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
                                <h3 className="text-xl font-semibold mb-2">Đang kết nối...</h3>
                                <p className="text-gray-300">Vui lòng chờ trong giây lát</p>
                            </>
                        ) : connectionError ? (
                            <>
                                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <PhoneOff className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Lỗi kết nối</h3>
                                <p className="text-gray-300 mb-4">{connectionError}</p>
                                <Button
                                    onClick={() => {
                                        setConnectionError(null);
                                        connectToRoom();
                                    }}
                                    variant="outline"
                                    className="text-white border-white"
                                >
                                    Thử lại
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
                                <h3 className="text-xl font-semibold mb-2">Đang khởi tạo...</h3>
                                <p className="text-gray-300">Chuẩn bị cuộc gọi video</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </RoomContext.Provider>
    );
}
