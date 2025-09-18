"use client";

import { VideoCallRoom } from "@/components/features/video-call/romvideo/VideoCallRoom";

interface VideoCallPageProps {
    params: {
        roomId: string;
    };
    searchParams: {
        groupName?: string;
        token?: string;
        serverUrl?: string;
        settings?: string;
        groupLeaderId?: string;
        conversationId?: string;
    };
}

export default function VideoCallPage({ params, searchParams }: VideoCallPageProps) {
    return (
        <div className="h-screen w-screen overflow-hidden">
            <VideoCallRoom
                roomId={params.roomId}
                conversationId={parseInt(searchParams.conversationId || "1")}
                groupName={searchParams.groupName || "Video Call"}
                livekitToken={searchParams.token}
                livekitServerUrl={searchParams.serverUrl}
                settings={searchParams.settings}
                groupLeaderId={searchParams.groupLeaderId}
            />
        </div>
    );
}
