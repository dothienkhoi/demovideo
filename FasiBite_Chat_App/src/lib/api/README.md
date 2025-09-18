# Presence API Services

This document explains how to use the presence API services for fetching user statuses.

## Overview

The presence system provides both real-time updates via SignalR and batch fetching via REST API. The REST API is used to get initial status snapshots when components load.

## API Functions

### `getUserStatuses(userIds: string[])`

Fetches the current presence status for multiple users at once.

**Parameters:**

- `userIds`: Array of user IDs to fetch statuses for

**Returns:**

- `Promise<ApiResponse<UserStatusDto[]>>`

**Example:**

```typescript
import { getUserStatuses } from "@/lib/api/presence";

const userIds = ["user1", "user2", "user3"];
const response = await getUserStatuses(userIds);

if (response.success && response.data) {
  console.log("Fetched statuses:", response.data);
}
```

## Store Integration

### `setStatusesBatch(userStatuses: UserStatusDto[])`

Updates the presence store with multiple user statuses at once.

**Example:**

```typescript
import { usePresenceStore } from "@/store/presenceStore";

const { setStatusesBatch } = usePresenceStore();
setStatusesBatch(response.data);
```

## Custom Hook

### `usePresenceStatuses(userIds, options)`

A convenient hook for fetching and managing presence statuses.

**Parameters:**

- `userIds`: Array of user IDs
- `options`: Configuration object
  - `enabled`: Whether to fetch automatically (default: true)
  - `onSuccess`: Callback when fetch succeeds
  - `onError`: Callback when fetch fails

**Returns:**

- `isLoading`: Boolean indicating if fetch is in progress
- `refresh`: Function to manually refresh statuses

**Example:**

```typescript
import { usePresenceStatuses } from "@/hooks/usePresenceStatuses";

const userIds = ["user1", "user2", "user3"];
const { isLoading, refresh } = usePresenceStatuses(userIds, {
  onSuccess: (count) => console.log(`Fetched ${count} statuses`),
  onError: (error) => console.error("Fetch failed:", error),
});
```

## Complete Usage Example

```typescript
import { useEffect } from "react";
import { usePresenceStore } from "@/store/presenceStore";
import { getUserStatuses } from "@/lib/api/presence";
import { handleApiError } from "@/lib/utils/handleApiError";

function GroupMemberList({ members }) {
  const { setStatusesBatch } = usePresenceStore();
  const userIds = members.map((member) => member.id);

  useEffect(() => {
    const fetchStatuses = async () => {
      if (userIds.length === 0) return;

      try {
        const response = await getUserStatuses(userIds);

        if (response.success && response.data) {
          setStatusesBatch(response.data);
        }
      } catch (error) {
        handleApiError(error, "Failed to fetch member statuses");
      }
    };

    fetchStatuses();
  }, [userIds, setStatusesBatch]);

  return (
    <div>
      {members.map((member) => (
        <UserAvatarWithStatus
          key={member.id}
          userId={member.id}
          fallback={member.name[0]}
        />
      ))}
    </div>
  );
}
```

## Error Handling

All API calls should use the `handleApiError` utility for consistent error handling:

```typescript
import { handleApiError } from "@/lib/utils/handleApiError";

try {
  const response = await getUserStatuses(userIds);
  // Handle success
} catch (error) {
  handleApiError(error, "Failed to fetch user statuses");
}
```

## Best Practices

1. **Batch Requests**: Always fetch multiple user statuses in a single request rather than individual calls
2. **Error Handling**: Always wrap API calls in try-catch blocks with proper error handling
3. **Loading States**: Show loading indicators while fetching statuses
4. **Caching**: The presence store automatically caches statuses, so avoid unnecessary refetches
5. **Real-time Updates**: Use SignalR for real-time updates after initial fetch
