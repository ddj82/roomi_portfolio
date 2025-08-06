import { create } from "zustand";
import { useLocation } from "react-router-dom";
import React from "react";

interface MapStore {
    isMapVisible: boolean;
    setMapVisibility: (isVisible: boolean) => void;
}

// 허용할 경로 목록
const ALLOWED_PREFIXES = ["/map"];

export const useMapStore = create<MapStore>((set) => ({
    isMapVisible: false,
    setMapVisibility: (isMapVisible) => set({ isMapVisible }),
}));

export const useMapVisibility = () => {
    const location = useLocation();
    const { setMapVisibility } = useMapStore();

    React.useEffect(() => {
        const isAllowed = ALLOWED_PREFIXES.some(prefix => location.pathname.startsWith(prefix));
        setMapVisibility(isAllowed); // 일단 경로 기준으로 설정
    }, [location.pathname]);

    return useMapStore((state) => state.isMapVisible);
};


