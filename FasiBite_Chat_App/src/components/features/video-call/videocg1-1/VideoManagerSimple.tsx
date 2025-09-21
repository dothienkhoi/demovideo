"use client";

import { useEffect, useState } from "react";
import { Track, LocalParticipant, RemoteParticipant } from "livekit-client";

interface VideoManagerSimpleProps {
    localParticipant?: LocalParticipant;
    remoteParticipant?: RemoteParticipant;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}

/**
 * Simplified video manager that uses direct track attachment
 */
export function useVideoManagerSimple({
    localParticipant,
    remoteParticipant,
    localVideoRef,
    remoteVideoRef,
}: VideoManagerSimpleProps) {
    const [hasLocalVideo, setHasLocalVideo] = useState(false);
    const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

    console.log('[VideoManagerSimple] Hook called with:', {
        localParticipant: !!localParticipant,
        remoteParticipant: !!remoteParticipant,
        localVideoRef: !!localVideoRef.current,
        remoteVideoRef: !!remoteVideoRef.current
    });

    // Monitor local video track - simplified approach
    useEffect(() => {
        if (!localParticipant) {
            setHasLocalVideo(false);
            return;
        }

        const updateLocalVideo = () => {
            // Get all video track publications
            const videoPublications = Array.from(localParticipant.videoTrackPublications.values());
            console.log('[VideoManagerSimple] Local video publications:', videoPublications.map(p => ({
                track: !!p.track,
                isSubscribed: p.isSubscribed,
                isMuted: p.isMuted,
                trackSid: p.trackSid
            })));

            // Find the first active video track - prioritize published tracks
            const activeVideoTrack = videoPublications.find(pub =>
                pub.track && pub.isSubscribed && !pub.isMuted
            ) || videoPublications.find(pub =>
                pub.track && pub.isSubscribed
            );

            const hasVideo = !!activeVideoTrack;
            setHasLocalVideo(hasVideo);

            console.log('[VideoManagerSimple] Local video state:', {
                hasVideo,
                activeVideoTrack: !!activeVideoTrack,
                trackSid: activeVideoTrack?.trackSid
            });

            // Attach/detach video track
            if (localVideoRef.current) {
                if (hasVideo && activeVideoTrack?.track) {
                    console.log('[VideoManagerSimple] Attaching local video track to element');
                    try {
                        activeVideoTrack.track.attach(localVideoRef.current);
                        // Ensure video element is visible
                        localVideoRef.current.style.display = 'block';
                    } catch (error) {
                        console.error('[VideoManagerSimple] Error attaching local video track:', error);
                    }
                } else {
                    console.log('[VideoManagerSimple] Detaching local video track');
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = null;
                        localVideoRef.current.style.display = 'none';
                    }
                }
            }
        };

        // Initial check
        updateLocalVideo();

        // Listen for track changes
        const handleTrackPublished = (publication: any) => {
            console.log('[VideoManagerSimple] Local track published:', publication.kind);
            if (publication.kind === Track.Kind.Video) {
                updateLocalVideo();
            }
        };

        const handleTrackUnpublished = (publication: any) => {
            console.log('[VideoManagerSimple] Local track unpublished:', publication.kind);
            if (publication.kind === Track.Kind.Video) {
                updateLocalVideo();
            }
        };

        localParticipant.on('trackPublished', handleTrackPublished);
        localParticipant.on('trackUnpublished', handleTrackUnpublished);

        return () => {
            localParticipant.off('trackPublished', handleTrackPublished);
            localParticipant.off('trackUnpublished', handleTrackUnpublished);
        };
    }, [localParticipant, localVideoRef]);

    // Monitor remote video track - simplified approach
    useEffect(() => {
        if (!remoteParticipant) {
            setHasRemoteVideo(false);
            return;
        }

        const updateRemoteVideo = () => {
            // Get all video track publications
            const videoPublications = Array.from(remoteParticipant.videoTrackPublications.values());
            console.log('[VideoManagerSimple] Remote video publications:', videoPublications.map(p => ({
                track: !!p.track,
                isSubscribed: p.isSubscribed,
                isMuted: p.isMuted,
                trackSid: p.trackSid
            })));

            // Find the first active video track - prioritize published tracks
            const activeVideoTrack = videoPublications.find(pub =>
                pub.track && pub.isSubscribed && !pub.isMuted
            ) || videoPublications.find(pub =>
                pub.track && pub.isSubscribed
            );

            const hasVideo = !!activeVideoTrack;
            setHasRemoteVideo(hasVideo);

            console.log('[VideoManagerSimple] Remote video state:', {
                hasVideo,
                activeVideoTrack: !!activeVideoTrack,
                trackSid: activeVideoTrack?.trackSid
            });

            // Attach/detach video track
            if (remoteVideoRef.current) {
                if (hasVideo && activeVideoTrack?.track) {
                    console.log('[VideoManagerSimple] Attaching remote video track to element');
                    try {
                        activeVideoTrack.track.attach(remoteVideoRef.current);
                        // Ensure video element is visible
                        remoteVideoRef.current.style.display = 'block';
                    } catch (error) {
                        console.error('[VideoManagerSimple] Error attaching remote video track:', error);
                    }
                } else {
                    console.log('[VideoManagerSimple] Detaching remote video track');
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = null;
                        remoteVideoRef.current.style.display = 'none';
                    }
                }
            }
        };

        // Initial check
        updateRemoteVideo();

        // Listen for track changes
        const handleTrackPublished = (publication: any) => {
            console.log('[VideoManagerSimple] Remote track published:', publication.kind);
            if (publication.kind === Track.Kind.Video) {
                updateRemoteVideo();
            }
        };

        const handleTrackUnpublished = (publication: any) => {
            console.log('[VideoManagerSimple] Remote track unpublished:', publication.kind);
            if (publication.kind === Track.Kind.Video) {
                updateRemoteVideo();
            }
        };

        const handleTrackSubscribed = (track: any, publication: any) => {
            console.log('[VideoManagerSimple] Remote track subscribed:', track.kind);
            if (track.kind === Track.Kind.Video) {
                updateRemoteVideo();
            }
        };

        const handleTrackUnsubscribed = (track: any, publication: any) => {
            console.log('[VideoManagerSimple] Remote track unsubscribed:', track.kind);
            if (track.kind === Track.Kind.Video) {
                updateRemoteVideo();
            }
        };

        remoteParticipant.on('trackPublished', handleTrackPublished);
        remoteParticipant.on('trackUnpublished', handleTrackUnpublished);
        remoteParticipant.on('trackSubscribed', handleTrackSubscribed);
        remoteParticipant.on('trackUnsubscribed', handleTrackUnsubscribed);

        return () => {
            remoteParticipant.off('trackPublished', handleTrackPublished);
            remoteParticipant.off('trackUnpublished', handleTrackUnpublished);
            remoteParticipant.off('trackSubscribed', handleTrackSubscribed);
            remoteParticipant.off('trackUnsubscribed', handleTrackUnsubscribed);
        };
    }, [remoteParticipant, remoteVideoRef]);

    return {
        hasLocalVideo,
        hasRemoteVideo,
    };
}
