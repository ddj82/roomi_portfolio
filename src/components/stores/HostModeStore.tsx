import { create } from "zustand";

interface HostModeState {
    hostMode: boolean;
    setHostMode: (status: boolean) => void;
    toggleUserMode: () => void;
    resetUserMode: () => void;
}

export const useHostModeStore = create<HostModeState>((set) => ({
    hostMode: localStorage.getItem('hostMode') === 'true',

    setHostMode: (status) => {
        localStorage.setItem('hostMode', status.toString());
        set({ hostMode: status });
    },

    toggleUserMode: () => set((state) => {
        const newMode = !state.hostMode;
        localStorage.setItem('hostMode', newMode.toString());
        return { hostMode: newMode };
    }),

    resetUserMode: () => {
        localStorage.removeItem('hostMode');
        set({ hostMode: false });
    },
}));
