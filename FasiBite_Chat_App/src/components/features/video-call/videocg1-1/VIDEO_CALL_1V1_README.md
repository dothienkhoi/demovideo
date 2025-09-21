# Video Call Interface 1v1

## Tổng quan

Component `VideoCallInterface1v1` cung cấp giao diện video call 1-1 đẹp mắt và tích hợp LiveKit cho cuộc gọi video giữa hai người dùng.

## Tính năng

### 🎥 Video & Audio
- **Camera**: Bật/tắt camera với preview local video
- **Microphone**: Bật/tắt microphone với visual feedback
- **Screen Sharing**: Chia sẻ màn hình với toggle button
- **Remote Controls**: Hiển thị trạng thái camera/mic của người gọi

### 🎨 Giao diện
- **Fullscreen Mode**: Giao diện toàn màn hình với background đen
- **Picture-in-Picture**: Local video hiển thị ở góc phải trên
- **Minimize Mode**: Có thể thu nhỏ thành floating window
- **Responsive Design**: Tự động adapt với kích thước màn hình

### 🔧 Controls
- **Call Duration**: Hiển thị thời gian cuộc gọi
- **Connection Status**: Badge hiển thị trạng thái kết nối
- **Settings Panel**: Panel cài đặt có thể toggle
- **End Call**: Button kết thúc cuộc gọi

## Cách sử dụng

### 1. Flow cuộc gọi

```typescript
// 1. A gọi B
await startCall(conversationId, partnerId, partnerName, partnerAvatar);

// 2. B nhận cuộc gọi và chấp nhận
await acceptCall(sessionId);

// 3. Giao diện VideoCallInterface1v1 tự động hiển thị
// khi callStatus === 'connected' và isActive === true
```

### 2. Component Props

```typescript
interface VideoCallInterface1v1Props {
    sessionId: string;                    // ID session cuộc gọi
    conversationId: number;               // ID cuộc hội thoại
    partnerId: string;                    // ID người gọi/nhận
    partnerName: string;                  // Tên người gọi/nhận
    partnerAvatar?: string;               // Avatar người gọi/nhận
    currentUserId: string;                // ID người dùng hiện tại
    currentUserName: string;              // Tên người dùng hiện tại
    currentUserAvatar?: string;           // Avatar người dùng hiện tại
    livekitToken: string;                 // LiveKit token
    livekitServerUrl: string;             // LiveKit server URL
    onEndCall: () => void;                // Callback kết thúc cuộc gọi
    onMinimize?: () => void;              // Callback thu nhỏ
    className?: string;                   // CSS class tùy chỉnh
}
```

### 3. Tích hợp với VideoCallProvider

Component được tự động hiển thị thông qua `VideoCallProvider` khi:
- `videoCallState.isActive === true`
- `videoCallState.callStatus === 'connected'`
- Có thông tin `callerProfile`

## Tính năng kỹ thuật

### LiveKit Integration
- **Room Connection**: Tự động kết nối đến LiveKit room
- **Track Management**: Quản lý video/audio tracks
- **Event Handling**: Xử lý các sự kiện LiveKit
- **Reconnection**: Tự động reconnect khi mất kết nối

### Media Controls
- **Camera Toggle**: `room.localParticipant.setCameraEnabled()`
- **Microphone Toggle**: `room.localParticipant.setMicrophoneEnabled()`
- **Screen Share**: `room.localParticipant.setScreenShareEnabled()`

### UI States
- **Connecting**: Hiển thị khi đang kết nối
- **Connected**: Giao diện đầy đủ khi đã kết nối
- **Error**: Hiển thị lỗi kết nối với retry button
- **Minimized**: Floating window khi thu nhỏ

## Styling

### CSS Classes
- **Background**: `bg-black` cho fullscreen
- **Video Container**: `object-cover` cho video fit
- **Controls**: `bg-black/50 backdrop-blur-sm` cho controls bar
- **Buttons**: Rounded buttons với hover effects

### Responsive
- **Mobile**: Controls stack vertically
- **Desktop**: Controls horizontal layout
- **Tablet**: Adaptive layout

## Error Handling

### Connection Errors
- Hiển thị overlay với error message
- Retry button để thử kết nối lại
- Toast notifications cho user feedback

### Media Errors
- Fallback UI khi camera/mic không khả dụng
- Avatar display khi remote video tắt
- Visual indicators cho mute states

## Performance

### Optimization
- **Video Simulcast**: Multiple quality layers
- **Adaptive Streaming**: Tự động adjust quality
- **Memory Management**: Proper cleanup on unmount
- **Event Throttling**: Optimized event handling

### Browser Support
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support với iOS compatibility
- **Mobile**: Responsive design

## Troubleshooting

### Common Issues
1. **Camera không hoạt động**: Check permissions
2. **Audio không có**: Check microphone permissions
3. **Kết nối thất bại**: Check LiveKit token/server
4. **Video lag**: Check network connection

### Debug
- Console logs cho connection events
- Visual indicators cho connection status
- Error messages trong UI

## Future Enhancements

### Planned Features
- **Recording**: Ghi lại cuộc gọi
- **Chat**: Text chat trong cuộc gọi
- **Filters**: Video filters/effects
- **Background**: Virtual backgrounds
- **Multi-device**: Switch between devices

### Technical Improvements
- **WebRTC Stats**: Connection quality monitoring
- **Bandwidth Adaptation**: Dynamic quality adjustment
- **E2E Encryption**: End-to-end encryption
- **P2P Fallback**: Direct peer-to-peer connection
