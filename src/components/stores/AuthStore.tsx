import { create } from "zustand";

interface AuthState {
    authToken: string | null;
    setAuthToken: (token: string | null) => void;
    profileImg: string;
    isConnected: boolean;
}

// Zustand Store
export const useAuthStore = create<AuthState>((set) => ({
    authToken: localStorage.getItem("authToken") ?? null,
    profileImg: localStorage.getItem("userProfileImg") ?? '/assets/images/profile.png',
    isConnected : localStorage.getItem("isConnected") === 'true' ? true : false,
    setIsConnected: (isConnected : boolean) => {
        localStorage.setItem("isConnected", isConnected.toString());
        set({ isConnected });
    },
    setAuthToken: (token) => {
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
        set({ authToken: token });
    },
}));
