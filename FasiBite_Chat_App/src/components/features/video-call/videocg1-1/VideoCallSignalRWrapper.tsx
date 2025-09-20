"use client";

import React from "react";
import { VideoCallModal } from "./VideoCallModal";

interface VideoCallSignalRWrapperProps {
    children: React.ReactNode;
}

export function VideoCallSignalRWrapper({ children }: VideoCallSignalRWrapperProps) {
    return (
        <>
            {children}
            <VideoCallModal />
        </>
    );
}