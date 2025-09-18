"use client";

import React from "react";
import { Video, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideoCallManager } from "@/hooks/useVideoCallManager";
import { VideoCallNotification } from "./VideoCallNotification";
import { StartVideoCallButton } from "./StartVideoCallButton";
import { VideoCallSessionData } from "@/types/video-call-api.types";

interface VideoCallManagerProps {
    conversationId: number;
    groupName?: string;
    currentVideoCallData?: string | VideoCallSessionData; // JSON string or object from backend
}

export function VideoCallManager({
    conversationId,
    groupName,
    currentVideoCallData
}: VideoCallManagerProps) {
    const {
        isCreatingCall,
        isJoiningCall,
        activeVideoCall,
        createVideoCall,
        joinVideoCall,
        openVideoCall,
        closeVideoCall,
    } = useVideoCallManager({ conversationId });

    // Parse current video call data from backend
    const parsedVideoCallData = React.useMemo(() => {
        if (!currentVideoCallData) return null;

        console.log("Raw video call data:", currentVideoCallData);
        console.log("Data type:", typeof currentVideoCallData);

        try {
            // Handle different formats from backend
            let parsedData;

            // If it's already an object
            if (typeof currentVideoCallData === 'object') {
                parsedData = currentVideoCallData;
            }
            // If it's a JSON string
            else if (typeof currentVideoCallData === 'string') {
                parsedData = JSON.parse(currentVideoCallData);
            }
            else {
                console.warn("Unexpected video call data format:", currentVideoCallData);
                return null;
            }

            console.log("Parsed video call data:", parsedData);

            // Validate that we have the required fields
            if (parsedData && parsedData.videoCallSessionId) {
                return parsedData as VideoCallSessionData;
            } else {
                console.warn("Invalid video call data structure:", parsedData);
                return null;
            }
        } catch (error) {
            console.error("Error parsing video call data:", error);
            return null;
        }
    }, [currentVideoCallData]);

    // Use active call or parsed data
    const currentCall = activeVideoCall || parsedVideoCallData;

    const handleCreateCall = async () => {
        try {
            const sessionData = await createVideoCall();
            openVideoCall(sessionData, groupName);
        } catch (error) {
            console.error("Failed to create video call:", error);
            // Handle error (show toast, etc.)
        }
    };

    const handleJoinCall = async (sessionId: string) => {
        try {
            const sessionData = await joinVideoCall(sessionId);
            openVideoCall(sessionData, groupName);
        } catch (error) {
            console.error("Failed to join video call:", error);
            // Handle error (show toast, etc.)
        }
    };

    // If there's an active video call, show notification
    if (currentCall) {
        return (
            <VideoCallNotification
                videoCallData={currentCall}
                groupName={groupName}
                onJoinCall={handleJoinCall}
                isJoining={isJoiningCall}
            />
        );
    }

    // If we have raw data but couldn't parse it, show fallback
    if (currentVideoCallData && !parsedVideoCallData) {
        return (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                            <Video className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                            <h4 className="text-card-foreground font-semibold text-sm">
                                Cuộc gọi video đang diễn ra
                            </h4>
                            <p className="text-muted-foreground text-xs">
                                {groupName ? `Trong nhóm ${groupName}` : "Trong cuộc trò chuyện này"}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            // Try to extract sessionId from raw data
                            let sessionId = null;
                            if (typeof currentVideoCallData === 'string') {
                                try {
                                    const parsed = JSON.parse(currentVideoCallData);
                                    sessionId = parsed.videoCallSessionId;
                                } catch (e) {
                                    // If parsing fails, try to extract from string
                                    const match = currentVideoCallData.match(/"videoCallSessionId":"([^"]+)"/);
                                    sessionId = match ? match[1] : null;
                                }
                            }
                            if (sessionId) {
                                handleJoinCall(sessionId);
                            }
                        }}
                        disabled={isJoiningCall}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg shadow-yellow-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                        size="sm"
                    >
                        {isJoiningCall ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Đang tham gia...
                            </>
                        ) : (
                            <>
                                <Phone className="h-4 w-4 mr-2" />
                                Tham gia
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    // If no active call, show start button
    return (
        <div className="mb-4">
            <StartVideoCallButton
                onCreateCall={handleCreateCall}
                isCreating={isCreatingCall}
                className="w-full"
            />
        </div>
    );
}
