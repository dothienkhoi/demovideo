"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { getInvitationLinkInfo } from "@/lib/api/customer/invites";
import { GroupPreviewCard } from "@/components/features/invites/GroupPreviewCard";
import { GroupPreviewDto } from "@/types/customer/group";

export default function InvitePage() {
  const params = useParams();
  const invitationCode = params.invitationCode as string;

  // Use React Query to fetch invitation info
  const {
    data: groupPreview,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["invitationInfo", invitationCode],
    queryFn: () => getInvitationLinkInfo(invitationCode),
    enabled: !!invitationCode,
    retry: 1, // Only retry once for invalid invites
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 customer-bg-gradient">
        <div className="w-full max-w-md">
          <div className="customer-glass-card p-8 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-white" />
            <h1 className="text-xl font-semibold text-white mb-2">
              Đang tải thông tin lời mời...
            </h1>
            <p className="text-white/70">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !groupPreview) {
    let errorTitle = "Lời mời không hợp lệ";
    let errorMessage =
      "Lời mời tham gia nhóm này không hợp lệ hoặc đã hết hạn. Vui lòng liên hệ người đã gửi lời mời để lấy link mới.";

    // Handle specific error codes
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as any;
      const errorCode = axiosError.response?.data?.errors?.[0]?.errorCode;

      switch (errorCode) {
        case "InviteLinkNotFound":
          errorTitle = "Lời mời không tồn tại";
          errorMessage = "Link lời mời này không tồn tại hoặc đã bị xóa.";
          break;
        case "InviteLinkExpired":
          errorTitle = "Lời mời đã hết hạn";
          errorMessage =
            "Link lời mời này đã hết hạn. Vui lòng yêu cầu người gửi tạo link mới.";
          break;
        case "GroupNotFound":
          errorTitle = "Nhóm không tồn tại";
          errorMessage = "Nhóm này có thể đã bị xóa hoặc không còn khả dụng.";
          break;
        case "InviteLinkUsedUp":
          errorTitle = "Lời mời đã hết lượt sử dụng";
          errorMessage =
            "Link lời mời này đã đạt giới hạn số người có thể sử dụng.";
          break;
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 customer-bg-gradient">
        <div className="w-full max-w-md">
          <div className="customer-glass-card p-8 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-white mb-4">{errorTitle}</h1>
            <p className="text-white/80 mb-6">{errorMessage}</p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Về trang chủ
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center p-4 customer-bg-gradient">
      <div className="w-full max-w-md">
        <GroupPreviewCard
          groupPreview={groupPreview}
          invitationCode={invitationCode}
        />
      </div>
    </div>
  );
}
