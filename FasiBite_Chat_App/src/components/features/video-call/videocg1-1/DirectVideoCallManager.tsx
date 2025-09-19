"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Video, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncomingCallModal } from "./IncomingCallModal";
import { OutgoingCallModal } from "./OutgoingCallModal";
import { useVideoCallAdmin } from "@/hooks/useVideoCallAdmin";
import { VideoCallSessionData } from "@/types/video-call-api.types";

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

interface DirectCallState {
    isIncomingCall: boolean;
    isOutgoingCall: boolean;
    callerId?: string;
    callerName?: string;
    callerAvatar?: string;
    callSessionId?: string;
    callStartTime?: number;
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
    const [callState, setCallState] = useState<DirectCallState>({
        isIncomingCall: false,
        isOutgoingCall: false,
    });
    const [isCreatingCall, setIsCreatingCall] = useState(false);
    const [isAcceptingCall, setIsAcceptingCall] = useState(false);
    const [isDecliningCall, setIsDecliningCall] = useState(false);
    const [isCancellingCall, setIsCancellingCall] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const {
        createVideoCall,
        joinVideoCall,
        openVideoCall,
        isCreatingCall: hookIsCreatingCall,
        isJoiningCall: hookIsJoiningCall,
    } = useVideoCallAdmin({ conversationId });

    // Update call duration
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callState.isOutgoingCall && callState.callStartTime) {
            interval = setInterval(() => {
                setCallDuration(Math.floor((Date.now() - callState.callStartTime!) / 1000));
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [callState.isOutgoingCall, callState.callStartTime]);

    // Handle starting a video call
    const handleStartVideoCall = useCallback(async () => {
        setIsCreatingCall(true);
        try {
            const sessionData = await createVideoCall();

            // Set outgoing call state
            setCallState({
                isIncomingCall: false,
                isOutgoingCall: true,
                callSessionId: sessionData.videoCallSessionId,
                callStartTime: Date.now(),
            });

            // TODO: Send call notification to partner via SignalR or WebSocket
            // This would trigger the incoming call modal on the partner's side

        } catch (error) {
            console.error("Failed to start video call:", error);
            // TODO: Show error toast
        } finally {
            setIsCreatingCall(false);
        }
    }, [createVideoCall]);

    // Handle accepting an incoming call
    const handleAcceptCall = useCallback(async () => {
        if (!callState.callSessionId) return;

        setIsAcceptingCall(true);
        try {
            const sessionData = await joinVideoCall(callState.callSessionId);

            // Close the incoming call modal and open video call room
            setCallState({
                isIncomingCall: false,
                isOutgoingCall: false,
            });

            // Open the video call room
            openVideoCall(sessionData, `${currentUserName} & ${partnerName}`);

        } catch (error) {
            console.error("Failed to accept video call:", error);
            // TODO: Show error toast
        } finally {
            setIsAcceptingCall(false);
        }
    }, [callState.callSessionId, joinVideoCall, openVideoCall, currentUserName, partnerName]);

    // Handle declining an incoming call
    const handleDeclineCall = useCallback(async () => {
        setIsDecliningCall(true);
        try {
            // TODO: Send decline notification to caller
            // TODO: Call API to decline the call

            setCallState({
                isIncomingCall: false,
                isOutgoingCall: false,
            });

        } catch (error) {
            console.error("Failed to decline video call:", error);
        } finally {
            setIsDecliningCall(false);
        }
    }, []);

    // Handle cancelling an outgoing call
    const handleCancelCall = useCallback(async () => {
        setIsCancellingCall(true);
        try {
            // TODO: Send cancel notification to recipient
            // TODO: Call API to cancel the call

            setCallState({
                isIncomingCall: false,
                isOutgoingCall: false,
            });

        } catch (error) {
            console.error("Failed to cancel video call:", error);
        } finally {
            setIsCancellingCall(false);
        }
    }, []);


    // Check if there's an active call
    const hasActiveCall = callState.isIncomingCall || callState.isOutgoingCall;
    const isCreating = isCreatingCall || hookIsCreatingCall;
    const isJoining = hookIsJoiningCall;

    return (
        <div className={className}>
            {/* Video Call Buttons */}
            {!hasActiveCall && (
                <div className="flex items-center gap-2">
                    {/* Start Video Call Button */}
                    <Button
                        onClick={handleStartVideoCall}
                        disabled={isCreating || isJoining}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        variant="ghost"
                        size="sm"
                    >
                        {isCreating ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                        ) : (
                            <Video className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        )}
                    </Button>

                    {/* Phone Call Button (placeholder) */}
                    <Button
                        onClick={() => {
                            // TODO: Implement phone call functionality
                            console.log("Phone call not implemented yet");
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        variant="ghost"
                        size="sm"
                    >
                        <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </Button>

                </div>
            )}

            {/* Incoming Call Modal */}
            <IncomingCallModal
                isOpen={callState.isIncomingCall}
                callerName={callState.callerName || ""}
                callerAvatar={callState.callerAvatar}
                callerId={callState.callerId || ""}
                onAccept={handleAcceptCall}
                onDecline={handleDeclineCall}
                isAccepting={isAcceptingCall}
                isDeclining={isDecliningCall}
            />

            {/* Outgoing Call Modal */}
            <OutgoingCallModal
                isOpen={callState.isOutgoingCall}
                recipientName={partnerName}
                recipientAvatar={partnerAvatar}
                recipientId={partnerId}
                onCancel={handleCancelCall}
                isCancelling={isCancellingCall}
                callDuration={callDuration}
            />
        </div>
    );
}
