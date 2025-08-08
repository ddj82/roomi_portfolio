import { create } from "zustand";

interface AuthState {
    authToken: string | null;
    setAuthToken: (token: string | null) => void;
    profileImg: string;
    isConnected: boolean;
}

const getPublicUrl = (path: string) => {
    return `${process.env.PUBLIC_URL ?? ''}${path}`;
};

// Zustand Store
export const useAuthStore = create<AuthState>((set) => ({
    authToken: localStorage.getItem("authToken") ?? null,
    profileImg: localStorage.getItem("userProfileImg") ?? getPublicUrl('/assets/images/profile.png'),
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
