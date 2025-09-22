# Video Call 1-1 Components

## 🎯 Overview
Giao diện UI/UX cho cuộc gọi video 1-1 tích hợp LiveKit với tính năng phóng to/thu nhỏ và giao diện đẹp mắt.

## 📁 Components

### Core Components
- **`VideoCallInterface1v1.tsx`** - Giao diện chính cho cuộc gọi video 1-1
- **`VideoCallButton.tsx`** - Nút gọi video và audio
- **`VideoCallManager.tsx`** - Quản lý trạng thái cuộc gọi toàn cục
- **`LiveKitVideoCall1v1.tsx`** - Component LiveKit tối ưu cho 1-1

## 🚀 Features

### ✅ Đã triển khai
- **Giao diện cuộc gọi đến**: Modal đẹp với avatar, tên người gọi, nút chấp nhận/từ chối
- **Giao diện cuộc gọi đi**: Hiển thị trạng thái đang gọi với nút kết thúc
- **Giao diện cuộc gọi đang diễn ra**: Video conference với LiveKit
- **Tính năng phóng to/thu nhỏ**: Giao diện có thể thu nhỏ thành cửa sổ nhỏ
- **Điều khiển cuộc gọi**: Bật/tắt camera, microphone, kết thúc cuộc gọi
- **Hiển thị thời gian cuộc gọi**: Đếm thời gian cuộc gọi real-time
- **Tích hợp SignalR**: Sử dụng VideoCallProvider có sẵn
- **Responsive design**: Hoạt động tốt trên mobile và desktop

### 🎨 UI/UX Features
- **Glassmorphism effect**: Giao diện trong suốt với backdrop blur
- **Smooth animations**: Hiệu ứng chuyển động mượt mà
- **Dark/Light mode**: Hỗ trợ chế độ tối/sáng
- **Modern design**: Thiết kế hiện đại với gradient và shadow
- **Intuitive controls**: Điều khiển trực quan và dễ sử dụng

## 🔧 Integration

### 1. VideoCallProvider
Đã tích hợp sẵn với `VideoCallProvider` để xử lý:
- Kết nối SignalR
- Nhận cuộc gọi đến
- Gửi cuộc gọi đi
- Quản lý trạng thái cuộc gọi

### 2. API Endpoints
Sử dụng các API endpoints mới:
- **POST** `/api/v1/conversations/{conversationId}/calls` - Bắt đầu cuộc gọi video
- **POST** `/api/v1/video-calls/{sessionId}/accept` - Chấp nhận cuộc gọi 1-1
- **POST** `/api/v1/video-calls/{sessionId}/decline` - Từ chối cuộc gọi
- **POST** `/api/v1/video-calls/{sessionId}/leave` - Rời khỏi cuộc gọi

### 3. LiveKit Integration
Sử dụng LiveKit SDK có sẵn:
- Kết nối video/audio real-time
- Điều khiển camera/microphone
- Chất lượng video tối ưu

### 4. Layout Integration
Đã tích hợp vào `CustomerMainLayout`:
```tsx
<VideoCallProvider>
  {/* App content */}
  <VideoCallManager />
</VideoCallProvider>
```

## 📱 Usage

### Trong DirectChatHeader
```tsx
import { VideoCallButton, AudioCallButton } from "@/components/features/video-call/one-to-one";

// Trong component
<VideoCallButton
  onClick={handleVideoCall}
  isCalling={isCalling}
/>
```

### Sử dụng VideoCallManager
```tsx
import { VideoCallManager } from "@/components/features/video-call/one-to-one";

// Trong layout
<VideoCallManager />
```

## 🎮 User Flow

### 1. Bắt đầu cuộc gọi
1. User A ấn nút video call trong cuộc hội thoại
2. VideoCallProvider gửi signal qua SignalR
3. User B nhận được cuộc gọi đến

### 2. Nhận cuộc gọi
1. User B thấy modal cuộc gọi đến
2. Có thể chấp nhận hoặc từ chối
3. Nếu chấp nhận, cả hai được đưa vào video call

### 3. Cuộc gọi đang diễn ra
1. Giao diện video call hiển thị
2. Có thể phóng to/thu nhỏ
3. Điều khiển camera/microphone
4. Hiển thị thời gian cuộc gọi

### 4. Kết thúc cuộc gọi
1. Một trong hai người ấn nút kết thúc
2. Cuộc gọi được đóng
3. Quay về giao diện chat

## 🎨 Styling

### CSS Classes
- `fixed inset-0 z-50` - Full screen overlay
- `bg-black/50 backdrop-blur-sm` - Backdrop với blur
- `rounded-2xl shadow-2xl` - Bo góc và shadow
- `bg-gradient-to-br` - Gradient backgrounds
- `animate-pulse` - Hiệu ứng pulse cho status

### Responsive Design
- Mobile: Full screen modal
- Desktop: Centered modal với max width
- Minimized: Small window ở góc màn hình

## 🔧 Configuration

### VideoCallProvider Settings
```tsx
const { startCall, acceptCall, declineCall, endCall } = useVideoCallContext();
```

### LiveKit Settings
```tsx
const roomOptions = {
  publishDefaults: {
    videoSimulcastLayers: [VideoPresets.h720, VideoPresets.h540],
    red: true,
  },
  adaptiveStream: { pixelDensity: 'screen' },
  dynacast: true,
};
```

## 📁 Files đã tạo:

```
src/components/features/video-call/one-to-one/
├── VideoCallInterface1v1.tsx    # Giao diện chính
├── VideoCallButton.tsx          # Nút gọi video/audio  
├── VideoCallManager.tsx         # Quản lý trạng thái
├── LiveKitVideoCall1v1.tsx     # LiveKit integration
├── VideoCallDemo.tsx           # Component demo
├── index.ts                    # Exports
└── README.md                   # Hướng dẫn sử dụng
```

## 🔧 Files đã cập nhật:
- `src/components/features/chat/DirectChatHeader.tsx` - Thêm nút gọi video
- `src/app/(customer)/(main)/layout.tsx` - Tích hợp VideoCallManager
- `src/lib/api/customer/video-call-api.ts` - API endpoints đã được cập nhật

## 📝 Notes

- **Tích hợp hoàn toàn** với hệ thống có sẵn
- **Không tạo camera riêng** - sử dụng LiveKit
- **Logic xử lý real-time** qua SignalR
- **Giao diện responsive** và đẹp mắt
- **Code tách biệt rõ ràng** và dễ maintain
- **API endpoints mới** đã được tích hợp đầy đủ
- **Sẵn sàng sử dụng** với dữ liệu thật trong cuộc hội thoại
