import { http, HttpResponse } from 'msw'

// 모킹 데이터 - 여러 개의 숙소 데이터
const mockRoomsData = [
    {
        accommodation_type: "일/주/월 단위 단기임대 공간",
        additional_facilities: {},
        address: "서울 서대문구 신촌로",
        address_detail: "100-115",
        amenities: null,
        bathroom_count: 1,
        bed_configs: null,
        breakfast_service: "",
        building_type: "아파트",
        business_license_url: null,
        check_in_time: "15:00",
        check_out_time: "11:00",
        checkin_service: "",
        cleaning_fee: 0,
        cleaning_fee_month: 0,
        cleaning_fee_week: 50000,
        cleaning_time: 60,
        coordinate_lat: 37.5562107,
        coordinate_long: 126.9393157,
        created_at: "2025-06-09T02:37:54.006Z",
        currency: "KRW",
        day_enabled: false,
        day_price: 0,
        deposit: 0,
        deposit_month: 0,
        deposit_week: 300000,
        description: "오래된 아파트지만 제가 혼자 살았던곳이라 깔끔한 공간을 대여합니다~\n\n혼자 또는 둘이서 여행하기 좋은곳\n무료주차가능(4주이상등록)\n서울과 가깝고 역과 가까워 어디든 출발~\n한달살기 추천합니다",
        detail_urls: [
            '/assets/images/room/img1.jpg',
            '/assets/images/room/img2.jpg',
            '/assets/images/room/img3.jpg',
            '/assets/images/room/img4.jpg',
            '/assets/images/room/img5.jpg',
            '/assets/images/room/img6.jpg',
        ],
        discounts: [
            {type: 'weekly', days: 7, percentage: 0},
            {type: 'weekly', days: 28, percentage: 5},
            {type: 'weekly', days: 84, percentage: 10}
        ],
        facilities: {
            wifi: '와이파이',
            kitchen: '주방',
            washing_machine: '세탁기',
            ac_unit: '에어컨'
        },
        favorites: false,
        features: {},
        floor: 4,
        floor_area: 16,
        has_elevator: true,
        has_parking: true,
        host: {
            name: 'admin',
            profile_image: null
        },
        host_id: 1,
        hour_enabled: false,
        hour_price: 0,
        house_rules: "* 입주는 비대면 입니다\n* 입주 확정될시 안내 문자 드립니다\n* 사랑스런 애완동물은 입주불가입니다\n* 성인 최대 2인 투숙가능입니다\n(1인추가시 1박당 2만원추가)\n* 전입불가입니다\n* 전구역 금연입니다\n* 임차인은 선관의무와 원상복구의 책임이 있으며 입주상태 그대로 퇴거해주셔야합니다",
        id: 1,
        is_active: true,
        is_auto_accepted: false,
        is_confirmed: true,
        is_deleted: false,
        is_favorite: false,
        is_rejected: false,
        is_verified: false,
        maintenance_explanation: "",
        maintenance_fee: 0,
        maintenance_fee_month: 0,
        maintenance_fee_week: 70000,
        max_guests: 2,
        min_days: 1,
        min_hours: null,
        min_weeks: 1,
        month_enabled: false,
        month_price: 0,
        prohibitions: ['반려동물 금지', '파티 금지', '흡연 금지', '추가 인원 금지'],
        refund_policy: "엄격한 환불 정책\\n• 체크인 7일 전까지 50% 환불\\n• 체크인 7일 전까지: 50% 환불\\n• 체크인 7일 전 ~ 당일: 환불 불가\\n• 체크인 이후: 환불 불가",
        reviews: [],
        room_count: 2,
        room_structure: "투룸",
        room_type: "LEASE",
        short_description: "",
        symbol: "₩",
        tags: [],
        thumbnail_url: null,
        title: "test방",
        transportation_info: "역 도보 5분\n롯데마트 도보 2분",
        unavailable_dates: {
            blocked_dates: [],
            reservations: [],
            custom_schedules: []
        },
        updated_at: "2025-06-16T21:56:33.127Z",
        verified_at: null,
        week_enabled: true,
        week_price: 280000
    },
    {
        accommodation_type: "일/주/월 단위 단기임대 공간",
        additional_facilities: {},
        address: "서울 마포구 신촌로",
        address_detail: "100-115",
        amenities: null,
        bathroom_count: 1,
        bed_configs: null,
        breakfast_service: "",
        building_type: "아파트",
        business_license_url: null,
        check_in_time: "15:00",
        check_out_time: "11:00",
        checkin_service: "",
        cleaning_fee: 0,
        cleaning_fee_month: 0,
        cleaning_fee_week: 50000,
        cleaning_time: 60,
        coordinate_lat: 37.5562333,
        coordinate_long: 126.9421377,
        created_at: "2025-06-09T02:37:54.006Z",
        currency: "KRW",
        day_enabled: false,
        day_price: 0,
        deposit: 0,
        deposit_month: 0,
        deposit_week: 300000,
        description: "오래된 아파트지만 제가 혼자 살았던곳이라 깔끔한 공간을 대여합니다~\n\n혼자 또는 둘이서 여행하기 좋은곳\n무료주차가능(4주이상등록)\n서울과 가깝고 역과 가까워 어디든 출발~\n한달살기 추천합니다",
        detail_urls: [
            '/assets/images/room/img1.jpg',
            '/assets/images/room/img2.jpg',
            '/assets/images/room/img3.jpg',
            '/assets/images/room/img4.jpg',
            '/assets/images/room/img5.jpg',
            '/assets/images/room/img6.jpg',
        ],
        discounts: [
            {type: 'weekly', days: 7, percentage: 0},
            {type: 'weekly', days: 28, percentage: 5},
            {type: 'weekly', days: 84, percentage: 10}
        ],
        facilities: {
            wifi: '와이파이',
            kitchen: '주방',
            washing_machine: '세탁기',
            ac_unit: '에어컨'
        },
        favorites: false,
        features: {},
        floor: 4,
        floor_area: 16,
        has_elevator: true,
        has_parking: true,
        host: {
            name: 'admin',
            profile_image: null
        },
        host_id: 1,
        hour_enabled: false,
        hour_price: 0,
        house_rules: "* 입주는 비대면 입니다\n* 입주 확정될시 안내 문자 드립니다\n* 사랑스런 애완동물은 입주불가입니다\n* 성인 최대 2인 투숙가능입니다\n(1인추가시 1박당 2만원추가)\n* 전입불가입니다\n* 전구역 금연입니다\n* 임차인은 선관의무와 원상복구의 책임이 있으며 입주상태 그대로 퇴거해주셔야합니다",
        id: 2,
        is_active: true,
        is_auto_accepted: false,
        is_confirmed: true,
        is_deleted: false,
        is_favorite: false,
        is_rejected: false,
        is_verified: false,
        maintenance_explanation: "",
        maintenance_fee: 0,
        maintenance_fee_month: 0,
        maintenance_fee_week: 70000,
        max_guests: 2,
        min_days: 1,
        min_hours: null,
        min_weeks: 1,
        month_enabled: false,
        month_price: 0,
        prohibitions: ['반려동물 금지', '파티 금지', '흡연 금지', '추가 인원 금지'],
        refund_policy: "엄격한 환불 정책\\n• 체크인 7일 전까지 50% 환불\\n• 체크인 7일 전까지: 50% 환불\\n• 체크인 7일 전 ~ 당일: 환불 불가\\n• 체크인 이후: 환불 불가",
        reviews: [],
        room_count: 2,
        room_structure: "투룸",
        room_type: "LEASE",
        short_description: "",
        symbol: "₩",
        tags: [],
        thumbnail_url: null,
        title: "test방",
        transportation_info: "역 도보 5분\n롯데마트 도보 2분",
        unavailable_dates: {
            blocked_dates: [],
            reservations: [],
            custom_schedules: []
        },
        updated_at: "2025-06-16T21:56:33.127Z",
        verified_at: null,
        week_enabled: true,
        week_price: 280000
    },
    {
        accommodation_type: "일/주/월 단위 단기임대 공간",
        additional_facilities: {},
        address: "서울 용산구 한강대로",
        address_detail: "100-115",
        amenities: null,
        bathroom_count: 1,
        bed_configs: null,
        breakfast_service: "",
        building_type: "아파트",
        business_license_url: null,
        check_in_time: "15:00",
        check_out_time: "11:00",
        checkin_service: "",
        cleaning_fee: 0,
        cleaning_fee_month: 0,
        cleaning_fee_week: 50000,
        cleaning_time: 60,
        coordinate_lat: 37.5511247,
        coordinate_long: 126.9729133,
        created_at: "2025-06-09T02:37:54.006Z",
        currency: "KRW",
        day_enabled: false,
        day_price: 0,
        deposit: 0,
        deposit_month: 0,
        deposit_week: 300000,
        description: "오래된 아파트지만 제가 혼자 살았던곳이라 깔끔한 공간을 대여합니다~\n\n혼자 또는 둘이서 여행하기 좋은곳\n무료주차가능(4주이상등록)\n서울과 가깝고 역과 가까워 어디든 출발~\n한달살기 추천합니다",
        detail_urls: [
            '/assets/images/room/img1.jpg',
            '/assets/images/room/img2.jpg',
            '/assets/images/room/img3.jpg',
            '/assets/images/room/img4.jpg',
            '/assets/images/room/img5.jpg',
            '/assets/images/room/img6.jpg',
        ],
        discounts: [
            {type: 'weekly', days: 7, percentage: 0},
            {type: 'weekly', days: 28, percentage: 5},
            {type: 'weekly', days: 84, percentage: 10}
        ],
        facilities: {
            wifi: '와이파이',
            kitchen: '주방',
            washing_machine: '세탁기',
            ac_unit: '에어컨'
        },
        favorites: false,
        features: {},
        floor: 4,
        floor_area: 16,
        has_elevator: true,
        has_parking: true,
        host: {
            name: 'admin',
            profile_image: null
        },
        host_id: 1,
        hour_enabled: false,
        hour_price: 0,
        house_rules: "* 입주는 비대면 입니다\n* 입주 확정될시 안내 문자 드립니다\n* 사랑스런 애완동물은 입주불가입니다\n* 성인 최대 2인 투숙가능입니다\n(1인추가시 1박당 2만원추가)\n* 전입불가입니다\n* 전구역 금연입니다\n* 임차인은 선관의무와 원상복구의 책임이 있으며 입주상태 그대로 퇴거해주셔야합니다",
        id: 3,
        is_active: true,
        is_auto_accepted: false,
        is_confirmed: true,
        is_deleted: false,
        is_favorite: false,
        is_rejected: false,
        is_verified: false,
        maintenance_explanation: "",
        maintenance_fee: 0,
        maintenance_fee_month: 0,
        maintenance_fee_week: 70000,
        max_guests: 2,
        min_days: 1,
        min_hours: null,
        min_weeks: 1,
        month_enabled: false,
        month_price: 0,
        prohibitions: ['반려동물 금지', '파티 금지', '흡연 금지', '추가 인원 금지'],
        refund_policy: "엄격한 환불 정책\\n• 체크인 7일 전까지 50% 환불\\n• 체크인 7일 전까지: 50% 환불\\n• 체크인 7일 전 ~ 당일: 환불 불가\\n• 체크인 이후: 환불 불가",
        reviews: [],
        room_count: 2,
        room_structure: "투룸",
        room_type: "LEASE",
        short_description: "",
        symbol: "₩",
        tags: [],
        thumbnail_url: null,
        title: "test방",
        transportation_info: "역 도보 5분\n롯데마트 도보 2분",
        unavailable_dates: {
            blocked_dates: [],
            reservations: [],
            custom_schedules: []
        },
        updated_at: "2025-06-16T21:56:33.127Z",
        verified_at: null,
        week_enabled: true,
        week_price: 280000
    },
];

