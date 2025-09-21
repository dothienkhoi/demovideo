"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Video, Phone, MoreVertical, ArrowLeft } from "lucide-react";
import { getAvatarGradient, getInitials } from "@/lib/utils/formatters";
import { DirectVideoCallManager } from "./DirectVideoCallManager";
import { useVideoCallContext } from "@/providers/VideoCallProvider";
import { useAuthStore } from "@/store/authStore";

interface ChatHeaderWithVideoCallProps {
    // Conversation info
    conversationId: number;
    receiverId: string;
    receiverName: string;
    receiverAvatar?: string;
    receiverStatus?: 'online' | 'offline' | 'away' | 'busy';

    // UI props
    onBack?: () => void;
    onMoreOptions?: () => void;
    showBackButton?: boolean;
    className?: string;
}

export function ChatHeaderWithVideoCall({
    conversationId,
    receiverId,
    receiverName,
    receiverAvatar,
    receiverStatus = 'offline',
    onBack,
    onMoreOptions,
    showBackButton = false,
    className = "",
}: ChatHeaderWithVideoCallProps) {
    const { videoCallState } = useVideoCallContext();
    const { user } = useAuthStore();


    const avatarGradient = getAvatarGradient();
    const avatarLetter = getInitials(receiverName);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'away': return 'bg-yellow-500';
            case 'busy': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'online': return 'Trực tuyến';
            case 'away': return 'Tạm vắng';
            case 'busy': return 'Bận';
            default: return 'Ngoại tuyến';
        }
    };

    // Determine if video call button should be disabled
    const isCallButtonDisabled = receiverStatus === 'offline' ||
        videoCallState.isIncomingCall ||
        videoCallState.isOutgoingCall ||
        videoCallState.isActive;


    return (
        <div className={`flex items-center justify-between p-4 border-b bg-background ${className}`}>
            {/* Left side - Back button and user info */}
            <div className="flex items-center gap-3">
                {showBackButton && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="p-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}

                {/* User Avatar */}
                <div className="relative">
                    <div className={`w-10 h-10 ${avatarGradient} rounded-full flex items-center justify-center`}>
                        {receiverAvatar ? (
                            <Avatar className="w-full h-full">
                                <AvatarImage src={receiverAvatar} alt={receiverName} />
                                <AvatarFallback className="bg-transparent text-white font-bold text-sm">
                                    {avatarLetter}
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <span className="text-white font-bold text-sm">{avatarLetter}</span>
                        )}
                    </div>

                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(receiverStatus)} rounded-full border-2 border-background`} />
                </div>

                {/* User info */}
                <div className="flex flex-col">
                    <h2 className="font-semibold text-foreground">{receiverName}</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            {getStatusText(receiverStatus)}
                        </span>

                        {/* Video call status indicator - only show for outgoing calls to this specific user */}
                        {videoCallState.isOutgoingCall &&
                            videoCallState.outgoingCallData?.receiverId === receiverId &&
                            videoCallState.callStatus === 'ringing' && (
                                <Badge variant="outline" className="text-xs">
                                    <Video className="h-3 w-3 mr-1" />
                                    Đang gọi
                                </Badge>
                            )}

                        {/* Incoming call indicator - only show if this user is calling */}
                        {videoCallState.isIncomingCall &&
                            videoCallState.incomingCallData?.caller.userId === receiverId && (
                                <Badge variant="outline" className="text-xs">
                                    <Phone className="h-3 w-3 mr-1" />
                                    Cuộc gọi đến
                                </Badge>
                            )}
                    </div>
                </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center gap-2">
                {/* Video call button - disable during active calls */}
                {user && (
                    <DirectVideoCallManager
                        conversationId={conversationId}
                        partnerId={receiverId}
                        partnerName={receiverName}
                        partnerAvatar={receiverAvatar}
                        currentUserId={user.id}
                        currentUserName={user.fullName}
                        currentUserAvatar={user.avatarUrl ?? undefined}
                        className="flex items-center"
                    />
                )}

                {/* More options button */}
                {onMoreOptions && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMoreOptions}
                        className="p-2"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

// Alternative compact version for mobile
export function ChatHeaderWithVideoCallCompact({
    conversationId,
    receiverId,
    receiverName,
    receiverAvatar,
    receiverStatus = 'offline',
    onBack,
    className = "",
}: Omit<ChatHeaderWithVideoCallProps, 'onMoreOptions' | 'showBackButton'> & {
    showBackButton?: boolean;
}) {
    const { videoCallState } = useVideoCallContext();
    const { user } = useAuthStore();


    const avatarGradient = getAvatarGradient();
    const avatarLetter = getInitials(receiverName);

    // Determine if video call button should be disabled
    const isCallButtonDisabled = receiverStatus === 'offline' ||
        videoCallState.isIncomingCall ||
        videoCallState.isOutgoingCall ||
        videoCallState.isActive;


    return (
        <div className={`flex items-center justify-between p-3 border-b bg-background ${className}`}>
            {/* Left side */}
            <div className="flex items-center gap-3">
                {onBack && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="p-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}

                {/* Avatar */}
                <div className={`w-8 h-8 ${avatarGradient} rounded-full flex items-center justify-center`}>
                    {receiverAvatar ? (
                        <Avatar className="w-full h-full">
                            <AvatarImage src={receiverAvatar} alt={receiverName} />
                            <AvatarFallback className="bg-transparent text-white font-bold text-xs">
                                {avatarLetter}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <span className="text-white font-bold text-xs">{avatarLetter}</span>
                    )}
                </div>

                {/* Name */}
                <h2 className="font-medium text-foreground text-sm">{receiverName}</h2>
            </div>

            {/* Right side - Video call button only */}
            {user && (
                <DirectVideoCallManager
                    conversationId={conversationId}
                    partnerId={receiverId}
                    partnerName={receiverName}
                    partnerAvatar={receiverAvatar}
                    currentUserId={user.id}
                    currentUserName={user.fullName}
                    currentUserAvatar={user.avatarUrl ?? undefined}
                    className="flex items-center"
                />
            )}
        </div>
    );
}