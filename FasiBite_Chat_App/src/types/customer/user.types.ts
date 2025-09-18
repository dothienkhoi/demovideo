// types/customer/user.types.ts

// =================================================================
// CUSTOMER USER PROFILE & ACCOUNT MANAGEMENT TYPES
// These interfaces describe data models for the current user's profile
// and account management features under /api/v1/me endpoints.
// =================================================================

import { UserPresenceStatus } from "@/types/customer/models";
import { PagedResult } from "@/types/api.types";

/**
 * Information about a group that the current user belongs to
 */
export interface MyGroupInfoDto {
  groupId: string;
  groupName: string;
  groupAvatarUrl?: string;
}

/**
 * Information about a recent post created by the current user
 */
export interface MyPostInfoDto {
  postId: number;
  title: string;
  createdAt: string; // ISO Date String
}

/**
 * Complete profile information for the current user
 */
export interface MyProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth: string; // ISO Date String
  twoFactorEnabled: boolean;
  createdAt: string; // ISO Date String
  updateAt: string; // ISO Date String
  presenceStatus: UserPresenceStatus;
  messagingPrivacy: MessagingPrivacy;
  groups: MyGroupInfoDto[];
  recentPosts: MyPostInfoDto[];
}

/**
 * Basic user information (used in update responses)
 */
export interface UserDto {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string; // ISO Date String
  twoFactorEnabled: boolean;
}

/**
 * Login history entry for the current user
 */
export interface LoginHistoryDto {
  loginTimestamp: string; // ISO Date String
  ipAddress?: string;
  userAgent?: string;
  wasSuccessful: boolean;
}

/**
 * Contact information for the current user
 */
export interface ContactDto {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  presenceStatus: UserPresenceStatus;
}

/**
 * Messaging privacy settings enum
 */
export enum MessagingPrivacy {
  FromSharedGroupMembers = "FromSharedGroupMembers",
  FromAnyone = "FromAnyone",
}

/**
 * Privacy settings update DTO
 */
export interface UpdatePrivacySettingsDto {
  messagingPrivacy: MessagingPrivacy;
}

// =================================================================
// CONVERSATION TYPES
// These interfaces describe data models for conversation management
// =================================================================

/**
 * Enum representing the possible conversation types
 */
export enum ConversationType {
  Direct = "Direct",
  Group = "Group",
}

/**
 * Enum representing the possible message types
 */
export enum MessageType {
  Text = "Text",
  Image = "Image",
  File = "File",
  Video = "Video",
  Audio = "Audio",
  Poll = "Poll",
  VideoCall = "VideoCall",
  SystemNotification = "SystemNotification",
  Delete = "Delete",
}

/**
 * Conversation list item DTO for the sidebar
 */
export interface ConversationListItemDTO {
  conversationId: number;
  groupId?: string; // Nullable Guid becomes optional string
  conversationType: ConversationType;
  displayName: string;
  avatarUrl?: string;
  partnerPresenceStatus?: UserPresenceStatus;
  lastMessagePreview?: string;
  lastMessageType?: MessageType;
  lastMessageTimestamp?: string; // ISO Date String
  unreadCount: number;
}

/**
 * Information about the sender of a message
 */
export interface MessageSenderDto {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
}

/**
 * Information about a file attached to a message
 */
export interface AttachmentInfoDto {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

/**
 * Information about a reaction to a message
 */
export interface ReactionDto {
  userId: string;
  emoji: string;
  timestamp: string;
}

/**
 * Information about who read a message
 */
export interface ReadReceiptDto {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  readAt: string;
}

/**
 * Detailed information about a single message
 */
export interface MessageDto {
  id: string;
  conversationId: number;
  sender: MessageSenderDto;
  content: string;
  messageType: MessageType;
  sentAt: string;
  isDeleted: boolean;
  attachments?: AttachmentInfoDto[] | null;
  reactions?: ReactionDto[] | null;
  parentMessageId?: string | null;
  readBy: ReadReceiptDto[];
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Information about the other user in a 1-on-1 conversation
 */
export interface ConversationPartnerDto {
  userId: string; // Guid
  fullName: string;
  avatarUrl?: string | null;
  presenceStatus: UserPresenceStatus;
  mutualGroupsCount: number;
}

/**
 * Detailed information about a single conversation, including the first page of messages
 */
export interface ConversationDetailDto {
  conversationId: number;
  groupId?: string | null;
  conversationType: ConversationType;
  displayName: string;
  avatarUrl?: string | null;
  currentUserRole?: string | null;
  partner?: ConversationPartnerDto | null;
  messagesPage: PagedResult<MessageDto>;
}

/**
 * @description Represents a user in the search results for invitations.
 * @response_from GET /api/v1/User/search-for-invite
 */
export interface UserSearchResultDto {
  userId: string; // Guid
  displayName: string;
  email: string;
  avatarUrl?: string | null;
}