// 모킹 데이터 - 유저
const mockUserData = {
    "id": 1,
    "name": "ddj82",
    "email": "test@test.com",
    "profile_image": null,
    "isHost": true,
    "phone": null,
    "gender": "MALE",
    "account": null,
    "bank": null,
    "bank_holder": null,
    "language": "ko",
    "accept_alert": true,
    "accept_email": false,
    "accept_SMS": false,
    "currency": "KRW",
    "is_korean": true
};

export const handlers = [
    // 메인 방 데이터 조회 모킹
    http.get('/rooms', ({ request }) => {
        // URL 파라미터들 추출
        const url = new URL(request.url);
        const swLat = url.searchParams.get('swLat');
        const swLng = url.searchParams.get('swLng');
        const neLat = url.searchParams.get('neLat');
        const neLng = url.searchParams.get('neLng');
        const locale = url.searchParams.get('locale');
        const currency = url.searchParams.get('currency');

        // 인증 토큰 체크 (필요하면)
        const authHeader = request.headers.get('Authorization');
        const hasAuth = !!authHeader;

        console.log('MSW: rooms API 호출됨', {
            swLat, swLng, neLat, neLng, locale, currency, hasAuth
        });

        // 응답 반환 (HttpResponse 사용)
        return HttpResponse.json({
            success: true,
            data: {
                items: mockRoomsData  // ← 이렇게 items 배열로 감싸기
            },
            total: mockRoomsData.length,
            message: "숙소 목록을 성공적으로 가져왔습니다."
        }, {
            status: 200,
            // 0.5초 지연으로 실제 API 느낌 연출 (필요하면)
            // delay: 500
        });
    }),

    // 방 상세 조회 API 모킹
    http.get('/rooms/:id', ({ request, params }) => {
        const { id } = params;
        const url = new URL(request.url);
        const locale = url.searchParams.get('locale');
        const currency = url.searchParams.get('currency');

        console.log('MSW: room 상세 조회 API 호출됨', {
            roomId: id,
            locale,
            currency
        });

        // ID로 방 찾기
        const room = mockRoomsData.find(room => room.id === Number(id));

        if (!room) {
            return HttpResponse.json({
                success: false,
                message: "해당 숙소를 찾을 수 없습니다.",
                data: null
            }, {
                status: 404
            });
        }

        // 성공 응답
        return HttpResponse.json({
            success: true,
            data: room,  // 단일 방 객체 반환
            message: "숙소 정보를 성공적으로 가져왔습니다."
        }, {
            status: 200
        });
    }),

    // 로그인 API 모킹
    http.post('/users/login', async ({request}) => {
        // POST 요청 body 데이터 추출
        const requestBody = await request.json();
        const { email, password } = requestBody;
        console.log('MSW: 로그인 API 호출됨', {
            email,
            password
        });

        // 가짜 JWT 토큰 생성
        const mockToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;

        return HttpResponse.json({
            message: "로그인에 성공했습니다.",
            statusCode: 200,
            success: true,
            data: mockUserData,
        }, {
            status: 200,
            headers: {
                'Authorization': mockToken,  // 응답 헤더에 토큰 추가
                'Content-Type': 'application/json'
            }
        });
    }),

    // 소셜 로그인 중복 확인 API 모킹
    http.post('/users/validate', async ({ request }) => {
        // POST 요청 body 데이터 추출
        const requestBody = await request.json();
        const { channel_uid, channel } = requestBody;

        console.log('MSW: 소셜 로그인 중복 확인 API 호출됨', {
            channel_uid,
            channel
        });

        // Mock에서는 항상 가입된 계정으로 응답 (200)
        return HttpResponse.json({
            message: "User already exists",
            statusCode: 200
        }, {
            status: 200
        });
    }),

    // 소셜 로그인 API 모킹
    http.post('/users/channel/login', async ({request}) => {
        // POST 요청 body 데이터 추출
        const requestBody = await request.json();
        const { channel_uid, channel } = requestBody;
        console.log('MSW: 소셜 로그인 API 호출됨', {
            channel_uid,
            channel
        });

        // 가짜 JWT 토큰 생성
        const mockToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;

        return HttpResponse.json({
            message: "로그인에 성공했습니다.",
            statusCode: 200,
            success: true,
            data: mockUserData,
        }, {
            status: 200,
            headers: {
                'Authorization': mockToken,  // 응답 헤더에 토큰 추가
                'Content-Type': 'application/json'
            }
        });
    }),
];