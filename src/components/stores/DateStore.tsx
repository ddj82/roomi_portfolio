import { create } from "zustand";

interface DateState {
    startDate: string | null;
    setStartDate: (date: string | null) => void;
    endDate: string | null;
    setEndDate: (date: string | null) => void;
    calUnit: boolean;
    setCalUnit: (value: boolean) => void;
    weekValue: number;
    setWeekValue: (valueOrUpdater: number | ((prev: number) => number)) => number;
    monthValue: number;
    setMonthValue: (valueOrUpdater: number | ((prev: number) => number)) => number;
}

export const useDateStore = create<DateState>((set, get) => ({
    startDate: null,
    setStartDate: (date) => set({ startDate: date }),
    endDate: null,
    setEndDate: (date) => set({ endDate: date }),
    calUnit: false,
    setCalUnit: (value) => set({ calUnit: value }),
    weekValue: 1,
    setWeekValue: (valueOrUpdater) => {
        // 값이 함수인지 확인
        const newValue =
            typeof valueOrUpdater === "function"
                ? (valueOrUpdater as (prev: number) => number)(get().weekValue)
                : valueOrUpdater;

        set({ weekValue: newValue });
        return newValue;
    },
    monthValue: 1,
    setMonthValue: (valueOrUpdater) => {
        // 값이 함수인지 확인
        const newValue =
            typeof valueOrUpdater === "function"
                ? (valueOrUpdater as (prev: number) => number)(get().monthValue)
                : valueOrUpdater;

        set({ monthValue: newValue });
        return newValue;
    },
}));
