// src/types/conversation.ts
import { ConversationPartnerDto } from "@/types/customer/user.types";

/**
 * @description The request payload for finding or creating a direct conversation.
 * @used_in POST /api/v1/conversations/direct
 */
export interface CreateDirectConversationRequestDto {
  partnerUserId: string; // Guid of the other user
}

/**
 * @description The successful response payload from the find/create direct conversation API.
 * @response_from POST /api/v1/conversations/direct
 */
export interface ConversationResponseDto {
  conversationId: number;
  partner: ConversationPartnerDto;
  wasCreated: boolean; // Indicates if the conversation was newly created (201) or found (200)
}

/**
 * @description User search result for starting new conversations
 */
export interface UserSearchResultDto {
  userId: string;
  displayName?: string;
  fullName?: string;
  avatarUrl?: string;
  email?: string;
}
