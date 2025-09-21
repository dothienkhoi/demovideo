"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, PhoneOff, Video, Clock } from "lucide-react";
import { getAvatarGradient, getInitials } from "@/lib/utils/formatters";
import { useVideoCallContext } from "@/providers/VideoCallProvider";

interface VideoCallModalProps {
    // Props are now handled by the context
}

export function VideoCallModal({ }: VideoCallModalProps) {
    const {
        videoCallState,
        acceptCall,
        declineCall,
        endCall,
        clearIncomingCall,
        clearOutgoingCall
    } = useVideoCallContext();

    const [isAccepting, setIsAccepting] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const {
        isIncomingCall,
        isOutgoingCall,
        incomingCallData,
        outgoingCallData,
        callStatus,
        isActive
    } = videoCallState;


    // Timer for call duration
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (callStatus === 'connected') {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [callStatus]);

    // Reset duration when call starts
    useEffect(() => {
        if (callStatus === 'connected') {
            setCallDuration(0);
        }
    }, [callStatus]);

    // Don't render if no active call or if call is already active
    if ((!isIncomingCall || !incomingCallData) && (!isOutgoingCall || !outgoingCallData) || isActive) {
        return null;
    }

    // Format call duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle incoming call actions
    const handleAccept = async () => {
        if (isAccepting || isDeclining || !incomingCallData) {
            return;
        }

        setIsAccepting(true);
        try {
            await acceptCall(incomingCallData.videoCallSessionId);
            // The context will handle the state update
        } catch (error) {
            // Handle error silently
        } finally {
            setIsAccepting(false);
        }
    };

    const handleDecline = async () => {
        if (isAccepting || isDeclining || !incomingCallData) {
            return;
        }

        setIsDeclining(true);
        try {
            await declineCall(incomingCallData.videoCallSessionId);
            clearIncomingCall();
        } catch (error) {
            // Handle error silently
        } finally {
            setIsDeclining(false);
        }
    };

    // Handle outgoing call actions
    const handleEndCall = async () => {
        if (isEnding || !outgoingCallData) {
            return;
        }

        setIsEnding(true);
        try {
            await endCall(outgoingCallData.sessionId);
            clearOutgoingCall();
        } catch (error) {
            // Handle error silently
        } finally {
            setIsEnding(false);
        }
    };

    // Handle dialog close
    const handleClose = () => {
        if (isIncomingCall && incomingCallData) {
            if (callStatus === 'ringing') {
                handleDecline();
            } else {
                clearIncomingCall();
            }
        } else if (isOutgoingCall && outgoingCallData) {
            if (callStatus === 'ringing' || callStatus === 'connected') {
                handleEndCall();
            } else {
                clearOutgoingCall();
            }
        }
    };

    // Get caller/recipient information
    let displayName = "";
    let displayAvatar = "";

    if (isIncomingCall && incomingCallData) {
        displayName = incomingCallData.caller.fullName;
        displayAvatar = incomingCallData.caller.avatarUrl || "";
    } else if (isOutgoingCall && outgoingCallData) {
        // For outgoing calls, use the receiver info
        displayName = outgoingCallData.receiverName;
        displayAvatar = outgoingCallData.receiverAvatar || "";
    }

    const avatarGradient = getAvatarGradient();
    const avatarLetter = getInitials(displayName);

    return (
        <Dialog
            open={isIncomingCall || isOutgoingCall}
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                }
            }}
        >
            <DialogContent className="bg-card border-border p-8 rounded-2xl shadow-2xl max-w-md z-[9999]">
                <DialogHeader className="text-center space-y-6">
                    {/* Avatar */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className={`w-24 h-24 ${avatarGradient} rounded-full flex items-center justify-center border-4 border-background shadow-2xl`}>
                                {displayAvatar ? (
                                    <Avatar className="w-full h-full">
                                        <AvatarImage src={displayAvatar} alt={displayName} />
                                        <AvatarFallback className="bg-transparent text-white font-bold text-2xl">
                                            {avatarLetter}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <span className="text-white font-bold text-2xl">{avatarLetter}</span>
                                )}
                            </div>
                            {/* Animated ring for incoming call */}
                            {isIncomingCall && callStatus === 'ringing' && (
                                <>
                                    <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-75"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-pulse"></div>
                                </>
                            )}
                            {/* Animated ring for outgoing call */}
                            {isOutgoingCall && callStatus === 'ringing' && (
                                <>
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-75"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-pulse"></div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Caller/Recipient Info */}
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-bold text-card-foreground">
                            {displayName}
                        </DialogTitle>
                        <DialogDescription className="text-lg text-muted-foreground">
                            {isIncomingCall && 'Cuộc gọi video đến'}
                            {isOutgoingCall && callStatus === 'ringing' && 'Đang gọi...'}
                            {isOutgoingCall && callStatus === 'connecting' && 'Đang kết nối...'}
                            {isOutgoingCall && callStatus === 'connected' && 'Cuộc gọi video'}
                        </DialogDescription>
                    </div>

                    {/* Call Status */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        {callStatus === 'ringing' && isIncomingCall && (
                            <>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Đang gọi...</span>
                            </>
                        )}
                        {callStatus === 'ringing' && isOutgoingCall && (
                            <>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span>Đang gọi...</span>
                            </>
                        )}
                        {callStatus === 'connecting' && (
                            <>
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span>Đang kết nối...</span>
                            </>
                        )}
                        {callStatus === 'connected' && (
                            <>
                                <Clock className="w-4 h-4 text-green-500" />
                                <span className="text-green-500 font-mono">{formatDuration(callDuration)}</span>
                            </>
                        )}
                        {callStatus === 'declined' && (
                            <>
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-red-500">Cuộc gọi bị từ chối</span>
                            </>
                        )}
                        {callStatus === 'missed' && (
                            <>
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span className="text-orange-500">Cuộc gọi nhỡ</span>
                            </>
                        )}
                    </div>
                </DialogHeader>

                {/* Action Buttons */}
                {isIncomingCall && callStatus === 'ringing' && (
                    <div className="flex items-center justify-center gap-6 mt-8">
                        {/* Decline Button */}
                        <Button
                            onClick={handleDecline}
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
                            onClick={handleAccept}
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
                )}

                {isOutgoingCall && (
                    <div className="flex items-center justify-center gap-6 mt-8">
                        {/* End Call Button */}
                        <Button
                            onClick={handleEndCall}
                            disabled={isEnding}
                            className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                            size="lg"
                        >
                            {isEnding ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                            ) : (
                                <PhoneOff className="h-6 w-6" />
                            )}
                        </Button>

                        {/* Video Button (for connected calls) */}
                        {callStatus === 'connected' && (
                            <Button
                                className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                                size="lg"
                            >
                                <Video className="h-6 w-6" />
                            </Button>
                        )}
                    </div>
                )}

                {/* Call Info */}
                <div className="text-center mt-4">
                    <p className="text-xs text-muted-foreground">
                        {isIncomingCall && callStatus === 'ringing' && "Vuốt lên để trả lời, vuốt xuống để từ chối"}
                        {isOutgoingCall && callStatus === 'ringing' && "Đang chờ người nhận trả lời..."}
                        {callStatus === 'connecting' && "Đang thiết lập cuộc gọi..."}
                        {callStatus === 'connected' && "Cuộc gọi video đang diễn ra"}
                        {callStatus === 'declined' && "Người nhận đã từ chối cuộc gọi"}
                        {callStatus === 'missed' && "Người nhận không trả lời"}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}