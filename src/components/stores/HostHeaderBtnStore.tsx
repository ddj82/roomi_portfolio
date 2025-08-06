import { create } from "zustand";
import { useLocation } from "react-router-dom";
import React from "react";

interface HostHeaderBtnState {
    isVisibleHostScreen: boolean;
    setVisibility: (isVisible: boolean) => void;
}

// 허용할 경로
const BLOCKED_KEYWORDS = [
    "/host/teb",
];
const BLOCKED_PREFIXES = [
    "/host",
];

export const useHostHeaderBtnStore = create<HostHeaderBtnState>((set) => ({
    isVisibleHostScreen: false,
    setVisibility: (isVisible) => set({ isVisibleHostScreen: isVisible }),
}));

// 커스텀 훅: useLocation을 활용하여 자동 업데이트
export const useHostHeaderBtnVisibility = () => {
    const location = useLocation();
    const { setVisibility } = useHostHeaderBtnStore();

    React.useEffect(() => {
        const isVisibleHostScreen =
            BLOCKED_PREFIXES.some(prefix => location.pathname === prefix) || BLOCKED_KEYWORDS.some(prefix => location.pathname.startsWith(prefix));
        setVisibility(isVisibleHostScreen);
    }, [location.pathname]); // URL 변경 감지하여 상태 업데이트

    return useHostHeaderBtnStore((state) => state.isVisibleHostScreen);
};
