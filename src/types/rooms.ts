// src/types/room.ts

export interface ApiResponse {
    success: boolean;
    message?: string;
    data: {
        items: RoomData[];
        total?: number;
        page?: number;
        size?: number;
    };
}

export interface RoomOperationHour {
    day_of_week: number;
    is_open: boolean;
    open_time?: string;
    close_time?: string;
}

export interface BlockedDate {
    start_date: string;
    end_date: string;
    block_type: string;
    reason?: string;
}

export interface Reservation {
    check_in_date: string;
    check_out_date: string;
    status: string;
}

export interface UnavailableDates {
    blocked_dates: BlockedDate[];
    reservations: Reservation[];
    operation_hours: RoomOperationHour[];
}

export interface Host {
    name: string;
    profile_image?: string;
}

export interface RoomData {
    id: number;
    title: string;
    address?: string;
    address_detail?: string;
    coordinate_long?: number;
    coordinate_lat?: number;
    thumbnail_url?: string;
    detail_urls?: string[];
    created_at?: Date;
    updated_at?: Date;
    room_type: string;

    // 숙소 기본 정보 추가
    accommodation_type?: string;
    short_description?: string;

    // 건물 정보 추가
    building_type?: string;
    floor_area?: number;
    floor?: number;
    has_elevator: boolean;
    has_parking: boolean;

    // 예약 관련 추가
    is_auto_accepted: boolean;
    refund_policy?: string;

    // 기존 가격 정보
    hour_enabled: boolean;
    hour_price?: number;
    min_hours?: number;
    day_enabled: boolean;
    day_price?: number;
    min_days?: number;
    week_enabled: boolean;
    week_price?: number;
    month_enabled: boolean;
    min_weeks?: number;
    maintenance_fee?: number;
    maintenance_fee_week?: number;
    cleaning_fee?: number;
    cleaning_fee_week?: number;
    cleaning_fee_month?: number;
    deposit?: number;
    deposit_week?: number;
    cleaning_time: number;
    breakfast_service: string;
    checkin_service: string;

    //월 가격 추가
    month_price?: number;
    deposit_month?: number;
    maintenance_fee_month?: number;

    // 상세 정보
    description?: string;
    transportation_info?: string;
    room_structure?: string;
    room_count?: number;
    bathroom_count?: number;
    max_guests?: number;
    check_in_time?: string;
    check_out_time?: string;
    facilities?: Record<string, any>;
    room_size?: number;
    bed_configs?: Record<string, any>;
    amenities?: Record<string, any>;
    features?: Record<string, any>;
    tags?: string[];
    prohibitions?: string[];
    house_rules?: string;
    additional_facilities?: Record<string, any>;
    refund_policy_rules?: RefundPolicyRule;
    // 인증 관련 추가
    business_license_url?: string;
    is_verified: boolean;
    verified_at?: Date;

    is_confirmed?: boolean;
    is_active?: boolean;
    is_rejected?: boolean;
    is_deleted: boolean;
    host_id?: number;
    unavailable_dates: UnavailableDates;
    discounts?: Discounts[];
    reviews?: any[];
    host: Host;
    host_name: string;
    host_profile_image?: string;

    is_favorite: boolean;
    currency: string;
    //추가된 필드
    symbol: string;

    //사업자정보 및 사진들
    business_number?: string;
    business_name?: string;
    business_representative?: string;
    business_address?: string;
    business_additionalAddress?: string;
    business_licenseNumber?: string;
    business_licenseFile?: File | null;
    business_identificationFile?: File | null;
    business_licenseType?: string;
}

export interface RoomFormData {
    detail: {
        checkin_service: string;
        breakfast_service: string;
        description: string;
        transportation_info: string;
        house_rules: string;
        room_structure: string;
        room_count: number;
        bathroom_count: number;
        floor: number;
        floor_area: number;
        max_guests: number;
        check_in_time: string;
        check_out_time: string;
        facilities: Record<string, string>;
        additional_facilities: Record<string, string>;
        tags: string[];
        prohibitions: string[];
    };

    room_type: string;
    title: string;
    address: string;
    address_detail: string;
    detail_urls: File[];
    has_elevator: boolean;
    has_parking: boolean;
    building_type: string;
    week_enabled: boolean;
    month_enabled: boolean;
    week_price: number;
    deposit_week: number;
    maintenance_fee_week: number;
    month_price: number;
    deposit_month: number;
    maintenance_fee_month: number;
    discounts: Discounts[];
    is_auto_accepted: boolean;
    refund_policy: string;

    //사업자정보 및 사진들
    business_number: string;
    business_name: string;
    business_representative: string;
    business_address: string;
    business_additionalAddress: string;
    business_licenseNumber: string;
    business_licenseFile: File | null;
    business_identificationFile: File | null;
    business_licenseType: string;
}

export interface RefundPolicyRule {
    after_checkin : number,
    before_24h: number,
    within_24h: number,

}
export interface Schedules {
    date: Date;
    dayPrice: number | null;
    isAvailable: boolean;
    description: string;
    reason: string;
    isBlocked: string;
}

export interface Guest {
    name: string,
    email: string,
    phone?: string,
}

export interface ReservationHistory {
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
    request_fee_refund_amount: number;
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
    room: RoomData;
    //추가된 필드
    symbol: string;
    maintenance_per_unit: number,
    price_per_unit: number,


}

export interface MyReservationHistory {
    reservation: {
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
    },
    room: RoomData;
}

export interface Discounts {
    type: string,
    days: number,
    percentage: number,
}

// 업로드할 이미지 파일 정보를 위한 인터페이스 선언
export interface ImageItem {
    file: File;
    previewUrl: string;
}