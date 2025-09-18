"use client";

import React from "react";
import { Video, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageDto } from "@/types/customer/user.types";
import { VideoCallSessionData } from "@/types/video-call-api.types";

interface VideoCallMessageProps {
    message: MessageDto;
    onJoinCall: (sessionId: string) => void;
    isJoiningCall: boolean;
    isCallActive?: boolean; // New prop to determine if call is still active
}

export function VideoCallMessage({ message, onJoinCall, isJoiningCall, isCallActive = true }: VideoCallMessageProps) {
    // Try to parse video call data from message content
    const parseVideoCallData = (content: string): VideoCallSessionData | null => {
        try {
            // Handle different formats
            let parsedData;

            if (typeof content === 'string') {
                // Try to parse as JSON
                parsedData = JSON.parse(content);
            } else {
                return null;
            }

            // Validate that we have the required fields
            if (parsedData && parsedData.videoCallSessionId) {
                return parsedData as VideoCallSessionData;
            }

            return null;
        } catch (error) {
            return null;
        }
    };

    const videoCallData = parseVideoCallData(message.content);

    // If it's not a video call message, return null (let parent handle it)
    if (!videoCallData) {
        return null;
    }

    const handleJoinCall = () => {
        onJoinCall(videoCallData.videoCallSessionId);
    };

    // If call is not active, return null (let VideoCallEndedMessage handle it)
    if (!isCallActive) {
        return null;
    }

    return (
        <div className="flex justify-center my-4">
            <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl p-4 shadow-lg max-w-sm w-full">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                            <Video className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <h4 className="text-card-foreground font-semibold text-sm">
                                Cuộc gọi video đang diễn ra
                            </h4>
                            <p className="text-muted-foreground text-xs">
                                Nhấn để tham gia cuộc gọi
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleJoinCall}
                        disabled={isJoiningCall}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50"
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
        </div>
    );
}
