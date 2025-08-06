// api.tsx
import i18n from "src/i18n";
import {RoomFormData, Schedules} from "../types/rooms";
import {User} from "../types/user";
import {Reservation} from "../types/reservation";
import axios from "axios";
import qs from "qs";
import exp from "node:constants";

const BASE_URL = 'https://roomi.co.kr/api';

// 로컬 스토리지에서 인증 토큰 가져오기
const getAuthToken = () => {
    try {
        return localStorage.getItem('authToken');
    } catch (error) {
        console.error('토큰을 가져오는 중 오류 발생(api.tsx):', error);
        return null;
    }
};

// 요청 메소드
/*
* 공용 request 메소드 매개 변수
* 1. url 패턴
* 2. 로그인 확인
* 3. 데이터 전송 방식
* 4. 데이터
* 5. 언어 감지 확인
* */
const request = async (endpoint: string, requireAuth: boolean = true, method: string = 'GET', data?: any, requireLocale: boolean = false) => {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (requireAuth) {
            const token = getAuthToken();
            if (token) {
                headers['Authorization'] = `${token}`; // Bearer token 추가
            } else {
                throw new Error('인증 토큰이 필요합니다.');
            }
        }

        let API_URL = BASE_URL + `${endpoint}`;
        if (requireLocale) {
            const locale = i18n.language; // 현재 언어 감지
            API_URL = API_URL + `?locale=${locale}`;
        }

        const response = await fetch(`${API_URL}`, {
            method: method,
            headers: headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        return response;
    } catch (error) {
        console.error(`API 요청 실패(request): ${endpoint}`, error);
        throw error;  // 전체 오류를 전달
    }
};

// 회원가입 API
export const createUser = async (formData: User) => {
    return request(`/users/signUp`, false, 'POST', formData);
};

// 로그인 API
export const login = async (email: string, password: string, setAuthToken: (token: string | null) => void) => {
    try {
        const response = await request('/users/login', false, 'POST', {
            "email": email,
            "password": password,
        });
        const token = response.headers.get('Authorization'); // 응답에서 토큰 추출
        console.log('토큰:', token);
        if (token) {
            localStorage.setItem('authToken', token); // 토큰 저장
            setAuthToken(token); // 전역 상태 업데이트
        } else {
            throw new Error('토큰을 찾을 수 없습니다.');
        }

        const data = await response.json();
        if (data.success) {
            console.log('사용자 정보:', data.data);
            localStorage.setItem('userId', data.data.id);
            localStorage.setItem('userEmail', data.data.email);
            localStorage.setItem('userName', data.data.name);
            localStorage.setItem('userIsHost', data.data.isHost);
            localStorage.setItem('isKorean', data.data.is_korean);
            if (data.data.profile_image === null) {
                localStorage.setItem('userProfileImg', '/assets/images/profile.png');
            } else {
                localStorage.setItem('userProfileImg', data.data.profile_image);
            }
            localStorage.setItem('userCurrency', data.data.currency);

            const { accept_SMS, accept_alert, accept_email } = data.data;
            localStorage.setItem('accept_SMS', accept_SMS ? '1' : '0');
            localStorage.setItem('accept_alert', accept_alert ? '1' : '0');
            localStorage.setItem('accept_email', accept_email ? '1' : '0');

            // DB에서 받아온 언어 적용
            localStorage.setItem('i18nextLng', data.data.language);
            await i18n.changeLanguage(data.data.language);
        } else {
            console.error('로그인 실패:', data.message);
        }

        return response; // 로그인 응답 데이터를 반환
    } catch (error) {
        console.error('로그인 실패(api.tsx):', error);
        throw error;  // 전체 오류를 전달
    }
};

// 소셜 로그인 API
export const channelLogin = async (channel_uid: string, channel: string, setAuthToken: (token: string | null) => void) => {
    try {
        const response = await request(`/users/channel/login`, false, 'POST', {
            'channel_uid': channel_uid,
            'channel': channel,
        });
        const token = response.headers.get('Authorization'); // 응답에서 토큰 추출
        // console.log('토큰:', token); 토큰 로그
        if (token) {
            localStorage.setItem('authToken', token); // 토큰 저장
            setAuthToken(token); // 전역 상태 업데이트
        } else {
            throw new Error('토큰을 찾을 수 없습니다.');
        }

        const data = await response.json();

        if (data.success) {
            // console.log('사용자 정보:', data.data); 사용자 정보 로그
            localStorage.setItem('userId', data.data.id);
            localStorage.setItem('userEmail', data.data.email);
            localStorage.setItem('userName', data.data.name);
            localStorage.setItem('userIsHost', data.data.isHost);
            localStorage.setItem('isKorean', data.data.is_korean);
            if (data.data.profile_image === null) {
                localStorage.setItem('userProfileImg', '/assets/images/profile.png');
            } else {
                localStorage.setItem('userProfileImg', data.data.profile_image);
            }
            localStorage.setItem('userCurrency', data.data.currency);

            const { accept_SMS, accept_alert, accept_email } = data.data;
            localStorage.setItem('accept_SMS', accept_SMS ? '1' : '0');
            localStorage.setItem('accept_alert', accept_alert ? '1' : '0');
            localStorage.setItem('accept_email', accept_email ? '1' : '0');

            // DB에서 받아온 언어 적용
            localStorage.setItem('i18nextLng', data.data.language);
            await i18n.changeLanguage(data.data.language);
        } else {
            console.error('로그인 실패:', data.message);
        }

        return response; // 로그인 응답 데이터를 반환
    } catch (error) {
        console.error('로그인 실패(api.tsx):', error);
        throw error;  // 전체 오류를 전달
    }
};

// 소셜 로그인 중복 확인 API
export const validateUser = async (channel_uid: string, channel: string) => {
    const response = await request(`/users/validate`, false, 'POST', {
        'channel_uid': channel_uid,
        'channel': channel,
    });
    const responseJson = await response.json();
    return responseJson.statusCode;
};

// 로그아웃
export const logout = async () => {
    try {
        localStorage.removeItem('authToken'); // 토큰 제거
        localStorage.removeItem('userId'); // 유저 정보 제거
        localStorage.removeItem('userName'); // 유저 정보 제거
        localStorage.removeItem('userEmail'); // 유저 정보 제거
        localStorage.removeItem('userIsHost'); // 유저 정보 제거
        localStorage.removeItem('userProfileImg'); // 유저 정보 제거
        localStorage.removeItem('hostMode');
        localStorage.removeItem('i18nextLng');
        localStorage.removeItem('accept_SMS');
        localStorage.removeItem('accept_alert');
        localStorage.removeItem('accept_email');
        localStorage.removeItem('userCurrency');
        localStorage.removeItem('authMode'); // 소셜 로그인 플래그 제거
        localStorage.removeItem('kakaoToken'); // 카카오 토큰 제거
        localStorage.removeItem('isKorean');

        const detectedLang = i18n.services.languageDetector?.detect();
        console.log('detectedLang:', detectedLang);
        i18n.changeLanguage(detectedLang || 'ko');
        return '로그아웃 성공';
    } catch (error) {
        console.error('로그아웃 실패:', error);
        return '로그아웃 실패';
    }
};

// 본인 인증(여권 인증) 여부(identity_verified) 확인 API
export const checkIdentification = async () => {
    return request(`/users/identification/metamap`, true);
}

// 본인 인증(import) 완료 후 identity_verified 처리 API
export const uploadIdentification = async (impUid: string) => {
    return request(`/users/update/identification?imp_uid=${impUid}`, true, 'PUT');
};

// 메인 화면 방 조회 API
export const mainRoomData = async (swY: number, swX: number, neY: number, neX: number, currentLocale: string) => {
    const authToken = !!localStorage.getItem("authToken");
    const currency = localStorage.getItem("userCurrency") ?? "KRW"; // 임시로 KRW

    if (authToken) {
        return request(`/rooms?swLat=${swY}&swLng=${swX}&neLat=${neY}&neLng=${neX}&locale=${currentLocale}&currency=${currency}`, true);
    } else {
        return request(`/rooms?swLat=${swY}&swLng=${swX}&neLat=${neY}&neLng=${neX}&locale=${currentLocale}&currency=${currency}`, false);
    }
};

// 방 조회 API
// export const roomData = async () => {
//
// };

// 방 조회 API
export const fetchRoomData = async (id: number) => {
    const locale = i18n.language;
    const currency = localStorage.getItem("userCurrency") ?? "KRW";
    console.log('locale', locale);
    console.log('currency', currency);
    return request(`/rooms/${id}?&locale=${locale}&currency=${currency}`, false, 'GET', undefined);
};

// host 등록 동의 API
export const termsOfUse = async () => {
    return request(`/policies/terms-of-use`, true);
};

// host 등록 API
export const be_host = async (hostModeAgreeForm: {
    bank: string;
    bank_holder: string;
    host_type: string;
    account: string
}) => {
    try {
        const response = await request(`/users/be_host`, true, 'POST', {
            ...hostModeAgreeForm,
        });
        if (response.ok) {
            localStorage.setItem('userIsHost', 'true');
            return response.ok;
        }
    } catch (error) {
        console.error('호스트 등록 실패:', error);
        return false;
    }
};

// 호스트모드 나의 방 API
export const myRoomList = async () => {
    return request(`/rooms/my/list`, true, 'GET', undefined, true);
};
// 호스트모드 계약 관리 API
export const myContractList = async () => {
    return request(`/rooms/host/history`, true, 'GET', undefined, true);
};

// 방 사용 불가 처리 API
export const createBulkBlocks = async (id: number, schedulesData: Schedules[]) => {
    return request(`/rooms/schedule/bulk`, true, 'POST', {
        'roomId': id,
        'schedules': schedulesData,
    });
};

// 방 언블락 처리 API
export const unblockDate = async (id: number, date: string) => {
    return request(`/rooms/schedule/unblock`, true, 'POST', {
        'roomId': id,
        'date': date,
    });
};

// 메일-인증 메일 전송 API
export const sendVerificationEmail = async (email: string, code: string) => {
    console.log('api.tsx에서 받은 변수 :', email, code);
    return request(`/email`, false, 'POST', {
        'recipient': email,
        'code': code,
    });
};

// 메일-인증 번호 확인 API
export const getValidationCode = async (email: string) => {
    return request(`/email`, false, 'PUT', {
        'recipient': email,
    });
};

// 찜 추가 API
export const addFavoriteRoom = async (roomId: number) => {
    return request(`/rooms/favorite/${roomId}`, true, 'POST');
};
// 찜 제거 API
export const deleteFavoriteRoom = async (roomId: number) => {
    return request(`/rooms/favorite/${roomId}`, true, 'DELETE');
};
// 찜 목록 API
export const getRoomFavoriteList = async () => {
    return request(`/rooms/favorite/list`, true, 'GET', undefined,true);
};

// 최근 본 방 추가 API
export const addRoomHistory = async (roomId: number) => {
    return request(`/rooms/history/${roomId}`, true, 'POST');
};
// 최근 본 방 목록 API
export const getRoomHistoryList = async () => {
    return request(`/rooms/history/list`, true, 'GET', undefined,true);
};

// 유저 정보 수정 API
export const updateUserInfo = async (updateUserData: Partial<User>, file: File | null) => {
    // 파일이 있으면 FormData 로 보냄
    if (file) {
        const formData = new FormData();
        // updateUserData 필드들 추가
        Object.entries(updateUserData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });
        // 파일 필드명은 백엔드 @UploadedFiles() 와 맞춰서 'files' 로
        formData.append('files', file);

        const token = getAuthToken();
        let API_URL = BASE_URL + `/users/update/info`;
        const response = await fetch(API_URL, {
            method: "PUT",
            headers: {
                Authorization: token ?? "",
            },
            body: formData,
        });

        const responseJson = await response.json();
        localStorage.setItem('userProfileImg', responseJson.data.profile_image);
        console.log('유저정보변경 리스폰스', response);
        console.log('유저정보변경 리스폰스 제이슨', responseJson);

        return response;
    }

    const response = await request(`/users/update/info`, true, 'PUT', {
        ...updateUserData,
    });

    console.log('유저정보변경 리스폰스', response);

    // 파일이 없으면 JSON
    return response;
};

