# Hướng dẫn tích hợp Video Call 1-1 với SignalR (DEPRECATED)

**NOTE: This documentation is for the old SignalR-based implementation which has been deprecated. Please refer to the main README.md for the current implementation.**

## 1. Tích hợp vào Layout chính (DEPRECATED)

### Bước 1: Wrap toàn bộ app với VideoCallSignalRWrapper (DEPRECATED)

```tsx
// app/layout.tsx
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { VideoCallSignalRWrapper } from '@/components/features/video-call/videocg1-1/VideoCallSignalRWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <VideoCallSignalRWrapper>
          {children}
        </VideoCallSignalRWrapper>
      </body>
    </html>
  );
}
```

### Bước 2: Hoặc tích hợp vào layout cụ thể (DEPRECATED)

```tsx
// app/(customer)/layout.tsx
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { VideoCallSignalRWrapper } from '@/components/features/video-call/videocg1-1/VideoCallSignalRWrapper';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">
        <VideoCallSignalRWrapper>
          {children}
        </VideoCallSignalRWrapper>
      </main>
    </div>
  );
}
```

## 2. Tích hợp vào cuộc hội thoại 1-1 (DEPRECATED)

### Cách 1: Sử dụng ChatHeaderWithVideoCall (Khuyến nghị) (DEPRECATED)

```tsx
// components/chat/ChatHeader.tsx
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { ChatHeaderWithVideoCall } from '@/components/features/video-call/videocg1-1/ChatHeaderWithVideoCall';

interface ChatHeaderProps {
  conversationId: number;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  receiverStatus?: 'online' | 'offline' | 'away' | 'busy';
}

export function ChatHeader({ 
  conversationId, 
  receiverId, 
  receiverName, 
  receiverAvatar, 
  receiverStatus 
}: ChatHeaderProps) {
  return (
    <ChatHeaderWithVideoCall
      conversationId={conversationId}
      receiverId={receiverId}
      receiverName={receiverName}
      receiverAvatar={receiverAvatar}
      receiverStatus={receiverStatus}
      showBackButton={true}
      onBack={() => router.back()}
      onMoreOptions={() => setShowOptions(true)}
    />
  );
}
```

### Cách 2: Tích hợp nút gọi video vào header hiện có (DEPRECATED)

```tsx
// components/chat/ExistingChatHeader.tsx
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { StartVideoCallButtonSignalR } from '@/components/features/video-call/videocg1-1/StartVideoCallButtonSignalR';

export function ExistingChatHeader({ conversationId, receiverId, receiverName }) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        {/* Existing header content */}
        <h2>{receiverName}</h2>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Add video call button */}
        <StartVideoCallButtonSignalR
          conversationId={conversationId}
          receiverId={receiverId}
          receiverName={receiverName}
          size="sm"
          variant="outline"
        />
        
        {/* Other existing buttons */}
      </div>
    </div>
  );
}
```

### Cách 3: Sử dụng trong mobile layout (DEPRECATED)

```tsx
// components/chat/MobileChatHeader.tsx
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { ChatHeaderWithVideoCallCompact } from '@/components/features/video-call/videocg1-1/ChatHeaderWithVideoCall';

export function MobileChatHeader({ conversationId, receiverId, receiverName }) {
  return (
    <ChatHeaderWithVideoCallCompact
      conversationId={conversationId}
      receiverId={receiverId}
      receiverName={receiverName}
      showBackButton={true}
      onBack={() => router.back()}
    />
  );
}
```

## 3. Sử dụng Context trong component khác (DEPRECATED)

```tsx
// components/chat/ChatStatus.tsx
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { useVideoCallContext } from '@/providers/VideoCallSignalRProvider';

export function ChatStatus({ conversationId }) {
  const { videoCallState } = useVideoCallContext();
  
  // Hiển thị trạng thái cuộc gọi
  if (videoCallState.isIncomingCall) {
    return (
      <div className="p-2 bg-blue-100 text-blue-800 rounded">
        Cuộc gọi video đến từ {videoCallState.incomingCallData?.caller.fullName}
      </div>
    );
  }
  
  if (videoCallState.isOutgoingCall) {
    return (
      <div className="p-2 bg-green-100 text-green-800 rounded">
        Đang gọi video...
      </div>
    );
  }
  
  return null;
}
```

## 4. Tích hợp vào conversation list (DEPRECATED)

