import { create } from "zustand";
import { useLocation } from "react-router-dom";
import React from "react";

interface HeaderBtnState {
    isVisible: boolean;
    setVisibility: (isVisible: boolean) => void;
}

// 차단할 경로 목록 (키워드 포함 방식)
const BLOCKED_KEYWORDS = ["reservation"];
const BLOCKED_PREFIXES = ["/host", "/join", "/myPage"];

export const useHeaderBtnStore = create<HeaderBtnState>((set) => ({
    isVisible: true,
    setVisibility: (isVisible) => set({ isVisible }),
}));

// 커스텀 훅: useLocation을 활용하여 자동 업데이트
export const useHeaderBtnVisibility = () => {
    const location = useLocation();
    const { setVisibility } = useHeaderBtnStore();

    React.useEffect(() => {
        const pathSegments = location.pathname.split("/");

        // 차단 조건
        const isBlocked =
            BLOCKED_KEYWORDS.some(keyword => pathSegments.includes(keyword)) ||
            BLOCKED_PREFIXES.some(prefix => location.pathname.startsWith(prefix));

        setVisibility(!isBlocked);
    }, [location.pathname]); // URL 변경 감지 하여 상태 업데이트

    return useHeaderBtnStore((state) => state.isVisible);
};