// 유저 언어 코드 변경 API
export const updateLanguage = async (langCode: string) => {
    return request(`/users/lang?language=${langCode}`, true, 'POST');
};

// 유저 알림 설정 API
export const acceptions = async (alert: boolean, SMS: boolean, email: boolean) => {
    try {
        const response = await request(
            `/users/accept?accept_alert=${alert}&accept_SMS=${SMS}&accept_email=${email}`,
            true,
            'POST'
        );
        if (response.ok) {
            localStorage.setItem('accept_alert', alert ? '1' : '0');
            localStorage.setItem('accept_SMS', SMS ? '1' : '0');
            localStorage.setItem('accept_email', email ? '1' : '0');
            return response;
        }
    } catch (error) {
        console.error('유저 알림 설정 실패:', error);
        return undefined;
    }
};

// 유저 공지사항 목록 API
export const getNotices = async () => {
    return request(`/notices`, true, 'GET', undefined, true);
};

// 예약하기 API (결제 전 서버 저장)
export const bookReservation = async (reservation: Reservation) => {
    return request(
        `/book`,
        true,
        'POST',
        {
            ...reservation,
        },
        true
    );
};
export const getReservation = async (reservationId: number) => {
    return request(
        `/book/reservation?reservationId=${reservationId}`,
        true,
        'GET'

    );
};
// 게스트 예약내역 API
export const getReservationHistory = async () => {
    return request(`/rooms/my/history`, true, 'GET', undefined, true);
};

