// Base error handling utility
const handleApiError = (error: any, defaultMessage: string): never => {
    console.error("[VideoCallAPI] API Error:", error);
    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    } else if (error.response?.status === 500) {
        throw new Error(`Server error: ${defaultMessage}`);
    } else if (error.response?.status === 404) {
        throw new Error(`Resource not found: ${defaultMessage}`);
    } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error(`Unauthorized: ${defaultMessage}`);
    } else {
        throw new Error(error.message || defaultMessage);
    }
};

// Response validation utility
const validateApiResponse = <T>(response: { data: { success: boolean; data: T; message?: string } }, errorMessage: string): T => {
    console.log("[VideoCallAPI] Validating API response:", response.data);
    if (!response.data.success) {
        console.error("[VideoCallAPI] API response indicates failure:", response.data.message || errorMessage);
        throw new Error(response.data.message || errorMessage);
    }
    console.log("[VideoCallAPI] API response validated successfully");
    return response.data.data;
};

import apiClient from "@/lib/api/apiClient";
import { ApiResponse } from "@/types/api.types";
import {
    StartVideoCallRequest,
    StartVideoCallResponse,
    VideoCallSessionData,
    VideoCallParticipant,
    StartCallResponseDto,
    JoinCallResponseDto,
    VideoCallSession,
    CallHistoryResponse,
    VideoCallSessionDetails,
    VideoCallAdminParticipant
} from "@/types/video-call-api.types";

// ===== SIGNALR VIDEO CALL APIs =====

/**
 * Start a new video call session via SignalR
 * POST /api/v1/conversations/start-video-call
 */
export const startVideoCallSignalR = async (
    conversationId: number
): Promise<VideoCallSessionData> => {
    console.log("[VideoCallAPI] startVideoCallSignalR called with conversationId:", conversationId);

    try {
        console.log("[VideoCallAPI] Making POST request to start video call");
        const response = await apiClient.post<StartVideoCallResponse>(
            `/conversations/${conversationId}/calls`
        );

        console.log("[VideoCallAPI] Start call response received:", response.data);
        const backendData = validateApiResponse(response, "Failed to start video call");
        console.log("[VideoCallAPI] Backend data:", backendData);

        const result = {
            videoCallSessionId: backendData.videoCallSessionId,
            livekitToken: backendData.livekitToken,
            livekitServerUrl: backendData.livekitServerUrl,
        };

        console.log("[VideoCallAPI] Start call result:", result);
        return result;
    } catch (error) {
        console.error("[VideoCallAPI] Failed to start video call:", error);
        return handleApiError(error, "Failed to start video call");
    }
};

/**
 * Accept an incoming video call via SignalR
 * POST /api/v1/video-calls/{sessionId}/accept
 */
export const acceptVideoCallSignalR = async (
    sessionId: string
): Promise<{ livekitToken: string; livekitServerUrl: string }> => {
    console.log("[VideoCallAPI] acceptVideoCallSignalR called with sessionId:", sessionId);

    try {
        console.log("[VideoCallAPI] Making POST request to accept video call");
        const response = await apiClient.post<ApiResponse<{ livekitToken: string; livekitServerUrl: string }>>(
            `/video-calls/${sessionId}/accept`
        );

        console.log("[VideoCallAPI] Accept call response received:", response.data);
        const result = validateApiResponse(response, "Failed to accept video call");
        console.log("[VideoCallAPI] Accept call result:", result);
        return result;
    } catch (error) {
        console.error("[VideoCallAPI] Failed to accept video call:", error);
        return handleApiError(error, "Failed to accept video call");
    }
};

/**
 * Decline an incoming video call via SignalR
 * POST /api/v1/video-calls/{sessionId}/decline
 */
export const declineVideoCallSignalR = async (
    sessionId: string
): Promise<void> => {
    console.log("[VideoCallAPI] declineVideoCallSignalR called with sessionId:", sessionId);

    try {
        console.log("[VideoCallAPI] Making POST request to decline video call");
        await apiClient.post(`/video-calls/${sessionId}/decline`);
        console.log("[VideoCallAPI] Call declined successfully");
    } catch (error) {
        console.error("[VideoCallAPI] Failed to decline video call:", error);
        return handleApiError(error, "Failed to decline video call");
    }
};

/**
 * Leave a video call session via SignalR
 * POST /api/v1/video-calls/{sessionId}/leave
 */
export const leaveVideoCallSignalR = async (
    sessionId: string
): Promise<void> => {
    console.log("[VideoCallAPI] leaveVideoCallSignalR called with sessionId:", sessionId);

    try {
        console.log("[VideoCallAPI] Making POST request to leave video call");
        await apiClient.post(`/video-calls/${sessionId}/leave`);
        console.log("[VideoCallAPI] Call left successfully");
    } catch (error) {
        console.error("[VideoCallAPI] Failed to leave video call:", error);
        return handleApiError(error, "Failed to leave video call");
    }
};

