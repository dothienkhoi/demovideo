"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export const OneSignalInitializer = () => {
  useEffect(() => {
    const initializeOneSignal = async () => {
      if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
        console.error("OneSignal App ID is not configured.");
        return;
      }

      try {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerParam: { scope: "/" },
          serviceWorkerPath: "/OneSignalSDKWorker.js",
          notificationClickHandlerMatch: "origin",
          notificationClickHandlerAction: "navigate",
          // Reduce preload warnings by optimizing resource loading
          autoResubscribe: true,
          autoRegister: true,
          // Disable automatic preloading of resources
          preload: false,
        });
        console.log("OneSignal initialized successfully");
      } catch (error) {
        console.error("Failed to initialize OneSignal:", error);
      }
    };

    // Add a small delay to ensure the service worker is ready
    const timer = setTimeout(initializeOneSignal, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null; // This component does not render any UI
};
