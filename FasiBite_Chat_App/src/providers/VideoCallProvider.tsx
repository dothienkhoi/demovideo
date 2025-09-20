"use client";

import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
    HubConnection,
    HubConnectionBuilder,
} from "@microsoft/signalr";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { throttle } from "lodash-es";
import { LiveKitVideoConference } from "@/components/features/video-call/romvideo/LiveKitVideoConference";
import { VideoCallMinimized } from "@/components/features/video-call/setting/VideoCallMinimized";
import { VideoCallSessionData } from "@/types/video-call-api.types";
import { VideoCallSettings } from "@/types/video-call.types";
import {
    startVideoCallSignalR,
    acceptVideoCallSignalR,
    declineVideoCallSignalR,
    leaveVideoCallSignalR
} from "@/lib/api/customer/video-call-api";

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
        console.log("[VideoCall] Connect called with:", {
            hasConnection: !!connectionRef.current,
            isConnecting: isConnectingRef.current,
            isAuthenticated,
            hasAccessToken: !!accessToken,
            hasUser: !!user,
            isMounted: isMountedRef.current
        });

        // Only attempt connection if user is authenticated and all required data is available
        if (!isAuthenticated || !accessToken || !user) {
            console.log("[VideoCall] Connect skipped - user not authenticated");
            return Promise.resolve();
        }

        // Prevent duplicate connections
        if (connectionRef.current || isConnectingRef.current || !isMountedRef.current) {
            console.log("[VideoCall] Connect skipped due to existing connection or component unmounted:", {
                hasConnection: !!connectionRef.current,
                isConnecting: isConnectingRef.current,
                isMounted: isMountedRef.current
            });
            return Promise.resolve();
        }

        isConnectingRef.current = true;

        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7007";
            const baseUrl = apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
            const hubUrl = `${baseUrl}/hubs/videocall`;

            console.log(`[VideoCall] API Base URL: ${apiBaseUrl}`);
            console.log(`[VideoCall] Cleaned Base URL: ${baseUrl}`);
            console.log(`[VideoCall] Hub URL: ${hubUrl}`);

            console.log(`[VideoCall] Connecting to: ${hubUrl}`);

            const connection = new HubConnectionBuilder()
                .withUrl(hubUrl, {
                    accessTokenFactory: () => {
                        console.log(`[VideoCall] Access token factory called, token: ${accessToken ? "Present" : "Missing"}`);
                        return accessToken || "";
                    },
                    withCredentials: true,
                })
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        const retryCount = retryContext.previousRetryCount;
                        if (retryCount === 0) return 0;
                        if (retryCount === 1) return 2000;
                        if (retryCount === 2) return 5000;
                        if (retryCount <= 10) return 10000;
                        return null;
                    },
                })
                .configureLogging("Information")
                .build();

            connectionRef.current = connection;

            // Connection event handlers
            connection.onclose((error: Error | undefined) => {
                if (error) {
                    console.error("[VideoCall] Connection closed with error:", error);
                    safeSetVideoCallState(prev => ({
                        ...prev,
                        isConnected: false,
                        connectionError: error.message,
                    }));
                    showThrottledNotification("Mất kết nối video call", "Kết nối thời gian thực bị gián đoạn", 'error');
                } else {
                    console.log("[VideoCall] Connection closed gracefully");
                    safeSetVideoCallState(prev => ({
                        ...prev,
                        isConnected: false,
                        connectionError: null,
                    }));
                }
            });

            connection.onreconnecting((error: Error | undefined) => {
                console.warn("[VideoCall] Reconnecting...", error);
                safeSetVideoCallState(prev => ({
                    ...prev,
                    isConnected: false,
                    connectionError: "Đang kết nối lại...",
                }));
                showThrottledNotification("Đang kết nối lại...", "Khôi phục kết nối video call", 'warning');
            });

            connection.onreconnected((connectionId?: string) => {
                console.log("[VideoCall] Reconnected successfully with ID:", connectionId);
                safeSetVideoCallState(prev => ({
                    ...prev,
                    isConnected: true,
                    connectionError: null,
                }));
                showThrottledNotification("Đã khôi phục kết nối", "Kết nối video call đã được khôi phục", 'success');
            });

            // Video call event handlers
            connection.on("IncomingCall", (callData: IncomingCallData) => {
                console.log("[VideoCall] Incoming call received:", callData);
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
                console.log("[VideoCall] Call accepted:", sessionId, acceptedBy);
                safeSetVideoCallState(prev => ({
                    ...prev,
                    isOutgoingCall: false,
                    outgoingCallData: null,
                    callStatus: 'connected',
                }));

                showThrottledNotification(
                    "Cuộc gọi được chấp nhận",
                    `${acceptedBy.fullName} đã chấp nhận cuộc gọi`,
                    'success'
                );
            });

            connection.on("CallDeclined", (sessionId: string) => {
                console.log("[VideoCall] Call declined:", sessionId);
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
                console.log("[VideoCall] Call missed:", sessionId);
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
                console.log("[VideoCall] Call ended:", sessionId);
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
                }));

                showThrottledNotification(
                    "Cuộc gọi đã kết thúc",
                    "Cuộc gọi video đã được kết thúc",
                    'info'
                );
            });

            // Start connection
            console.log("[VideoCall] Starting connection...");
            await connection.start();
            console.log("[VideoCall] Connection started successfully!");

            safeSetVideoCallState(prev => ({
                ...prev,
                isConnected: true,
                connectionError: null,
            }));

            console.log("[VideoCall] Successfully connected to VideoCallHub");
            showThrottledNotification("Đã kết nối video call", "Sẵn sàng nhận cuộc gọi video", 'success');

        } catch (error) {
            console.error("[VideoCall] Connection failed:", error);
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
            console.log("[VideoCall] Disconnecting from VideoCallHub...");
            await connectionRef.current.stop();
            connectionRef.current = null;

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

        try {
            // Call backend API to start the call
            const result = await startVideoCallSignalR(conversationId);

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
            }));

            showThrottledNotification(
                "Đang gọi...",
                "Đang kết nối cuộc gọi video",
                'info'
            );
        } catch (error) {
            console.error("[VideoCall] Failed to start call:", error);
            showThrottledNotification(
                "Không thể bắt đầu cuộc gọi",
                error instanceof Error ? error.message : "Đã có lỗi xảy ra",
                'error'
            );
        }
    }, [videoCallState.isConnected, safeSetVideoCallState, showThrottledNotification]);

    const acceptCall = useCallback(async (sessionId: string) => {
        if (!connectionRef.current || !videoCallState.isConnected) {
            showThrottledNotification("Không thể chấp nhận", "Chưa kết nối đến server", 'error');
            return Promise.resolve();
        }

        try {
            const result = await acceptVideoCallSignalR(sessionId);

            safeSetVideoCallState(prev => ({
                ...prev,
                isIncomingCall: false,
                incomingCallData: null,
                callStatus: 'connected',
            }));

            showThrottledNotification(
                "Đã chấp nhận cuộc gọi",
                "Bắt đầu cuộc gọi video",
                'success'
            );

            // Return void to match the context type
            return;
        } catch (error) {
            console.error("[VideoCall] Failed to accept call:", error);
            showThrottledNotification(
                "Không thể chấp nhận cuộc gọi",
                error instanceof Error ? error.message : "Đã có lỗi xảy ra",
                'error'
            );
        }
    }, [videoCallState.isConnected, safeSetVideoCallState, showThrottledNotification]);

    const declineCall = useCallback(async (sessionId: string) => {
        if (!connectionRef.current || !videoCallState.isConnected) {
            showThrottledNotification("Không thể từ chối", "Chưa kết nối đến server", 'error');
            return Promise.resolve();
        }

        try {
            await declineVideoCallSignalR(sessionId);

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
            console.error("[VideoCall] Failed to decline call:", error);
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
            }));

            showThrottledNotification(
                "Đã kết thúc cuộc gọi",
                "Cuộc gọi video đã được kết thúc",
                'info'
            );
        } catch (error) {
            console.error("[VideoCall] Failed to end call:", error);
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

    return (
        <VideoCallContext.Provider value={contextValue}>
            {children}

            {/* Video Call Room */}
            {videoCallState.isActive && videoCallState.sessionData && videoCallState.conversationId && (
                <LiveKitVideoConference
                    sessionId={videoCallState.sessionData.videoCallSessionId}
                    conversationId={videoCallState.conversationId}
                    groupName={videoCallState.groupName}
                    userId={user?.id}
                    onClose={endVideoCall}
                />
            )}

            {/* Minimized Video Call */}
            {!videoCallState.isActive && videoCallState.sessionData && videoCallState.conversationId && (
                <VideoCallMinimized
                    sessionData={videoCallState.sessionData}
                    conversationId={videoCallState.conversationId}
                    groupName={videoCallState.groupName}
                    onMaximize={restoreVideoCall}
                    onEndCall={endVideoCall}
                />
            )}
        </VideoCallContext.Provider>
    );
}