// src/types/eximbay.d.ts
export declare namespace Eximbay {
    interface PaymentRequest {
        fgkey?: string;
        payment : {
            transaction_type : "PAYMENT" | "AUTH"; // 거래 타입 (결제 or 승인)
            order_id: string; // 주문 번호
            currency: string; // 통화 코드 (ex: USD, KRW)
            amount: number; // 결제 금액
            lang?: string; // 언어 코드 (ex: en, ko)
        };
        merchant : {
            mid: string; // 상점 ID
        };
        buyer : {
            name? : string; // 구매자 이름
            email? : string; // 구매자 이메일
        };
        url : {
            return_url: string; // 결제 완료 후 돌아올 URL
            status_url?: string; // 결제 후 콜백을 받을 URL (status_url로 변경)
        };
        product: {
            name: string;
            quantity: number;
            unit_price: number;
            link?: string;
        }[]; // 구매 항목
        // surcharge?: {
        //     name?: string; // 추가 금액 항목명 (예: 쿠폰할인, 배송비)
        //     quantity?: string; // 추가된 항목의 수량 (0보다 큰 숫자)
        //     unit_price?: string; // 추가된 항목의 단가 (소수점 가능, 음수 가능)
        // }[]; // 추가 요금 항목 (최대 3개)
        settings?: {
            display_type?: "P" | "R"; // P: 팝업형태, R: 가맹점 화면에서 결제창으로 이동
            // autoclose?: "Y" | "N"; // Y: 가맹점 화면으로 이동, N: 결제창이 완료 화면으로 이동(기본)
            // call_from_app?: "Y" | "N"; // Y: 앱 환경에서 호출, N: 웹 브라우저에서 호출
            // call_from_scheme?: string; // 앱 URL Scheme (외부 앱에서 가맹점으로 돌아올 때 필요)
            issuer_country?: string; // 결제국가 (KR 추가 시 국내 결제창이 열립니다)
            ostype?: "P" | "M"; // P: PC 환경, M: 모바일 환경
            // virtualaccount_expiry_date?: string; // 가상계좌 입금 만료기한 (YYYYMMDDHH24)
        };
    }

    interface PaymentResponse {
        status: "SUCCESS" | "FAILED";
        order_no: string;
        txnid: string;
        amount: number;
        currency: string;
        message: string;
    }

    interface EximbaySDK {
        request_pay: (options: PaymentRequest, callback: (response: PaymentResponse) => void) => void;
    }
}

// 전역 객체에 Eximbay SDK 추가
declare global {
    interface Window {
        EXIMBAY?: Eximbay.EximbaySDK;
    }
}

export {};
