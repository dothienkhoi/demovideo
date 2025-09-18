// =================================================================
// CUSTOMER NOTIFICATIONS SPECIFIC TYPES
// These interfaces describe the data models related to customer notifications.
// =================================================================

/**
 * The official enumeration for customer notification types.
 */
export type CustomerNotificationType =
  | "NewMessage"
  | "GroupInvitation"
  | "GroupUpdate"
  | "UserMention"
  | "SystemAnnouncement"
  | "FriendRequest"
  | "FriendAccepted"
  | "GroupRoleChanged"
  | "MessageReaction"
  | "FileShared";

/**
 * The main Data Transfer Object for a single customer notification.
 */
export interface NotificationDTO {
  id: string;
  notificationType: CustomerNotificationType;
  title: string;
  message: string;
  linkTo?: string; // URL to navigate to when the notification is clicked
  isRead: boolean;
  timestamp: string; // ISO 8601 Date string
  triggeredByUserId?: string; // UUID
  triggeredByUserName?: string;
  groupId?: string; // UUID - if notification is related to a group
  groupName?: string;
  metadata?: Record<string, any>; // Additional data specific to notification type
}

/**
 * The payload structure for real-time SignalR notifications.
 */
export interface RealtimeNotificationPayload {
  id: string;
  title: string;
  message: string;
  linkTo?: string;
  timestamp: string; // ISO 8601 Date string
  notificationType: CustomerNotificationType;
  groupId?: string;
  groupName?: string;
  triggeredByUserId?: string;
  triggeredByUserName?: string;
  metadata?: Record<string, any>;
}
