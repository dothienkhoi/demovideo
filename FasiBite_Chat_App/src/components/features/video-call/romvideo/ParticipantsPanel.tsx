"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useParticipants, useLocalParticipant } from "@livekit/components-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Mic, MicOff, Video, VideoOff, UserMinus, Crown, User } from "lucide-react";
import { getAvatarGradient, getInitials } from "@/lib/utils/formatters";
import {
    muteParticipantMic,
    stopParticipantVideo,
    removeParticipant
} from "@/lib/api/customer/video-call-api";
import { useVideoCallAdmin } from "@/hooks/useVideoCallAdmin";
import { useAuthStore } from "@/store/authStore";

// Type definitions
type LoadingAction = 'mute' | 'video' | 'remove';
type LoadingKey = `${LoadingAction}-${string}`;

interface ParticipantsPanelProps {
    onClose?: () => void;
    isVisible?: boolean;
    sessionId?: string;
    conversationId?: number;
    isAdmin?: boolean;
    isInitiator?: boolean;
    userId?: string;
}

interface ParticipantInfo {
    identity: string;
    name: string;
    isLocal: boolean;
    isSpeaking: boolean;
    isMicrophoneEnabled: boolean;
    isCameraEnabled: boolean;
    isAdmin: boolean;
    isCurrentUser: boolean;
}

