import {create} from "zustand";

interface ReserSlideConState {
    slideIsOpen: boolean;
    setSlideIsOpen: (value: boolean) => void;
}

export const useReserSlideConStore = create<ReserSlideConState> ((set) => ({
    slideIsOpen: false,
    setSlideIsOpen: ((value) => set({slideIsOpen: value})),
}));