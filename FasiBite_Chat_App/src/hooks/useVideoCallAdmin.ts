import { useState, useEffect, useCallback, useMemo } from "react";
import {
    checkAdminStatus,
    getVideoCallSessionDetails,
    VideoCallSessionDetails,
    VideoCallAdminParticipant,
    startVideoCall,
    joinVideoCallSession
} from "@/lib/api/customer/video-call";
import { VideoCallSessionData } from "@/types/video-call-api.types";
import { useAuthStore } from "@/store/authStore";

interface UseVideoCallAdminProps {
    sessionId?: string | null;
    conversationId?: number;
    enabled?: boolean;
}

interface UseVideoCallAdminReturn {
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;
    sessionDetails: VideoCallSessionDetails | null;
    participants: VideoCallAdminParticipant[];
    currentUser: VideoCallAdminParticipant | null;
    refreshAdminStatus: () => Promise<void>;
    refreshSessionDetails: () => Promise<void>;
    // Video call management functions
    isCreatingCall: boolean;
    isJoiningCall: boolean;
    activeVideoCall: VideoCallSessionData | null;
    isInitiator: boolean;
    createVideoCall: () => Promise<VideoCallSessionData>;
    joinVideoCall: (sessionId: string) => Promise<VideoCallSessionData>;
    openVideoCall: (sessionData: VideoCallSessionData, groupName?: string) => void;
    closeVideoCall: () => void;
}

export function useVideoCallAdmin({
    sessionId,
    conversationId,
    enabled = true
}: UseVideoCallAdminProps): UseVideoCallAdminReturn {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionDetails, setSessionDetails] = useState<VideoCallSessionDetails | null>(null);

    // Video call management state
    const [isCreatingCall, setIsCreatingCall] = useState(false);
    const [isJoiningCall, setIsJoiningCall] = useState(false);
    const [activeVideoCall, setActiveVideoCall] = useState<VideoCallSessionData | null>(null);
    const [isInitiator, setIsInitiator] = useState(false);

    const { user } = useAuthStore();
    const currentUserId = user?.id;

    // Memoized current user participant info
    const currentUser = useMemo(() =>
        sessionDetails?.participants.find(p => p.userId === currentUserId) || null,
        [sessionDetails?.participants, currentUserId]
    );

    const participants = useMemo(() =>
        sessionDetails?.participants || [],
        [sessionDetails?.participants]
    );

    // Memoized admin status refresh function
    const refreshAdminStatus = useCallback(async () => {
        if (!sessionId || !conversationId || !enabled) return;

        setIsLoading(true);
        setError(null);

        try {
            const adminStatus = await checkAdminStatus(sessionId, conversationId, currentUserId);
            setIsAdmin(adminStatus);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to check admin status";

            // Handle 404 errors specifically - session doesn't exist
            if (errorMessage.includes("not found") || errorMessage.includes("404")) {
                setError("Video call session not found or has ended");
                setIsAdmin(false);
            } else {
                setError(errorMessage);
                setIsAdmin(false);
            }
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, conversationId, enabled, currentUserId]);

    // Memoized session details refresh function
    const refreshSessionDetails = useCallback(async () => {
        if (!sessionId || !conversationId || !enabled) return;

        setIsLoading(true);
        setError(null);

        try {
            const details = await getVideoCallSessionDetails(sessionId, conversationId);
            setSessionDetails(details);

            // Check if current user is admin from session details
            if (currentUserId) {
                const isInitiator = details.initiatorUserId === currentUserId;
                const participantData = details.participants.find(p => p.userId === currentUserId);
                const isParticipantAdmin = participantData?.isAdmin === true;

                setIsAdmin(isInitiator || isParticipantAdmin);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch session details";

            // Handle 404 errors specifically - session doesn't exist
            if (errorMessage.includes("not found") || errorMessage.includes("404")) {
                setError("Video call session not found or has ended");
                setSessionDetails(null);
                setIsAdmin(false);
            } else {
                setError(errorMessage);
                setSessionDetails(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, conversationId, enabled, currentUserId]);

    // Initial load
    useEffect(() => {
        if (sessionId && conversationId && enabled) {
            // Load both admin status and session details
            Promise.all([
                refreshAdminStatus(),
                refreshSessionDetails()
            ]);
        }
    }, [sessionId, conversationId, enabled, refreshAdminStatus, refreshSessionDetails]);

    // Determine admin status from multiple sources
    useEffect(() => {
        if (sessionDetails && currentUserId) {
            const isInitiator = sessionDetails.initiatorUserId === currentUserId;
            const participantData = sessionDetails.participants.find(p => p.userId === currentUserId);
            const isParticipantAdmin = participantData?.isAdmin === true;

            // User is admin if they are the initiator OR explicitly marked as admin
            setIsAdmin(isInitiator || isParticipantAdmin);
        }
    }, [sessionDetails, currentUserId]);

    // Memoized video call creation function
    const createVideoCall = useCallback(async (): Promise<VideoCallSessionData> => {
        if (!conversationId) {
            throw new Error("Conversation ID is required to create a video call");
        }

        setIsCreatingCall(true);
        try {
            const sessionData = await startVideoCall(conversationId);
            setActiveVideoCall(sessionData);
            setIsInitiator(true);
            return sessionData;
        } finally {
            setIsCreatingCall(false);
        }
    }, [conversationId]);

    // Memoized video call join function
    const joinVideoCall = useCallback(async (sessionId: string): Promise<VideoCallSessionData> => {
        if (!conversationId) {
            throw new Error("Conversation ID is required to join a video call");
        }

        setIsJoiningCall(true);
        try {
            const sessionData = await joinVideoCallSession(conversationId, sessionId, currentUserId);
            setActiveVideoCall(sessionData);
            setIsInitiator(false);
            return sessionData;
        } finally {
            setIsJoiningCall(false);
        }
    }, [conversationId, currentUserId]);

    // Memoized video call opening function
    const openVideoCall = useCallback((sessionData: VideoCallSessionData, groupName?: string) => {
        if (!conversationId) {
            return;
        }

        const params = new URLSearchParams({
            groupName: groupName || "Video Call",
            token: sessionData.livekitToken,
            serverUrl: sessionData.livekitServerUrl,
            conversationId: conversationId.toString(),
            isInitiator: isInitiator.toString(),
            userId: user?.id || "",
        });

        const videoCallUrl = `/video-call/${sessionData.videoCallSessionId}?${params.toString()}`;
        window.open(videoCallUrl, '_blank');
    }, [conversationId, isInitiator, user?.id]);

    // Memoized video call closing function
    const closeVideoCall = useCallback(() => {
        setActiveVideoCall(null);
        setIsInitiator(false);
    }, []);

    return {
        isAdmin,
        isLoading,
        error,
        sessionDetails,
        participants,
        currentUser,
        refreshAdminStatus,
        refreshSessionDetails,
        // Video call management
        isCreatingCall,
        isJoiningCall,
        activeVideoCall,
        isInitiator,
        createVideoCall,
        joinVideoCall,
        openVideoCall,
        closeVideoCall,
    };
}