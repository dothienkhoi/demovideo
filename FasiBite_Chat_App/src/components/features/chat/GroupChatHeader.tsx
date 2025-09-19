"use client";

import { useState, useEffect } from "react";
import { MoreVertical, Video, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConversationDetailDto } from "@/types/customer/user.types";
import { GroupDetailsSheet } from "@/components/features/groups/GroupDetailsSheet";
import { VideoCallSetupModal } from "@/components/features/video-call";
import { VideoCallSettings } from "../../../types/video-call.types";

interface GroupChatHeaderProps {
  conversationDetails: ConversationDetailDto;
}

export function GroupChatHeader({ conversationDetails }: GroupChatHeaderProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isVideoCallModalOpen, setIsVideoCallModalOpen] = useState(false);

  // Close video call modal when conversation changes
  useEffect(() => {
    setIsVideoCallModalOpen(false);
  }, [conversationDetails.conversationId]); // Chỉ depend vào conversationId, không phải toàn bộ object

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleJoinVideoCall = (settings: VideoCallSettings) => {
    // This will be handled by the ChatInterface component
    // The modal will trigger the video call creation directly
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={conversationDetails.avatarUrl || undefined}
              alt={conversationDetails.displayName}
            />
            <AvatarFallback className="bg-gradient-to-r from-[#ad46ff] to-[#1447e6] text-white font-bold text-sm">
              {getInitials(conversationDetails.displayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              {conversationDetails.displayName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nhóm chat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Phone Call Button */}
          <Button
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Bắt đầu cuộc gọi thoại"
          >
            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>

          {/* Video Call Button */}
          <Button
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setIsVideoCallModalOpen(true)}
            title="Bắt đầu cuộc gọi video"
          >
            <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>

          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setIsSheetOpen(true)}
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

      {/* The Sheet component is rendered here but controlled by the state */}
      {conversationDetails.groupId && (
        <GroupDetailsSheet
          groupId={conversationDetails.groupId}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}

      {/* Video Call Setup Modal */}
      <VideoCallSetupModal
        isOpen={isVideoCallModalOpen}
        onOpenChange={setIsVideoCallModalOpen}
        onJoinCall={handleJoinVideoCall}
        groupId={conversationDetails.conversationId?.toString() || undefined}
        groupName={conversationDetails.displayName}
      />
    </>
  );
}
