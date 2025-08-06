export {}; // 모듈 로컬 선언 유지

declare global {
    interface Window {
        MetamapVerification?: new (config: {
            clientId: string;
            flowId: string;
            metadata?: Record<string, any>;
            onSuccess?: (data: any) => void;
            onError?: (error: any) => void;
            onClose?: () => void;
            onEvent?: (event: any) => void;
        }) => {
            start: () => void;
            open: () => void;
            on:   (eventName: string, handler: (payload: any) => void) => void;
            off:  (eventName: string, handler: (payload: any) => void) => void;
        };
    }
}
