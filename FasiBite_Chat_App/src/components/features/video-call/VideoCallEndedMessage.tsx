"use client";

import React from "react";
import { Video, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageDto } from "@/types/customer/user.types";
import { VideoCallSessionData } from "@/types/video-call-api.types";

interface VideoCallEndedMessageProps {
    message: MessageDto;
    onStartNewCall?: () => void;
    isStartingCall?: boolean;
}

export function VideoCallEndedMessage({ message, onStartNewCall, isStartingCall }: VideoCallEndedMessageProps) {
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

    const handleStartNewCall = () => {
        if (onStartNewCall) {
            onStartNewCall();
        }
    };

    // Format the time when the call ended
    const callEndedTime = new Date(message.sentAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="flex justify-center my-4">
            <div className="bg-gradient-to-r from-gray-500/10 to-gray-600/10 border border-gray-500/20 rounded-xl p-4 shadow-lg max-w-sm w-full">
                <div className="flex flex-col items-center gap-3">
                    {/* Icon and Status */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30">
                            <Video className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="text-center">
                            <h4 className="text-card-foreground font-semibold text-sm">
                                Cuộc gọi video đã kết thúc
                            </h4>
                            <p className="text-muted-foreground text-xs flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Kết thúc lúc {callEndedTime}
                            </p>
                        </div>
                    </div>

                    {/* Call Details */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>Phiên gọi: {videoCallData.videoCallSessionId.substring(0, 8)}...</span>
                    </div>

                    {/* Action Button */}
                    {onStartNewCall && (
                        <Button
                            onClick={handleStartNewCall}
                            disabled={isStartingCall}
                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                            size="sm"
                        >
                            {isStartingCall ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Đang tạo cuộc gọi...
                                </>
                            ) : (
                                <>
                                    <Video className="h-4 w-4 mr-2" />
                                    Mở cuộc gọi mới
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
