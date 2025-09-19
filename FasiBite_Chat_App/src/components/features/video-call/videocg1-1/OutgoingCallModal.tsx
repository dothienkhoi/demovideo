"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneOff, Video } from "lucide-react";
import { getAvatarGradient, getInitials } from "@/lib/utils/formatters";

interface OutgoingCallModalProps {
    isOpen: boolean;
    recipientName: string;
    recipientAvatar?: string;
    recipientId: string;
    onCancel: () => void;
    isCancelling?: boolean;
    callDuration?: number; // in seconds
}

export function OutgoingCallModal({
    isOpen,
    recipientName,
    recipientAvatar,
    recipientId,
    onCancel,
    isCancelling = false,
    callDuration = 0
}: OutgoingCallModalProps) {
    const avatarGradient = getAvatarGradient();
    const avatarLetter = getInitials(recipientName);

    // Format call duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="bg-card border-border p-8 rounded-2xl shadow-2xl max-w-md z-[9999]">
                <DialogHeader className="text-center space-y-6">
                    {/* Recipient Avatar */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className={`w-24 h-24 ${avatarGradient} rounded-full flex items-center justify-center border-4 border-background shadow-2xl`}>
                                {recipientAvatar ? (
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={recipientAvatar} alt={recipientName} />
                                        <AvatarFallback className="bg-transparent text-white font-bold text-2xl">
                                            {avatarLetter}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <span className="text-white font-bold text-2xl">{avatarLetter}</span>
                                )}
                            </div>
                            {/* Animated ring */}
                            <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-75"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Recipient Info */}
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-bold text-card-foreground">
                            {recipientName}
                        </DialogTitle>
                        <DialogDescription className="text-lg text-muted-foreground">
                            {callDuration > 0 ? "Cuộc gọi video đang diễn ra" : "Đang gọi..."}
                        </DialogDescription>
                    </div>

                    {/* Call Status */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        {callDuration > 0 ? (
                            <>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>{formatDuration(callDuration)}</span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span>Đang gọi...</span>
                            </>
                        )}
                    </div>
                </DialogHeader>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-6 mt-8">
                    {/* Cancel/End Call Button */}
                    <Button
                        onClick={onCancel}
                        disabled={isCancelling}
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                        size="lg"
                    >
                        {isCancelling ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                        ) : (
                            <PhoneOff className="h-6 w-6" />
                        )}
                    </Button>

                    {/* Video Icon (for visual balance) */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30 flex items-center justify-center">
                        <Video className="h-6 w-6 text-blue-500" />
                    </div>
                </div>

                {/* Call Info */}
                <div className="text-center mt-4">
                    <p className="text-xs text-muted-foreground">
                        {callDuration > 0
                            ? "Cuộc gọi video đang diễn ra"
                            : "Chờ người nhận trả lời..."
                        }
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
