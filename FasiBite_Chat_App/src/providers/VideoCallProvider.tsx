"use client";

import { createContext, useContext, ReactNode, useState, useCallback } from "react";
import { LiveKitVideoConference } from "@/components/features/video-call/romvideo/LiveKitVideoConference";
import { VideoCallMinimized } from "@/components/features/video-call/setting/VideoCallMinimized";
import { VideoCallSessionData } from "@/types/video-call-api.types";
import { VideoCallSettings } from "@/types/video-call.types";

interface VideoCallState {
    isActive: boolean;
    sessionData: VideoCallSessionData | null;
    conversationId: number | null;
    groupName: string;
    settings: VideoCallSettings | null;
}

interface VideoCallContextType {
    videoCallState: VideoCallState;
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
    const [videoCallState, setVideoCallState] = useState<VideoCallState>({
        isActive: false,
        sessionData: null,
        conversationId: null,
        groupName: "",
        settings: null,
    });

    const startVideoCall = useCallback((
        sessionData: VideoCallSessionData,
        conversationId: number,
        groupName: string,
        settings: VideoCallSettings
    ) => {
        setVideoCallState({
            isActive: true,
            sessionData,
            conversationId,
            groupName,
            settings,
        });
    }, []);

    const endVideoCall = useCallback(() => {
        setVideoCallState({
            isActive: false,
            sessionData: null,
            conversationId: null,
            groupName: "",
            settings: null,
        });
    }, []);

    const minimizeVideoCall = useCallback(() => {
        setVideoCallState(prev => ({
            ...prev,
            isActive: false,
        }));
    }, []);

    const restoreVideoCall = useCallback(() => {
        setVideoCallState(prev => ({
            ...prev,
            isActive: true,
        }));
    }, []);

    return (
        <VideoCallContext.Provider
            value={{
                videoCallState,
                startVideoCall,
                endVideoCall,
                minimizeVideoCall,
                restoreVideoCall,
            }}
        >
            {children}

            {/* Video Call Room */}
            {videoCallState.isActive && videoCallState.sessionData && videoCallState.conversationId && (
                <LiveKitVideoConference
                    sessionId={videoCallState.sessionData.videoCallSessionId}
                    groupName={videoCallState.groupName}
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
