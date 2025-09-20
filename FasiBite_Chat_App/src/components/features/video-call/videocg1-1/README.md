# Direct Video Call Components (1-1)

This directory contains components for handling direct video calls between two users in a 1-on-1 conversation.

## Components

### 1. VideoCallModal
Consolidated modal that handles both incoming and outgoing video calls.

**Features:**
- Animated caller/recipient avatar with pulsing ring
- Accept/Decline buttons for incoming calls with loading states
- Cancel/End call button for outgoing calls with loading state
- Call duration timer for connected calls
- Beautiful gradient design
- Responsive layout
- Support for all call statuses (ringing, connecting, connected, declined, missed)

### 2. DirectVideoCallManager
Main component that manages the entire direct video call flow.

**Features:**
- Video call button integration
- State management for incoming/outgoing calls
- Integration with existing video call system
- Test functionality for development

**Props:**
```typescript
interface DirectVideoCallManagerProps {
    conversationId: number;
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
    currentUserId: string;
    currentUserName: string;
    currentUserAvatar?: string;
    className?: string;
}
```

## Usage

### Integration in DirectChatHeader

```typescript
import { DirectVideoCallManager } from "@/components/features/video-call";

// In your DirectChatHeader component
{conversationType === ConversationType.Direct && partner && user && (
    <DirectVideoCallManager
        conversationId={conversationId}
        partnerId={partner.userId}
        partnerName={displayName}
        partnerAvatar={avatarUrl || undefined}
        currentUserId={user.id}
        currentUserName={user.fullName || "User"}
        currentUserAvatar={user.avatarUrl || undefined}
    />
)}
```

### Standalone Usage

```typescript
import { VideoCallModal } from "@/components/features/video-call";

// The VideoCallModal is automatically connected to the VideoCallSignalRProvider
// and handles both incoming and outgoing calls based on the context state
<VideoCallModal />
```

## API Integration

The components are designed to work with the existing video call system:

- Uses `useVideoCallContext` hook for video call management
- Integrates with SignalR for real-time call notifications
- Supports LiveKit integration for video conferencing

## Styling

All components use:
- Tailwind CSS for styling
- Shadcn/ui components for consistency
- Gradient backgrounds and shadows
- Smooth animations and transitions
- Responsive design

## Future Enhancements

- [ ] Call history integration
- [ ] Push notifications for incoming calls
- [ ] Call quality indicators
- [ ] Screen sharing support
- [ ] Call recording functionality