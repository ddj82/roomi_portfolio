import { create } from "zustand";
import { useLocation, useNavigate } from "react-router-dom";
import React from "react";

interface HostTabState {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const useHostTabStore = create<HostTabState>((set) => ({
    activeTab: "my_room",
    setActiveTab: (tab) => set({ activeTab: tab }),
}));

// 커스텀 훅: useLocation과 useNavigate를 활용하여 자동 이동 처리
export const useHostTabNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { activeTab } = useHostTabStore();
/*
    React.useEffect(() => {
        // 현재 URL이 "/host"가 아니면서 "/host/"로 시작하면 "/host"로 강제 이동
        if (location.pathname !== "/host" && location.pathname.startsWith("/host/")) {
            navigate("/host", { replace: true });
        }
    }, [activeTab]); // 경로 변경 시 업데이트
*/

    return useHostTabStore();
};
