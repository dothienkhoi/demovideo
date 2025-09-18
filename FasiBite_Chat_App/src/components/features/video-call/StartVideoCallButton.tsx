"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Video, Plus } from "lucide-react";

interface StartVideoCallButtonProps {
    onCreateCall: () => void;
    isCreating?: boolean;
    className?: string;
}

export function StartVideoCallButton({
    onCreateCall,
    isCreating = false,
    className = ""
}: StartVideoCallButtonProps) {
    return (
        <Button
            onClick={onCreateCall}
            disabled={isCreating}
            className={`bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50 ${className}`}
            size="sm"
        >
            {isCreating ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Đang tạo...
                </>
            ) : (
                <>
                    <Video className="h-4 w-4 mr-2" />
                    Mở cuộc gọi
                </>
            )}
        </Button>
    );
}
