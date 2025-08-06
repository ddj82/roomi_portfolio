// 공통 하위 타입들
import SuccessVirtualAccountPage from "../components/pay/SuccessVirtualAccountPage";

interface Channel {
    type: string;
    id: string;
    key: string;
    name: string;
    pgProvider: string;
    pgMerchantId: string;
}

interface Amount {
    total: number;
    taxFree: number;
    vat: number;
    supply: number;
    discount: number;
    paid: number;
    cancelled: number;
    cancelledTaxFree: number;
}

interface Customer {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
}

// 1) 결제 실패 응답용 인터페이스 (수정된 failure 포함) "FAILED"
interface FailureInfo {
    reason: string;
    pgCode?: string;
    pgMessage?: string;
}

export interface PaymentFailedResponse {
    status: string
    id: string;
    transactionId: string;
    merchantId: string;
    storeId: string;
    channel: Channel;
    version: string;
    requestedAt: string;      // ISO 8601 문자열
    updatedAt: string;        // ISO 8601 문자열
    statusChangedAt: string;  // ISO 8601 문자열
    orderName: string;
    amount: Amount;
    currency: string;
    customer: Customer;
    promotionId: string;
    isCulturalExpense: boolean;
    failedAt: string;         // ISO 8601 문자열
    failure: FailureInfo;
}


// 2) 결제 취소 응답용 인터페이스 "CANCELLED"
interface CardInfo {
    publisher: string;
    issuer: string;
    brand: string;
    type: string;
    ownerType: string;
    bin: string;
    name: string;
    number: string;
}

interface Installment {
    month: number;
    isInterestFree: boolean;
}

interface PaymentMethod {
    type: string;
    card: CardInfo;
    approvalNumber: string;
    installment: Installment;
    pointUsed: boolean;
}

interface CancellationDetail {
    status: string;
    id: string;
    pgCancellationId: string;
    totalAmount: number;
    taxFreeAmount: number;
    vatAmount: number;
    reason: string;
    cancelledAt: string;   // ISO 8601 문자열
    requestedAt: string;   // ISO 8601 문자열
    receiptUrl: string;
    trigger: string;
}

export interface PaymentCancelledResponse {
    status: string;
    id: string;
    transactionId: string;
    merchantId: string;
    storeId: string;
    method: PaymentMethod;
    channel: Channel;
    version: string;
    requestedAt: string;      // ISO 8601 문자열
    updatedAt: string;        // ISO 8601 문자열
    statusChangedAt: string;  // ISO 8601 문자열
    orderName: string;
    amount: Amount;
    currency: string;
    customer: Customer;
    promotionId: string;
    isCulturalExpense: boolean;
    paidAt: string;           // ISO 8601 문자열
    pgTxId: string;
    receiptUrl: string;
    cancellations: CancellationDetail[];
    cancelledAt: string;      // ISO 8601 문자열
}

// 3) 결제 성공 응답용 인터페이스 "PAID"
export interface PaymentSuccessResponse {
    status: string;
    id: string;
    transactionId: string;
    merchantId: string;
    storeId: string;
    method: PaymentMethod;
    channel: Channel;
    version: string;
    requestedAt: string;      // ISO 8601 문자열
    updatedAt: string;        // ISO 8601 문자열
    statusChangedAt: string;  // ISO 8601 문자열
    orderName: string;
    amount: Amount;
    currency: string;
    customer: Customer;
    promotionId: string;
    isCulturalExpense: boolean;
    paidAt: string;           // ISO 8601 문자열
    pgTxId: string;
    pgResponse: string;       // 내부 JSON 문자열
    receiptUrl: string;
    disputes: any[];          // 분쟁 내역이 없거나 구조가 다양할 수 있으므로 any[]로 처리
}


// 가상 계좌 발급 성공 인터페이스
export interface SuccessVirtualAccountResponse {
    accountNumber: string;
    accountType: string;
    bank: string;
    amount: Amount;
    expiredAt: string;
    issuedAt: string;
    remitteeName: string;
    remitterName: string;
    type: string;
}