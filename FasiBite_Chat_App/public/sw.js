// OneSignal Service Worker
// This file is required for OneSignal push notifications to work properly

// Import OneSignal SDK
importScripts("https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js");

// Service Worker Installation
self.addEventListener("install", (event) => {
  console.log("OneSignal Service Worker installing...");
  self.skipWaiting();
});

// Service Worker Activation
self.addEventListener("activate", (event) => {
  console.log("OneSignal Service Worker activated");
  event.waitUntil(self.clients.claim());
});

// Handle push events
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || "You have a new notification",
      icon: data.icon || "/favicon.ico",
      badge: data.badge || "/favicon.ico",
      tag: data.tag || "onesignal-notification",
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      data: data.data || {},
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || "FastBite Group",
        options
      )
    );
  }
});

// Handle notification click events
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action) {
    // Handle specific action clicks
    console.log("Action clicked:", event.action);
  } else {
    // Handle notification body click
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || "/")
    );
  }
});

// Handle background sync
self.addEventListener("sync", (event) => {
  console.log("Background sync event:", event);
  // Handle background sync if needed
});
