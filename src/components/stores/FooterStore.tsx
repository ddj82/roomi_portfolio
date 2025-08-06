import { create } from "zustand";
import { useLocation } from "react-router-dom";
import React from "react";

interface FooterStore {
    isFooterVisible: boolean;
    setFooterVisibility: (isVisible: boolean) => void;
}

// 차단할 경로 목록 (키워드 포함 방식)
const BLOCKED_PREFIXES = ["/map"];

export const useFooterStore = create<FooterStore>((set) => ({
    isFooterVisible: true,
    setFooterVisibility: (isFooterVisible) => set({ isFooterVisible }),
}));

export const useFooterVisibility = () => {
    const location = useLocation();
    const { setFooterVisibility } = useFooterStore();

    React.useEffect(() => {
        const isBlocked = BLOCKED_PREFIXES.some(prefix => location.pathname.startsWith(prefix));
        setFooterVisibility(!isBlocked); // 일단 경로 기준으로 설정
    }, [location.pathname]);

    return useFooterStore((state) => state.isFooterVisible);
};


