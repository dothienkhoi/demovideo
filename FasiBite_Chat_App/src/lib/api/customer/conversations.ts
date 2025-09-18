import apiClient from "@/lib/api/apiClient";
import { PagedResult, ApiResponse } from "@/types/api.types";
import {
  ConversationListItemDTO,
  ConversationDetailDto,
} from "@/types/customer/user.types";
import {
  CreateDirectConversationRequestDto,
  ConversationResponseDto,
} from "@/types/conversation";

export interface GetMyConversationsParams {
  pageParam: number;
  pageSize?: number;
  filter?: "direct" | "group";
  searchTerm?: string;
}

/**
 * Fetches the current user's conversations with pagination, filtering, and search support
 */
export async function getMyConversations({
  pageParam,
  pageSize = 20,
  filter,
  searchTerm,
}: GetMyConversationsParams): Promise<PagedResult<ConversationListItemDTO>> {
  const params = new URLSearchParams({
    pageNumber: pageParam.toString(),
    pageSize: pageSize.toString(),
  });

  if (filter) {
    params.append("filter", filter);
  }

  if (searchTerm) {
    params.append("searchTerm", searchTerm);
  }

  try {
    const response = await apiClient.get(
      `/conversations/me?${params.toString()}`
    );
    const apiResponse = response.data as ApiResponse<
      PagedResult<ConversationListItemDTO>
    >;
    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}

/**
 * Fetches detailed information about a specific conversation, including the first page of messages
 * @param conversationId - The ID of the conversation to fetch
 * @param pageSize - Optional page size for messages
 * @returns Promise<ConversationDetailDto> - Detailed conversation information with messages
 */
export async function getConversationDetails(
  conversationId: number,
  pageSize?: number
): Promise<ConversationDetailDto> {
  const params = new URLSearchParams();

  if (pageSize) {
    params.append("pageSize", pageSize.toString());
  }

  try {
    const url = `/conversations/${conversationId}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    const apiResponse = response.data as ApiResponse<ConversationDetailDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    throw error;
  }
}

/**
 * Finds an existing direct conversation or creates a new one with the specified user
 * @param request - The request payload containing the partner user ID
 * @returns Promise<ConversationResponseDto> - Conversation details with creation status
 */
export async function findOrCreateDirectConversation(
  request: CreateDirectConversationRequestDto
): Promise<ConversationResponseDto> {
  try {
    const response = await apiClient.post("/conversations/direct", request);
    const apiResponse = response.data as ApiResponse<ConversationResponseDto>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error creating/finding direct conversation:", error);
    throw error;
  }
}
