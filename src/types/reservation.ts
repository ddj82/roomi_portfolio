import {Guest} from "./rooms";

export interface Reservation {
    checkIn: string;
    checkOut: string;
    selectionMode: string;
    roomId: number;
    unit: number;
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    totalGuests: number;
    currency: string;
}

export interface MyReservation {
    id: number;
    room_id: number;
    order_id: string;
    selection_mode: string; // "weekly", "monthly", etc.
    check_in_date: Date;
    check_out_date: Date;
    status: string; // "CONFIRMED", etc.
    payment_status: string; // "PAID", "UNPAID", etc.
    total_price: number;
    price: number; // Base price
    maintenance_fee: number;
    deposit: number;
    unit: number;
    is_reviewed: boolean | null;
    guest_count: number;
    is_checkout_requested: boolean;
    checkout_requested_at: Date;
    request_fee_refund_amount: string;
    request_fee_refund_reason: string;
    guest_accepted_fee: boolean;
    fee: number;
    created_at: Date;
    currency: string; // "JPY", etc.
    is_deposit_returned: boolean;
    refunded_amount: number;
    yen_price?: number;
    dollar_price?: number;
    guest: Guest;
    //추가된 필드
    symbol: string;
    maintenance_per_unit: number,
    price_per_unit: number,
    //예약자 정보
    guest_name : string,
    guest_phone : string,
    guest_email : string
}