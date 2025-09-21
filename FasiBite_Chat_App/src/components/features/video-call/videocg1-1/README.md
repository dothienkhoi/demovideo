# Video Call Components (SignalR Only)

## Tổng quan

Thư mục `videocg1-1` đã được cập nhật để **chỉ sử dụng SignalR** cho phần thời gian thực, **đã loại bỏ hoàn toàn phần giao diện LiveKit**.

## Các file còn lại

### ✅ **Các component được giữ lại:**

1. **DirectVideoCallManager.tsx**
   - Quản lý việc bắt đầu cuộc gọi video
   - Sử dụng SignalR để giao tiếp với backend
   - Hiển thị nút gọi video trong chat header

2. **VideoCallModal.tsx**
   - Modal hiển thị cuộc gọi đến/đi
   - Xử lý accept/decline/end call
   - Sử dụng SignalR context để quản lý trạng thái

3. **ChatHeaderWithVideoCall.tsx**
   - Header chat với nút gọi video
   - Tích hợp DirectVideoCallManager
   - Hiển thị thông tin người dùng và trạng thái

4. **index.ts**
   - Export các component cần thiết
   - Đã loại bỏ export của LiveKit components

## Các file đã bị xóa

### ❌ **Các file LiveKit UI đã bị xóa:**

1. **VideoCallInterface.tsx** - Giao diện LiveKit chính
2. **VideoCallInterfaceWrapper.tsx** - Wrapper cho LiveKit interface
3. **ConnectionSyncIndicator.tsx** - Indicator trạng thái kết nối LiveKit
4. **test-connection.js** - Script test LiveKit connection
5. **CONNECTION_STABILITY_FIX.md** - Tài liệu sửa lỗi LiveKit
6. **SYNC_IMPROVEMENTS.md** - Tài liệu cải tiến đồng bộ LiveKit
7. **VIDEO_CALL_IMPROVEMENTS.md** - Tài liệu cải tiến LiveKit

## Chức năng còn lại

### ✅ **SignalR Functionality (Giữ nguyên):**

1. **Call Management:**
   - Bắt đầu cuộc gọi video
   - Chấp nhận/từ chối cuộc gọi
   - Kết thúc cuộc gọi
   - Quản lý trạng thái cuộc gọi

2. **Real-time Communication:**
   - Kết nối SignalR Hub
   - Nhận thông báo cuộc gọi đến
   - Gửi tín hiệu accept/decline/end
   - Auto-reconnect khi mất kết nối

3. **UI Components:**
   - Modal cuộc gọi với thông tin người gọi
   - Nút gọi video trong chat header
   - Hiển thị trạng thái cuộc gọi
   - Timer cuộc gọi

## Cách sử dụng

### 1. **Trong Chat Header:**
```tsx
import { ChatHeaderWithVideoCall } from "@/components/features/video-call/videocg1-1";

<ChatHeaderWithVideoCall
    conversationId={conversationId}
    receiverId={receiverId}
    receiverName={receiverName}
    receiverAvatar={receiverAvatar}
    onBack={() => router.back()}
/>
```

### 2. **Trong VideoCallProvider:**
```tsx
// VideoCallProvider đã được cập nhật để không render LiveKit UI
// Chỉ cung cấp SignalR context cho các component
```

### 3. **Sử dụng Context:**
```tsx
import { useVideoCallContext } from "@/providers/VideoCallProvider";

const { videoCallState, startCall, acceptCall, declineCall, endCall } = useVideoCallContext();
```

## Lưu ý quan trọng

### ⚠️ **Những gì đã thay đổi:**

1. **Không còn LiveKit UI** - Chỉ còn SignalR functionality
2. **VideoCallProvider** không còn render VideoCallInterfaceWrapper
3. **Export trong index.ts** đã được cập nhật
4. **Tất cả file LiveKit** đã bị xóa

### ✅ **Những gì vẫn hoạt động:**

1. **SignalR connection** - Kết nối thời gian thực
2. **Call notifications** - Thông báo cuộc gọi
3. **Call management** - Quản lý cuộc gọi
4. **UI components** - Modal và buttons

## Migration Notes

Nếu bạn cần sử dụng LiveKit UI trong tương lai:

1. **Tạo thư mục mới** cho LiveKit components
2. **Không sử dụng lại** các file đã bị xóa
3. **Implement từ đầu** với architecture mới
4. **Tách biệt** SignalR và LiveKit logic

## Testing

### ✅ **Test các chức năng còn lại:**

1. **SignalR Connection:**
   - Kết nối/ngắt kết nối
   - Auto-reconnect
   - Error handling

2. **Call Flow:**
   - Start call
   - Accept/decline call
   - End call
   - Call notifications

3. **UI Components:**
   - Modal hiển thị đúng
   - Buttons hoạt động
   - Timer chạy đúng
   - Avatar và thông tin hiển thị

## Support

Nếu gặp vấn đề sau khi xóa LiveKit UI:

1. **Kiểm tra imports** - Đảm bảo không import file đã bị xóa
2. **Check VideoCallProvider** - Đảm bảo không còn reference đến LiveKit
3. **Verify exports** - Kiểm tra index.ts exports đúng
4. **Test SignalR** - Đảm bảo SignalR vẫn hoạt động