// ===== CORE VIDEO CALL APIs =====

/**
 * Start a new video call session in a conversation
 * POST /api/v1/conversations/{conversationId}/calls
 */
export const startVideoCall = async (
    conversationId: number
): Promise<VideoCallSessionData> => {
    console.log("[VideoCallAPI] startVideoCall called with conversationId:", conversationId);

    try {
        console.log("[VideoCallAPI] Making POST request to start video call");
        const response = await apiClient.post<StartVideoCallResponse>(
            `/conversations/${conversationId}/calls`
        );

        console.log("[VideoCallAPI] Start call response received:", response.data);
        const backendData = validateApiResponse(response, "Failed to start video call");
        console.log("[VideoCallAPI] Backend data:", backendData);

        const result = {
            videoCallSessionId: backendData.videoCallSessionId,
            livekitToken: backendData.livekitToken,
            livekitServerUrl: backendData.livekitServerUrl,
        };
        console.log("[VideoCallAPI] Start call result:", result);
        return result;
    } catch (error) {
        console.error("[VideoCallAPI] Failed to start video call:", error);
        return handleApiError(error, "Failed to start video call");
    }
};

/**
 * Join an existing video call session
 * POST /api/v1/video-calls/{sessionId}/join
 */
export const joinVideoCall = async (
    sessionId: string,
    conversationId: number,
    userId?: string
): Promise<VideoCallSessionData> => {
    console.log("[VideoCallAPI] joinVideoCall called with:", { sessionId, conversationId, userId });

    try {
        const requestBody: Record<string, any> = { conversationId };

        if (userId) {
            requestBody.userId = userId;
        }

        console.log("[VideoCallAPI] Making POST request to join video call with body:", requestBody);
        const response = await apiClient.post<ApiResponse<JoinCallResponseDto>>(
            `/video-calls/${sessionId}/join`,
            requestBody
        );

        console.log("[VideoCallAPI] Join call response received:", response.data);
        const backendData = validateApiResponse(response, "Failed to join video call");
        console.log("[VideoCallAPI] Backend data:", backendData);

        const result = {
            videoCallSessionId: sessionId,
            livekitToken: backendData.livekitToken,
            livekitServerUrl: backendData.livekitServerUrl,
        };
        console.log("[VideoCallAPI] Join call result:", result);
        return result;
    } catch (error) {
        console.error("[VideoCallAPI] Failed to join video call:", error);
        return handleApiError(error, "Failed to join video call");
    }
};

/**
 * Leave a video call session
 * POST /api/v1/video-calls/{sessionId}/leave
 */
export const leaveVideoCall = async (
    sessionId: string
): Promise<void> => {
    console.log("[VideoCallAPI] leaveVideoCall called with sessionId:", sessionId);

    try {
        console.log("[VideoCallAPI] Making POST request to leave video call");
        await apiClient.post(`/video-calls/${sessionId}/leave`);
        console.log("[VideoCallAPI] Call left successfully");
    } catch (error) {
        console.error("[VideoCallAPI] Failed to leave video call:", error);
        return handleApiError(error, "Failed to leave video call");
    }
};

/**
 * End video call for all participants (Admin/Host only)
 * POST /api/v1/video-calls/{sessionId}/end
 */
export const endVideoCallForAll = async (sessionId: string): Promise<void> => {
    console.log("[VideoCallAPI] endVideoCallForAll called with sessionId:", sessionId);

    try {
        console.log("[VideoCallAPI] Making POST request to end video call for all");
        await apiClient.post(`/video-calls/${sessionId}/end`);
        console.log("[VideoCallAPI] Call ended for all successfully");
    } catch (error) {
        console.error("[VideoCallAPI] Failed to end video call for all:", error);
        return handleApiError(error, "Failed to end video call for all");
    }
};

// ===== ADMIN CONTROL APIs =====

/**
 * Mute participant microphone (Admin/Host only)
 * POST /api/v1/video-calls/{sessionId}/participants/{targetUserId}/mute-mic
 */
export const muteParticipantMic = async (sessionId: string, targetUserId: string): Promise<void> => {
    console.log("[VideoCallAPI] muteParticipantMic called with:", { sessionId, targetUserId });

    try {
        console.log("[VideoCallAPI] Making POST request to mute participant microphone");
        await apiClient.post(`/video-calls/${sessionId}/participants/${targetUserId}/mute-mic`);
        console.log("[VideoCallAPI] Participant microphone muted successfully");
    } catch (error) {
        console.error("[VideoCallAPI] Failed to mute participant microphone:", error);
        return handleApiError(error, "Failed to mute participant microphone");
    }
};

/**
 * Stop participant video (Admin/Host only)
 * POST /api/v1/video-calls/{sessionId}/participants/{targetUserId}/stop-video
 */
