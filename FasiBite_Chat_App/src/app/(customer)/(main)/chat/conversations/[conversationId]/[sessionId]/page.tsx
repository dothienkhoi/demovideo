"use client";

import { VideoCallInterface1v1 } from "@/components/features/video-call/videocg1-1/VideoCallInterface1v1";
import { use } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface VideoCallInConversationPageProps {
    params: Promise<{
        conversationId: string;
        sessionId: string;
    }>;
    searchParams: Promise<{
        partnerId?: string;
        partnerName?: string;
        partnerAvatar?: string;
        token?: string;
        serverUrl?: string;
    }>;
}

export default function VideoCallInConversationPage({ params, searchParams }: VideoCallInConversationPageProps) {
    const resolvedParams = use(params);
    const resolvedSearchParams = use(searchParams);
    const { user } = useAuthStore();
    const router = useRouter();

    // Handle end call - navigate back to conversation
    const handleEndCall = () => {
        router.push(`/chat/conversations/${resolvedParams.conversationId}`);
    };

    // Handle minimize - navigate back to conversation
    const handleMinimize = () => {
        router.push(`/chat/conversations/${resolvedParams.conversationId}`);
    };

    // Check if we have all required data
    if (!resolvedSearchParams.token || !resolvedSearchParams.serverUrl || !resolvedSearchParams.partnerId || !resolvedSearchParams.partnerName) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-black">
                <div className="text-center text-white">
                    <h2 className="text-xl font-semibold mb-2">Thiếu thông tin cuộc gọi</h2>
                    <p className="text-gray-400 mb-4">Không thể tải giao diện video call</p>
                    <button
                        onClick={() => router.push(`/chat/conversations/${resolvedParams.conversationId}`)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Quay lại cuộc trò chuyện
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden">
            <VideoCallInterface1v1
                sessionId={resolvedParams.sessionId}
                conversationId={parseInt(resolvedParams.conversationId)}
                partnerId={resolvedSearchParams.partnerId}
                partnerName={resolvedSearchParams.partnerName}
                partnerAvatar={resolvedSearchParams.partnerAvatar}
                currentUserId={user?.id || ""}
                currentUserName={user?.fullName || ""}
                currentUserAvatar={user?.avatarUrl || undefined}
                livekitToken={resolvedSearchParams.token}
                livekitServerUrl={resolvedSearchParams.serverUrl}
                onEndCall={handleEndCall}
                onMinimize={handleMinimize}
            />
        </div>
    );
}
