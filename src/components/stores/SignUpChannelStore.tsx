import {create} from "zustand";

interface SignUpChannelState {
    signUpChannel: string;
    setSignUpChannel: (value: string) => void;
    email: string;
    setEmail: (email: string) => void;
    name: string;
    setName: (name: string) => void;
    channelUid: string;
    setChannelUid: (channelUid: string) => void;
    channel: string;
    setChannel: (channel: string) => void;
}

export const useSignUpChannelStore = create<SignUpChannelState> ((set) => ({
    signUpChannel: 'email',
    setSignUpChannel: ((value) => set({signUpChannel: value})),
    email: '',
    name: '',
    channelUid: '',
    channel: '',
    setEmail: (email: string) => set({ email }),
    setName: (name: string) => set({ name }),
    setChannelUid: (channelUid: string) => set({ channelUid }),
    setChannel: (channel: string) => set({ channel }),
}));