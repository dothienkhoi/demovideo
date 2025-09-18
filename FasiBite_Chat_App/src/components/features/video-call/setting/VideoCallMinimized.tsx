"use client";

import { Video, Maximize2, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCallSessionData } from "@/types/video-call-api.types";

interface VideoCallMinimizedProps {
    sessionData: VideoCallSessionData;
    conversationId: number;
    groupName: string;
    onMaximize: () => void;
    onEndCall: () => void;
}

export function VideoCallMinimized({
    sessionData,
    conversationId,
    groupName,
    onMaximize,
    onEndCall,
}: VideoCallMinimizedProps) {
    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-gray-900 rounded-lg p-3 shadow-lg border border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-white text-sm font-medium">{groupName}</p>
                        <p className="text-gray-400 text-xs">Cuộc gọi video đang diễn ra</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onMaximize}
                            className="text-white hover:bg-gray-800 w-8 h-8"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onEndCall}
                            className="text-red-400 hover:bg-red-900/20 w-8 h-8"
                        >
                            <PhoneOff className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
