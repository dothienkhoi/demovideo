# Direct Video Call Components (1-1)

This directory contains components for handling direct video calls between two users in a 1-on-1 conversation.

## Components

### 1. IncomingCallModal
Modal that appears when receiving an incoming video call.

**Features:**
- Animated caller avatar with pulsing ring
- Accept/Decline buttons with loading states
- Beautiful gradient design
- Responsive layout

**Props:**
```typescript
interface IncomingCallModalProps {
    isOpen: boolean;
    callerName: string;
    callerAvatar?: string;
    callerId: string;
    onAccept: () => void;
    onDecline: () => void;
    isAccepting?: boolean;
    isDeclining?: boolean;
}
```

### 2. OutgoingCallModal
Modal that appears when making an outgoing video call.

**Features:**
- Animated recipient avatar with pulsing ring
- Cancel button with loading state
- Call duration timer
- Beautiful gradient design

**Props:**
```typescript
interface OutgoingCallModalProps {
    isOpen: boolean;
    recipientName: string;
    recipientAvatar?: string;
    recipientId: string;
    onCancel: () => void;
    isCancelling?: boolean;
    callDuration?: number; // in seconds
}
```

### 3. DirectVideoCallManager
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

### 4. DirectVideoCallDemo
Demo component for testing and showcasing the direct video call UI.

**Features:**
- Interactive demo of all components
- Test buttons for incoming/outgoing calls
- Live call duration timer
- Feature showcase

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
import { IncomingCallModal, OutgoingCallModal } from "@/components/features/video-call";

// Incoming call
<IncomingCallModal
    isOpen={showIncoming}
    callerName="John Doe"
    callerAvatar="https://example.com/avatar.jpg"
    callerId="user-123"
    onAccept={handleAccept}
    onDecline={handleDecline}
    isAccepting={isAccepting}
    isDeclining={isDeclining}
/>

// Outgoing call
<OutgoingCallModal
    isOpen={showOutgoing}
    recipientName="Jane Smith"
    recipientAvatar="https://example.com/avatar.jpg"
    recipientId="user-456"
    onCancel={handleCancel}
    isCancelling={isCancelling}
    callDuration={callDuration}
/>
```

## Demo Page

Visit `/video-call-demo` to see all components in action with interactive demos.

## API Integration

The components are designed to work with the existing video call system:

- Uses `useVideoCallAdmin` hook for video call management
- Integrates with `createVideoCall` and `joinVideoCall` APIs
- Opens video call room using `openVideoCall` function
- Supports LiveKit integration

## Styling

All components use:
- Tailwind CSS for styling
- Shadcn/ui components for consistency
- Gradient backgrounds and shadows
- Smooth animations and transitions
- Responsive design

## Future Enhancements

- [ ] Real-time call notifications via SignalR
- [ ] Call history integration
- [ ] Push notifications for incoming calls
- [ ] Call quality indicators
- [ ] Screen sharing support
- [ ] Call recording functionality
