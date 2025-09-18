"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Users, Sparkles } from "lucide-react";

import { createChatGroup } from "@/lib/api/customer/groups";
import { CreateGroupResponseDto } from "@/types/customer/group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateGroupDetailsForm } from "./CreateGroupDetailsForm";

export type CreateGroupStep = "details";

interface CreateGroupModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateGroupModal({
  children,
  isOpen,
  onOpenChange,
}: CreateGroupModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const router = useRouter();
  const queryClient = useQueryClient();

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: createChatGroup,
    onSuccess: (data) => {
      toast.success("✨ Tạo nhóm thành công!", {
        description: `Nhóm "${data.groupName}" đã được tạo và sẵn sàng sử dụng.`,
        duration: 4000,
      });

      // Invalidate conversations list to refresh sidebar
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Navigate to the new group's chat
      router.push(`/chat/conversations/${data.defaultConversationId}`);

      // Close modal and reset state
      handleClose();
    },
    onError: (error) => {
      console.error("Error creating group:", error);
      toast.error("⚠️ Lỗi tạo nhóm", {
        description:
          "Không thể tạo nhóm. Vui lòng kiểm tra thông tin và thử lại.",
        duration: 5000,
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only show DialogTrigger if using internal control (no external isOpen provided) */}
      {isOpen === undefined && (
        <DialogTrigger asChild>
          {children || (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-200 group"
              aria-label="Tạo nhóm mới"
            >
              <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden customer-bg-gradient border-0 shadow-2xl">
        <DialogHeader className="relative overflow-hidden pb-4">
          {/* Enhanced background decoration */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl" />

          {/* Header content */}
          <div className="relative z-10 text-center">
            <DialogTitle className="customer-gradient-text text-2xl font-bold mb-2">
              Tạo nhóm mới
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-sm">
              Thiết lập nhóm chat của bạn với thông tin cơ bản
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] px-6 pb-6">
          <div className="customer-glass-card p-8">
            <CreateGroupDetailsForm
              onSuccess={(data: any) => createGroupMutation.mutate(data)}
              isLoading={createGroupMutation.isPending}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
