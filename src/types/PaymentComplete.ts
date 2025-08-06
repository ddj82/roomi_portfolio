interface Payment {
    account_number: string | null;
    account_type: string | null;
    bank_code: string | null;
    channel_name: string;
    created_at: string;           // ISO 날짜 문자열
    currency: string;
    customer_address: string;
    customer_email: string;
    customer_id: string;
    customer_name: string;
    customer_phone: string;
    deposit_amount: string;       // "0" 과 같은 문자열
    deposit_deducted: string;     // "0" 과 같은 문자열
    expired_at: string | null;
    id: string;                   // UUID 형태 문자열
    merchant_id: string;
    order_name: string;
    paid_at: string;              // ISO 날짜 문자열
    pay_method: string;           // ex. "PaymentMethodCard"
    pg_provider: string;          // ex. "INICIS_V2"
    pg_tx_id: string;
    portone_id: string;
    refund_requested: string;     // "0" 과 같은 문자열
    remittee_name: string | null;
    requested_at: string;         // ISO 날짜 문자열
    reservation_id: number;
    status: string;               // ex. "PAID"
    status_changed_at: string;    // ISO 날짜 문자열
    store_id: string;
    supply_amount: number;        // 909 등 숫자
    tax_free_amount: number;      // 0 등 숫자
    total_amount: number;         // 1000 등 숫자
    transaction_id: string;
    updated_at: string;           // ISO 날짜 문자열
    vat_amount: number;           // 91 등 숫자
}

interface Reservation {
    check_in_date: string;            // ISO 날짜 문자열
    check_out_date: string;           // ISO 날짜 문자열
    created_at: string;               // ISO 날짜 문자열
    currency: string;                 // ex. "KRW"
    deposit: string;                  // "100000" 등 문자열
    dollar_price: string;             // "1469.44" 등 문자열
    fee: string;                      // "18400" 등 문자열
    guest_accepted_fee: string | null;
    guest_count: number;              // 1 등 숫자
    guest_email: string;
    guest_id: number;
    guest_name: string;
    guest_phone: string;
    id: number;
    is_checkout_requested: boolean;
    is_deleted: boolean;
    is_guest_deleted: boolean;
    is_host_deleted: boolean;
    is_reviewed: boolean | null;
    maintenance_fee: string;          // "50000" 등 문자열
    maintenance_per_unit: string;     // "50000" 등 문자열
    order_id: string;
    payment_status: string;           // ex. "PAID"
    price: string;                    // "180000" 등 문자열
    price_per_unit: string;           // "180000" 등 문자열
    reason: string | null;
    request_fee_refund_amount: string | null;
    request_fee_refund_reason: string | null;
    room_id: number;
    selection_mode: string;           // ex. "weekly"
    status: string;                   // ex. "CONFIRMED"
    total_guests: number;             // 2 등 숫자
    total_price: string;              // "348400" 등 문자열
    unit: number;                     // 1 등 숫자
    updated_at: string;               // ISO 날짜 문자열
    yen_price: string;                // "9.76" 등 문자열
}

export interface PaymentComplete {
    success: boolean;
    message: string;
    payment: Payment;
    reservation: Reservation;
}
