# Video Call 1-1 với SignalR Integration (DEPRECATED)

**NOTE: This documentation is for the old SignalR-based implementation which has been deprecated. Please refer to the main README.md for the current implementation.**

Hệ thống video call 1-1 sử dụng SignalR để kết nối thời gian thực giữa người gọi và người nhận.

## Cấu trúc Components

### 1. VideoCallSignalRProvider (DEPRECATED)
- **File**: `src/providers/VideoCallSignalRProvider.tsx` (DEPRECATED)
- **Chức năng**: Quản lý kết nối SignalR và trạng thái cuộc gọi
- **Features**:
  - Tự động kết nối SignalR khi user đăng nhập
  - Xử lý các sự kiện: IncomingCall, CallAccepted, CallDeclined, CallMissed, CallEnded
  - Quản lý trạng thái cuộc gọi (ringing, connecting, connected, ended, etc.)
  - Throttled notifications để tránh spam

### 2. IncomingCallModalSignalR (DEPRECATED)
- **File**: `src/components/features/video-call/videocg1-1/IncomingCallModalSignalR.tsx` (DEPRECATED)
- **Chức năng**: Hiển thị modal cuộc gọi đến
- **Features**:
  - Avatar với animation ring
  - Nút Accept/Decline
  - Loading states
  - Tự động đóng khi call kết thúc

### 3. OutgoingCallModalSignalR (DEPRECATED)
- **File**: `src/components/features/video-call/videocg1-1/OutgoingCallModalSignalR.tsx` (DEPRECATED)
- **Chức năng**: Hiển thị modal cuộc gọi đi
- **Features**:
  - Avatar với animation ring
  - Timer cuộc gọi
  - Nút End Call
  - Hiển thị trạng thái (ringing, connecting, connected, declined, missed)

### 4. StartVideoCallButtonSignalR (DEPRECATED)
- **File**: `src/components/features/video-call/videocg1-1/StartVideoCallButtonSignalR.tsx` (DEPRECATED)
- **Chức năng**: Nút bắt đầu cuộc gọi video
- **Variants**:
  - `StartVideoCallButtonSignalR`: Icon Video
  - `StartVideoCallButtonSignalRPhone`: Icon Phone
- **Features**:
  - Disabled khi đã có cuộc gọi đang diễn ra
  - Loading state
  - Toast notifications

### 5. VideoCallSignalRWrapper (DEPRECATED)
- **File**: `src/components/features/video-call/videocg1-1/VideoCallSignalRWrapper.tsx` (DEPRECATED)
- **Chức năng**: Wrapper component chứa provider và modals
- **Sử dụng**: Wrap toàn bộ app hoặc layout chính

## Cách sử dụng (DEPRECATED)

### 1. Setup trong Layout chính (DEPRECATED)

```tsx
// app/layout.tsx hoặc layout component chính
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { VideoCallSignalRWrapper } from '@/components/features/video-call/videocg1-1/VideoCallSignalRWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <VideoCallSignalRWrapper>
          {children}
        </VideoCallSignalRWrapper>
      </body>
    </html>
  );
}
```

### 2. Sử dụng trong cuộc hội thoại 1-1 (DEPRECATED)

```tsx
// Trong component chat conversation
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { StartVideoCallButtonSignalR } from '@/components/features/video-call/videocg1-1/StartVideoCallButtonSignalR';

function ChatHeader({ conversationId, receiverId, receiverName }) {
  return (
    <div className="flex items-center justify-between">
      <h2>{receiverName}</h2>
      <StartVideoCallButtonSignalR
        conversationId={conversationId}
        receiverId={receiverId}
        receiverName={receiverName}
        size="sm"
        variant="outline"
      />
    </div>
  );
}
```

### 3. Sử dụng Context trong component khác (DEPRECATED)

```tsx
// THIS IS DEPRECATED - USE THE NEW IMPLEMENTATION INSTEAD
import { useVideoCallContext } from '@/providers/VideoCallSignalRProvider';

function SomeComponent() {
  const { videoCallState, startCall, acceptCall, declineCall } = useVideoCallContext();
  
  // Kiểm tra trạng thái cuộc gọi
  if (videoCallState.isIncomingCall) {
    // Hiển thị thông báo cuộc gọi đến
  }
  
  // Bắt đầu cuộc gọi
  const handleStartCall = () => {
    startCall(conversationId, receiverId);
  };
}
```

## API Endpoints cần thiết (DEPRECATED)

Backend cần có các endpoints sau:

1. **POST** `/api/v1/conversations/start-video-call`
   - Body: `{ conversationId: number }`
   - Response: `{ success: boolean, data: { videoCallSessionId: string, livekitToken: string, livekitServerUrl: string } }`

2. **POST** `/api/v1/video-calls/{sessionId}/accept`
   - Response: `{ success: boolean, data: { livekitToken: string, livekitServerUrl: string } }`

3. **POST** `/api/v1/video-calls/{sessionId}/decline`
   - Response: `{ success: boolean }`

4. **POST** `/api/v1/video-calls/{sessionId}/leave`
   - Response: `{ success: boolean }`

## SignalR Hub Events (DEPRECATED)

### Client nhận được:
- `IncomingCall`: Cuộc gọi đến
- `CallAccepted`: Cuộc gọi được chấp nhận
- `CallDeclined`: Cuộc gọi bị từ chối
- `CallMissed`: Cuộc gọi nhỡ
- `CallEnded`: Cuộc gọi kết thúc

### Client gửi lên:
- Không cần gửi events lên hub, chỉ cần gọi API endpoints

## Luồng hoạt động (DEPRECATED)

1. **User A bấm nút gọi video**:
   - Gọi API `start-video-call`
   - Backend tạo session và gửi `IncomingCall` event cho User B
   - User A thấy `OutgoingCallModal` với trạng thái "ringing"

2. **User B nhận cuộc gọi**:
   - Nhận `IncomingCall` event
   - Hiển thị `IncomingCallModal`
   - Có thể Accept hoặc Decline

3. **User B chấp nhận**:
   - Gọi API `accept`
   - Backend gửi `CallAccepted` event cho User A
   - Cả hai user nhận LiveKit token để kết nối video

4. **User B từ chối**:
   - Gọi API `decline`
   - Backend gửi `CallDeclined` event cho User A
   - User A thấy trạng thái "declined"

5. **Timeout (45 giây)**:
   - Backend tự động gửi `CallMissed` event
   - User A thấy trạng thái "missed"

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://localhost:7007
```

## Dependencies

- `@microsoft/signalr`: SignalR client
- `sonner`: Toast notifications
- `lodash-es`: Throttle function
- `lucide-react`: Icons

## Notes

- Tất cả components đều sử dụng TypeScript
- Responsive design với Tailwind CSS
- Error handling và loading states
- Throttled notifications để tránh spam
- Auto-reconnect SignalR khi mất kết nối