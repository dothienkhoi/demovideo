import apiClient from "../apiClient";
import { ApiResponse, PagedResult } from "@/types/api.types";
import { NotificationDTO } from "@/types/customer/notification.types";

// ===============================
// CUSTOMER NOTIFICATIONS API FUNCTIONS
// ===============================

/**
 * Get paginated notifications for the current user
 */
export const getMyNotifications = async ({ pageParam = 1 }) => {
  const response = await apiClient.get<
    ApiResponse<PagedResult<NotificationDTO>>
  >(`/notifications/me?pageNumber=${pageParam}&pageSize=10`);
  // Important: TanStack Query expects the actual data, not the whole ApiResponse wrapper
  return response.data.data;
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  const response = await apiClient.post(
    `/notifications/${notificationId}/mark-as-read`
  );
  return response;
};

/**
 * Mark all notifications as read for the current user
 */
export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.post(`/notifications/me/mark-all-as-read`);
  return response;
};

/**
 * Subscribes the current user to push notifications by sending their PlayerId.
 * @param playerId The unique ID provided by the OneSignal SDK.
 */
export const subscribeToPushNotifications = async (playerId: string) => {
  const response = await apiClient.post("/me/notifications/subscribe", {
    playerId,
  });
  return response;
};
