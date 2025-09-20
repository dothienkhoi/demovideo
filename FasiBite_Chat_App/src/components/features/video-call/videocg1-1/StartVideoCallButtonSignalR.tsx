"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Phone } from "lucide-react";
import { useVideoCallContext } from "@/providers/VideoCallProvider";
import { toast } from "sonner";

interface StartVideoCallButtonSignalRProps {
    conversationId: number;
    receiverId: string;
    receiverName: string;
    receiverAvatar?: string;
    disabled?: boolean;
    size?: "sm" | "default" | "lg";
    variant?: "default" | "outline" | "ghost";
    className?: string;
}

export function StartVideoCallButtonSignalR({
    conversationId,
    receiverId,
    receiverName,
    receiverAvatar,
    disabled = false,
    size = "default",
    variant = "outline",
    className = "",
}: StartVideoCallButtonSignalRProps) {
    const { videoCallState, startCall } = useVideoCallContext();
    const [isStarting, setIsStarting] = useState(false);

    const handleStartCall = async () => {
        if (isStarting || disabled) return;

        // Check if there's already an active call
        if (videoCallState.isOutgoingCall || videoCallState.isIncomingCall) {
            toast.warning("Cuộc gọi đang diễn ra", {
                description: "Vui lòng kết thúc cuộc gọi hiện tại trước khi bắt đầu cuộc gọi mới"
            });
            return;
        }

        // Check connection status
        if (!videoCallState.isConnected) {
            toast.error("Không thể gọi", {
                description: "Chưa kết nối đến server. Vui lòng thử lại sau."
            });
            return;
        }

        setIsStarting(true);
        try {
            await startCall(conversationId, receiverId, receiverName, receiverAvatar);
            toast.success("Đang gọi...", {
                description: `Đang gọi video cho ${receiverName}`
            });
        } catch (error) {
            console.error("Failed to start video call:", error);
            toast.error("Không thể bắt đầu cuộc gọi", {
                description: "Đã có lỗi xảy ra. Vui lòng thử lại."
            });
        } finally {
            setIsStarting(false);
        }
    };

    const isDisabled = disabled || isStarting || !videoCallState.isConnected || videoCallState.isOutgoingCall || videoCallState.isIncomingCall;

    return (
        <Button
            onClick={handleStartCall}
            disabled={isDisabled}
            size={size}
            variant={variant}
            className={`flex items-center gap-2 ${className}`}
        >
            {isStarting ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    <span>Đang gọi...</span>
                </>
            ) : (
                <>
                    <Video className="h-4 w-4" />
                    <span>Gọi video</span>
                </>
            )}
        </Button>
    );
}

// Alternative button with phone icon
export function StartVideoCallButtonSignalRPhone({
    conversationId,
    receiverId,
    receiverName,
    receiverAvatar,
    disabled = false,
    size = "default",
    variant = "outline",
    className = "",
}: StartVideoCallButtonSignalRProps) {
    const { videoCallState, startCall } = useVideoCallContext();
    const [isStarting, setIsStarting] = useState(false);

    const handleStartCall = async () => {
        if (isStarting || disabled) return;

        if (videoCallState.isOutgoingCall || videoCallState.isIncomingCall) {
            toast.warning("Cuộc gọi đang diễn ra", {
                description: "Vui lòng kết thúc cuộc gọi hiện tại trước khi bắt đầu cuộc gọi mới"
            });
            return;
        }

        if (!videoCallState.isConnected) {
            toast.error("Không thể gọi", {
                description: "Chưa kết nối đến server. Vui lòng thử lại sau."
            });
            return;
        }

        setIsStarting(true);
        try {
            await startCall(conversationId, receiverId, receiverName, receiverAvatar);
            toast.success("Đang gọi...", {
                description: `Đang gọi video cho ${receiverName}`
            });
        } catch (error) {
            console.error("Failed to start video call:", error);
            toast.error("Không thể bắt đầu cuộc gọi", {
                description: "Đã có lỗi xảy ra. Vui lòng thử lại."
            });
        } finally {
            setIsStarting(false);
        }
    };

    const isDisabled = disabled || isStarting || !videoCallState.isConnected || videoCallState.isOutgoingCall || videoCallState.isIncomingCall;

    return (
        <Button
            onClick={handleStartCall}
            disabled={isDisabled}
            size={size}
            variant={variant}
            className={`flex items-center gap-2 ${className}`}
        >
            {isStarting ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    <span>Đang gọi...</span>
                </>
            ) : (
                <>
                    <Phone className="h-4 w-4" />
                    <span>Gọi video</span>
                </>
            )}
        </Button>
    );
}