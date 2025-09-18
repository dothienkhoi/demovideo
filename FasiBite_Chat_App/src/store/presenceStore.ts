// stores/presenceStore.ts

// =================================================================
// PRESENCE STATE MANAGEMENT
// Zustand store for managing real-time user presence statuses.
// =================================================================

import { create } from "zustand";
import { UserPresenceStatus } from "@/types/customer/models";
import { UserStatusDto } from "@/types/customer/presence.types";

interface PresenceState {
  statuses: Record<string, UserPresenceStatus>;
  updateUserStatus: (userId: string, status: UserPresenceStatus) => void;
  setStatusesBatch: (userStatuses: UserStatusDto[]) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  statuses: {},
  updateUserStatus: (userId, status) =>
    set((state) => ({
      statuses: {
        ...state.statuses,
        [userId]: status,
      },
    })),
  setStatusesBatch: (userStatuses) =>
    set((state) => {
      const newStatuses = { ...state.statuses };
      userStatuses.forEach((userStatus) => {
        newStatuses[userStatus.userId] = userStatus.presenceStatus;
      });
      return { statuses: newStatuses };
    }),
}));