```tsx
// components/chat/ConversationItem.tsx
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { StartVideoCallButtonSignalR } from '@/components/features/video-call/videocg1-1/StartVideoCallButtonSignalR';

export function ConversationItem({ conversation }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50">
      <div className="flex items-center gap-3">
        {/* Conversation info */}
        <div>
          <h3>{conversation.name}</h3>
          <p className="text-sm text-gray-500">{conversation.lastMessage}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Video call button for direct conversations */}
        {conversation.type === 'direct' && (
          <StartVideoCallButtonSignalR
            conversationId={conversation.id}
            receiverId={conversation.participantId}
            receiverName={conversation.name}
            size="sm"
            variant="ghost"
          />
        )}
      </div>
    </div>
  );
}
```

## 5. Tích hợp vào message input (DEPRECATED)

```tsx
// components/chat/MessageInput.tsx
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { StartVideoCallButtonSignalR } from '@/components/features/video-call/videocg1-1/StartVideoCallButtonSignalR';

export function MessageInput({ conversationId, receiverId, receiverName }) {
  return (
    <div className="flex items-center gap-2 p-3 border-t">
      {/* Video call button */}
      <StartVideoCallButtonSignalR
        conversationId={conversationId}
        receiverId={receiverId}
        receiverName={receiverName}
        size="sm"
        variant="ghost"
      />
      
      {/* Message input */}
      <input 
        type="text" 
        placeholder="Nhập tin nhắn..."
        className="flex-1 p-2 border rounded"
      />
      
      {/* Send button */}
      <button className="p-2 bg-blue-500 text-white rounded">
        Gửi
      </button>
    </div>
  );
}
```

## 6. Tích hợp vào user profile (DEPRECATED)

```tsx
// components/user/UserProfile.tsx
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { StartVideoCallButtonSignalR } from '@/components/features/video-call/videocg1-1/StartVideoCallButtonSignalR';

export function UserProfile({ user, conversationId }) {
  return (
    <div className="p-6 space-y-4">
      {/* User info */}
      <div className="text-center">
        <h2>{user.name}</h2>
        <p className="text-gray-500">{user.status}</p>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        <StartVideoCallButtonSignalR
          conversationId={conversationId}
          receiverId={user.id}
          receiverName={user.name}
          size="default"
          variant="default"
          className="flex-1"
        />
        
        <Button variant="outline" className="flex-1">
          Gửi tin nhắn
        </Button>
      </div>
    </div>
  );
}
```

## 7. Tích hợp vào notification system (DEPRECATED)

```tsx
// components/notifications/NotificationItem.tsx
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { useVideoCallContext } from '@/providers/VideoCallSignalRProvider';

export function NotificationItem({ notification }) {
  const { videoCallState } = useVideoCallContext();
  
  // Hiển thị notification đặc biệt cho video call
  if (notification.type === 'video_call' && videoCallState.isIncomingCall) {
    return (
      <div className="p-3 bg-blue-50 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Cuộc gọi video đến</p>
            <p className="text-sm text-gray-600">
              {videoCallState.incomingCallData?.caller.fullName} đang gọi cho bạn
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="default">Trả lời</Button>
            <Button size="sm" variant="outline">Từ chối</Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular notification
  return (
    <div className="p-3 border-b">
      <p>{notification.message}</p>
    </div>
  );
}
```

## 8. Environment Variables

Đảm bảo có các biến môi trường sau:

```env
# .env.local
NEXT_PUBLIC_API_URL=https://localhost:7007
```

## 9. Dependencies

Đảm bảo đã cài đặt các dependencies:

```bash
npm install @microsoft/signalr sonner lodash-es
```

## 10. Backend Requirements

Backend cần có:

1. **VideoCallHub** đã được đăng ký trong Program.cs
2. **API endpoints** cho video call
3. **LiveKit server** được cấu hình
4. **Authentication** cho SignalR connections

## 11. Testing

Để test hệ thống:

1. Mở 2 tab browser với 2 user khác nhau
2. User A bấm nút gọi video
3. User B sẽ nhận được modal cuộc gọi đến
4. Test các trường hợp: Accept, Decline, Missed call

## 12. Troubleshooting

### Lỗi kết nối SignalR:
- Kiểm tra backend có chạy không
- Kiểm tra CORS configuration
- Kiểm tra authentication token

### Lỗi API calls:
- Kiểm tra API endpoints có tồn tại không
- Kiểm tra request/response format
- Kiểm tra authentication headers

### Lỗi LiveKit:
- Kiểm tra LiveKit server có chạy không
- Kiểm tra token generation
- Kiểm tra room configuration