// 유저 내 정보 API
export const getUserById = async (userId: number) => {
    return request(`/users/${userId}`, true);
};

// 유저 통화 변경 API
export const updateCurrency = async (currency: string) => {
    return request(`/users/currency?currency=${currency}`, true, 'POST');
};

// 결제 완료 API
export const confirmPayment = async (paymentId: string, orderId: string) => {
    return request(`/payment/confirm`, true, 'POST', {
        paymentId: paymentId,
        reservationId: orderId,
    });
};

// 결제(또는 가상계좌 발급) 후 검증 API
export const verifyPayment = async (paymentId: string) => {
    return request(`/payment/verify`, true, 'POST', {
        paymentId: paymentId,
    });
};

// 가상계좌 발급 확인 API
export const getVirtualAccountInfo = async (paymentId: string) => {
    return request(`/payment/virtual-account`, true, 'POST', {
        paymentId: paymentId,
    });
}

// 호스트 방 추가 API
export const createRoom = async (roomFormData: RoomFormData, detailImageFiles: File[]) => {
    const formData = new FormData();

    const {
        business_licenseFile,
        business_identificationFile,
        ...rest
    } = roomFormData;

    let dataToSend = { ...rest };

    if (roomFormData.room_type === "LEASE") {
        // LEASE면 business 관련 필드 제거
        Object.keys(dataToSend).forEach((key) => {
            if (key.startsWith("business_")) {
                delete (dataToSend as any)[key];
            }
        });
    }

    // 1. JSON 데이터
    formData.append("data", JSON.stringify(dataToSend));

    // 2. detail_urls → 서버의 files 필드로
    detailImageFiles.forEach((file) => {
        formData.append("files", file);
    });

    if (roomFormData.room_type === "LODGE") {
        // 3. 사업자등록증 → 서버의 business_license
        if (business_licenseFile) {
            formData.append("business_license", business_licenseFile);
        }
        // 4. 신분증 사본 → 서버의 business_registration
        if (business_identificationFile) {
            formData.append("business_registration", business_identificationFile);
        }
    }

    const token = getAuthToken();
    let API_URL = BASE_URL + `/rooms`;
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            Authorization: token ?? "",
        },
        body: formData,
    });

    return response;
};

