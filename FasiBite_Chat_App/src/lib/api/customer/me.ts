// lib/api/customer/me.ts

import apiClient from "@/lib/api/apiClient";
import { ApiResponse } from "@/types/api.types";
import {
  MyProfileDto,
  UserDto,
  LoginHistoryDto,
  ContactDto,
  UpdatePrivacySettingsDto,
} from "@/types/customer/user.types";
import {
  UpdateProfileFormData,
  ChangePasswordFormData,
  DeleteAccountFormData,
  DeactivateAccountFormData,
} from "@/lib/schemas/customer/user.schema";

/**
 * Get current user's profile
 */
export const getMyProfile = async (): Promise<ApiResponse<MyProfileDto>> => {
  const response = await apiClient.get<ApiResponse<MyProfileDto>>(
    "/me/profile"
  );
  return response.data;
};

/**
 * Update current user's profile
 */
export const updateMyProfile = async (
  data: UpdateProfileFormData | any
): Promise<ApiResponse<UserDto>> => {
  const response = await apiClient.put<ApiResponse<UserDto>>(
    "/me/profile",
    data
  );
  return response.data;
};

/**
 * Update current user's avatar
 */
export const updateMyAvatar = async (
  file: File
): Promise<ApiResponse<string>> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.put<ApiResponse<string>>(
    "/me/avatar",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

/**
 * Change current user's password
 */
export const changeMyPassword = async (
  data: ChangePasswordFormData
): Promise<ApiResponse<object>> => {
  const response = await apiClient.put<ApiResponse<object>>(
    "/me/password",
    data
  );
  return response.data;
};

/**
 * Get current user's login history
 */
export const getMyLoginHistory = async (): Promise<
  ApiResponse<LoginHistoryDto[]>
> => {
  const response = await apiClient.get<ApiResponse<LoginHistoryDto[]>>(
    "/me/login-history"
  );
  return response.data;
};

/**
 * Request account deletion
 */
export const requestAccountDeletion = async (
  data: DeleteAccountFormData
): Promise<ApiResponse<object>> => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/me/delete-request",
    data
  );
  return response.data;
};

/**
 * Deactivate account
 */
export const deactivateAccount = async (
  data: DeactivateAccountFormData
): Promise<ApiResponse<object>> => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/me/deactivate",
    data
  );
  return response.data;
};

/**
 * Update privacy settings
 */
export const updatePrivacySettings = async (
  settings: UpdatePrivacySettingsDto
): Promise<ApiResponse<object>> => {
  const response = await apiClient.put<ApiResponse<object>>(
    "/me/settings/privacy",
    settings
  );
  return response.data;
};

/**
 * Get current user's contacts
 */
export const getMyContacts = async (): Promise<ApiResponse<ContactDto[]>> => {
  const response = await apiClient.get<ApiResponse<ContactDto[]>>(
    "/me/contacts"
  );
  return response.data;
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async (
  playerId: string
): Promise<ApiResponse<object>> => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/me/notifications/subscribe",
    { playerId }
  );
  return response.data;
};
