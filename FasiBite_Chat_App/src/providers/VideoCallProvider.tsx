"use client";

import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
    HubConnection,
    HubConnectionBuilder,
} from "@microsoft/signalr";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { throttle } from "lodash-es";
import { useRouter } from "next/navigation";
import { VideoCallSessionData } from "@/types/video-call-api.types";
import { VideoCallSettings } from "@/types/video-call.types";
import {
    startVideoCallSignalR,
    acceptVideoCallSignalR,
    declineVideoCallSignalR,
    leaveVideoCallSignalR,
    joinVideoCall,
    startVideoCall
} from "@/lib/api/customer/video-call-api";
import { VideoCallInterface1v1 } from "@/components/features/video-call/videocg1-1/VideoCallInterface1v1";

// Types for video call
interface IncomingCallData {
    videoCallSessionId: string;
    conversationId: number;
    caller: {
        userId: string;
        fullName: string;
        avatarUrl?: string;
        presenceStatus: string;
    };
}

interface UserProfileDto {
    userId: string;
    fullName: string;
    avatarUrl?: string;
    presenceStatus: string;
}

interface OutgoingCallData {
    sessionId: string;
    conversationId: number;
    receiverId: string;
    receiverName: string;
    receiverAvatar?: string;
}

interface VideoCallState {
    // Connection state
    isConnected: boolean;
    connectionError: string | null;

    // Call state
    isIncomingCall: boolean;
    isOutgoingCall: boolean;
    incomingCallData: IncomingCallData | null;
    outgoingCallData: OutgoingCallData | null;
    callStatus: 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'missed' | 'declined';

    // Active video call state
    isActive: boolean;
    sessionData: VideoCallSessionData | null;
    conversationId: number | null;
    groupName: string;
    settings: VideoCallSettings | null;

    // Caller profile for active calls
    callerProfile: {
        userId: string;
        fullName: string;
        avatarUrl?: string;
    } | null;

    // Navigation data for URL routing
    navigationData: {
        conversationId: number;
        sessionId: string;
        partnerId: string;
        partnerName: string;
        partnerAvatar: string;
        token: string;
        serverUrl: string;
    } | null;
}

interface VideoCallContextType {
    // State
    videoCallState: VideoCallState;

    // Connection methods
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;

    // Call methods
    startCall: (conversationId: number, receiverId: string, receiverName: string, receiverAvatar?: string) => Promise<void>;
    acceptCall: (sessionId: string) => Promise<void>;
    declineCall: (sessionId: string) => Promise<void>;
    endCall: (sessionId: string) => Promise<void>;

    // UI state methods
    clearIncomingCall: () => void;
    clearOutgoingCall: () => void;

