// conversations/[conversationId]/page.tsx
"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { getConversationDetails } from "@/lib/api/customer/conversations";
import { ChatInterface } from "@/components/features/chat/ChatInterface";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConversationDetailPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId: conversationIdString } = use(params);
  const conversationId = parseInt(conversationIdString, 10);

  const {
    data: conversationData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["conversationDetails", conversationId],
    queryFn: () => getConversationDetails(conversationId, 50),
    enabled: !isNaN(conversationId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !conversationData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Không thể tải cuộc trò chuyện
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi tải cuộc trò chuyện"}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          Thử lại
        </Button>
      </div>
    );
  }

  if (isNaN(conversationId)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Cuộc trò chuyện không hợp lệ
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ID cuộc trò chuyện không đúng định dạng
        </p>
      </div>
    );
  }

  return <ChatInterface conversationDetails={conversationData} />;
}
