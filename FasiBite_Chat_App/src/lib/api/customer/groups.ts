// src/lib/api/customer/groups.ts

import apiClient from "../apiClient";
import { PagedResult, ApiResponse } from "@/types/api.types";
import {
  PublicGroupDto,
  GroupFilterType,
  JoinGroupResponseDto,
  GroupDetailsDto,
  CreateGroupResponseDto,
  AddMemberRequestDto,
  GroupMemberListDto,
  GetGroupMembersRequestParams,
  TransferAndLeaveRequestDto,
  UpdateGroupInfoDto,
  UpdateGroupAvatarResponseDto,
  SendInvitationsRequestDto,
  CreateInviteLinkDto,
  InviteLinkDto,
  ManageMemberAction,
  ManageMemberRequestDto,
} from "@/types/customer/group";
import { UserSearchResultDto } from "@/types/customer/user.types";
import {
  CreateChatGroupFormData,
  UpdateGroupInfoFormData,
} from "@/lib/schemas/customer/group.schema";

/**
 * Query parameters for fetching public groups
 */
export interface GetPublicGroupsParams {
  pageParam: number;
  searchTerm?: string;
  filterType?: GroupFilterType;
}

/**
 * Fetches a paginated list of public groups with optional search and filtering
 * @param params - Query parameters including page, search term, and filter type
 * @returns Promise<PagedResult<PublicGroupDto>>
 */
export async function getPublicGroups(
  params: GetPublicGroupsParams
): Promise<PagedResult<PublicGroupDto>> {
  const { pageParam, searchTerm, filterType } = params;

  const searchParams = new URLSearchParams({
    pageNumber: pageParam.toString(),
    pageSize: "12", // Fixed page size for discovery
  });

  if (searchTerm && searchTerm.trim()) {
    searchParams.append("searchTerm", searchTerm.trim());
  }

  if (filterType && filterType !== GroupFilterType.All) {
    searchParams.append("filterType", filterType);
  }

  const response = await apiClient.get(
    `/groups/public?${searchParams.toString()}`
  );
  const apiResponse = response.data as ApiResponse<PagedResult<PublicGroupDto>>;
  return apiResponse.data;
}

/**
 * Fetches detailed information about a specific group
 * @param groupId - The unique identifier of the group
 * @returns Promise<GroupDetailsDto>
 */
export async function getGroupDetails(
  groupId: string
): Promise<GroupDetailsDto> {
  const response = await apiClient.get(`/groups/${groupId}`);
  const apiResponse = response.data as ApiResponse<GroupDetailsDto>;
  return apiResponse.data;
}

/**
 * Joins a public group
 * @param groupId - The unique identifier of the group to join
 * @returns Promise<JoinGroupResponseDto>
 */
export async function joinPublicGroup(
  groupId: string
): Promise<JoinGroupResponseDto> {
  const response = await apiClient.post(`/groups/${groupId}/join`);
  const apiResponse = response.data as ApiResponse<JoinGroupResponseDto>;
  return apiResponse.data;
}

/**
 * Creates a new chat group
 * @param formData - The group creation form data
 * @returns Promise<CreateGroupResponseDto>
 */
