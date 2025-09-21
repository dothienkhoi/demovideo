# Video Call Testing Guide

## 🧪 Testing Video Display Fix

### **Prerequisites**
1. Open Developer Console (F12 → Console tab)
2. Start a 1-on-1 video call between two users
3. Monitor console logs for debugging information

### **Test Steps**

#### **1. Initial Connection Test**
- Start video call
- **Expected Logs:**
```
[VideoCallInterface1v1] Room disconnected: [reason]
[VideoCallAPI] leaveVideoCallSignalR called with sessionId: [sessionId]
[VideoCallAPI] startVideoCallSignalR called with conversationId: [id]
[VideoCallInterface1v1] Room disconnected: [reason]
[VideoCallInterface1v1] Local track published: video
[VideoManagerSimple] Local video publications: [...]
```

#### **2. Camera Toggle Test**
- Click camera toggle button
- **Expected Logs:**
```
[VideoManagerSimple] Local video publications: [array of publications]
[VideoManagerSimple] Local video state: { hasVideo: true, activeVideoTrack: true, trackSid: "..." }
[VideoManagerSimple] Attaching local video track to element
[VideoCallInterface1v1] Final video state: { hasLocalVideo: true, ... }
```

#### **3. Video Display Verification**
- **Camera ON**: Should see actual video feed (not gray screen)
- **Camera OFF**: Should see avatar placeholder with "Camera đã tắt"

### **Debug Information**

#### **Key Console Logs to Monitor:**

1. **Room Connection:**
   - `[VideoCallInterface1v1] Room disconnected: [reason]`
   - `[VideoCallInterface1v1] Local track published: video`

2. **Video Manager:**
   - `[VideoManagerSimple] Local video publications: [...]`
   - `[VideoManagerSimple] Local video state: {...}`
   - `[VideoManagerSimple] Attaching local video track to element`

3. **Final State:**
   - `[VideoCallInterface1v1] Final video state: {...}`

#### **Expected Video Publications Structure:**
```javascript
{
  track: true,           // Video track exists
  isSubscribed: true,    // Track is subscribed
  isMuted: false,        // Track is not muted
  trackSid: "TR_..."     // Track session ID
}
```

### **Troubleshooting**

#### **If Video Still Shows Gray Screen:**

1. **Check Console Logs:**
   - Look for `[VideoManagerSimple] Local video state: { hasVideo: false }`
   - Check if `activeVideoTrack` is `null`

2. **Check Track Publications:**
   - Verify `track: true` in publications array
   - Verify `isSubscribed: true`

3. **Check Video Element:**
   - Verify video element has `style.display = 'block'`
   - Check if video element has `srcObject` attached

#### **If Room Keeps Disconnecting:**

1. **Check Disconnect Reason:**
   - Look for `[VideoCallInterface1v1] Room disconnected: [reason]`
   - If reason is `CLIENT_INITIATED`, it's expected

2. **Check Media Permissions:**
   - Look for `[VideoCallInterface1v1] Media permissions not granted: [error]`
   - Grant camera/microphone permissions if prompted

### **Success Criteria**

✅ **Video Display Working:**
- Camera ON → Video feed visible (not gray screen)
- Camera OFF → Avatar placeholder visible
- No room disconnection when toggling camera
- Console logs show successful track attachment

✅ **Console Logs Clean:**
- No error messages in console
- Track attachment logs present
- Video state updates correctly

### **Performance Notes**

- **First Connection**: May take 2-3 seconds to establish
- **Camera Toggle**: Should be instant (< 1 second)
- **Video Quality**: Should be smooth without flickering

### **Browser Compatibility**

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: May require additional permissions

### **Next Steps After Testing**

1. **If Working**: Remove debug console logs
2. **If Issues**: Check specific error messages and report
3. **Performance**: Monitor for any lag or quality issues

---

## 🔧 Technical Details

### **Files Modified:**
- `VideoCallInterface1v1.tsx` - Main video call interface
- `VideoManagerSimple.tsx` - Video track management
- Room options and connection handling

### **Key Changes:**
- Removed `videoEnabled: false` from room options
- Added media permissions request before connection
- Improved video track detection logic
- Added comprehensive debug logging
- Enhanced error handling for track attachment

### **LiveKit Integration:**
- Uses `useLocalParticipant` and `useRemoteParticipant` hooks
- Manual video track attachment to HTML video elements
- Event-driven video state management
