"use client";

import React from "react";
import { Clock, Video, Users, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCallHistory } from "@/hooks/useCallHistory";
import { VideoCallSession } from "@/types/video-call-api.types";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";

interface CallHistoryPanelProps {
    conversationId: number;
    className?: string;
}

export function CallHistoryPanel({ conversationId, className }: CallHistoryPanelProps) {
    const { callHistory, isLoading, error, refresh } = useCallHistory({
        conversationId,
        enabled: true,
        refreshInterval: 30000 // Refresh every 30 seconds
    });

    const formatDuration = (minutes: number): string => {
        if (minutes < 1) return "< 1 phút";
        if (minutes < 60) return `${minutes} phút`;

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (remainingMinutes === 0) return `${hours} giờ`;
        return `${hours} giờ ${remainingMinutes} phút`;
    };

    const formatDateTime = (date: Date | string): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCallStatus = (call: VideoCallSession): "active" | "ended" => {
        return call.endedAt ? "ended" : "active";
    };

    if (isLoading && callHistory.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Lịch sử cuộc gọi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Lịch sử cuộc gọi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <p>Không thể tải lịch sử cuộc gọi</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refresh}
                            className="mt-2"
                        >
                            Thử lại
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (callHistory.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Lịch sử cuộc gọi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Chưa có cuộc gọi video nào</p>
                        <p className="text-sm mt-1">Bắt đầu cuộc gọi đầu tiên của bạn!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Lịch sử cuộc gọi
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={refresh}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        ) : (
                            "Làm mới"
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {callHistory.map((call) => {
                        const status = getCallStatus(call);
                        const isActive = status === "active";

                        return (
                            <div
                                key={call.videoCallSessionId}
                                className={`p-3 rounded-lg border transition-all duration-200 ${isActive
                                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800"
                                    : "bg-muted/30 border-border hover:bg-muted/50"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className={`p-2 rounded-lg ${isActive
                                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-muted text-muted-foreground"
                                            }`}>
                                            <Video className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-sm truncate">
                                                    {call.initiatorName}
                                                </p>
                                                <Badge
                                                    variant={isActive ? "default" : "secondary"}
                                                    className={isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}
                                                >
                                                    {isActive ? "Đang diễn ra" : "Đã kết thúc"}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {call.participantCount} người
                                                </span>
                                                {!isActive && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDuration(call.durationInMinutes)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {isActive
                                                    ? `Bắt đầu ${formatDistanceToNow(new Date(call.startedAt), { addSuffix: true, locale: vi })}`
                                                    : formatDateTime(call.startedAt)
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    {isActive && (
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => {
                                                // Navigate to active call
                                                window.open(`/video-call/${call.videoCallSessionId}`, '_blank');
                                            }}
                                        >
                                            <Play className="w-3 h-3 mr-1" />
                                            Tham gia
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}