import { create } from "zustand";

interface DataUpdateState {
    dataUpdate: boolean;
    toggleDataUpdate: () => void;
}

export const useDataUpdateStore = create<DataUpdateState>((set) => ({
    dataUpdate: false,
    toggleDataUpdate: () => set((state) => ({ dataUpdate: !state.dataUpdate })),
}));
