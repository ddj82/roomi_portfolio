import { create } from "zustand";

interface GuestsState {
    guestCount: number;
    setGuestCount: (updater: (prev: number) => number) => number;
}

export const useGuestsStore = create<GuestsState>((set, get) => ({
    guestCount: 0,
    setGuestCount: (updater) => {
        const newValue = updater(get().guestCount); // 현재 상태 가져오기
        set({ guestCount: newValue });
        return newValue;
    },
}));