    // Active video call methods
    startVideoCall: (sessionData: VideoCallSessionData, conversationId: number, groupName: string, settings: VideoCallSettings) => void;
    endVideoCall: () => void;
    minimizeVideoCall: () => void;
    restoreVideoCall: () => void;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export function useVideoCallContext() {
    const context = useContext(VideoCallContext);
    if (!context) {
        throw new Error("useVideoCallContext must be used within a VideoCallProvider");
    }
    return context;
}

interface VideoCallProviderProps {
    children: ReactNode;
}

export function VideoCallProvider({ children }: VideoCallProviderProps) {
    const { accessToken, isAuthenticated, user } = useAuthStore();
    const router = useRouter();
    const connectionRef = useRef<HubConnection | null>(null);
    const isConnectingRef = useRef<boolean>(false);
    const isMountedRef = useRef<boolean>(true);
    const connectRef = useRef<(() => Promise<void>) | undefined>(undefined);
    const disconnectRef = useRef<(() => Promise<void>) | undefined>(undefined);

    const [videoCallState, setVideoCallState] = useState<VideoCallState>({
        // Connection state
        isConnected: false,
        connectionError: null,

        // Call state
        isIncomingCall: false,
        isOutgoingCall: false,
        incomingCallData: null,
        outgoingCallData: null,
        callStatus: 'idle',

        // Active video call state
        isActive: false,
        sessionData: null,
        conversationId: null,
        groupName: "",
        settings: null,

        // Caller profile for active calls
        callerProfile: null,

        // Navigation data for URL routing
        navigationData: null,
    });

    // Safe setState function
    const safeSetVideoCallState = useCallback((updater: (prev: VideoCallState) => VideoCallState) => {
        if (isMountedRef.current) {
            setVideoCallState(updater);
        }
    }, []);

    // Throttled notifications
    const showThrottledNotification = useMemo(() => throttle(
        (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
            switch (type) {
                case 'success':
                    toast.success(title, { description: message });
                    break;
                case 'warning':
                    toast.warning(title, { description: message });
                    break;
                case 'error':
                    toast.error(title, { description: message });
                    break;
                default:
                    toast.info(title, { description: message });
            }
        },
        2000,
        { leading: true, trailing: false }
    ), []); // Empty dependency array since throttle function doesn't depend on any props/state

    // Connection methods
    const connect = useCallback(async () => {
        // Only attempt connection if user is authenticated and all required data is available
        if (!isAuthenticated || !accessToken || !user) {
            return Promise.resolve();
        }

        // Prevent duplicate connections
        if (connectionRef.current || isConnectingRef.current || !isMountedRef.current) {
            return Promise.resolve();
        }

        isConnectingRef.current = true;

        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7007";
            const baseUrl = apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
            const hubUrl = `${baseUrl}/hubs/videocall`;

            const connection = new HubConnectionBuilder()
                .withUrl(hubUrl, {
                    accessTokenFactory: () => {
                        return accessToken || "";
                    },
                    withCredentials: true,
                })
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        const retryCount = retryContext.previousRetryCount;
                        if (retryCount === 0) return 0;
                        if (retryCount === 1) return 1000;
                        if (retryCount === 2) return 2000;
                        if (retryCount === 3) return 5000;
                        if (retryCount <= 8) return 10000;
                        return 15000; // Continue trying but with longer delays
                    },
                })
                .configureLogging("Information")
                .build();

            connectionRef.current = connection;

            // Connection event handlers

            connection.onreconnecting((error: Error | undefined) => {
                if (!isMountedRef.current) return;

                safeSetVideoCallState(prev => ({
                    ...prev,
                    isConnected: false,
                    connectionError: "Đang kết nối lại...",
                }));
                showThrottledNotification("Đang kết nối lại...", "Khôi phục kết nối video call", 'warning');
            });

            connection.onreconnected((connectionId?: string) => {
                if (!isMountedRef.current) return;

                safeSetVideoCallState(prev => ({
                    ...prev,
                    isConnected: true,
                    connectionError: null,
                }));
                showThrottledNotification("Đã khôi phục kết nối", "Kết nối video call đã được khôi phục", 'success');
            });

            // Handle connection errors
            connection.onclose((error: Error | undefined) => {
                if (!isMountedRef.current) return;

                if (error) {
                    console.error("[VideoCallProvider] Connection closed with error:", error);
                    safeSetVideoCallState(prev => ({
                        ...prev,
                        isConnected: false,
                        connectionError: error.message,
                    }));

                    // Only show error notification for unexpected disconnections
                    if (error.message !== "The connection was closed.") {
                        showThrottledNotification("Mất kết nối video call", `Lỗi: ${error.message}`, 'error');
                    }
                } else {
                    safeSetVideoCallState(prev => ({
                        ...prev,
                        isConnected: false,
                        connectionError: null,
                    }));
                }
            });

            // Video call event handlers
            connection.on("IncomingCall", (callData: IncomingCallData) => {
                // Additional check to ensure we're handling the event correctly
                if (user && user.id === callData.caller.userId) {
                    return;
                }

                if (!isMountedRef.current) return;

                safeSetVideoCallState(prev => ({
                    ...prev,
                    isIncomingCall: true,
                    incomingCallData: callData,
                    callStatus: 'ringing',
                }));

                showThrottledNotification(
                    "Cuộc gọi video đến",
                    `${callData.caller.fullName} đang gọi cho bạn`,
                    'info'
                );
            });

