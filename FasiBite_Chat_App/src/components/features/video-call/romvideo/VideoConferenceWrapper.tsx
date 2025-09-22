"use client";

import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { VideoConference, useRoomContext } from "@livekit/components-react";

interface VideoConferenceWrapperProps {
    className?: string;
    chatMessageFormatter?: (message: string) => string;
}

export function VideoConferenceWrapper({ className, chatMessageFormatter }: VideoConferenceWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const room = useRoomContext();
    const [isMounted, setIsMounted] = useState(false);

    // Memoized error handler for LiveKit layout errors
    const handleError = useCallback((event: ErrorEvent) => {
        const errorPatterns = [
            "Element not part of the array",
            "updatePages",
            "_camera_placeholder",
            "GridLayout",
            "useVisualStableUpdate",
            "No subscription", // SessionManager errors
            "Cannot read properties of undefined",
            "Cannot read property",
            "Maximum update depth exceeded"
        ];

        if (errorPatterns.some(pattern => event.message?.includes(pattern))) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, []);

    // Memoized promise rejection handler
    const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
        const errorPatterns = [
            "Element not part of the array",
            "updatePages",
            "_camera_placeholder",
            "No subscription",
            "Maximum update depth exceeded"
        ];

        if (errorPatterns.some(pattern => event.reason?.message?.includes(pattern))) {
            event.preventDefault();
        }
    }, []);

    // Optimized error boundary setup
    useEffect(() => {
        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, [handleError, handleUnhandledRejection]);

    // Ensure component is mounted before rendering VideoConference
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Memoized video conference props
    const videoConferenceProps = useMemo(() => ({
        chatMessageFormatter,
        className: "h-full w-full"
    }), [chatMessageFormatter]);

    // Don't render VideoConference until component is fully mounted
    if (!isMounted || !room) {
        return (
            <div ref={containerRef} className={className}>
                <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={className}>
            <VideoConference {...videoConferenceProps} />
        </div>
    );
}
