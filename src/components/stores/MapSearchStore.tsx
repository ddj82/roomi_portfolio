import { create } from "zustand";
import { useLocation } from "react-router-dom";
import React from "react";

interface MapSearchStore {
    isSearchVisible: boolean;
    setSearchVisibility: (isVisible: boolean) => void;
}

// 허용할 경로 목록
const ALLOWED_PREFIXES = ["/"];

export const useMapSearchStore = create<MapSearchStore>((set) => ({
    isSearchVisible: false,
    setSearchVisibility: (isSearchVisible) => set({ isSearchVisible }),
}));

export const useSearchVisibility = () => {
    const location = useLocation();
    const { setSearchVisibility } = useMapSearchStore();

    React.useEffect(() => {
        const isAllowed = ALLOWED_PREFIXES.some(prefix => location.pathname === prefix);
        setSearchVisibility(isAllowed); // 일단 경로 기준으로 설정
    }, [location.pathname]);

    return useMapSearchStore((state) => state.isSearchVisible);
};