            connection.on("CallAccepted", (sessionId: string, acceptedBy: UserProfileDto) => {
                if (!isMountedRef.current) return;

                console.log("[VideoCallProvider] Call accepted by:", acceptedBy.fullName, "Session:", sessionId);

                // For the caller (User A), we need to get updated session data with LiveKit credentials
                let conversationId: number | null = null;
                let outgoingData: any = null;
                let sessionData: any = null;

                safeSetVideoCallState(prev => {
                    console.log("[VideoCallProvider] CallAccepted - Current state:", {
                        callStatus: prev.callStatus,
                        isActive: prev.isActive,
                        outgoingCallData: prev.outgoingCallData,
                        sessionData: prev.sessionData
                    });

                    // Prevent multiple connections
                    if (prev.callStatus === 'connected') {
                        console.log("[VideoCallProvider] Call already connected, ignoring duplicate accept");
                        return prev;
                    }

                    conversationId = prev.outgoingCallData?.conversationId || null;
                    outgoingData = prev.outgoingCallData;
                    sessionData = prev.sessionData;

                    const newState = {
                        ...prev,
                        isOutgoingCall: false,
                        outgoingCallData: null,
                        callStatus: 'connected' as const,
                        // Keep existing sessionData with LiveKit credentials from the initial call
                        sessionData: prev.sessionData,
                        // Set navigationData with LiveKit credentials for VideoCallInterface1v1
                        navigationData: prev.sessionData ? {
                            conversationId: prev.outgoingCallData?.conversationId || 0,
                            sessionId: sessionId,
                            partnerId: prev.outgoingCallData?.receiverId || '',
                            partnerName: prev.outgoingCallData?.receiverName || '',
                            partnerAvatar: prev.outgoingCallData?.receiverAvatar || '',
                            token: prev.sessionData.livekitToken,
                            serverUrl: prev.sessionData.livekitServerUrl,
                        } : null,
                        // Set conversationId from outgoingCallData
                        conversationId: prev.outgoingCallData?.conversationId || null,
                        // Set caller profile from outgoingCallData
                        callerProfile: prev.outgoingCallData ? {
                            userId: prev.outgoingCallData.receiverId,
                            fullName: prev.outgoingCallData.receiverName,
                            avatarUrl: prev.outgoingCallData.receiverAvatar,
                        } : null,
                        isActive: true, // Activate the video call interface for the caller
                    };

                    console.log("[VideoCallProvider] CallAccepted - New state:", {
                        callStatus: newState.callStatus,
                        isActive: newState.isActive,
                        callerProfile: newState.callerProfile,
                        navigationData: newState.navigationData
                    });

                    return newState;
                });

                console.log("[VideoCallProvider] Call accepted state set:", {
                    callStatus: 'connected',
                    isActive: true,
                    callerProfile: outgoingData ? {
                        userId: outgoingData.receiverId,
                        fullName: outgoingData.receiverName,
                        avatarUrl: outgoingData.receiverAvatar,
                    } : null,
                    sessionData: sessionData
                });

                showThrottledNotification(
                    "Cuộc gọi được chấp nhận",
                    `${acceptedBy.fullName} đã chấp nhận cuộc gọi`,
                    'success'
                );

                // Navigate to video call page for the caller
                if (conversationId && sessionData && outgoingData) {
                    const videoCallUrl = `/chat/conversations/${conversationId}/${sessionId}?` +
                        `partnerId=${encodeURIComponent(outgoingData.receiverId || '')}&` +
                        `partnerName=${encodeURIComponent(outgoingData.receiverName || '')}&` +
                        `partnerAvatar=${encodeURIComponent(outgoingData.receiverAvatar || '')}&` +
                        `token=${encodeURIComponent(sessionData.livekitToken)}&` +
                        `serverUrl=${encodeURIComponent(sessionData.livekitServerUrl)}`;

                    router.push(videoCallUrl);
                }
            });

