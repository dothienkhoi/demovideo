"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Video, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCallModal } from "./VideoCallModal";
import { useVideoCallContext } from "@/providers/VideoCallProvider";
import { toast } from "sonner";

interface DirectVideoCallManagerProps {
    conversationId: number;
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
    currentUserId: string;
    currentUserName: string;
    currentUserAvatar?: string;
    className?: string;
}

export function DirectVideoCallManager({
    conversationId,
    partnerId,
    partnerName,
    partnerAvatar,
    currentUserId,
    currentUserName,
    currentUserAvatar,
    className = ""
}: DirectVideoCallManagerProps) {
    const {
        videoCallState,
        startCall
    } = useVideoCallContext();

    const [isStartingCall, setIsStartingCall] = useState(false);

    // Handle starting a video call
    const handleStartVideoCall = useCallback(async () => {
        if (!videoCallState.isConnected) {
            toast.error("Không thể gọi", { description: "Chưa kết nối đến server" });
            return;
        }

        if (videoCallState.isIncomingCall || videoCallState.isOutgoingCall) {
            toast.warning("Đang có cuộc gọi", { description: "Vui lòng kết thúc cuộc gọi hiện tại trước" });
            return;
        }

        setIsStartingCall(true);
        try {
            await startCall(conversationId, partnerId, partnerName, partnerAvatar);
            toast.success("Đang gọi...", { description: `Đang gọi ${partnerName}` });
        } catch (error) {
            toast.error("Không thể bắt đầu cuộc gọi", {
                description: error instanceof Error ? error.message : "Đã có lỗi xảy ra"
            });
        } finally {
            setIsStartingCall(false);
        }
    }, [videoCallState.isConnected, videoCallState.isIncomingCall, videoCallState.isOutgoingCall, startCall, conversationId, partnerId, partnerName, partnerAvatar]);

    // Check if there's an active call
    const hasActiveCall = videoCallState.isIncomingCall || videoCallState.isOutgoingCall || videoCallState.isActive;
    const isCreating = isStartingCall;

    return (
        <div className={className}>
            {/* Video Call Buttons */}
            {!hasActiveCall && (
                <div className="flex items-center gap-2">
                    {/* Start Video Call Button */}
                    <Button
                        onClick={handleStartVideoCall}
                        disabled={isCreating || !videoCallState.isConnected}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        variant="ghost"
                        size="sm"
                        title={!videoCallState.isConnected ? "Chưa kết nối đến server" : `Gọi video cho ${partnerName}`}
                    >
                        {isCreating ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                        ) : (
                            <Video className={`h-5 w-5 ${!videoCallState.isConnected ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`} />
                        )}
                    </Button>

                    {/* Phone Call Button (placeholder) */}
                    <Button
                        onClick={() => {
                            toast.info("Tính năng gọi thoại", { description: "Sẽ được phát triển trong tương lai" });
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        variant="ghost"
                        size="sm"
                        title="Gọi thoại (chưa hỗ trợ)"
                    >
                        <Phone className="h-5 w-5 text-gray-400" />
                    </Button>
                </div>
            )}

            {/* Consolidated Video Call Modal */}
            <VideoCallModal />
        </div>
    );
}