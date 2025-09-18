"use client";

import React from "react";
import { useTrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CameraToggle() {
    const { enabled, toggle } = useTrackToggle({ source: Track.Source.Camera });

    const handleClick = () => {
        toggle();
    };

    return (
        <Button
            onClick={handleClick}
            className={`rounded-full w-14 h-14 border-2 transition-all duration-200 transform active:scale-95 ${enabled
                ? 'bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50'
                : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-400/50 hover:border-red-400'
                }`}
        >
            {enabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>
    );
}
