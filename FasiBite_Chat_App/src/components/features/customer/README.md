# Real-Time User Presence System

This document explains how to use the real-time user presence system implemented via SignalR Hub.

## Overview

The presence system allows you to track and display real-time user status (Online, Offline, Busy, Absent) throughout the application. It uses SignalR for real-time communication and Zustand for state management.

## Components

### 1. UserAvatarWithStatus

A component that displays a user avatar with a status indicator.

```tsx
import { UserAvatarWithStatus } from "@/components/shared/UserAvatarWithStatus";

<UserAvatarWithStatus
  userId="user123"
  src="/path/to/avatar.jpg"
  fallback="JD"
  className="h-10 w-10"
/>;
```

**Props:**

- `userId`: Unique identifier for the user
- `src`: Optional avatar image URL
- `fallback`: Text to display when no image is available
- `className`: Optional CSS classes

### 2. PresenceProvider

The provider component that manages the SignalR connection. It's already integrated into the main customer layout.

### 3. Hooks

#### useUserPresence(userId)

Get presence information for a specific user:

```tsx
import { useUserPresence } from "@/hooks/useUserPresence";

const { status, changeMyStatus } = useUserPresence("user123");
```

#### useMyPresence()

Get the current user's presence actions:

```tsx
import { useMyPresence } from "@/hooks/useUserPresence";

const { changeMyStatus } = useMyPresence();
```

## Usage Examples

### Displaying User Status

```tsx
import { UserAvatarWithStatus } from "@/components/shared/UserAvatarWithStatus";

function UserList() {
  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-3">
          <UserAvatarWithStatus
            userId={user.id}
            src={user.avatarUrl}
            fallback={user.initials}
          />
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  );
}
```

### Changing Your Status

```tsx
import { useMyPresence } from "@/hooks/useUserPresence";
import { UserPresenceStatus } from "@/types/models";

function StatusSelector() {
  const { changeMyStatus } = useMyPresence();

  return (
    <div className="flex gap-2">
      <button onClick={() => changeMyStatus(UserPresenceStatus.Online)}>
        Online
      </button>
      <button onClick={() => changeMyStatus(UserPresenceStatus.Busy)}>
        Busy
      </button>
      <button onClick={() => changeMyStatus(UserPresenceStatus.Absent)}>
        Absent
      </button>
      <button onClick={() => changeMyStatus(UserPresenceStatus.Offline)}>
        Offline
      </button>
    </div>
  );
}
```

## Status Colors

- **Online**: Green (`bg-green-500`)
- **Offline**: Gray (`bg-gray-400`)
- **Busy**: Red (`bg-red-500`)
- **Absent**: Yellow (`bg-yellow-500`)

## Technical Details

- The system automatically connects to the SignalR hub when a user is authenticated
- Status changes are broadcast to all connected clients in real-time
- The connection includes automatic reconnection functionality
- All presence data is stored in a Zustand store for efficient state management

