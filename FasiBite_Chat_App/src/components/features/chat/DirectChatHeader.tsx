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
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setIsDetailsSheetOpen(true)}
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
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
