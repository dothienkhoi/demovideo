/**
 * @description Represents a single pending group invitation in a user's list.
 * @response_from GET /api/v1/invitations/me
 */
export interface GroupInvitationDto {
  invitationId: number;
  groupName: string;
  groupAvatarUrl: string;
  invitedByName: string;
}

/**
 * @description The request payload for responding to an invitation.
 * @used_in POST /api/v1/invitations/{invitationId}/respond
 */
export interface RespondToInvitationDto {
  accept: boolean; // true to accept, false to decline
}
