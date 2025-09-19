# Video Call Status Check Fix

## Issue Description
The video call UI was incorrectly showing "Cuộc gọi video đã kết thúc" (Video call has ended) even when the call was still active in LiveKit. This occurred when:

1. The backend API for checking call status (`/api/v1/video-calls/{sessionId}/status`) was slow, unavailable, or returned errors
2. Network issues caused timeouts when checking call status
3. The UI was too aggressive in marking calls as "ended" on any API failure

## Root Cause
The original logic in `VideoCallRoom.tsx` treated any API failure (timeout, network error, server error) as "call ended":

```typescript
// OLD LOGIC - PROBLEMATIC
} catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
        // Only 404 was treated as "call active"
        setCallStatus({ isActive: true, ... });
    } else {
        // ALL other errors were treated as "call ended" - THIS WAS THE PROBLEM
        setCallStatus({ isActive: false, ... });
    }
}
```

## Solution Implemented

### 1. **Defensive Call Status Checking**
- Changed default behavior: assume call is active on API errors
- Only mark call as ended when explicitly confirmed by server
- Added better error handling for different failure scenarios

### 2. **Improved LiveKit Event Handling**
- Added proper disconnect reason handling using `DisconnectReason` enum
- Only auto-end calls for server-initiated disconnections
- Added reconnection event handling

### 3. **Periodic Status Monitoring**
- Added 30-second periodic checks to detect server-side call termination
- Background monitoring doesn't interfere with active calls
- Graceful degradation when status API is unavailable

### 4. **Enhanced Connection Logic**
- Only connect to LiveKit when call status is definitively active
- Better handling of edge cases during status verification

## Code Changes

### Key Files Modified:
- `src/components/features/video-call/romvideo/VideoCallRoom.tsx`

### Specific Improvements:

1. **Robust Error Handling:**
```typescript
// NEW LOGIC - DEFENSIVE
} catch (error) {
    if (error.message.includes('404') || error.message.includes('Not Found')) {
        setCallStatus({ isActive: true }); // API not available, assume active
    } else if (error.message === 'Timeout') {
        setCallStatus({ isActive: true }); // Timeout, assume still active
    } else {
        setCallStatus({ isActive: true }); // Other errors, assume still active
    }
}
```

2. **LiveKit Disconnect Handling:**
```typescript
const handleDisconnected = (reason?: DisconnectReason) => {
    // Only auto-end for server-initiated disconnections
    if (reason === DisconnectReason.SERVER_SHUTDOWN || reason === DisconnectReason.ROOM_DELETED) {
        setCallStatus({ isActive: false, message: "Cuộc gọi đã được kết thúc bởi server" });
    }
};
```

3. **Periodic Monitoring:**
```typescript
// Check every 30 seconds for server-side termination
setInterval(async () => {
    try {
        const status = await checkVideoCallStatus(roomId);
        if (!status.isActive) {
            setCallStatus({ isActive: false, message: status.message });
        }
    } catch (error) {
        // Ignore API errors in periodic checks
    }
}, 30000);
```

## Benefits

1. **Improved Reliability:** Calls continue working even when status API is temporarily unavailable
2. **Better User Experience:** No false "call ended" messages due to network hiccups
3. **Graceful Degradation:** System works even with backend API issues
4. **Accurate Status Detection:** Still detects legitimate call terminations
5. **Reduced False Positives:** Eliminates spurious "call ended" screens

## Testing Scenarios

The fix handles these scenarios correctly:

✅ **API Timeout:** Call continues, no false "ended" message  
✅ **Network Issues:** Call remains active during temporary connectivity problems  
✅ **Server Errors:** Call not terminated due to temporary backend issues  
✅ **Legitimate End:** Proper detection when call is actually ended by server  
✅ **User Leaves:** Correct handling when user manually leaves call  
✅ **Admin Ends Call:** Proper termination when admin ends call for all  

## Future Considerations

- Consider adding visual indicators for "status unknown" states
- Implement exponential backoff for status check retries
- Add user notifications for temporary API issues
- Consider WebSocket-based status updates for real-time accuracy