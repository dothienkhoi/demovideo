"use client";

import React, { useEffect, useRef } from "react";
import { VideoConference } from "@livekit/components-react";

interface VideoConferenceWrapperProps {
    className?: string;
    chatMessageFormatter?: (message: string) => string;
}

export function VideoConferenceWrapper({ className, chatMessageFormatter }: VideoConferenceWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Error boundary for LiveKit layout errors
        const handleError = (event: ErrorEvent) => {
            if (event.message?.includes("Element not part of the array") ||
                event.message?.includes("updatePages") ||
                event.message?.includes("_camera_placeholder") ||
                event.message?.includes("GridLayout") ||
                event.message?.includes("useVisualStableUpdate")) {
                // Prevent the error from propagating
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        };

        // Add error listener
        window.addEventListener('error', handleError);

        // Also catch unhandled promise rejections
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (event.reason?.message?.includes("Element not part of the array") ||
                event.reason?.message?.includes("updatePages") ||
                event.reason?.message?.includes("_camera_placeholder")) {
                event.preventDefault();
            }
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        // Cleanup
        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    return (
        <div ref={containerRef} className={className}>
            <VideoConference
                chatMessageFormatter={chatMessageFormatter}
                className="h-full w-full"
            />
        </div>
    );
}