export async function createChatGroup(
  formData: CreateChatGroupFormData
): Promise<CreateGroupResponseDto> {
  const payload = new FormData();

  payload.append("groupName", formData.groupName);
  payload.append("groupType", formData.groupType.toString());

  if (formData.description) {
    payload.append("description", formData.description);
  }

  if (formData.avatarFile) {
    payload.append("avatarFile", formData.avatarFile);
  }

  const response = await apiClient.post("/groups/chat", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const apiResponse = response.data as ApiResponse<CreateGroupResponseDto>;
  return apiResponse.data;
}

/**
 * Search users for invitation to a group
 * @param params - Search parameters including groupId, query, and pagination
 * @returns Promise<PagedResult<UserSearchResultDto>>
 */
export async function searchUsersForInvite(params: {
  groupId: string;
  query?: string;
  pageParam: number;
  pageSize: number;
}): Promise<PagedResult<UserSearchResultDto>> {
  const { groupId, query, pageParam, pageSize } = params;

  const searchParams = new URLSearchParams({
    groupId,
    pageNumber: pageParam.toString(),
    pageSize: pageSize.toString(),
  });

  if (query && query.trim()) {
    searchParams.append("query", query.trim());
  }

  const response = await apiClient.get(
    `/User/search-for-invite?${searchParams.toString()}`
  );

  const apiResponse = response.data as ApiResponse<
    PagedResult<UserSearchResultDto>
  >;
  return apiResponse.data;
}

/**
 * Send group invitations to multiple users
 * @param groupId - The group ID to send invitations for
 * @param payload - The send invitations request data
 * @returns Promise<void>
 */
export async function sendGroupInvitations(
  groupId: string,
  payload: SendInvitationsRequestDto
): Promise<void> {
  const response = await apiClient.post(
    `/groups/${groupId}/invitations`,
    payload
  );
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Invite users to a group
 * @param groupId - The group ID to invite users to
 * @param userIds - Array of user IDs to invite
 * @returns Promise<void>
 */
export async function inviteUsersToGroup(
  groupId: string,
  userIds: string[]
): Promise<void> {
  await apiClient.post(`/groups/${groupId}/invite`, {
    userIds,
  });
}

/**
 * Add a member directly to a group (for admins/moderators)
 * @param groupId - The group ID to add the member to
 * @param payload - The add member request data
 * @returns Promise<void>
 */
export async function addMemberToGroup(
  groupId: string,
  payload: AddMemberRequestDto
): Promise<void> {
  await apiClient.post(`/groups/${groupId}/members`, payload);
}

/**
 * Fetches a paginated list of group members with optional search
 * @param groupId - The group ID to fetch members for
 * @param params - Query parameters including search term and pagination
 * @returns Promise<PagedResult<GroupMemberListDto>>
 */
export async function getGroupMembers(
  groupId: string,
  params: GetGroupMembersRequestParams
): Promise<PagedResult<GroupMemberListDto>> {
  const { pageParam = 1, pageSize = 20, searchTerm } = params;

  const searchParams = new URLSearchParams({
    pageNumber: pageParam.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchTerm && searchTerm.trim()) {
    searchParams.append("searchTerm", searchTerm.trim());
  }

  const response = await apiClient.get(
    `/groups/${groupId}/members?${searchParams.toString()}`
  );

  const apiResponse = response.data as ApiResponse<
    PagedResult<GroupMemberListDto>
  >;
  return apiResponse.data;
}

/**
 * Leave a group (standard flow)
 * @param groupId - The group ID to leave
 * @returns Promise<void>
 */
export async function leaveGroup(groupId: string): Promise<void> {
  const response = await apiClient.post(`/groups/${groupId}/leave`);
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Transfer group ownership and leave (admin transfer flow)
 * @param groupId - The group ID to transfer ownership and leave
 * @param payload - The transfer request data containing new admin user ID
 * @returns Promise<void>
 */
export async function transferOwnershipAndLeave(
  groupId: string,
  payload: TransferAndLeaveRequestDto
): Promise<void> {
  const response = await apiClient.post(
    `/groups/${groupId}/transfer-and-leave`,
    payload
  );
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Delete a group (destructive action)
 * @param groupId - The group ID to delete
 * @returns Promise<void>
 */
export async function deleteGroup(groupId: string): Promise<void> {
  const response = await apiClient.delete(`/groups/${groupId}`);
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Archive a group
 * @param groupId - The group ID to archive
 * @returns Promise<void>
 */
export async function archiveGroup(groupId: string): Promise<void> {
  const response = await apiClient.post(`/groups/${groupId}/archive`);
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Unarchive a group
 * @param groupId - The group ID to unarchive
 * @returns Promise<void>
 */
export async function unarchiveGroup(groupId: string): Promise<void> {
  const response = await apiClient.post(`/groups/${groupId}/unarchive`);
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Update group information (name, description, privacy)
 * @param groupId - The group ID to update
 * @param payload - The update group info form data
 * @returns Promise<void>
 */
export async function updateGroupInfo(
  groupId: string,
  payload: UpdateGroupInfoFormData
): Promise<void> {
  const response = await apiClient.put(`/groups/${groupId}`, payload);
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Update group avatar
 * @param groupId - The group ID to update avatar for
 * @param file - The image file to upload
 * @returns Promise<UpdateGroupAvatarResponseDto>
 */
export async function updateGroupAvatar(
  groupId: string,
  file: File
): Promise<UpdateGroupAvatarResponseDto> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.put(`/groups/${groupId}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const apiResponse =
    response.data as ApiResponse<UpdateGroupAvatarResponseDto>;
  return apiResponse.data;
}

/**
 * Create an invite link for a group
 * @param groupId - The group ID to create invite link for
 * @param payload - The create invite link request data
 * @returns Promise<InviteLinkDto>
 */
export async function createInviteLink(
  groupId: string,
  payload: CreateInviteLinkDto
): Promise<InviteLinkDto> {
  const response = await apiClient.post(
    `/groups/${groupId}/invite-links`,
    payload
  );
  const apiResponse = response.data as ApiResponse<InviteLinkDto>;
  return apiResponse.data;
}

/**
 * Manage a member's role (promote or demote)
 * @param groupId - The group ID
 * @param memberId - The member ID to manage
 * @param payload - The manage member request data
 * @returns Promise<void>
 */
export async function manageMemberRole(
  groupId: string,
  memberId: string,
  payload: ManageMemberRequestDto
): Promise<void> {
  const response = await apiClient.put(
    `/groups/${groupId}/members/${memberId}/role`,
    payload
  );
  const apiResponse = response.data as ApiResponse<null>;
  // No need to return data, just ensure proper error handling structure
}

/**
 * Kick a member from the group
 * @param groupId - The group ID
 * @param userIdToKick - The user ID to kick from the group
 * @returns Promise<void>
 */
export async function kickMember(
  groupId: string,
  userIdToKick: string
): Promise<void> {
  const response = await apiClient.delete(
    `/groups/${groupId}/members/${userIdToKick}`
  );
  // DELETE endpoint returns 204 NoContent, no need to parse response
}