export function ParticipantsPanel({
    onClose,
    isVisible = true,
    sessionId,
    conversationId,
    isAdmin = false,
    isInitiator = false,
    userId
}: ParticipantsPanelProps) {
    const participants = useParticipants();
    const localParticipant = useLocalParticipant();
    const [isLoading, setIsLoading] = useState<LoadingKey | null>(null);
    const { user } = useAuthStore();

    // Get detailed admin status and session info
    const {
        sessionDetails,
        participants: adminParticipants,
        refreshSessionDetails
    } = useVideoCallAdmin({
        sessionId: sessionId || null,
        conversationId: conversationId,
        enabled: !!sessionId && !!conversationId
    });

    // Memoized participant information processing
    const participantsList = useMemo((): ParticipantInfo[] => {
        return participants.map(participant => {
            const name = participant.name || participant.identity || 'Người dùng';
            const participantData = adminParticipants.find(p => p.userId === participant.identity);
            const isParticipantAdmin = participantData?.isAdmin ||
                (sessionDetails?.initiatorUserId === participant.identity) ||
                (isInitiator && participant.identity === user?.id);
            const isCurrentUser = participant.identity === user?.id;

            return {
                identity: participant.identity,
                name,
                isLocal: participant.isLocal,
                isSpeaking: participant.isSpeaking,
                isMicrophoneEnabled: participant.isMicrophoneEnabled,
                isCameraEnabled: participant.isCameraEnabled,
                isAdmin: isParticipantAdmin,
                isCurrentUser
            };
        });
    }, [participants, adminParticipants, sessionDetails?.initiatorUserId, isInitiator, user?.id]);

    // Memoized action handlers
    const handleMuteParticipant = useCallback(async (participantId: string, isCurrentlyMuted: boolean) => {
        if (!sessionId || !isAdmin) return;

        const loadingKey: LoadingKey = `mute-${participantId}`;
        setIsLoading(loadingKey);

        try {
            // Note: Our consolidated API only supports muting, not unmuting
            // For unmuting, we would need a separate API endpoint
            if (!isCurrentlyMuted) {
                await muteParticipantMic(sessionId, participantId);
            }
            // TODO: Add unmute functionality when API is available
            await refreshSessionDetails();
        } catch (error) {
            // TODO: Implement proper error handling with toast notifications
        } finally {
            setIsLoading(null);
        }
    }, [sessionId, isAdmin, refreshSessionDetails]);

    const handleStopParticipantVideo = useCallback(async (participantId: string, isCurrentlyStopped: boolean) => {
        if (!sessionId || !isAdmin) return;

        const loadingKey: LoadingKey = `video-${participantId}`;
        setIsLoading(loadingKey);

        try {
            // Note: Our consolidated API only supports stopping video, not enabling
            // For enabling, we would need a separate API endpoint
            if (!isCurrentlyStopped) {
                await stopParticipantVideo(sessionId, participantId);
            }
            // TODO: Add enable video functionality when API is available
            await refreshSessionDetails();
        } catch (error) {
            // TODO: Implement proper error handling with toast notifications
        } finally {
            setIsLoading(null);
        }
    }, [sessionId, isAdmin, refreshSessionDetails]);

    const handleRemoveParticipant = useCallback(async (participantId: string, participantName: string) => {
        if (!sessionId || !isAdmin) return;

        const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa "${participantName}" khỏi cuộc gọi?`);
        if (!confirmed) return;

        const loadingKey: LoadingKey = `remove-${participantId}`;
        setIsLoading(loadingKey);

        try {
            await removeParticipant(sessionId, participantId);
            // TODO: Show success notification
        } catch (error) {
            // TODO: Implement proper error handling with toast notifications
        } finally {
            setIsLoading(null);
        }
    }, [sessionId, isAdmin]);

    return (
        <div className={`absolute right-0 top-0 h-full w-80 bg-card border-l border-border flex flex-col transition-all duration-300 ease-in-out z-50 ${isVisible ? 'translate-x-0' : 'translate-x-full'
            }`}>
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                    <h3 className="text-card-foreground font-medium">Người tham gia</h3>
                    {onClose && (
                        <Button
                            onClick={onClose}
                            className="rounded-full w-8 h-8 bg-muted hover:bg-accent text-muted-foreground"
                            size="sm"
                        >
                            ×
                        </Button>
                    )}
                </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-3">
                    {participantsList.map((participant) => {
                        const { identity, name, isLocal, isSpeaking, isMicrophoneEnabled, isCameraEnabled, isAdmin: isParticipantAdmin, isCurrentUser } = participant;

                        // Use project's standard avatar gradient and initials
                        const avatarGradient = getAvatarGradient();
                        const avatarLetter = getInitials(name);

                        return (
                            <div
                                key={identity}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
                            bg-muted/50 
                            ${isSpeaking ? 'border-2 border-blue-500' : 'border border-transparent'}`}
                            >
                                <div className={`w-10 h-10 ${avatarGradient} rounded-full flex items-center justify-center relative`}>
                                    <span className="text-white font-bold text-sm">{avatarLetter}</span>
                                    {isParticipantAdmin && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center border-2 border-background">
                                            <Crown className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-card-foreground font-medium truncate max-w-[120px]" title={name}>
                                            {name.length > 15 ? `${name.substring(0, 12)}...` : name}
                                        </p>
                                        {isParticipantAdmin ? (
                                            <span className="text-xs bg-purple-600/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                                                <Crown className="w-3 h-3" />
                                                Trưởng nhóm
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-gray-600/20 text-gray-300 border border-gray-500/30 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                                                <User className="w-3 h-3" />
                                                Thành viên
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* More menu - only show for non-admin participants and if current user is admin */}
                                    {!isParticipantAdmin && isAdmin && !isCurrentUser && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-48 bg-popover border-border text-popover-foreground">
                                                <DropdownMenuItem
                                                    onClick={() => handleMuteParticipant(identity, !isMicrophoneEnabled)}
                                                    disabled={isLoading === `mute-${identity}`}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    {isLoading === `mute-${identity}` ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                                                    ) : isMicrophoneEnabled ? (
                                                        <MicOff className="h-4 w-4" />
                                                    ) : (
                                                        <Mic className="h-4 w-4" />
                                                    )}
                                                    {isMicrophoneEnabled ? "Tắt mic" : "Bật mic"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStopParticipantVideo(identity, !isCameraEnabled)}
                                                    disabled={isLoading === `video-${identity}`}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    {isLoading === `video-${identity}` ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                                                    ) : isCameraEnabled ? (
                                                        <VideoOff className="h-4 w-4" />
                                                    ) : (
                                                        <Video className="h-4 w-4" />
                                                    )}
                                                    {isCameraEnabled ? "Tắt cam" : "Bật cam"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleRemoveParticipant(identity, name)}
                                                    disabled={isLoading === `remove-${identity}`}
                                                    className="flex items-center gap-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                                                >
                                                    {isLoading === `remove-${identity}` ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                                                    ) : (
                                                        <UserMinus className="h-4 w-4" />
                                                    )}
                                                    Xóa khỏi cuộc gọi
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
