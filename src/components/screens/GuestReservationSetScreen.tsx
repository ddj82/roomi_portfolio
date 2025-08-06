import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {bookReservation} from "../../api/api";
import {MyReservationHistory, RoomData} from "../../types/rooms";
import {useTranslation} from "react-i18next";
import {useDateStore} from "../stores/DateStore";
import ImgCarousel from "../util/ImgCarousel";
import {useGuestsStore} from "../stores/GuestsStore";
import {LuCircleMinus, LuCirclePlus} from "react-icons/lu";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faChevronDown,
    faChevronUp,
    faEnvelope, faMapMarkerAlt,
    faPhone,
    faUser
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import {Reservation} from "../../types/reservation";

export default function GuestReservationSetScreen() {
    //동의항목
    const [isChecked1, setIsChecked1] = useState(true);
    const [isChecked2, setIsChecked2] = useState(true);
    const [isChecked3, setIsChecked3] = useState(true);
    //
    const {roomId, locale} = useParams(); // URL 파라미터 추출
    const [room, setRoom] = useState<RoomData | null>(null);
    const {t} = useTranslation();
    const {
        startDate,
        endDate,
        calUnit,
        weekValue,
        monthValue,} = useDateStore();
    const {guestCount, setGuestCount} = useGuestsStore();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        price = 0,
        depositPrice = 0,
        maintenancePrice = 0,
        feePrice = 0,
        // allOptionPrice = 0,
        thisRoom = null,
    } = location.state || {}; // state가 없는 경우 기본값 설정
    const [totalPrice, setTotalPrice] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
    });
    const [slideIsOpen, setSlideIsOpen] = useState(false);
    const [userCurrency, setUserCurrency] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        setRoom(thisRoom);
        handleNight();
        setUserCurrency(localStorage.getItem('userCurrency') ?? "");
        // 더미데이터
        formData.name = '진유진';
        formData.phone = '01012312312';
        formData.email = 'qweqwe@naver.com';
        setGuestCount(prev => 2);
    }, [roomId, locale]);

    const handleguestValue = (value : boolean) => {
        if (value) {
            // 플러스 버튼 클릭 시
            setGuestCount(prev => prev + 1);
        } else {
            // 마이너스 버튼 클릭 시
            if (guestCount === 1) return;
            setGuestCount(prev => prev - 1);
        }
    };

    const handleNight = () => {
        if (calUnit) {
            setTotalPrice(((price + maintenancePrice + feePrice) * monthValue) );
        } else {
            setTotalPrice(((price + maintenancePrice + feePrice) * weekValue) );
        }
    };


    // 입력값 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value, // id 속성을 key로 사용하여 동적으로 값 업데이트
        }));
    };

    const reservationBtn = async (): Promise<void> => {
        // 예약자 정보 유효성 검사
        const newErrors: { [key: string]: string } = {}; // 새로운 오류 객체

        // 예약자명 유효성 검사
        if (!formData.name.trim()) {
            newErrors.name = "예약자명을 입력하세요.";
        }

        // 전화번호 유효성 검사
        if (!formData.phone.trim()) {
            newErrors.phone = "전화번호를 입력하세요.";
        } else if (!/^\d{10,11}$/.test(formData.phone)) {
            newErrors.phone = "올바른 전화번호를 입력하세요.";
        }

        // 이메일 유효성 검사
        if (!formData.email.trim()) {
            newErrors.email = "이메일을 입력하세요.";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "올바른 이메일 형식을 입력하세요.";
        }

        // 오류가 있으면 상태 업데이트 후 진행 중지
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        // 오류가 없으면 다음 단계로 이동
        setErrors({}); // 오류 초기화

        console.log('유효성 통과',formData);

        let totalNight = weekValue; // 기본 주 단위로 초기화
        if (calUnit) {
            totalNight = monthValue; // 월 단위면 초기화
        }
        try {
            if (startDate && endDate) {
                const selectionMode = calUnit ? 'monthly' : 'weekly';
                const reservation: Reservation = {
                    checkIn: startDate,
                    checkOut: endDate,
                    selectionMode,
                    roomId: Number(roomId),
                    unit: totalNight,
                    guestName: formData.name,
                    guestPhone: formData.phone,
                    guestEmail: formData.email,
                    totalGuests: guestCount,
                    currency: userCurrency,
                };
                const response = await bookReservation(reservation);
                const responseJson = await response.json();

                if (responseJson.success && responseJson.data.reservation) {
                    const bookData = responseJson.data as MyReservationHistory;
                    console.log('예약 성공:', bookData);

                    // 자동 승인 여부에 따라 다른 처리
                    if (thisRoom.is_auto_accepted) {
                        // 자동 승인인 경우 결제 페이지로 이동
                        navigateToPayment(bookData);
                    } else {
                        // 자동 승인이 아닌 경우 예약 완료 페이지로 이동
                        showReservationCompleteModal(bookData);
                    }
                } else {
                    console.error('예약 응답 오류:', responseJson);
                    alert('예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
                }
            }
        } catch (e) {
            console.error('예약하기 실패:', e);
            alert('예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    // 결제 페이지로 이동하는 함수
    const navigateToPayment = (reservationInfo: MyReservationHistory): void => {
        // 결제 페이지로 이동
        navigate(`/detail/${roomId}/${locale}/reservation/payment`, {
            state: {
                price: Number(reservationInfo.reservation.price),
                depositPrice: Number(reservationInfo.reservation.deposit),
                maintenancePrice: Number(reservationInfo.reservation.maintenance_fee),
                fee: Number(reservationInfo.reservation.fee),
                totalPrice: Number(reservationInfo.reservation.total_price),
                totalNight: reservationInfo.reservation.unit,
                formData,
                thisRoom,
                bookData: {
                    reservation: reservationInfo.reservation,
                    room: reservationInfo.room,
                },
                JPY: reservationInfo.reservation.yen_price,
                USD: reservationInfo.reservation.dollar_price,
                unit: reservationInfo.reservation.unit,
                maintenancePerUnit: reservationInfo.reservation.maintenance_per_unit,
                pricePerUnit: reservationInfo.reservation.price_per_unit,
            },
        });
    };

    // 예약 완료 모달 표시 함수
    const showReservationCompleteModal = (reservationInfo: MyReservationHistory): void => {
        // 모달 표시 로직
        // 예시: 모달 컴포넌트 상태 업데이트 또는 모달 라이브러리 활용

        // 모달에서 확인 버튼 클릭 시 처리할 함수
        const handleConfirm = (): void => {
            // 예약 내역 페이지로 이동
            window.location.href = `/reservations/${reservationInfo.reservation.id}`;
        };

        // 모달에서 메인으로 돌아가기 버튼 클릭 시 처리할 함수
        const handleGoToMain = (): void => {
            window.location.href = '/';
        };

        // 여기서는 간단히 alert로 대체하고 예약 내역 페이지로 이동
        if (window.confirm('예약이 완료되었습니다. 예약 내역 페이지로 이동하시겠습니까?')) {
            handleConfirm();
        } else {
            handleGoToMain();
        }
    };

    useEffect(() => {
        if (slideIsOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        // 컴포넌트 언마운트 시 스크롤 복원
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [slideIsOpen]);

    return (
        <div className="my-8 relative overflow-visible max-w-[1200px] mx-auto pb-24 md:pb-0">
            {room ? (
                <div className="flex flex-col md:flex-row gap-8">
                    {/* 메인 콘텐츠 영역 */}
                    <div className="px-4 md:w-3/5 w-full">
                        <div className="mb-8 text-xl font-bold text-gray-800">{t("예약확인")}</div>
                        <div
                            className="flex flex-col md:flex-row md:p-6 border border-gray-200 rounded-xl shadow-sm mb-6 bg-white overflow-hidden">
                            <div className="md:w-3/5 overflow-hidden">
                                {room.detail_urls && room.detail_urls.length > 0 ? (
                                    <ImgCarousel
                                        images={room.detail_urls}
                                        customClass="rounded-xl h-72 md:h-64 object-cover"
                                    />
                                ) : (
                                    <img
                                        src="/default-image.jpg"
                                        alt="thumbnail"
                                        className="w-full h-72 md:h-64 object-cover rounded-xl"
                                    />
                                )}
                            </div>
                            <div className="w-full md:w-2/5 md:ml-6 p-4 flex flex-col justify-center">
                                <div className="text-xl font-semibold text-gray-800 my-3">{room.title}</div>
                                <div className="my-3 flex items-center text-roomi">
                                    {room.is_verified && (
                                        <span
                                            className="inline-flex items-center text-sm font-medium py-0.5 text-roomi mr-2">
                                          <FontAwesomeIcon icon={faCheckCircle} className="mr-2"/>
                                                                            {t('[인증숙박업소]')}
                                        </span>
                                    )}
                                </div>
                                <div className="my-3 flex items-center text-gray-600 text-sm">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2"/>
                                    {room.address}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border border-gray-200 rounded-xl shadow-sm mb-6 bg-white">
                            <div className="font-bold text-gray-800 mb-4">
                                {t("호스트정보")}
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <div className="flex_center mr-4">
                                        <img src={room.host.profile_image ?
                                            (room.host.profile_image) : ('/assets/images/profile.png')}
                                             alt="프로필사진"
                                             className="rounded-full w-16 h-16"/>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">{room.host.name}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border border-gray-200 rounded-xl shadow-sm mb-6 bg-white">
                        <div className="font-bold text-gray-800 mb-4">
                                {t("예약정보")}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-roomi-light">
                                    <div className="text-sm text-gray-500">{t("입실")}</div>
                                    <div className="font-bold text-gray-800 mt-1 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-roomi" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        {startDate}
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-roomi-light">
                                    <div className="text-sm text-gray-500">{t("퇴실")}</div>
                                    <div className="font-bold text-gray-800 mt-1 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-roomi" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        {endDate}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-4 rounded-lg bg-roomi-light">
                                <div className="text-sm text-gray-500">{t("사용인원")}</div>
                                <div className="flex items-center mt-1">
                                    <button className="text-lg text-roomi hover:text-roomi-4 transition-colors"
                                            onClick={() => handleguestValue(false)}>
                                        <LuCircleMinus/>
                                    </button>
                                    <div className="font-bold text-gray-800 mx-4">{guestCount}{t("guest_unit")}</div>
                                    <button className="text-lg text-roomi hover:text-roomi-4 transition-colors"
                                            onClick={() => handleguestValue(true)}>
                                        <LuCirclePlus/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border border-gray-200 rounded-xl shadow-sm mb-6 bg-white">
                            <div className="font-bold text-gray-800 mb-6">
                                {t("예약자정보")}
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                    <span className="absolute start-0 bottom-2 text-roomi">
                                        <FontAwesomeIcon icon={faUser}/>
                                    </span>
                                    <input type="text" id="name" value={formData.name} onChange={handleChange}
                                           className="block py-3 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-roomi peer"
                                           placeholder=""/>
                                    <label htmlFor="name"
                                           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-roomi peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                        {t("예약자명")}
                                    </label>
                                </div>
                                {errors.name && <p className="font-bold text-red-500 text-sm">{errors.name}</p>}
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                    <span className="absolute start-0 bottom-2 text-roomi">
                                        <FontAwesomeIcon icon={faPhone}/>
                                    </span>
                                    <input type="text" id="phone" value={formData.phone} onChange={handleChange}
                                           className="block py-3 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-roomi peer"
                                           pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}" placeholder=""/>
                                    <label htmlFor="phone"
                                           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-roomi peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                        {t("전화번호")}
                                    </label>
                                </div>
                                {errors.phone && <p className="font-bold text-red-500 text-sm">{errors.phone}</p>}
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                    <span className="absolute start-0 bottom-2 text-roomi">
                                        <FontAwesomeIcon icon={faEnvelope}/>
                                    </span>
                                    <input type="text" id="email" value={formData.email} onChange={handleChange}
                                           className="block py-3 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-roomi peer"
                                           placeholder=""/>
                                    <label htmlFor="email"
                                           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-roomi peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                        {t("이메일")}
                                    </label>
                                </div>
                                {errors.email && <p className="font-bold text-red-500 text-sm">{errors.email}</p>}
                            </div>
                        </div>
                    </div>

                    {/*리모컨 영역*/}
                    <div className="md:w-2/5 md:h-fit md:sticky md:top-28 md:rounded-xl md:shadow-md
                        border border-gray-200 shadow-sm md:p-6 p-4 break-words bg-white
                        w-full fixed bottom-0 z-[100]">
                        {/* 모바일 전용 아코디언 버튼 */}
                        <div
                            className="md:hidden w-full items-center p-4 rounded-lg cursor-pointer bg-roomi text-white">
                            <button type="button" className="w-full flex justify-between items-center"
                                    onClick={() => setSlideIsOpen(!slideIsOpen)}>
                                <span className="font-bold">{t("price_info")}</span>
                                <FontAwesomeIcon icon={slideIsOpen ? faChevronDown : faChevronUp}/>
                            </button>
                        </div>
                        <div className={`transition-all duration-300 ease-in-out md:max-h-none md:opacity-100 md:overflow-visible
                            ${slideIsOpen
                            // 아코디언이 열릴 때: 화면 높이 - 여유공간(예: 헤더/상단여백 80px)
                            ? "max-h-[calc(60vh)] overflow-y-auto opacity-100"
                            // 아코디언이 닫힐 때
                            : "max-h-0 overflow-hidden opacity-0"}`}
                        >
                            {/*결제 정보*/}
                            <div className="font-bold text-gray-800 md:mt-0 my-4 text-lg md:block hidden">
                                {t("price_info")}
                            </div>
                            <div className="p-5 mt-4 rounded-lg bg-roomi-light">
                                {/*숙박비*/}
                                <div className="flex justify-between py-2">
                                    <div className="font-medium text-gray-700">
                                        {t('원')}{price.toLocaleString()} × {calUnit ? (`${monthValue}${t('달')}`) : (`${weekValue}${t('주')}`)}
                                    </div>
                                    <div className="font-bold text-gray-800">
                                        {t('원')}{(calUnit ? (price * monthValue) : (price * weekValue)).toLocaleString()}
                                    </div>
                                </div>
                                {/*보증금*/}
                                {/*<div className="flex justify-between py-2">*/}
                                {/*    <div className="text-gray-700">{t("deposit")}</div>*/}
                                {/*    <div className="font-bold text-gray-800">{t('원')}{depositPrice.toLocaleString()}</div>*/}
                                {/*</div>*/}
                                {/*관리비*/}
                                <div className="flex justify-between py-2">
                                    <div className="text-gray-700">{t("service_charge")}</div>
                                    <div className="font-bold text-gray-800">
                                        {t('원')}{(calUnit ? (maintenancePrice * monthValue) : (maintenancePrice * weekValue)).toLocaleString()}
                                    </div>
                                </div>
                                {/*청소비*/}
                                <div className="flex justify-between py-2">
                                    <div className="text-gray-700">수수료</div>
                                    <div className="font-bold text-gray-800">
                                        {t('원')}{(calUnit ? (feePrice * monthValue) : (feePrice * weekValue)).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 mt-3 pt-4">
                                    <div className="text-gray-800 font-medium">{t("총결제금액")}</div>
                                    <div
                                        className="font-bold text-roomi text-xl">{t("원")}{totalPrice.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="mt-4 text-sm space-y-6 max-w-lg mx-auto">
                                <div className="bg-roomi-light p-4 rounded-lg text-roomi text-xs">
                                    {t("계약 요청이 승인되기 전까지 요금이 결제 되지 않습니다.")}
                                </div>

                                <div className="space-y-4">
                                    {/* 1. 방 예약 내용을 확인했습니다 */}
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={isChecked1}
                                                onChange={() => setIsChecked1(!isChecked1)}
                                                className="sr-only peer"
                                            />
                                            <div
                                                className="w-5 h-5 border-2 border-roomi rounded transition-all peer-checked:bg-roomi flex items-center justify-center">
                                                {isChecked1 && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="3" d="M5 13l4 4L19 7"/>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-600 group-hover:text-gray-800 transition-colors">
                                          방 예약 내용을 확인했습니다.
                                        </span>
                                    </label>

                                    {/* 2. 서비스 약관에 동의합니다 */}
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={isChecked2}
                                                onChange={() => setIsChecked2(!isChecked2)}
                                                className="sr-only peer"
                                            />
                                            <div
                                                className="w-5 h-5 border-2 border-roomi rounded transition-all peer-checked:bg-roomi flex items-center justify-center">
                                                {isChecked2 && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="3" d="M5 13l4 4L19 7"/>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-600 group-hover:text-gray-800 transition-colors">
                                          서비스 약관에 동의합니다.
                                          <a
                                              href="https://roomi.co.kr/api/policies/terms-of-use"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-roomi underline ml-2"
                                          >
                                            [상세보기]
                                          </a>
                                        </span>
                                    </label>
                                </div>

                                <button
                                    className="w-full py-3 px-4 bg-roomi hover:bg-roomi-3 text-white font-medium rounded-lg transition-colors"
                                    onClick={reservationBtn}>
                                    {t("계약 요청")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center p-12">
                    <div role="status" className="inline-flex flex-col items-center">
                        <svg aria-hidden="true"
                             className="w-12 h-12 text-gray-200 animate-spin fill-roomi"
                             viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"/>
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"/>
                        </svg>
                        <span className="mt-3 text-gray-500">로딩중...</span>
                    </div>
                </div>
            )}
        </div>
    );
};
