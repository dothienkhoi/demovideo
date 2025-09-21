"use client";

import { useEffect, useState } from "react";
import { Track, Room } from "livekit-client";

interface VideoManagerDirectProps {
    room?: Room | null;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}

/**
 * Direct video manager that uses room object directly
 */
export function useVideoManagerDirect({
    room,
    localVideoRef,
    remoteVideoRef,
}: VideoManagerDirectProps) {
    const [hasLocalVideo, setHasLocalVideo] = useState(false);
    const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

    console.log('[VideoManagerDirect] Hook called with:', {
        room: !!room,
        localVideoRef: !!localVideoRef.current,
        remoteVideoRef: !!remoteVideoRef.current
    });

    // Monitor local video track using room object directly
    useEffect(() => {
        if (!room || !room.localParticipant) {
            setHasLocalVideo(false);
            return;
        }

        const updateLocalVideo = () => {
            const localParticipant = room.localParticipant;
            const videoPublications = Array.from(localParticipant.videoTrackPublications.values());

            console.log('[VideoManagerDirect] Local video publications:', videoPublications.map(p => ({
                track: !!p.track,
                isSubscribed: p.isSubscribed,
                isMuted: p.isMuted,
                trackSid: p.trackSid
            })));

            // Find the first active video track
            const activeVideoTrack = videoPublications.find(pub =>
                pub.track && pub.isSubscribed && !pub.isMuted
            ) || videoPublications.find(pub =>
                pub.track && pub.isSubscribed
            );

            const hasVideo = !!activeVideoTrack;
            setHasLocalVideo(hasVideo);

            console.log('[VideoManagerDirect] Local video state:', {
                hasVideo,
                activeVideoTrack: !!activeVideoTrack,
                trackSid: activeVideoTrack?.trackSid
            });

            // Attach/detach video track
            if (localVideoRef.current) {
                if (hasVideo && activeVideoTrack?.track) {
                    console.log('[VideoManagerDirect] Attaching local video track to element');
                    try {
                        activeVideoTrack.track.attach(localVideoRef.current);
                        localVideoRef.current.style.display = 'block';
                    } catch (error) {
                        console.error('[VideoManagerDirect] Error attaching local video track:', error);
                    }
                } else {
                    console.log('[VideoManagerDirect] Detaching local video track');
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
            console.log('[VideoManagerDirect] Local track published:', publication.kind);
            if (publication.kind === Track.Kind.Video) {
                updateLocalVideo();
            }
        };

        const handleTrackUnpublished = (publication: any) => {
            console.log('[VideoManagerDirect] Local track unpublished:', publication.kind);
            if (publication.kind === Track.Kind.Video) {
                updateLocalVideo();
            }
        };

        room.localParticipant.on('trackPublished', handleTrackPublished);
        room.localParticipant.on('trackUnpublished', handleTrackUnpublished);

        return () => {
            room.localParticipant.off('trackPublished', handleTrackPublished);
            room.localParticipant.off('trackUnpublished', handleTrackUnpublished);
        };
    }, [room, localVideoRef]);

    // Monitor remote video track using room object directly
    useEffect(() => {
        if (!room) {
            setHasRemoteVideo(false);
            return;
        }

        const updateRemoteVideo = () => {
            // Get all remote participants
            const remoteParticipants = Array.from(room.remoteParticipants.values());
            console.log('[VideoManagerDirect] Remote participants:', remoteParticipants.map(p => p.identity));

            // Find video tracks from all remote participants
            let activeVideoTrack = null;
            for (const participant of remoteParticipants) {
                const videoPublications = Array.from(participant.videoTrackPublications.values());
                console.log('[VideoManagerDirect] Remote video publications for', participant.identity, ':', videoPublications.map(p => ({
                    track: !!p.track,
                    isSubscribed: p.isSubscribed,
                    isMuted: p.isMuted,
                    trackSid: p.trackSid
                })));

                const videoTrack = videoPublications.find(pub =>
                    pub.track && pub.isSubscribed && !pub.isMuted
                ) || videoPublications.find(pub =>
                    pub.track && pub.isSubscribed
                );

                if (videoTrack) {
                    activeVideoTrack = videoTrack;
                    break;
                }
            }

            const hasVideo = !!activeVideoTrack;
            setHasRemoteVideo(hasVideo);

            console.log('[VideoManagerDirect] Remote video state:', {
                hasVideo,
                activeVideoTrack: !!activeVideoTrack,
                trackSid: activeVideoTrack?.trackSid
            });

            // Attach/detach video track
            if (remoteVideoRef.current) {
                if (hasVideo && activeVideoTrack?.track) {
                    console.log('[VideoManagerDirect] Attaching remote video track to element');
                    try {
                        activeVideoTrack.track.attach(remoteVideoRef.current);
                        remoteVideoRef.current.style.display = 'block';
                    } catch (error) {
                        console.error('[VideoManagerDirect] Error attaching remote video track:', error);
                    }
                } else {
                    console.log('[VideoManagerDirect] Detaching remote video track');
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = null;
                        remoteVideoRef.current.style.display = 'none';
                    }
                }
            }
        };

        // Initial check
        updateRemoteVideo();

        // Listen for track changes from all remote participants
        const handleTrackSubscribed = (track: any, publication: any) => {
            console.log('[VideoManagerDirect] Remote track subscribed:', track.kind);
            if (track.kind === Track.Kind.Video) {
                updateRemoteVideo();
            }
        };

        const handleTrackUnsubscribed = (track: any, publication: any) => {
            console.log('[VideoManagerDirect] Remote track unsubscribed:', track.kind);
            if (track.kind === Track.Kind.Video) {
                updateRemoteVideo();
            }
        };

        // Add listeners to all remote participants
        const addListeners = () => {
            room.remoteParticipants.forEach(participant => {
                participant.on('trackSubscribed', handleTrackSubscribed);
                participant.on('trackUnsubscribed', handleTrackUnsubscribed);
            });
        };

        // Remove listeners from all remote participants
        const removeListeners = () => {
            room.remoteParticipants.forEach(participant => {
                participant.off('trackSubscribed', handleTrackSubscribed);
                participant.off('trackUnsubscribed', handleTrackUnsubscribed);
            });
        };

        // Listen for participant changes
        const handleParticipantConnected = (participant: any) => {
            console.log('[VideoManagerDirect] Remote participant connected:', participant.identity);
            participant.on('trackSubscribed', handleTrackSubscribed);
            participant.on('trackUnsubscribed', handleTrackUnsubscribed);
            updateRemoteVideo();
        };

        const handleParticipantDisconnected = (participant: any) => {
            console.log('[VideoManagerDirect] Remote participant disconnected:', participant.identity);
            participant.off('trackSubscribed', handleTrackSubscribed);
            participant.off('trackUnsubscribed', handleTrackUnsubscribed);
            updateRemoteVideo();
        };

        // Add initial listeners
        addListeners();

        // Listen for participant changes
        room.on('participantConnected', handleParticipantConnected);
        room.on('participantDisconnected', handleParticipantDisconnected);

        return () => {
            removeListeners();
            room.off('participantConnected', handleParticipantConnected);
            room.off('participantDisconnected', handleParticipantDisconnected);
        };
    }, [room, remoteVideoRef]);

    return {
        hasLocalVideo,
        hasRemoteVideo,
    };
}