export const stopParticipantVideo = async (sessionId: string, targetUserId: string): Promise<void> => {
    console.log("[VideoCallAPI] stopParticipantVideo called with:", { sessionId, targetUserId });

    try {
        console.log("[VideoCallAPI] Making POST request to stop participant video");
        await apiClient.post(`/video-calls/${sessionId}/participants/${targetUserId}/stop-video`);
        console.log("[VideoCallAPI] Participant video stopped successfully");
    } catch (error) {
        console.error("[VideoCallAPI] Failed to stop participant video:", error);
        return handleApiError(error, "Failed to stop participant video");
    }
};

/**
 * Remove participant from call (Admin/Host only)
 * DELETE /api/v1/video-calls/{sessionId}/participants/{targetUserId}
 */
export const removeParticipant = async (sessionId: string, targetUserId: string): Promise<void> => {
    console.log("[VideoCallAPI] removeParticipant called with:", { sessionId, targetUserId });

    try {
        console.log("[VideoCallAPI] Making DELETE request to remove participant");
        await apiClient.delete(`/video-calls/${sessionId}/participants/${targetUserId}`);
        console.log("[VideoCallAPI] Participant removed successfully");
    } catch (error) {
        console.error("[VideoCallAPI] Failed to remove participant:", error);
        return handleApiError(error, "Failed to remove participant");
    }
};

// ===== CALL HISTORY APIs =====

/**
 * Get call history for a conversation (for admin functionality)
 * GET /api/v1/conversations/{conversationId}/call-history
 */
export const getCallHistory = async (conversationId: number): Promise<VideoCallSession[]> => {
    console.log("[VideoCallAPI] getCallHistory called with conversationId:", conversationId);

    try {
        console.log("[VideoCallAPI] Making GET request to fetch call history");
        const response = await apiClient.get<CallHistoryResponse>(
            `/conversations/${conversationId}/call-history`
        );

        console.log("[VideoCallAPI] Call history response received:", response.data);
        const data = validateApiResponse(response, "Failed to fetch call history");
        console.log("[VideoCallAPI] Call history data:", data);
        return data || [];
    } catch (error) {
        console.error("[VideoCallAPI] Failed to fetch call history:", error);
        return handleApiError(error, "Failed to fetch call history");
    }
};

/**
 * Get current video call session details with participants (for admin functionality)
 * Note: This function uses available APIs to construct session details
 */
export const getVideoCallSessionDetails = async (sessionId: string, conversationId: number): Promise<VideoCallSessionDetails> => {
    console.log("[VideoCallAPI] getVideoCallSessionDetails called with:", { sessionId, conversationId });

    try {
        // For now, return basic session structure since the original endpoint doesn't exist
        // The actual implementation would depend on what data is available from your backend
        console.log("[VideoCallAPI] Constructing session details");
        const result = {
            sessionId: sessionId,
            conversationId: conversationId,
            initiatorUserId: '', // Would need to be determined from other context
            initiatorName: '',
            isActive: true, // Assume active if we're calling this function
            participants: [], // Would need to be fetched from another endpoint if available
            createdAt: new Date().toISOString()
        };
        console.log("[VideoCallAPI] Session details result:", result);
        return result;
    } catch (error: any) {
        console.error("[VideoCallAPI] Failed to fetch session details:", error);
        if (error.response?.status === 404) {
            throw new Error(`Video call session not found: ${sessionId}`);
        }
        return handleApiError(error, "Failed to fetch session details");
    }
};

/**
 * Check if current user is admin of a video call session (for admin functionality)
 * Note: This is a simplified implementation since admin status checking isn't in your API list
 */
export const checkAdminStatus = async (sessionId: string, conversationId: number, currentUserId?: string): Promise<boolean> => {
    console.log("[VideoCallAPI] checkAdminStatus called with:", { sessionId, conversationId, currentUserId });

    try {
        // Since there's no specific admin status API, this is a placeholder implementation
        // In a real scenario, you would need to determine admin status from other available data
        console.log("[VideoCallAPI] Checking admin status (placeholder implementation)");
        const result = false; // Default to false for safety
        console.log("[VideoCallAPI] Admin status result:", result);
        return result;
    } catch (error: any) {
        console.error("[VideoCallAPI] Error checking admin status:", error);
        return false;
    }
};

/**
 * @deprecated Use joinVideoCall instead
 * Join an existing video call session
 */
export const joinVideoCallSession = (conversationId: number, sessionId: string, userId?: string) => {
    console.log("[VideoCallAPI] joinVideoCallSession called (deprecated) with:", { conversationId, sessionId, userId });
    return joinVideoCall(sessionId, conversationId, userId);
};

/**
 * @deprecated Use muteParticipantMic instead
 * Mute a participant (admin only)
 */
export const muteParticipantAsAdmin = muteParticipantMic;

/**
 * @deprecated Use removeParticipant instead
 * Remove a participant from the call (admin only)
 */
export const removeParticipantAsAdmin = removeParticipant;