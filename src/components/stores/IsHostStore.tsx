import { create } from "zustand";

interface IsHostState {
    isHost: boolean;
    setIsHost: (status: boolean) => void;
}

export const useIsHostStore = create<IsHostState>((set) => ({
    isHost: localStorage.getItem("userIsHost") === "true",

    setIsHost: (status) => {
        localStorage.setItem("userIsHost", status.toString());
        set({ isHost: status });
    },
}));
