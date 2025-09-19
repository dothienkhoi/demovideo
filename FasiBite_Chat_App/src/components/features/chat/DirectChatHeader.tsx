import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ConversationPartnerDto,
  ConversationType,
} from "@/types/customer/user.types";
import { UserPresenceStatus } from "@/types/customer/models";
import { DirectDetailsSheet } from "./DirectDetailsSheet";
import { DirectVideoCallManager } from "@/components/features/video-call";
import { useAuthStore } from "@/store/authStore";

interface DirectChatHeaderProps {
  conversationId: number;
  partner?: ConversationPartnerDto | null;
  displayName: string;
  conversationType: ConversationType;
  avatarUrl?: string | null;
}

export function DirectChatHeader({
  conversationId,
  partner,
  displayName,
  conversationType,
  avatarUrl,
}: DirectChatHeaderProps) {
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const { user } = useAuthStore();
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPresenceText = (status?: UserPresenceStatus) => {
    switch (status) {
      case UserPresenceStatus.Online:
        return "Đang hoạt động";
      case UserPresenceStatus.Busy:
        return "Bận";
      case UserPresenceStatus.Absent:
        return "Vắng mặt";
      case UserPresenceStatus.Offline:
      default:
        return "Không hoạt động";
    }
  };

  const getPresenceColor = (status?: UserPresenceStatus) => {
    switch (status) {
      case UserPresenceStatus.Online:
        return "text-green-500";
      case UserPresenceStatus.Busy:
        return "text-yellow-500";
      case UserPresenceStatus.Absent:
        return "text-orange-500";
      case UserPresenceStatus.Offline:
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-r from-[#ad46ff] to-[#1447e6] text-white font-bold text-sm">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              {displayName}
            </h2>
            {conversationType === ConversationType.Direct && partner && (
              <p
                className={`text-sm ${getPresenceColor(
                  partner.presenceStatus
                )}`}
              >
                {getPresenceText(partner.presenceStatus)}
              </p>
            )}
            {conversationType === ConversationType.Group && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nhóm chat
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Video Call Manager */}
          {conversationType === ConversationType.Direct && partner && user && (
            <DirectVideoCallManager
              conversationId={conversationId}
              partnerId={partner.userId}
              partnerName={displayName}
              partnerAvatar={avatarUrl || undefined}
              currentUserId={user.id}
              currentUserName={user.fullName || "User"}
              currentUserAvatar={user.avatarUrl || undefined}
            />
          )}
          
          {/* More Options Button */}
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setIsDetailsSheetOpen(true)}
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Direct Details Sheet */}
      <DirectDetailsSheet
        conversationId={conversationId}
        partner={partner}
        displayName={displayName}
        avatarUrl={avatarUrl}
        isOpen={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
      />
    </>
  );
}
