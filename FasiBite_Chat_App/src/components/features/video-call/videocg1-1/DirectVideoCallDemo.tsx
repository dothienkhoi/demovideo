"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DirectVideoCallManager } from "./DirectVideoCallManager";
import { IncomingCallModal } from "./IncomingCallModal";
import { OutgoingCallModal } from "./OutgoingCallModal";

export function DirectVideoCallDemo() {
    const [showIncoming, setShowIncoming] = useState(false);
    const [showOutgoing, setShowOutgoing] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    // Simulate call duration
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showOutgoing) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            setCallDuration(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [showOutgoing]);

    return (
        <div className="p-8 space-y-8 bg-background min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-8">
                    Direct Video Call Demo
                </h1>

                {/* Demo Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Incoming Call Demo */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-card-foreground mb-4">
                            Incoming Call Modal
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Simulate receiving an incoming video call
                        </p>
                        <Button
                            onClick={() => setShowIncoming(true)}
                            className="w-full"
                        >
                            Show Incoming Call
                        </Button>
                    </div>

                    {/* Outgoing Call Demo */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-card-foreground mb-4">
                            Outgoing Call Modal
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Simulate making an outgoing video call
                        </p>
                        <Button
                            onClick={() => setShowOutgoing(true)}
                            className="w-full"
                        >
                            Show Outgoing Call
                        </Button>
                    </div>
                </div>

                {/* Direct Video Call Manager Demo */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-card-foreground mb-4">
                        Direct Video Call Manager
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        Integrated video call manager for direct messages
                    </p>
                    <div className="bg-muted/50 border border-border rounded-lg p-4">
                        <DirectVideoCallManager
                            conversationId={123}
                            partnerId="partner-123"
                            partnerName="John Doe"
                            partnerAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                            currentUserId="user-456"
                            currentUserName="Jane Smith"
                            currentUserAvatar="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
                        />
                    </div>
                </div>

                {/* Features List */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-card-foreground mb-4">
                        Features
                    </h2>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>✅ Beautiful incoming call modal with animated avatar</li>
                        <li>✅ Outgoing call modal with call duration timer</li>
                        <li>✅ Accept/Decline buttons with loading states</li>
                        <li>✅ Cancel call functionality</li>
                        <li>✅ Responsive design with proper animations</li>
                        <li>✅ Integration with existing video call system</li>
                        <li>✅ Proper TypeScript types and error handling</li>
                    </ul>
                </div>
            </div>

            {/* Incoming Call Modal */}
            <IncomingCallModal
                isOpen={showIncoming}
                callerName="John Doe"
                callerAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
                callerId="caller-123"
                onAccept={() => {
                    setShowIncoming(false);
                    console.log("Call accepted");
                }}
                onDecline={() => {
                    setShowIncoming(false);
                    console.log("Call declined");
                }}
            />

            {/* Outgoing Call Modal */}
            <OutgoingCallModal
                isOpen={showOutgoing}
                recipientName="Jane Smith"
                recipientAvatar="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face"
                recipientId="recipient-456"
                onCancel={() => {
                    setShowOutgoing(false);
                    console.log("Call cancelled");
                }}
                callDuration={callDuration}
            />
        </div>
    );
}
