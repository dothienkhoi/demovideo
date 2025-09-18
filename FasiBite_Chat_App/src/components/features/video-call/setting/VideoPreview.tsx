"use client";

import { SimpleCameraPreview } from "./SimpleCameraPreview";
import { VideoCallSettings, VideoPreviewProps } from "../../../../types/video-call.types";

export function VideoPreview({ settings, onSettingsChange }: VideoPreviewProps) {
    return (
        <SimpleCameraPreview
            settings={settings}
            onSettingsChange={onSettingsChange}
        />
    );
}