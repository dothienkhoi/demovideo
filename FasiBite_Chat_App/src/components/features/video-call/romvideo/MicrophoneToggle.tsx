"use client";

import React, { useCallback } from "react";
import { useTrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MicrophoneToggle() {
    const { enabled, toggle, pending } = useTrackToggle({ source: Track.Source.Microphone });

    const handleClick = useCallback(async () => {
        try {
            await toggle();
        } catch (error) {
            // Silently handle microphone toggle errors
            // Could be due to permissions or hardware issues
        }
    }, [toggle]);

    return (
        <Button
            onClick={handleClick}
            disabled={pending}
            className={`rounded-full w-14 h-14 border-2 transition-all duration-200 transform active:scale-95 ${pending
                    ? 'bg-gray-500/20 text-gray-400 border-gray-400/50 cursor-not-allowed'
                    : enabled
                        ? 'bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50'
                        : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-400/50 hover:border-red-400'
                }`}
            aria-label={enabled ? "Turn off microphone" : "Turn on microphone"}
        >
            {pending ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
            ) : enabled ? (
                <Mic className="w-6 h-6" />
            ) : (
                <MicOff className="w-6 h-6" />
            )}
        </Button>
    );
}