            connection.on("CallDeclined", (sessionId: string) => {
                if (!isMountedRef.current) return;

                safeSetVideoCallState(prev => ({
                    ...prev,
                    isOutgoingCall: false,
                    outgoingCallData: null,
                    callStatus: 'declined',
                }));

                showThrottledNotification(
                    "Cuộc gọi bị từ chối",
                    "Người nhận đã từ chối cuộc gọi",
                    'warning'
                );
            });

            connection.on("CallMissed", (sessionId: string) => {
                if (!isMountedRef.current) return;

                safeSetVideoCallState(prev => ({
                    ...prev,
                    isOutgoingCall: false,
                    outgoingCallData: null,
                    callStatus: 'missed',
                }));

                showThrottledNotification(
                    "Cuộc gọi nhỡ",
                    "Người nhận không trả lời",
                    'warning'
                );
            });

            connection.on("CallEnded", (sessionId: string) => {
                if (!isMountedRef.current) return;

                safeSetVideoCallState(prev => ({
                    ...prev,
                    isIncomingCall: false,
                    isOutgoingCall: false,
                    incomingCallData: null,
                    outgoingCallData: null,
                    callStatus: 'ended',
                    isActive: false,
                    sessionData: null,
                    conversationId: null,
                    groupName: "",
                    settings: null,
                    callerProfile: null, // Clear caller profile
                }));

                showThrottledNotification(
                    "Cuộc gọi đã kết thúc",
                    "Cuộc gọi video đã được kết thúc",
                    'info'
                );
            });

            // Start connection
            await connection.start();

            if (!isMountedRef.current) return;

            safeSetVideoCallState(prev => ({
                ...prev,
                isConnected: true,
                connectionError: null,
            }));

