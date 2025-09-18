"use client";

import React, { useState } from "react";
import { useParticipants, useLocalParticipant } from "@livekit/components-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Mic, MicOff, Video, VideoOff, UserMinus } from "lucide-react";
import { getAvatarGradient, getInitials } from "@/lib/utils/formatters";
import { muteParticipantMic, stopParticipantVideo, removeParticipant } from "@/lib/api/customer/video-call";

interface ParticipantsPanelProps {
    groupLeaderId?: string;
    onClose?: () => void;
    isVisible?: boolean;
    sessionId?: string; // Video call session ID for API calls
    isAdmin?: boolean; // Whether current user is admin/host
}

export function ParticipantsPanel({ groupLeaderId, onClose, isVisible = true, sessionId, isAdmin = false }: ParticipantsPanelProps) {
    const participants = useParticipants();
    const localParticipant = useLocalParticipant();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    // Debug logging for component props
    console.log("ParticipantsPanel Props Debug:", {
        groupLeaderId,
        isAdmin,
        sessionId,
        participantsCount: participants.length,
        participants: participants.map(p => ({ identity: p.identity, name: p.name }))
    });

    // Use real participants from LiveKit
    const displayParticipants = participants;

    // Handle mute/unmute participant microphone
    const handleMuteParticipant = async (participantId: string, isCurrentlyMuted: boolean) => {
        if (!sessionId || !isAdmin) {
            console.warn("Cannot mute participant: missing sessionId or not admin");
            return;
        }

        setIsLoading(`mute-${participantId}`);
        try {
            if (isCurrentlyMuted) {
                // If currently muted, we would need an "unmute" API - for now just log
                console.log(`Unmuting participant ${participantId}`);
                // TODO: Add unmute API call when available
            } else {
                // Mute the participant
                await muteParticipantMic(sessionId, participantId);
                console.log(`Successfully muted participant ${participantId}`);
            }
        } catch (error) {
            console.error(`Failed to mute participant ${participantId}:`, error);
            // TODO: Show error toast/notification
        } finally {
            setIsLoading(null);
        }
    };

    // Handle stop/start participant video
    const handleStopParticipantVideo = async (participantId: string, isCurrentlyStopped: boolean) => {
        if (!sessionId || !isAdmin) {
            console.warn("Cannot stop participant video: missing sessionId or not admin");
            return;
        }

        setIsLoading(`video-${participantId}`);
        try {
            if (isCurrentlyStopped) {
                // If currently stopped, we would need a "start video" API - for now just log
                console.log(`Starting video for participant ${participantId}`);
                // TODO: Add start video API call when available
            } else {
                // Stop the participant's video
                await stopParticipantVideo(sessionId, participantId);
                console.log(`Successfully stopped video for participant ${participantId}`);
            }
        } catch (error) {
            console.error(`Failed to stop participant video ${participantId}:`, error);
            // TODO: Show error toast/notification
        } finally {
            setIsLoading(null);
        }
    };

    // Handle remove participant from call
    const handleRemoveParticipant = async (participantId: string, participantName: string) => {
        if (!sessionId || !isAdmin) {
            console.warn("Cannot remove participant: missing sessionId or not admin");
            return;
        }

        // Show confirmation dialog
        const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa "${participantName}" khỏi cuộc gọi?`);
        if (!confirmed) {
            return;
        }

        setIsLoading(`remove-${participantId}`);
        try {
            await removeParticipant(sessionId, participantId);
            console.log(`Successfully removed participant ${participantName} (${participantId}) from call`);
            // TODO: Show success toast/notification
        } catch (error) {
            console.error(`Failed to remove participant ${participantName} (${participantId}):`, error);
            // TODO: Show error toast/notification
        } finally {
            setIsLoading(null);
        }
    };

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
                    {displayParticipants.map((participant) => {
                        const isLocal = participant.isLocal;
                        const isSpeaking = participant.isSpeaking;
                        const isMicrophoneEnabled = participant.isMicrophoneEnabled;
                        const isCameraEnabled = participant.isCameraEnabled;
                        // Get real name from participant metadata or identity
                        const name = participant.name || participant.identity || 'Người dùng';

                        // Check if this is the group leader
                        const isLeader = groupLeaderId ?
                            participant.identity === groupLeaderId :
                            (isLocal || (participant.metadata && JSON.parse(participant.metadata).isLeader === true) || participant.identity === 'leader');

                        // Debug logging for dropdown visibility
                        console.log("Dropdown Debug:", {
                            participantIdentity: participant.identity,
                            participantName: name,
                            isLeader,
                            isAdmin,
                            shouldShowDropdown: !isLeader && isAdmin,
                            groupLeaderId
                        });

                        // Use project's standard avatar gradient and initials
                        const avatarGradient = getAvatarGradient();
                        const avatarLetter = getInitials(name);

                        return (
                            <div
                                key={participant.identity}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
                            bg-muted/50 
                            ${isSpeaking ? 'border-2 border-blue-500' : 'border border-transparent'}`}

                            >
                                <div className={`w-10 h-10 ${avatarGradient} rounded-full flex items-center justify-center relative`}>
                                    <span className="text-white font-bold text-sm">{avatarLetter}</span>
                                    {isLeader && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center border-2 border-background">
                                            <span className="text-xs text-white">👑</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-card-foreground font-medium truncate max-w-[120px]" title={name}>
                                            {name.length > 15 ? `${name.substring(0, 12)}...` : name}
                                        </p>
                                        {isLeader ? (
                                            <span className="text-xs bg-purple-600/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                                                <span className="text-xs">👑</span>
                                                Trưởng nhóm
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-gray-600/20 text-gray-300 border border-gray-500/30 px-2 py-1 rounded-full flex-shrink-0">
                                                Thành viên
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* More menu - only show for non-leader participants and if user is admin */}
                                    {!isLeader && isAdmin && (
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
                                                    onClick={() => handleMuteParticipant(participant.identity, !isMicrophoneEnabled)}
                                                    disabled={isLoading === `mute-${participant.identity}`}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    {isLoading === `mute-${participant.identity}` ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                                                    ) : isMicrophoneEnabled ? (
                                                        <MicOff className="h-4 w-4" />
                                                    ) : (
                                                        <Mic className="h-4 w-4" />
                                                    )}
                                                    {isMicrophoneEnabled ? "Tắt mic" : "Bật mic"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStopParticipantVideo(participant.identity, !isCameraEnabled)}
                                                    disabled={isLoading === `video-${participant.identity}`}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    {isLoading === `video-${participant.identity}` ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                                                    ) : isCameraEnabled ? (
                                                        <VideoOff className="h-4 w-4" />
                                                    ) : (
                                                        <Video className="h-4 w-4" />
                                                    )}
                                                    {isCameraEnabled ? "Tắt cam" : "Bật cam"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleRemoveParticipant(participant.identity, name)}
                                                    disabled={isLoading === `remove-${participant.identity}`}
                                                    className="flex items-center gap-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                                                >
                                                    {isLoading === `remove-${participant.identity}` ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                                                    ) : (
                                                        <UserMinus className="h-4 w-4" />
                                                    )}
                                                    Xóa khỏi nhóm
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
