# OneSignal Push Notification Implementation

This document describes the implementation of OneSignal push notification subscription for the FastBite Group application.

## Overview

The implementation enables users to subscribe to push notifications, allowing the backend to send notifications even when users are not actively using the application.

## Components

### 1. OneSignalInitializer (`src/components/shared/OneSignalInitializer.tsx`)

- Initializes the OneSignal SDK with the app ID from environment variables
- Runs once when the application starts
- Added to the root layout for global initialization

### 2. useOneSignalSubscription Hook (`src/hooks/useOneSignalSubscription.ts`)

- Manages the entire subscription workflow
- Only runs for authenticated users
- Uses localStorage to prevent re-prompting subscribed users
- Handles the subscription process and sends PlayerId to backend

### 3. API Integration (`src/lib/api/customer/notifications.ts`)

- Added `subscribeToPushNotifications` function
- Sends PlayerId to `/notifications/subscribe` endpoint

## Setup Instructions

### 1. Install Dependencies

```bash
npm install react-onesignal
```

### 2. Environment Configuration

Create or update `.env.local`:

```env
NEXT_PUBLIC_ONESIGNAL_APP_ID=your-app-id-goes-here
```

### 3. Backend Endpoint

Ensure your backend has the following endpoint:

```
POST /notifications/subscribe
Body: { "playerId": "string" }
```

## How It Works

1. **Initialization**: OneSignal SDK is initialized when the app starts
2. **Authentication Check**: Hook only runs for authenticated users
3. **Subscription Check**: Checks localStorage to avoid re-prompting
4. **Permission Prompt**: Shows browser permission dialog via OneSignal
5. **PlayerId Retrieval**: Gets unique PlayerId from OneSignal
6. **Backend Registration**: Sends PlayerId to backend for storage
7. **State Management**: Updates local state and localStorage

## Features

- **Smart Prompting**: Only prompts users who haven't subscribed
- **Error Handling**: Comprehensive error handling with user feedback
- **Persistent State**: Uses localStorage to remember subscription status
- **Authentication Aware**: Only works for authenticated users
- **Role-Based**: Only runs for Customer/VIP users (via layout integration)

## Usage

The hook is automatically integrated into the customer layout and will:

- Prompt users for notification permission after 3 seconds
- Handle the subscription process automatically
- Send the PlayerId to the backend
- Remember the subscription status

## Troubleshooting

1. **OneSignal Not Initializing**: Check if `NEXT_PUBLIC_ONESIGNAL_APP_ID` is set
2. **Permission Not Prompting**: Ensure user is authenticated and hasn't subscribed before
3. **Backend Errors**: Check if `/notifications/subscribe` endpoint is working
4. **PlayerId Issues**: Verify OneSignal SDK is properly initialized

## Security Notes

- PlayerId is only sent to authenticated users
- Subscription status is stored locally to prevent repeated prompts
- Backend should validate the PlayerId and user authentication
