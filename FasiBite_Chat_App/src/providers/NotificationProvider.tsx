"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
} from "@microsoft/signalr";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { throttle } from "lodash-es";

import { useAuthStore } from "@/store/authStore";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api/customer/notifications";
import { NotificationDTO } from "@/types/customer/notification.types";
import { PagedResult } from "@/types/api.types";
import { handleApiError } from "@/lib/utils/errorUtils";

// ===============================
// NOTIFICATION CONTEXT TYPES
// ===============================

interface NotificationContextType {
  notifications: NotificationDTO[];
  unreadCount: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  isMarkingAsRead: boolean;
  isMarkingAllAsRead: boolean;
}

// ===============================
// NOTIFICATION PROVIDER
// ===============================

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [connection, setConnection] = useState<HubConnection | null>(null);

  // ===============================
  // TANSTACK QUERY SETUP
  // ===============================

  // Infinite query for notifications
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: getMyNotifications,
      getNextPageParam: (lastPage) => {
        if (lastPage.pageNumber < lastPage.totalPages) {
          return lastPage.pageNumber + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
      enabled: isAuthenticated && !!accessToken,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });

  // Mark single notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, notificationId) => {
      // Optimistically update the notification in the cache
      queryClient.setQueryData<InfiniteData<PagedResult<NotificationDTO>>>(
        ["notifications"],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((notification) =>
                notification.id === notificationId
                  ? { ...notification, isRead: true }
                  : notification
              ),
            })),
          };
        }
      );

      // Update unread count optimistically
      setUnreadCount((prev) => Math.max(0, prev - 1));

      toast.success("Đã đánh dấu thông báo là đã đọc");
    },
    onError: (error) => {
      handleApiError(error, "Không thể đánh dấu thông báo");
    },
  });

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Optimistically update all notifications in the cache
      queryClient.setQueryData<InfiniteData<PagedResult<NotificationDTO>>>(
        ["notifications"],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((notification) => ({
                ...notification,
                isRead: true,
              })),
            })),
          };
        }
      );

      // Reset unread count
      setUnreadCount(0);

      toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
    },
    onError: (error) => {
      handleApiError(error, "Không thể đánh dấu tất cả thông báo");
    },
  });

  // ===============================
  // THROTTLED TOAST FUNCTIONS
  // ===============================

  const showThrottledNotification = throttle(
    (title: string, message: string, duration?: number) => {
      toast.info(title, {
        description: message,
        duration: duration || 5000,
      });
    },
    2000,
    { leading: true, trailing: false }
  );

  const showThrottledConnectionStatus = throttle(
    (message: string, description?: string) => {
      toast.info(message, {
        description: description,
        duration: 3000,
      });
    },
    10000,
    { leading: true, trailing: false }
  );

  const showThrottledSuccess = throttle(
    (message: string, description?: string) => {
      toast.success(message, {
        description: description,
        duration: 3000,
      });
    },
    10000,
    { leading: true, trailing: false }
  );

  // ===============================
  // SIGNALR CONNECTION SETUP
  // ===============================

  useEffect(() => {
    // Only attempt connection for authenticated users with Customer or VIP roles
    if (
      !isAuthenticated ||
      !accessToken ||
      !user?.roles?.some((role) => role === "Customer" || role === "VIP")
    ) {
      console.log(
        "[NotificationSignalR] Skipping connection - user not authenticated or doesn't have Customer/VIP role:",
        {
          isAuthenticated,
          hasToken: !!accessToken,
          userRoles: user?.roles,
          hasCustomerOrVipRole: user?.roles?.some(
            (role) => role === "Customer" || role === "VIP"
          ),
        }
      );
      return;
    }

    // Get API URL from environment variables with fallback
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://localhost:7007";
    const baseUrl = apiBaseUrl.endsWith("/")
      ? apiBaseUrl.slice(0, -1)
      : apiBaseUrl;
    const hubUrl = `${baseUrl}/hubs/notifications`;

    console.log(`[NotificationSignalR] Hub URL: ${hubUrl}`);
    console.log("[NotificationSignalR] Attempting to connect to:", hubUrl);

    // Build the connection
    const newConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          console.log(
            "[NotificationSignalR] Providing access token for authentication"
          );
          return accessToken;
        },
        withCredentials: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const retryCount = retryContext.previousRetryCount;
          if (retryCount === 0) return 0;
          if (retryCount === 1) return 2000;
          if (retryCount === 2) return 5000;
          if (retryCount === 3) return 10000;
          if (retryCount <= 10) return 30000;
          return null;
        },
      })
      .configureLogging("Information")
      .build();

    setConnection(newConnection);

    // Start the connection
    newConnection
      .start()
      .then(() => {
        console.log("Notification Hub connected successfully");
        showThrottledSuccess(
          "Đã kết nối thông báo thời gian thực",
          "Sẽ nhận thông báo tự động"
        );
      })
      .catch((err) => {
        console.error("Notification Hub Connection Error: ", err);

        let errorMessage = "Không thể kết nối thông báo thời gian thực";
        let errorDescription = "Vui lòng kiểm tra kết nối mạng và thử lại";

        if (err instanceof Error) {
          const errorMsg = err.message.toLowerCase();

          if (errorMsg.includes("401") || errorMsg.includes("unauthorized")) {
            errorDescription = "Lỗi xác thực - vui lòng đăng nhập lại";
          } else if (
            errorMsg.includes("404") ||
            errorMsg.includes("not found")
          ) {
            errorDescription = "Endpoint thông báo không tồn tại trên server";
          } else if (
            errorMsg.includes("cors") ||
            errorMsg.includes("cross-origin")
          ) {
            errorDescription = "Lỗi CORS - vui lòng kiểm tra cấu hình server";
          } else if (
            errorMsg.includes("timeout") ||
            errorMsg.includes("timed out")
          ) {
            errorDescription =
              "Kết nối bị timeout - server có thể đang quá tải";
          } else if (
            errorMsg.includes("network") ||
            errorMsg.includes("offline")
          ) {
            errorDescription =
              "Lỗi kết nối mạng - vui lòng kiểm tra kết nối internet";
          }
        }

        toast.error(errorMessage, {
          description: errorDescription,
          duration: 10000,
        });
      });

    // Add connection event handlers
    newConnection.onclose((error: Error | undefined) => {
      if (error) {
        console.error(
          "[NotificationSignalR] Connection closed with error:",
          error
        );
        toast.error("Mất kết nối thông báo thời gian thực", {
          description: "Thông báo tự động sẽ tạm thời không khả dụng",
        });
      } else {
        console.log("[NotificationSignalR] Connection closed gracefully");
      }
    });

    newConnection.onreconnecting((error: Error | undefined) => {
      console.warn("[NotificationSignalR] Reconnecting...", error);
      showThrottledConnectionStatus(
        "Đang kết nối lại...",
        "Đang khôi phục kết nối thông báo thời gian thực"
      );
    });

    newConnection.onreconnected((connectionId?: string) => {
      console.log(
        "[NotificationSignalR] Reconnected successfully with ID:",
        connectionId
      );
      showThrottledSuccess("Đã khôi phục kết nối thông báo thời gian thực");
    });

    // ===============================
    // SIGNALR EVENT LISTENERS
    // ===============================

    // Listen for new notifications
    newConnection.on(
      "ReceiveNewNotification",
      (newNotification: NotificationDTO) => {
        console.log(
          "[NotificationSignalR] New notification received:",
          newNotification
        );

        // Show toast notification
        showThrottledNotification(
          "Thông báo mới!",
          newNotification.message,
          5000
        );

        // Optimistically add the new notification to the top of the list in the cache
        queryClient.setQueryData<InfiniteData<PagedResult<NotificationDTO>>>(
          ["notifications"],
          (oldData) => {
            if (!oldData) return oldData;

            const firstPage = oldData.pages[0];
            const updatedFirstPage = {
              ...firstPage,
              items: [newNotification, ...firstPage.items],
              totalRecords: firstPage.totalRecords + 1,
            };

            return {
              ...oldData,
              pages: [updatedFirstPage, ...oldData.pages.slice(1)],
            };
          }
        );
      }
    );

    // Listen for unread count updates
    newConnection.on("UpdateUnreadCount", (count: number) => {
      console.log("[NotificationSignalR] Unread count updated:", count);
      setUnreadCount(count);
    });

    // Cleanup
    return () => {
      if (newConnection) {
        console.log(
          "[NotificationSignalR] Disconnecting from NotificationsHub..."
        );
        newConnection.stop().catch((error: Error) => {
          console.error(
            "[NotificationSignalR] Error during disconnect:",
            error
          );
        });
      }
    };
  }, [isAuthenticated, accessToken, user, queryClient]);

  // ===============================
  // COMPUTE NOTIFICATIONS AND UNREAD COUNT
  // ===============================

  // Flatten all notifications from all pages
  const notifications = data?.pages.flatMap((page) => page.items) ?? [];

  // Calculate unread count from notifications if SignalR hasn't provided it yet
  useEffect(() => {
    if (unreadCount === 0 && notifications.length > 0) {
      const calculatedUnreadCount = notifications.filter(
        (notification) => !notification.isRead
      ).length;
      setUnreadCount(calculatedUnreadCount);
    }
  }, [notifications, unreadCount]);

  // ===============================
  // CONTEXT VALUE
  // ===============================

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ===============================
// USE NOTIFICATIONS HOOK
// ===============================

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