// 호스트 방 업데이트 API
export const updateRoom = async (roomId: number, roomFormData: RoomFormData, detailImageFiles: File[]) => {
    const formData = new FormData();

    const {
        business_licenseFile,
        business_identificationFile,
        ...rest
    } = roomFormData;

    let dataToSend = { ...rest, id: roomId }; // 업데이트 시 ID 포함

    if (roomFormData.room_type === "LEASE") {
        // LEASE면 business 관련 필드 제거
        Object.keys(dataToSend).forEach((key) => {
            if (key.startsWith("business_")) {
                delete (dataToSend as any)[key];
            }
        });
    }

    // 1. JSON 데이터
    formData.append("data", JSON.stringify(dataToSend));

    // 2. detail_urls → 서버의 files 필드로
    detailImageFiles.forEach((file) => {
        formData.append("files", file);
    });

    if (roomFormData.room_type === "LODGE") {
        // 3. 사업자등록증 → 서버의 business_license
        if (business_licenseFile) {
            formData.append("business_license", business_licenseFile);
        }
        // 4. 신분증 사본 → 서버의 business_registration
        if (business_identificationFile) {
            formData.append("business_registration", business_identificationFile);
        }
    }

    const token = getAuthToken();
    let API_URL = BASE_URL + `/rooms`; // PUT 요청은 같은 endpoint
    const response = await fetch(API_URL, {
        method: "PUT", // POST에서 PUT으로 변경
        headers: {
            Authorization: token ?? "",
        },
        body: formData,
    });

    return response;
};

