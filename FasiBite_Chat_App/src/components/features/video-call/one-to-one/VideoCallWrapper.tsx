"use client";

import React, { useState, useEffect } from "react";
import { VideoCallInterface1v1 } from "./VideoCallInterface1v1";
import { useVideoCallContext } from "@/providers/VideoCallProvider";

type VideoCallSize = 'fullscreen' | 'minimized' | 'ultra-minimized';

interface VideoCallWrapperProps {
    onClose?: () => void;
    className?: string;
}

export function VideoCallWrapper({ onClose, className }: VideoCallWrapperProps) {
    const [size, setSize] = useState<VideoCallSize>('fullscreen');
    const [hasAutoMinimized, setHasAutoMinimized] = useState(false);
    const { videoCallState } = useVideoCallContext();

    // Auto-minimize after 3 seconds if call is connected (only once per call)
    useEffect(() => {
        if (videoCallState.callStatus === 'connected' && !hasAutoMinimized) {
            const timer = setTimeout(() => {
                setSize('minimized');
                setHasAutoMinimized(true);
            }, 3000);
            return () => clearTimeout(timer);
        }

        // Reset auto-minimize flag when call ends
        if (videoCallState.callStatus !== 'connected') {
            setHasAutoMinimized(false);
            setSize('fullscreen'); // Reset to fullscreen for next call
        }
    }, [videoCallState.callStatus, hasAutoMinimized]);

    const handleSizeChange = (newSize: VideoCallSize) => {
        setSize(newSize);
        // Prevent auto-minimize after manual size change
        if (newSize === 'fullscreen') {
            setHasAutoMinimized(true);
        }
    };

    return (
        <VideoCallInterface1v1
            size={size}
            onSizeChange={handleSizeChange}
            onClose={onClose}
            className={className}
        />
    );
}
