import { useState, useEffect, useCallback } from "react";
import { getCallHistory } from "@/lib/api/customer/video-call-api";
import { VideoCallSession } from "@/types/video-call-api.types";

interface UseCallHistoryProps {
    conversationId: number;
    enabled?: boolean;
    refreshInterval?: number; // milliseconds
}

interface UseCallHistoryReturn {
    callHistory: VideoCallSession[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    lastUpdated: Date | null;
}

export function useCallHistory({
    conversationId,
    enabled = true,
    refreshInterval
}: UseCallHistoryProps): UseCallHistoryReturn {
    const [callHistory, setCallHistory] = useState<VideoCallSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const refresh = useCallback(async () => {
        if (!enabled) return;

        setIsLoading(true);
        setError(null);

        try {
            const history = await getCallHistory(conversationId);
            setCallHistory(history);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch call history");
            setCallHistory([]);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, enabled]);

    // Initial load
    useEffect(() => {
        if (enabled) {
            refresh();
        }
    }, [enabled, refresh]);

    // Auto-refresh if interval is specified
    useEffect(() => {
        if (!refreshInterval || !enabled) return;

        const interval = setInterval(refresh, refreshInterval);
        return () => clearInterval(interval);
    }, [refresh, refreshInterval, enabled]);

    return {
        callHistory,
        isLoading,
        error,
        refresh,
        lastUpdated
    };
}