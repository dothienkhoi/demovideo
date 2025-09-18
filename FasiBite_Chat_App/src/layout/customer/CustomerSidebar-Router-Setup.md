# Navigation Router Setup - CustomerSidebar

This document summarizes the router setup and navigation fixes implemented for the CustomerSidebar component.

## Routes Created

### 1. Groups Routes (`/groups`)

- **Layout**: `src/app/(customer)/(main)/groups/layout.tsx`
  - Uses ConversationSidebar with `defaultFilter="group"`
  - Follows the same pattern as chat layout
- **Main Page**: `src/app/(customer)/(main)/groups/page.tsx`
  - Default page when no group is selected
  - Shows placeholder with instructions
- **Conversation Page**: `src/app/(customer)/(main)/groups/[conversationId]/page.tsx`
  - Individual group conversation interface
  - Uses conversationId for consistent API usage
  - Fetches conversation details and renders ChatInterface
  - Follows the same pattern as direct chat conversations

### 2. Communities Route (`/communities`)

- **Page**: `src/app/(customer)/(main)/communities/page.tsx`
  - Placeholder page for future community features
  - Consistent design with the app's aesthetic

## Navigation Structure

The navigation items in CustomerSidebar are correctly configured:

```typescript
const navigationItems = [
  {
    id: "chats",
    icon: MessageCircle,
    label: "Tin nhắn",
    path: "/chat",
    badge: 3,
  },
  {
    id: "groups",
    icon: Users,
    label: "Nhóm chat",
    path: "/groups",
    badge: 1,
  },
  {
    id: "discover",
    icon: Search,
    label: "Khám phá",
    path: "/discover",
  },
  {
    id: "communities",
    icon: Compass,
    label: "Cộng đồng",
    path: "/communities",
  },
];
```

## Routing Logic

The `getCurrentNavItem()` function properly detects active routes:

```typescript
const getCurrentNavItem = (path: string) => {
  if (path.includes("/chat")) return "chats";
  if (path.includes("/groups")) return "groups";
  if (path.includes("/discover")) return "discover";
  if (path.includes("/communities")) return "communities";
  if (path.includes("/profile")) return "profile";
  if (path.includes("/me")) return "settings";
  return null;
};
```

## Key Features

### ✅ **Conversation ID Consistency**

- Both direct chats (`/chat/conversations/[conversationId]`) and group chats (`/groups/[conversationId]`) use conversationId
- Ensures consistent API usage and data structure handling

### ✅ **Unified Chat Interface**

- Both chat types use the same ChatInterface component
- ConversationType determines whether to render DirectChatHeader or GroupChatHeader

### ✅ **Sidebar Filtering**

- Chat layout uses ConversationSidebar without filter (shows all)
- Groups layout uses ConversationSidebar with `defaultFilter="group"`

### ✅ **Navigation State Management**

- Active navigation items are highlighted based on current pathname
- Smooth transitions and hover effects
- Badge notifications for unread messages

## URL Structure

| Route Pattern                          | Description                                 |
| -------------------------------------- | ------------------------------------------- |
| `/chat`                                | Main chat page (all conversations)          |
| `/chat/conversations/[conversationId]` | Individual direct chat                      |
| `/groups`                              | Main groups page (group conversations only) |
| `/groups/[conversationId]`             | Individual group chat                       |
| `/discover`                            | Group discovery page                        |
| `/communities`                         | Communities page (placeholder)              |
| `/me`                                  | User settings                               |

## Technical Implementation

- **Next.js 15 App Router** with proper route groups
- **TanStack Query** for conversation data fetching
- **TypeScript** with proper type safety
- **Responsive design** with mobile-friendly navigation
- **Error handling** with proper loading and error states

All routes are now functional and properly integrated with the existing application architecture!
