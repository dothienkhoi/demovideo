# VideoManager Hook

## Overview
`VideoManager` is a custom React hook designed to manage video track display for 1-on-1 video calls using LiveKit. It handles automatic video track attachment/detachment and provides real-time state management for video availability.

## Features
- ✅ **Automatic video track detection** - Detects when video tracks are available
- ✅ **Real-time track attachment** - Automatically attaches/detaches video tracks to video elements
- ✅ **Event-driven updates** - Listens to LiveKit track events for immediate updates
- ✅ **Clean state management** - Maintains `hasLocalVideo` and `hasRemoteVideo` states
- ✅ **Proper cleanup** - Handles component unmounting and event cleanup

## Usage

```typescript
import { useVideoManager } from "./VideoManager";

const VideoCallComponent = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    
    const local = useLocalParticipant();
    const remote = useRemoteParticipant(partnerId);

    // Use the VideoManager hook
    const { hasLocalVideo, hasRemoteVideo } = useVideoManager({
        localParticipant: local.localParticipant,
        remoteParticipant: remote,
        localVideoRef,
        remoteVideoRef,
    });

    return (
        <div>
            {/* Remote video */}
            <div className="remote-video">
                {!hasRemoteVideo ? (
                    <div>Camera đã tắt</div>
                ) : (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Local video */}
            <div className="local-video">
                {!hasLocalVideo ? (
                    <div>Camera đã tắt</div>
                ) : (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
        </div>
    );
};
```

## Props

### VideoManagerProps
| Prop | Type | Description |
|------|------|-------------|
| `localParticipant` | `LocalParticipant \| undefined` | LiveKit local participant instance |
| `remoteParticipant` | `RemoteParticipant \| undefined` | LiveKit remote participant instance |
| `localVideoRef` | `React.RefObject<HTMLVideoElement \| null>` | Ref to local video element |
| `remoteVideoRef` | `React.RefObject<HTMLVideoElement \| null>` | Ref to remote video element |

## Returns

### VideoManagerReturn
| Property | Type | Description |
|----------|------|-------------|
| `hasLocalVideo` | `boolean` | Whether local video track is available and active |
| `hasRemoteVideo` | `boolean` | Whether remote video track is available and active |

## How It Works

1. **Track Detection**: The hook monitors video track publications from both local and remote participants
2. **Event Listening**: Listens to LiveKit events:
   - `trackPublished` - When a new track is published
   - `trackUnpublished` - When a track is unpublished
   - `trackSubscribed` - When a track is subscribed (remote only)
   - `trackUnsubscribed` - When a track is unsubscribed (remote only)
3. **Automatic Attachment**: When a video track is available, it automatically attaches to the corresponding video element
4. **State Updates**: Updates the `hasLocalVideo` and `hasRemoteVideo` states based on track availability
5. **Cleanup**: Properly removes event listeners and detaches tracks when component unmounts

## Event Handling

### Local Participant Events
- `trackPublished` - Single parameter: `TrackPublication`
- `trackUnpublished` - Single parameter: `TrackPublication`

### Remote Participant Events
- `trackPublished` - Single parameter: `RemoteTrackPublication`
- `trackUnpublished` - Single parameter: `RemoteTrackPublication`
- `trackSubscribed` - Two parameters: `RemoteTrack`, `RemoteTrackPublication`
- `trackUnsubscribed` - Two parameters: `RemoteTrack`, `RemoteTrackPublication`

## Best Practices

1. **Always use refs**: Pass video element refs to the hook for automatic track attachment
2. **Handle loading states**: Use the returned boolean states to show appropriate UI
3. **Cleanup**: The hook handles cleanup automatically, but ensure video elements are properly unmounted
4. **Error handling**: The hook silently handles track attachment errors

## Dependencies

- `livekit-client` - For LiveKit participant and track types
- `react` - For hooks and refs

## Example Integration

See `VideoCallInterface1v1.tsx` for a complete implementation example.
