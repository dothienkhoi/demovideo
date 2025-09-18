# Chat Group Invitation Management

This feature allows users to view and respond to direct invitations to join groups.

## Components Created

### 1. TypeScript Types (`src/types/invitation.ts`)
- `GroupInvitationDto`: Represents a single pending group invitation
- `RespondToInvitationDto`: Request payload for responding to invitations

### 2. API Functions (`src/lib/api/customer/invitations.ts`)
- `getMyPendingInvitations()`: Fetches pending invitations (GET /invitations/me)
- `respondToGroupInvitation()`: Responds to invitations (POST /invitations/{invitationId}/respond)

### 3. UI Components

#### PendingInvitationsList (`src/components/features/invitations/PendingInvitationsList.tsx`)
- Fetches and displays list of pending invitations
- Handles loading, error, and empty states
- Uses TanStack Query with queryKey: `['pendingInvitations']`

#### GroupInvitationCard (`src/components/features/invitations/GroupInvitationCard.tsx`)
- Displays individual invitation with group info and action buttons
- Implements accept/decline functionality with proper mutation handling
- Shows group avatar, name, and inviter information
- Provides user feedback through toast notifications

## Usage

To integrate this feature into your application:

1. **In a notification center or dedicated page:**
```tsx
import { PendingInvitationsList } from "@/components/features/invitations/PendingInvitationsList";

export function NotificationsPage() {
  return (
    <div className="p-4">
      <PendingInvitationsList />
    </div>
  );
}
```

2. **In a popover or dropdown:**
```tsx
import { PendingInvitationsList } from "@/components/features/invitations/PendingInvitationsList";

export function NotificationPopover() {
  return (
    <PopoverContent className="w-80">
      <PendingInvitationsList />
    </PopoverContent>
  );
}
```

## Features

- ✅ Responsive design with proper mobile layout
- ✅ Loading states with skeleton components
- ✅ Error handling with user-friendly messages
- ✅ Empty state when no invitations exist
- ✅ Real-time UI updates after accepting/declining
- ✅ Query invalidation to refresh related data
- ✅ Vietnamese localization
- ✅ Proper accessibility with disabled states
- ✅ Visual feedback through toast notifications

## Query Invalidation

When an invitation is accepted, the following queries are invalidated:
- `['pendingInvitations']` - Removes the invitation from the list
- `['conversations']` - Updates conversation list with new group
- `['myProfile']` - Updates user profile with new group membership

When an invitation is declined:
- `['pendingInvitations']` - Removes the invitation from the list