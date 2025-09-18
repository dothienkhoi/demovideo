"use client";

import { useRef, useEffect, useState } from "react";
import { Video } from "lucide-react";
import { VideoCallSettings } from "../../../../types/video-call.types";

interface SimpleCameraPreviewProps {
    settings: VideoCallSettings;
    onSettingsChange: (settings: Partial<VideoCallSettings>) => void;
}

export function SimpleCameraPreview({ settings, onSettingsChange }: SimpleCameraPreviewProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Start camera when enabled
    useEffect(() => {
        if (settings.cameraEnabled) {
            startCamera();
        } else {
            stopCamera();
        }
    }, [settings.cameraEnabled, settings.selectedCamera]);

    // Update video element when stream changes
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(console.error);
        }
    }, [stream]);

    const startCamera = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const constraints: MediaStreamConstraints = {
                video: settings.selectedCamera ? { deviceId: settings.selectedCamera } : true,
                audio: false
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                await videoRef.current.play();
            }
        } catch (err) {
            console.error("Error starting camera:", err);
            setError("Không thể truy cập camera");
        } finally {
            setIsLoading(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);



    return (
        <div className="flex flex-col h-full bg-card rounded-l-xl lg:rounded-l-xl rounded-t-xl lg:rounded-t-none">
            {/* Video Preview Area */}
            <div className="flex-1 relative bg-muted rounded-tl-xl lg:rounded-tl-xl rounded-t-xl lg:rounded-t-none overflow-hidden min-h-0 flex items-center justify-center">
                {settings.cameraEnabled ? (
                    <>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center text-center">
                                <p className="text-lg font-medium mb-2 text-destructive">Lỗi Preview</p>
                                <p className="text-sm text-muted-foreground">{error}</p>
                            </div>
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover bg-black"
                                style={{
                                    minWidth: '100%',
                                    minHeight: '100%',
                                    backgroundColor: '#000'
                                }}
                            />
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center mb-4">
                            <Video className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Bật để xem trước</p>
                    </div>
                )}
            </div>

        </div>
    );
}
