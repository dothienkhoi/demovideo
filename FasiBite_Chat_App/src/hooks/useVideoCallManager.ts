import { useState, useCallback } from "react";
import { startVideoCall, joinVideoCallSession } from "@/lib/api/customer/video-call";
import { VideoCallSessionData } from "@/types/video-call-api.types";

interface UseVideoCallManagerProps {
    conversationId: number;
}

export function useVideoCallManager({ conversationId }: UseVideoCallManagerProps) {
    const [isCreatingCall, setIsCreatingCall] = useState(false);
    const [isJoiningCall, setIsJoiningCall] = useState(false);
    const [activeVideoCall, setActiveVideoCall] = useState<VideoCallSessionData | null>(null);

    // Tạo cuộc gọi video mới
    const createVideoCall = useCallback(async () => {
        setIsCreatingCall(true);
        try {
            const sessionData = await startVideoCall(conversationId);
            setActiveVideoCall(sessionData);
            return sessionData;
        } catch (error) {
            throw error;
        } finally {
            setIsCreatingCall(false);
        }
    }, [conversationId]);

    // Tham gia cuộc gọi video
    const joinVideoCall = useCallback(async (sessionId: string) => {
        setIsJoiningCall(true);
        try {
            const sessionData = await joinVideoCallSession(conversationId, sessionId);
            setActiveVideoCall(sessionData);
            return sessionData;
        } catch (error) {
            throw error;
        } finally {
            setIsJoiningCall(false);
        }
    }, [conversationId]);

    // Mở cuộc gọi video trong tab mới
    const openVideoCall = useCallback((sessionData: VideoCallSessionData, groupName?: string) => {
        const params = new URLSearchParams({
            groupName: groupName || "Video Call",
            token: sessionData.livekitToken,
            serverUrl: sessionData.livekitServerUrl,
            conversationId: conversationId.toString(),
        });

        const videoCallUrl = `/video-call/${sessionData.videoCallSessionId}?${params.toString()}`;
        window.open(videoCallUrl, '_blank');
    }, [conversationId]);

    // Đóng cuộc gọi video
    const closeVideoCall = useCallback(() => {
        setActiveVideoCall(null);
    }, []);

    return {
        // State
        isCreatingCall,
        isJoiningCall,
        activeVideoCall,

        // Actions
        createVideoCall,
        joinVideoCall,
        openVideoCall,
        closeVideoCall,
    };
}
