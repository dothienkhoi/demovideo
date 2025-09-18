"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Video, Users, Phone } from "lucide-react";
import { VideoCallSessionData } from "@/types/video-call-api.types";

interface VideoCallNotificationProps {
    videoCallData: VideoCallSessionData;
    groupName?: string;
    onJoinCall: (sessionId: string) => void;
    isJoining?: boolean;
}

export function VideoCallNotification({
    videoCallData,
    groupName,
    onJoinCall,
    isJoining = false
}: VideoCallNotificationProps) {
    const handleJoinCall = () => {
        onJoinCall(videoCallData.videoCallSessionId);
    };

    return (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                        <Video className="h-5 w-5 text-purple-500" />
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
                    onClick={handleJoinCall}
                    disabled={isJoining}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                    size="sm"
                >
                    {isJoining ? (
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
