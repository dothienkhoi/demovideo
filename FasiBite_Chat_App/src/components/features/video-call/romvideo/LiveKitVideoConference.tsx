"use client";

import { useState, useEffect, useMemo } from "react";
import { Room, RoomOptions, RoomConnectOptions, VideoPresets } from "livekit-client";
import { RoomContext, VideoConference, formatChatMessageLinks } from "@livekit/components-react";
import { LogLevel } from "livekit-client";
import { joinVideoCall, leaveVideoCall } from "@/lib/api/customer/video-call-api";
import { Button } from "@/components/ui/button";
import { X, PhoneOff } from "lucide-react";

interface LiveKitVideoConferenceProps {
    sessionId: string;
    conversationId: number;
    onClose: () => void;
    groupName?: string;
    userId?: string;
}

export function LiveKitVideoConference({ sessionId, conversationId, onClose, groupName, userId }: LiveKitVideoConferenceProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);

    console.log("[LiveKitVideoConference] Rendering with props:", { sessionId, conversationId, groupName, userId });

    const roomOptions = useMemo((): RoomOptions => {
        console.log("[LiveKitVideoConference] Creating room options");
        return {
            publishDefaults: {
                videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
                red: true,
            },
            adaptiveStream: { pixelDensity: 'screen' },
            dynacast: true,
        };
    }, []);

    const room = useMemo(() => {
        console.log("[LiveKitVideoConference] Creating new Room instance");
        return new Room(roomOptions);
    }, [roomOptions]);

    const connectOptions = useMemo((): RoomConnectOptions => {
        console.log("[LiveKitVideoConference] Creating connect options");
        return {
            autoSubscribe: true,
        };
    }, []);

    useEffect(() => {
        console.log("[LiveKitVideoConference] Connection effect triggered");
        let isMounted = true;

        const connectToLiveKit = async () => {
            try {
                console.log("[LiveKitVideoConference] Connecting to LiveKit");
                setError(null);
                setIsConnecting(true);

                // Get LiveKit token from backend
                console.log("[LiveKitVideoConference] Calling joinVideoCall API");
                const joinResponse = await joinVideoCall(sessionId, conversationId, userId);
                console.log("[LiveKitVideoConference] joinVideoCall API response:", joinResponse);

                if (isMounted) {
                    console.log("[LiveKitVideoConference] Connecting to LiveKit room");
                    // Connect to LiveKit room with real token
                    await room.connect(joinResponse.livekitServerUrl, joinResponse.livekitToken, connectOptions);
                    console.log("[LiveKitVideoConference] Connected to LiveKit room");

                    // Enable camera and microphone by default
                    console.log("[LiveKitVideoConference] Enabling camera and microphone");
                    await room.localParticipant.enableCameraAndMicrophone();
                    console.log("[LiveKitVideoConference] Camera and microphone enabled");

                    setIsConnected(true);
                    setIsConnecting(false);
                    console.log("[LiveKitVideoConference] Connection state updated: connected");
                }
            } catch (err) {
                console.error("[LiveKitVideoConference] Connection error:", err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to connect to LiveKit room");
                    setIsConnecting(false);
                    console.log("[LiveKitVideoConference] Connection state updated: error");
                }
            }
        };

        connectToLiveKit();

        return () => {
            console.log("[LiveKitVideoConference] Cleaning up connection effect");
            isMounted = false;
            room.disconnect();
        };
    }, [sessionId, conversationId, userId]); // Removed room and connectOptions from dependencies

    const handleDisconnect = async () => {
        console.log("[LiveKitVideoConference] HandleDisconnect called");
        try {
            // Leave the call via backend API
            console.log("[LiveKitVideoConference] Calling leaveVideoCall API");
            await leaveVideoCall(sessionId);
            console.log("[LiveKitVideoConference] leaveVideoCall API completed");
        } catch (error) {
            console.error("[LiveKitVideoConference] Error leaving call:", error);
            // Handle error silently
        } finally {
            // Always disconnect from room and call onClose
            console.log("[LiveKitVideoConference] Disconnecting from room");
            room.disconnect();
            console.log("[LiveKitVideoConference] Calling onClose callback");
            onClose();
        }
    };

    if (error) {
        console.log("[LiveKitVideoConference] Rendering error state:", error);
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
                    <h2 className="text-white text-xl font-semibold mb-4">Lỗi kết nối</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <Button onClick={() => {
                        console.log("[LiveKitVideoConference] Close button clicked in error state");
                        onClose();
                    }} className="w-full">
                        Đóng
                    </Button>
                </div>
            </div>
        );
    }

    if (isConnecting) {
        console.log("[LiveKitVideoConference] Rendering connecting state");
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
                    <h2 className="text-white text-xl font-semibold mb-4">
                        Đang kết nối đến {groupName || "cuộc gọi video"}...
                    </h2>
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                </div>
            </div>
        );
    }

    console.log("[LiveKitVideoConference] Rendering video conference interface");

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-white font-semibold text-lg">
                        {groupName || "Cuộc gọi video"}
                    </h1>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                console.log("[LiveKitVideoConference] Leave call button clicked");
                                handleDisconnect();
                            }}
                            variant="outline"
                            size="sm"
                            className="text-white border-white hover:bg-white hover:text-black"
                        >
                            <PhoneOff className="w-4 h-4 mr-2" />
                            Rời khỏi
                        </Button>
                        <Button
                            onClick={() => {
                                console.log("[LiveKitVideoConference] Close button clicked");
                                handleDisconnect();
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* LiveKit VideoConference */}
            <div className="h-full">
                <RoomContext.Provider value={room}>
                    <VideoConference
                        chatMessageFormatter={formatChatMessageLinks}
                    />
                </RoomContext.Provider>
            </div>
        </div>
    );
}