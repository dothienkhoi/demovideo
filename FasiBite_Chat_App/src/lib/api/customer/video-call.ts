// lib/api/customer/video-call.ts

import apiClient from "@/lib/api/apiClient";
import { ApiResponse } from "@/types/api.types";
import {
    StartVideoCallRequest,
    StartVideoCallResponse,
    VideoCallSessionData,
    VideoCallParticipant,
    StartCallResponseDto,
    JoinCallResponseDto
} from "@/types/video-call-api.types";

// ===== INTERFACES =====

export interface JoinCallResponse {
    livekitToken: string;
    livekitServerUrl: string;
}

export interface LiveKitConnectionDetails {
    serverUrl: string;
    roomName: string;
    participantToken: string;
    participantName: string;
}

// ===== CONVERSATION-BASED APIs =====

/**
 * Start a new video call session in a conversation
 * POST /api/v1/conversations/{conversationId}/calls
 */
export const startVideoCall = async (
    conversationId: number
): Promise<VideoCallSessionData> => {
    const response = await apiClient.post<StartVideoCallResponse>(
        `/conversations/${conversationId}/calls`
    );

    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to start video call");
    }

    // Convert backend response to frontend format
    const backendData = response.data.data;
    return {
        videoCallSessionId: backendData.videoCallSessionId,
        livekitToken: backendData.livekitToken,
        livekitServerUrl: backendData.livekitServerUrl,
    };
};

/**
 * Join an existing video call session
 * POST /api/v1/video-calls/{sessionId}/join
 */
export const joinVideoCallSession = async (
    conversationId: number,
    sessionId: string
): Promise<VideoCallSessionData> => {
    const response = await apiClient.post<ApiResponse<JoinCallResponseDto>>(
        `/video-calls/${sessionId}/join`
    );

    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to join video call");
    }

    // Convert backend response to frontend format
    const backendData = response.data.data;
    return {
        videoCallSessionId: sessionId, // Use the sessionId from parameter
        livekitToken: backendData.livekitToken,
        livekitServerUrl: backendData.livekitServerUrl,
    };
};

/**
 * End a video call session
 * DELETE /api/v1/conversations/{conversationId}/calls/{sessionId}
 */
export const endVideoCall = async (
    conversationId: number,
    sessionId: string
): Promise<void> => {
    await apiClient.delete(
        `/conversations/${conversationId}/calls/${sessionId}`
    );
};

/**
 * Get video call session details
 * GET /api/v1/conversations/{conversationId}/calls/{sessionId}
 */
export const getVideoCallSession = async (
    conversationId: number,
    sessionId: string
): Promise<VideoCallSessionData> => {
    const response = await apiClient.get<StartVideoCallResponse>(
        `/conversations/${conversationId}/calls/${sessionId}`
    );

    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get video call session");
    }

    return response.data.data;
};

/**
 * Get video call participants
 * GET /api/v1/conversations/{conversationId}/calls/{sessionId}/participants
 */
export const getVideoCallParticipants = async (
    conversationId: number,
    sessionId: string
): Promise<VideoCallParticipant[]> => {
    const response = await apiClient.get<ApiResponse<VideoCallParticipant[]>>(
        `/conversations/${conversationId}/calls/${sessionId}/participants`
    );

    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get video call participants");
    }

    return response.data.data;
};

/**
 * Update participant status (video/audio)
 * PUT /api/v1/conversations/{conversationId}/calls/{sessionId}/participants/{userId}/status
 */
export const updateParticipantStatus = async (
    conversationId: number,
    sessionId: string,
    userId: string,
    status: {
        isVideoEnabled?: boolean;
        isAudioEnabled?: boolean;
    }
): Promise<void> => {
    await apiClient.put(
        `/conversations/${conversationId}/calls/${sessionId}/participants/${userId}/status`,
        status
    );
};

// ===== SESSION-BASED APIs =====

/**
 * Join a video call and get LiveKit connection details
 * POST /api/v1/video-calls/{sessionId}/join
 */
export async function joinVideoCall(sessionId: string): Promise<JoinCallResponse> {
    const response = await apiClient.post<JoinCallResponse>(
        `/api/v1/video-calls/${sessionId}/join`
    );
    return response.data;
}

/**
 * Leave a video call session
 * POST /api/v1/video-calls/{sessionId}/leave
 */
export const leaveVideoCall = async (
    sessionId: string
): Promise<void> => {
    await apiClient.post(`/video-calls/${sessionId}/leave`);
};

/**
 * Check if video call session is still active
 * GET /api/v1/video-calls/{sessionId}/status
 */
export const checkVideoCallStatus = async (
    sessionId: string
): Promise<{ isActive: boolean; message?: string }> => {
    const response = await apiClient.get<ApiResponse<{ isActive: boolean; message?: string }>>(
        `/video-calls/${sessionId}/status`
    );

    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to check video call status");
    }

    return response.data.data;
};

/**
 * End video call for all participants (Admin/Host only)
 * POST /api/v1/video-calls/{sessionId}/end
 */
export async function endVideoCallForAll(sessionId: string): Promise<void> {
    await apiClient.post(`/video-calls/${sessionId}/end`);
}

/**
 * Mute participant microphone (Admin/Host only)
 * POST /api/v1/video-calls/{sessionId}/participants/{targetUserId}/mute-mic
 */
export async function muteParticipantMic(sessionId: string, targetUserId: string): Promise<void> {
    await apiClient.post(`/video-calls/${sessionId}/participants/${targetUserId}/mute-mic`);
}

/**
 * Stop participant video (Admin/Host only)
 * POST /api/v1/video-calls/{sessionId}/participants/{targetUserId}/stop-video
 */
export async function stopParticipantVideo(sessionId: string, targetUserId: string): Promise<void> {
    await apiClient.post(`/video-calls/${sessionId}/participants/${targetUserId}/stop-video`);
}

/**
 * Remove participant from call (Admin/Host only)
 * DELETE /api/v1/video-calls/{sessionId}/participants/{targetUserId}
 */
export async function removeParticipant(sessionId: string, targetUserId: string): Promise<void> {
    await apiClient.delete(`/video-calls/${sessionId}/participants/${targetUserId}`);
}

/**
 * Accept direct call (1-1)
 * POST /api/v1/video-calls/{sessionId}/accept
 */
export async function acceptDirectCall(sessionId: string): Promise<JoinCallResponse> {
    const response = await apiClient.post<JoinCallResponse>(
        `/video-calls/${sessionId}/accept`
    );
    return response.data;
}

/**
 * Decline direct call (1-1)
 * POST /api/v1/video-calls/{sessionId}/decline
 */
export async function declineDirectCall(sessionId: string): Promise<void> {
    await apiClient.post(`/video-calls/${sessionId}/decline`);
}