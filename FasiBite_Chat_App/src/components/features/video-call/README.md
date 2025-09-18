# Video Call Components - LiveKit Integration

## 🎯 Overview
This directory contains the video call components that are **fully integrated with LiveKit** for real-time video and audio communication. **NO custom camera/mic implementation is used.**

## 📁 File Structure

### Core Components
- **`LiveKitVideoConference.tsx`** - Main LiveKit video conference component
- **`VideoCallSetupModal.tsx`** - Modal for setting up camera/mic before joining call
- **`VideoPreview.tsx`** - Wrapper for LiveKitPreview component
- **`LiveKitPreview.tsx`** - LiveKit-based camera/mic preview for settings
- **`AudioSettings.tsx`** - Audio device selection and settings
- **`VideoCallMinimized.tsx`** - Minimized video call interface

### Utilities
- **`index.ts`** - Export all components

## 🔧 LiveKit Integration

### Backend Integration
- Uses `joinVideoCall()` API to get LiveKit token from backend
- Connects to LiveKit server with real credentials
- Handles disconnect and cleanup properly

### Features
- ✅ Real-time video/audio communication (LiveKit only)
- ✅ Camera and microphone controls (LiveKit only)
- ✅ LiveKit-based camera/mic preview in settings
- ✅ Device selection (camera, mic, speaker)
- ✅ Error handling and connection status
- ✅ Responsive UI with proper styling

## 🗑️ Cleaned Up Files

### Deleted Components (No longer needed)
- ~~`LiveKitTestComponent.tsx`~~ - Replaced with `LiveKitVideoConference.tsx`
- ~~`LiveKitVideoCallRoom.tsx`~~ - Replaced with `LiveKitVideoConference.tsx`
- ~~`VideoCallRoom.tsx`~~ - Old component not using LiveKit
- ~~`VideoElement.tsx`~~ - Replaced with native video element
- ~~`streamUtils.ts`~~ - LiveKit handles stream management
- ~~`CameraPlaceholder.tsx`~~ - No longer needed

### Why These Were Removed
- **LiveKitTestComponent**: Was a test component, replaced with production-ready component
- **LiveKitVideoCallRoom**: Had duplicate functionality, merged into `LiveKitVideoConference`
- **VideoCallRoom**: Used old camera/mic implementation, not LiveKit
- **VideoElement**: Custom video element replaced with native HTML5 video
- **streamUtils**: LiveKit SDK handles all stream management internally
- **CameraPlaceholder**: No longer needed with simplified VideoPreview

## 🚀 Usage

### Starting a Video Call
1. User clicks video call button in group chat
2. `VideoCallSetupModal` opens for device setup
3. User configures camera/mic settings
4. Clicks "Tham gia ngay" (Join Now)
5. `LiveKitVideoConference` component loads
6. Connects to LiveKit server with backend token
7. **LiveKit handles ALL video/audio communication**

### Component Flow
```
GroupChatHeader (Video Button)
    ↓
VideoCallSetupModal (Device Setup)
    ↓
LiveKitVideoConference (LiveKit Integration)
    ↓
Backend API (Token Generation)
    ↓
LiveKit Server (Real-time Communication)
```

## 🔗 Dependencies

### LiveKit Packages
- `@livekit/components-react` - React components
- `@livekit/components-styles` - Styling
- `livekit-client` - Client SDK
- `@livekit/krisp-noise-filter` - Noise cancellation
- `@livekit/track-processors` - Video/audio processing

### Backend Integration
- `joinVideoCall()` - Get LiveKit token
- `leaveVideoCall()` - Leave call
- `startVideoCall()` - Create new session

## 📝 Notes

- **ALL video/audio functionality is handled by LiveKit**
- **NO custom camera/mic implementation**
- **NO MediaStream API usage for video/audio**
- Backend provides LiveKit tokens for authentication
- Components are optimized and cleaned up
- No duplicate or test files remain
- Device enumeration only (no media access until LiveKit)