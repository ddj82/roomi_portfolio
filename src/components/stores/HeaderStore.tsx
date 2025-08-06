import { create } from "zustand";
import { useLocation } from "react-router-dom";
import React from "react";

interface HeaderState {
    headerVisible: boolean;
    setHeaderVisibility: (isVisible: boolean) => void;
    headerNone: boolean;
    setHeaderNone: (isVisible: boolean) => void;
}

// 허용할 경로 목록
const ALLOWED_PREFIXES = [
    "/map",
    "/myPage",
    "/chat",
    "/host",
    "/join",
    "/reservation",
    "/certification/redirect",
    "/payMobile/redirect",
];

// 허용할 경로 키워드
const ALLOWED_KEYWORDS = ["reservation", "detail",];

// 차단할 경로 키워드
const BLOCKED_KEYWORDS = ["myPage",];

export const useHeaderStore = create<HeaderState>((set) => ({
    headerVisible: true,
    setHeaderVisibility: (headerVisible) => set({ headerVisible }),
    headerNone: true,
    setHeaderNone: (headerNone) => set({ headerNone }),
}));

export const useHeaderVisibility = () => {
    const location = useLocation();
    const { setHeaderVisibility } = useHeaderStore();
    const { setHeaderNone } = useHeaderStore();

    React.useEffect(() => {
        const pathSegments = location.pathname.split("/");

        const isAllowed =
            ALLOWED_KEYWORDS.some(keyword => pathSegments.includes(keyword)) ||
            ALLOWED_PREFIXES.some(prefix => location.pathname.startsWith(prefix));

        const isBlocked =
            BLOCKED_KEYWORDS.some(keyword => pathSegments.includes(keyword));

        setHeaderVisibility(isAllowed);
        setHeaderNone(isBlocked);

    }, [location.pathname]);

    return useHeaderStore((state) => state.headerVisible);
};