// 예약내역 처리 API

// 예약취소(결제전)
export const confirmReservation = async (reservationId: string) => {
    return request(`/book?reservationId=${reservationId}`, true, 'DELETE');
};
// 일반 퇴실 신청
export const checkOut = async (reservationId: string) => {
    return request(`/book/checkout?reservationId=${reservationId}&type=normal`, true, 'PUT');
};
// 중도 퇴실 신청 [새로운 체크아웃 날짜로]
export const earlyCheckOut = async (reservationId: string,newCheckoutDate:Date) => {
    return request(`/book/early-checkout?reservationId=${reservationId}&type=early`, true, 'PUT',{
        newCheckoutDate : newCheckoutDate
    });
};
// 중도 퇴실 이용요금 금액 수락 [게스트 -> 호스트]
export const processPartialRefund = async (reservationId: string) => {
    return request(`/book/accept-fee?reservationId=${reservationId}&approved=true`, true, 'PUT');
};
//게스트 예약내역 (소프트) 삭제
export const guestSoftDeleteReservation = async (reservationId: number) => {
    return request(`/book/guest/delete?reservationId=${reservationId}`, true, 'DELETE');
};

//호스트 예약 정보 요청 API

//예약 수락
export const hostAcceptReservation = async (reservationId: number) => {
    return request(`/book/host/accept?reservationId=${reservationId}`, true, 'PUT');
};
//예약 거절
export const hostRejectReservation = async (reservationId: number) => {
    return request(`/book/host/reject?reservationId=${reservationId}`, true, 'PUT');
};


// 중도 퇴실 이용요금 환불 요청 [호스트 -> 게스트]
export const requestPartialRefundFee = async (reservationId: number,deductionAmount: number,reason : string) => {
    return request(`/book/host/deduction?reservationId=${reservationId}&deductionAmount=${deductionAmount ?? 0}&reason=${reason}`, true, 'PUT');
};
// 호스트 소프트 삭제
export const hostSoftDeleteReservation = async (reservationId: number) => {
    return request(`/book/host/delete?reservationId=${reservationId}`, true, 'DELETE');
};

// 고객센터 메일 전송 API
export const sendHelpMessage = async (sendEmailForm: { name: string; title: string; email: string; content: string }) => {
    return request(`/email/help`, false, 'POST', {
        ...sendEmailForm,
    });
};


