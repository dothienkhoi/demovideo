"use client";

import { useEffect, useState } from "react";
import { Track, TrackPublication, LocalParticipant, RemoteParticipant } from "livekit-client";

interface VideoManagerProps {
    localParticipant?: LocalParticipant;
    remoteParticipant?: RemoteParticipant;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}

/**
 * Custom hook to manage video track display for 1-on-1 video calls
 * Handles automatic video track attachment/detachment and state management
 */
export function useVideoManager({
    localParticipant,
    remoteParticipant,
    localVideoRef,
    remoteVideoRef,
}: VideoManagerProps) {
    const [hasLocalVideo, setHasLocalVideo] = useState(false);
    const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

    // Monitor local video track changes
    useEffect(() => {
        if (!localParticipant) {
            setHasLocalVideo(false);
            return;
        }

        const updateLocalVideo = () => {
            // Find active video track from local participant
            const videoTrack = Array.from(localParticipant.videoTrackPublications.values())
                .find(pub => pub.track && pub.isSubscribed);

            const hasVideo = !!videoTrack;
            console.log('[VideoManager] Local video update:', {
                hasVideo,
                videoTrack: videoTrack ? {
                    track: !!videoTrack.track,
                    isSubscribed: videoTrack.isSubscribed,
                    isMuted: videoTrack.isMuted,
                    trackSid: videoTrack.trackSid
                } : null,
                publications: Array.from(localParticipant.videoTrackPublications.values()).map(p => ({
                    track: !!p.track,
                    isSubscribed: p.isSubscribed,
                    isMuted: p.isMuted,
                    trackSid: p.trackSid
                }))
            });

            setHasLocalVideo(hasVideo);

            // Attach/detach video track to video element
            if (localVideoRef.current) {
                if (hasVideo && videoTrack?.track) {
                    console.log('[VideoManager] Attaching local video track');
                    videoTrack.track.attach(localVideoRef.current);
                } else {
                    console.log('[VideoManager] Detaching local video track');
                    localVideoRef.current.srcObject = null;
                }
            }
        };

        // Initial check
        updateLocalVideo();

        // Listen for track changes - Local participant events
        const handleLocalTrackPublished = (publication: TrackPublication) => {
            if (publication.kind === Track.Kind.Video) {
                updateLocalVideo();
            }
        };

        const handleLocalTrackUnpublished = (publication: TrackPublication) => {
            if (publication.kind === Track.Kind.Video) {
                updateLocalVideo();
            }
        };

        localParticipant.on('trackPublished', handleLocalTrackPublished);
        localParticipant.on('trackUnpublished', handleLocalTrackUnpublished);

        return () => {
            localParticipant.off('trackPublished', handleLocalTrackPublished);
            localParticipant.off('trackUnpublished', handleLocalTrackUnpublished);
        };
    }, [localParticipant, localVideoRef]);

    // Monitor remote video track changes
    useEffect(() => {
        if (!remoteParticipant) {
            setHasRemoteVideo(false);
            return;
        }

        const updateRemoteVideo = () => {
            // Find active video track from remote participant
            const videoTrack = Array.from(remoteParticipant.videoTrackPublications.values())
                .find(pub => pub.track && pub.isSubscribed);

            const hasVideo = !!videoTrack;
            console.log('[VideoManager] Remote video update:', {
                hasVideo,
                videoTrack: videoTrack ? {
                    track: !!videoTrack.track,
                    isSubscribed: videoTrack.isSubscribed,
                    isMuted: videoTrack.isMuted,
                    trackSid: videoTrack.trackSid
                } : null,
                publications: Array.from(remoteParticipant.videoTrackPublications.values()).map(p => ({
                    track: !!p.track,
                    isSubscribed: p.isSubscribed,
                    isMuted: p.isMuted,
                    trackSid: p.trackSid
                }))
            });

            setHasRemoteVideo(hasVideo);

            // Attach/detach video track to video element
            if (remoteVideoRef.current) {
                if (hasVideo && videoTrack?.track) {
                    console.log('[VideoManager] Attaching remote video track');
                    videoTrack.track.attach(remoteVideoRef.current);
                } else {
                    console.log('[VideoManager] Detaching remote video track');
                    remoteVideoRef.current.srcObject = null;
                }
            }
        };

        // Initial check
        updateRemoteVideo();

        // Listen for track changes - Remote participant events
        const handleRemoteTrackPublished = (publication: any) => {
            if (publication.kind === Track.Kind.Video) {
                updateRemoteVideo();
            }
        };

        const handleRemoteTrackUnpublished = (publication: any) => {
            if (publication.kind === Track.Kind.Video) {
                updateRemoteVideo();
            }
        };

        const handleRemoteTrackSubscribed = (track: any, publication: any) => {
            if (track.kind === Track.Kind.Video) {
                updateRemoteVideo();
            }
        };

        const handleRemoteTrackUnsubscribed = (track: any, publication: any) => {
            if (track.kind === Track.Kind.Video) {
                updateRemoteVideo();
            }
        };

        remoteParticipant.on('trackPublished', handleRemoteTrackPublished);
        remoteParticipant.on('trackUnpublished', handleRemoteTrackUnpublished);
        remoteParticipant.on('trackSubscribed', handleRemoteTrackSubscribed);
        remoteParticipant.on('trackUnsubscribed', handleRemoteTrackUnsubscribed);

        return () => {
            remoteParticipant.off('trackPublished', handleRemoteTrackPublished);
            remoteParticipant.off('trackUnpublished', handleRemoteTrackUnpublished);
            remoteParticipant.off('trackSubscribed', handleRemoteTrackSubscribed);
            remoteParticipant.off('trackUnsubscribed', handleRemoteTrackUnsubscribed);
        };
    }, [remoteParticipant, remoteVideoRef]);

    return {
        hasLocalVideo,
        hasRemoteVideo,
    };
}
