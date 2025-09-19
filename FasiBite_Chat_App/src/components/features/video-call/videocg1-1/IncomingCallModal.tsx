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
import { Phone, PhoneOff, Video } from "lucide-react";
import { getAvatarGradient, getInitials } from "@/lib/utils/formatters";

interface IncomingCallModalProps {
    isOpen: boolean;
    callerName: string;
    callerAvatar?: string;
    callerId: string;
    onAccept: () => void;
    onDecline: () => void;
    isAccepting?: boolean;
    isDeclining?: boolean;
}

export function IncomingCallModal({
    isOpen,
    callerName,
    callerAvatar,
    callerId,
    onAccept,
    onDecline,
    isAccepting = false,
    isDeclining = false
}: IncomingCallModalProps) {
    const avatarGradient = getAvatarGradient();
    const avatarLetter = getInitials(callerName);

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="bg-card border-border p-8 rounded-2xl shadow-2xl max-w-md z-[9999]">
                <DialogHeader className="text-center space-y-6">
                    {/* Caller Avatar */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className={`w-24 h-24 ${avatarGradient} rounded-full flex items-center justify-center border-4 border-background shadow-2xl`}>
                                {callerAvatar ? (
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={callerAvatar} alt={callerName} />
                                        <AvatarFallback className="bg-transparent text-white font-bold text-2xl">
                                            {avatarLetter}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <span className="text-white font-bold text-2xl">{avatarLetter}</span>
                                )}
                            </div>
                            {/* Animated ring */}
                            <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-75"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Caller Info */}
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-bold text-card-foreground">
                            {callerName}
                        </DialogTitle>
                        <DialogDescription className="text-lg text-muted-foreground">
                            Cuộc gọi video đến
                        </DialogDescription>
                    </div>

                    {/* Call Status */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Đang gọi...</span>
                    </div>
                </DialogHeader>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-6 mt-8">
                    {/* Decline Button */}
                    <Button
                        onClick={onDecline}
                        disabled={isAccepting || isDeclining}
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                        size="lg"
                    >
                        {isDeclining ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                        ) : (
                            <PhoneOff className="h-6 w-6" />
                        )}
                    </Button>

                    {/* Accept Button */}
                    <Button
                        onClick={onAccept}
                        disabled={isAccepting || isDeclining}
                        className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                        size="lg"
                    >
                        {isAccepting ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                        ) : (
                            <Video className="h-6 w-6" />
                        )}
                    </Button>
                </div>

                {/* Call Duration (if needed) */}
                <div className="text-center mt-4">
                    <p className="text-xs text-muted-foreground">
                        Vuốt lên để trả lời, vuốt xuống để từ chối
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
