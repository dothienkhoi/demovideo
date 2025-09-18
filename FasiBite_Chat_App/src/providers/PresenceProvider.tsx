"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as signalR from "@microsoft/signalr";
import { useAuthStore } from "@/store/authStore";
import { usePresenceStore } from "@/store/presenceStore";
import { UserStatusChangedDto } from "@/types/customer/realtime";
import { UserPresenceStatus } from "@/types/customer/models";

interface PresenceContextType {
  changeMyStatus: (status: UserPresenceStatus) => Promise<void>;
}

const PresenceContext = createContext<PresenceContextType | undefined>(
  undefined
);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const accessToken = useAuthStore((state) => state.accessToken);
  const { updateUserStatus } = usePresenceStore();

  useEffect(() => {
    if (accessToken) {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/presence`, {
          accessTokenFactory: () => accessToken,
        })
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);

      newConnection
        .start()
        .then(() => {
          console.log("Presence Hub connected successfully");
          // Set default status to Online when user logs in
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            updateUserStatus(currentUser.id, UserPresenceStatus.Online);
            // Also notify the server about the online status
            newConnection
              .invoke("ChangeMyStatus", UserPresenceStatus.Online)
              .catch(console.error);
          }
        })
        .catch((err) => {
          console.error("Presence Hub Connection Error: ", err);
        });

      newConnection.on("UserStatusChanged", (data: UserStatusChangedDto) => {
        console.log("✅ Received UserStatusChanged event:", data);
        updateUserStatus(data.userId, data.presenceStatus);
        console.log(
          "✅ Status updated in store for user:",
          data.userId,
          "to:",
          data.presenceStatus
        );
      });

      // Add debugging for all SignalR events
      newConnection.on("ReceiveMessage", (message) => {
        console.log("📨 Received message:", message);
      });

      // Add connection state change logging
      newConnection.onclose((error) => {
        console.log("Presence Hub connection closed:", error);
      });

      newConnection.onreconnecting((error) => {
        console.log("Presence Hub reconnecting:", error);
      });

      newConnection.onreconnected((connectionId) => {
        console.log("Presence Hub reconnected:", connectionId);
      });

      return () => {
        // Set user to offline when disconnecting
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          updateUserStatus(currentUser.id, UserPresenceStatus.Offline);
        }

        // Only stop if connection is not already stopped
        if (newConnection.state !== signalR.HubConnectionState.Disconnected) {
          newConnection.stop().catch((error) => {
            console.warn("Error stopping presence connection:", error);
          });
        }
      };
    }
  }, [accessToken, updateUserStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        connection &&
        connection.state !== signalR.HubConnectionState.Disconnected
      ) {
        connection.stop().catch((error) => {
          console.warn("Error stopping presence connection on unmount:", error);
        });
      }
    };
  }, [connection]);

  const changeMyStatus = async (status: UserPresenceStatus) => {
    if (!connection) {
      console.warn("Presence connection not initialized");
      return;
    }

    if (connection.state !== signalR.HubConnectionState.Connected) {
      console.warn(
        `Presence connection not connected. Current state: ${connection.state}`
      );
      return;
    }

    try {
      console.log("Attempting to change status to:", status);
      await connection.invoke("ChangeMyStatus", status);
      console.log("Status changed successfully");
    } catch (err) {
      console.error("Failed to invoke ChangeMyStatus:", err);
      console.error("Error details:", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        connectionState: connection.state,
      });
    }
  };

  return (
    <PresenceContext.Provider value={{ changeMyStatus }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error("usePresence must be used within a PresenceProvider");
  }
  return context;
};