            showThrottledNotification("Đã kết nối video call", "Sẵn sàng nhận cuộc gọi video", 'success');

        } catch (error) {
            if (!isMountedRef.current) return;

            safeSetVideoCallState(prev => ({
                ...prev,
                isConnected: false,
                connectionError: error instanceof Error ? error.message : "Unknown error",
            }));

            showThrottledNotification(
                "Không thể kết nối video call",
                "Vui lòng kiểm tra kết nối mạng và thử lại",
                'error'
            );
        } finally {
            isConnectingRef.current = false;
        }
    }, [isAuthenticated, accessToken, user?.id, safeSetVideoCallState, showThrottledNotification]);

    // Store connect function in ref
    connectRef.current = connect;

    const disconnect = useCallback(async () => {
        if (connectionRef.current) {
            try {
                await connectionRef.current.stop();
            } catch (error) {
                console.error("[VideoCallProvider] Error disconnecting:", error);
            } finally {
                connectionRef.current = null;

                if (isMountedRef.current) {
                    safeSetVideoCallState(prev => ({
                        ...prev,
                        isConnected: false,
                        connectionError: null,
                        isIncomingCall: false,
                        isOutgoingCall: false,
                        incomingCallData: null,
                        outgoingCallData: null,
                        callStatus: 'idle',
                    }));
                }
            }
        }
        return Promise.resolve();
    }, [safeSetVideoCallState]);

    // Store disconnect function in ref
    disconnectRef.current = disconnect;

    // Update refs when functions change
    useEffect(() => {
        connectRef.current = connect;
        disconnectRef.current = disconnect;
    }, [connect, disconnect]);

    // Call methods
    const startCall = useCallback(async (conversationId: number, receiverId: string, receiverName: string, receiverAvatar?: string) => {
        if (!connectionRef.current || !videoCallState.isConnected) {
            showThrottledNotification("Không thể gọi", "Chưa kết nối đến server", 'error');
            return Promise.resolve();
        }

        // Prevent multiple outgoing calls
        if (videoCallState.isOutgoingCall) {
            return Promise.resolve();
        }

        try {
            // Call backend API to start the call
            const result = await startVideoCallSignalR(conversationId);

            if (!isMountedRef.current) return;

            safeSetVideoCallState(prev => ({
                ...prev,
                isOutgoingCall: true,
                outgoingCallData: {
                    sessionId: result.videoCallSessionId,
                    conversationId,
                    receiverId,
                    receiverName,
                    receiverAvatar,
                },
                callStatus: 'ringing',
                // Set session data when starting a new call - now includes LiveKit credentials
                sessionData: result,
                // Set caller profile for the callee
                callerProfile: {
                    userId: receiverId,
                    fullName: receiverName,
                    avatarUrl: receiverAvatar,
                },
                isActive: false,
            }));

            showThrottledNotification(
                "Đang gọi...",
                "Đang kết nối cuộc gọi video",
                'info'
            );
        } catch (error) {
            showThrottledNotification(
                "Không thể bắt đầu cuộc gọi",
                error instanceof Error ? error.message : "Đã có lỗi xảy ra",
                'error'
            );
        }
    }, [videoCallState.isConnected, videoCallState.isOutgoingCall, safeSetVideoCallState, showThrottledNotification, user?.id]);

    const acceptCall = useCallback(async (sessionId: string) => {
        if (!connectionRef.current || !videoCallState.isConnected) {
            showThrottledNotification("Không thể chấp nhận", "Chưa kết nối đến server", 'error');
            return Promise.resolve();
        }

        // Prevent multiple calls to acceptCall
        if (videoCallState.callStatus === 'connected') {
            console.log("[VideoCallProvider] Call already connected, ignoring accept");
            return Promise.resolve();
        }

        console.log("[VideoCallProvider] Accepting call with session:", sessionId);

        try {
            const result = await acceptVideoCallSignalR(sessionId);

            if (!isMountedRef.current) return;

            console.log("[VideoCallProvider] Call accepted successfully, setting state");

            let conversationId: number | null = null;
            let callerData: any = null;

            safeSetVideoCallState(prev => {
                conversationId = prev.incomingCallData?.conversationId || null;
                callerData = prev.incomingCallData?.caller;

                return {
                    ...prev,
                    isIncomingCall: false, // Close the incoming call modal
                    incomingCallData: null,
                    callStatus: 'connected',
                    // Set session data when call is accepted with LiveKit credentials
                    sessionData: {
                        videoCallSessionId: sessionId,
                        livekitToken: result.livekitToken,
                        livekitServerUrl: result.livekitServerUrl,
                    },
                    // Set navigationData with LiveKit credentials for VideoCallInterface1v1
                    navigationData: {
                        conversationId: prev.incomingCallData?.conversationId || 0,
                        sessionId: sessionId,
                        partnerId: prev.incomingCallData?.caller.userId || '',
                        partnerName: prev.incomingCallData?.caller.fullName || '',
                        partnerAvatar: prev.incomingCallData?.caller.avatarUrl || '',
                        token: result.livekitToken,
                        serverUrl: result.livekitServerUrl,
                    },
                    // Set conversationId from incomingCallData
                    conversationId: prev.incomingCallData?.conversationId || null,
                    // Set caller profile from incomingCallData
                    callerProfile: prev.incomingCallData?.caller || null,
                    isActive: true, // Activate the video call interface
                };
            });

            showThrottledNotification(
                "Đã chấp nhận cuộc gọi",
                "Bắt đầu cuộc gọi video",
                'success'
            );

            // Navigate to video call page
            if (conversationId && callerData) {
                const videoCallUrl = `/chat/conversations/${conversationId}/${sessionId}?` +
                    `partnerId=${encodeURIComponent(callerData.userId || '')}&` +
                    `partnerName=${encodeURIComponent(callerData.fullName || '')}&` +
                    `partnerAvatar=${encodeURIComponent(callerData.avatarUrl || '')}&` +
                    `token=${encodeURIComponent(result.livekitToken)}&` +
                    `serverUrl=${encodeURIComponent(result.livekitServerUrl)}`;

                router.push(videoCallUrl);
            }

            // Return void to match the context type
            return;
        } catch (error) {
            console.error("[VideoCallProvider] Error accepting call:", error);
            showThrottledNotification(
                "Không thể chấp nhận cuộc gọi",
                error instanceof Error ? error.message : "Đã có lỗi xảy ra",
                'error'
            );
        }
    }, [videoCallState.isConnected, videoCallState.callStatus, safeSetVideoCallState, showThrottledNotification]);

    const declineCall = useCallback(async (sessionId: string) => {
        if (!connectionRef.current || !videoCallState.isConnected) {
            showThrottledNotification("Không thể từ chối", "Chưa kết nối đến server", 'error');
            return Promise.resolve();
        }

        try {
            await declineVideoCallSignalR(sessionId);

            if (!isMountedRef.current) return;

            safeSetVideoCallState(prev => ({
                ...prev,
                isIncomingCall: false,
                incomingCallData: null,
                callStatus: 'declined',
            }));

            showThrottledNotification(
                "Đã từ chối cuộc gọi",
                "Cuộc gọi đã được từ chối",
                'info'
            );
        } catch (error) {
            showThrottledNotification(
                "Không thể từ chối cuộc gọi",
                error instanceof Error ? error.message : "Đã có lỗi xảy ra",
                'error'
            );
        }
    }, [videoCallState.isConnected, safeSetVideoCallState, showThrottledNotification]);

    const endCall = useCallback(async (sessionId: string) => {
        if (!connectionRef.current || !videoCallState.isConnected) {
            showThrottledNotification("Không thể kết thúc", "Chưa kết nối đến server", 'error');
            return Promise.resolve();
        }

        try {
            await leaveVideoCallSignalR(sessionId);

            if (!isMountedRef.current) return;

            safeSetVideoCallState(prev => ({
                ...prev,
                isIncomingCall: false,
                isOutgoingCall: false,
                incomingCallData: null,
                outgoingCallData: null,
                callStatus: 'ended',
                isActive: false,
                sessionData: null,
                conversationId: null,
                groupName: "",
                settings: null,
                callerProfile: null, // Clear caller profile
            }));

            showThrottledNotification(
                "Đã kết thúc cuộc gọi",
                "Cuộc gọi video đã được kết thúc",
                'info'
            );
        } catch (error) {
            showThrottledNotification(
                "Không thể kết thúc cuộc gọi",
                error instanceof Error ? error.message : "Đã có lỗi xảy ra",
                'error'
            );
        }
    }, [videoCallState.isConnected, safeSetVideoCallState, showThrottledNotification]);

    // UI state methods
    const clearIncomingCall = useCallback(() => {
        safeSetVideoCallState(prev => ({
            ...prev,
            isIncomingCall: false,
            incomingCallData: null,
            callStatus: 'idle',
        }));
    }, [safeSetVideoCallState]);

    const clearOutgoingCall = useCallback(() => {
        safeSetVideoCallState(prev => ({
            ...prev,
            isOutgoingCall: false,
            outgoingCallData: null,
            callStatus: 'idle',
        }));
    }, [safeSetVideoCallState]);

    // Active video call methods (from original VideoCallProvider)
    const startVideoCall = useCallback((
        sessionData: VideoCallSessionData,
        conversationId: number,
        groupName: string,
        settings: VideoCallSettings
    ) => {
        safeSetVideoCallState(prev => ({
            ...prev,
            isActive: true,
            sessionData,
            conversationId,
            groupName,
            settings,
        }));
    }, [safeSetVideoCallState]);

    const endVideoCall = useCallback(() => {
        safeSetVideoCallState(prev => ({
            ...prev,
            isActive: false,
            sessionData: null,
            conversationId: null,
            groupName: "",
            settings: null,
            callerProfile: null, // Clear caller profile
        }));
    }, [safeSetVideoCallState]);

    const minimizeVideoCall = useCallback(() => {
        safeSetVideoCallState(prev => ({
            ...prev,
            isActive: false,
        }));
    }, [safeSetVideoCallState]);

    const restoreVideoCall = useCallback(() => {
        safeSetVideoCallState(prev => ({
            ...prev,
            isActive: true,
        }));
    }, [safeSetVideoCallState]);

    // Auto-connect when authenticated
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        // Set mounted to true when effect runs
        isMountedRef.current = true;

        if (isAuthenticated && accessToken && user) {
            // Add a small delay to prevent rapid reconnection
            timeoutId = setTimeout(() => {
                connectRef.current?.();
            }, 100);
        } else {
            disconnectRef.current?.();
        }

        return () => {
            isMountedRef.current = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            disconnectRef.current?.();
        };
    }, [isAuthenticated, accessToken, user?.id]); // Dependencies: reconnect when auth state changes

    const contextValue: VideoCallContextType = {
        videoCallState,
        connect,
        disconnect,
        startCall,
        acceptCall,
        declineCall,
        endCall,
        clearIncomingCall,
        clearOutgoingCall,
        startVideoCall,
        endVideoCall,
        minimizeVideoCall,
        restoreVideoCall,
    };

    const callerProfile = videoCallState.isIncomingCall && videoCallState.incomingCallData
        ? videoCallState.incomingCallData.caller
        : videoCallState.isOutgoingCall && videoCallState.outgoingCallData
            ? {
                userId: videoCallState.outgoingCallData.receiverId,
                fullName: videoCallState.outgoingCallData.receiverName,
                avatarUrl: videoCallState.outgoingCallData.receiverAvatar,
            }
            : null;

    // Debug logging for VideoCallInterface1v1 rendering
    console.log('[VideoCallProvider] Component render - Full state:', {
        videoCallState: {
            isActive: videoCallState.isActive,
            callStatus: videoCallState.callStatus,
            isIncomingCall: videoCallState.isIncomingCall,
            isOutgoingCall: videoCallState.isOutgoingCall,
            incomingCallData: videoCallState.incomingCallData,
            outgoingCallData: videoCallState.outgoingCallData,
            navigationData: videoCallState.navigationData,
            sessionData: videoCallState.sessionData
        },
        callerProfile: callerProfile,
        hasToken: !!(videoCallState.navigationData?.token || videoCallState.sessionData?.livekitToken),
        hasServerUrl: !!(videoCallState.navigationData?.serverUrl || videoCallState.sessionData?.livekitServerUrl)
    });

    return (
        <VideoCallContext.Provider value={contextValue}>
            {children}

            {/* Video Call Interface 1v1 - Show when call is active */}
            {(() => {
                const shouldRender = videoCallState.isActive && videoCallState.callStatus === 'connected' && callerProfile;
                console.log('[VideoCallProvider] Render condition check:', {
                    isActive: videoCallState.isActive,
                    callStatus: videoCallState.callStatus,
                    callerProfile: !!callerProfile,
                    shouldRender: shouldRender
                });
                return shouldRender;
            })() && (
                    <VideoCallInterface1v1
                        sessionId={videoCallState.isIncomingCall
                            ? videoCallState.incomingCallData?.videoCallSessionId || ''
                            : videoCallState.outgoingCallData?.sessionId || ''
                        }
                        conversationId={videoCallState.isIncomingCall
                            ? videoCallState.incomingCallData?.conversationId || 0
                            : videoCallState.outgoingCallData?.conversationId || 0
                        }
                        partnerId={callerProfile?.userId || ''}
                        partnerName={callerProfile?.fullName || ''}
                        partnerAvatar={callerProfile?.avatarUrl}
                        currentUserName={user?.fullName || ''}
                        currentUserAvatar={user?.avatarUrl || undefined}
                        livekitToken={videoCallState.navigationData?.token || videoCallState.sessionData?.livekitToken || ''}
                        livekitServerUrl={videoCallState.navigationData?.serverUrl || videoCallState.sessionData?.livekitServerUrl || ''}
                        onEndCall={async () => {
                            if (videoCallState.isIncomingCall) {
                                await endCall(videoCallState.incomingCallData?.videoCallSessionId || '');
                            } else if (videoCallState.isOutgoingCall) {
                                await endCall(videoCallState.outgoingCallData?.sessionId || '');
                            }
                        }}
                        onMinimize={() => {
                            // Handle minimize if needed
                        }}
                    />
                )}
        </VideoCallContext.Provider>
    );
}