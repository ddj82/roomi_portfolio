import { create } from "zustand";

interface LocationState {
    selectedLocation: string;
    setSelectedLocation: (location: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    selectedLocation: "",
    setSelectedLocation: (location) => set({ selectedLocation: location }),
}));
