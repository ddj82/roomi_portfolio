import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {addRoomHistory, checkIdentification, fetchRoomData, uploadIdentification} from "src/api/api";
import {Reservation, RoomData} from "../../types/rooms";
import ImgCarousel from "../util/ImgCarousel";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {facilityIcons} from "src/types/facilityIcons";
import {
    faBath,
    faBuilding,
    faClock,
    faDoorOpen,
    faElevator,
    faHome,
    faLayerGroup,
    faSquareParking,
    faUsers,
    faVectorSquare,
    faMapLocationDot,
    faCalendarDay,
    faChevronUp,
    faChevronDown,
    faCheckCircle,
    faUtensils,
    faUserCheck,
    faArrowLeft,
    faShare,
    faShareFromSquare,
    faInfoCircle,
    faMoneyBillWave,
    faCalendarAlt,
    faCalendarWeek,
    faHouseUser,
    faCouch,
    faDoorClosed,
    faPlusCircle,
    faSwimmingPool,
    faLocationDot,
    faMapPin,
    faCommentDots,
    faUserCircle,
    faCircleCheck, faCircleXmark, faBan, faExclamationCircle, faCircleDot, faMoneyBillTransfer
} from "@fortawesome/free-solid-svg-icons";
import {useTranslation} from "react-i18next";
import NaverMapRoom from "../map/NaverMapRoom";
import Calendar from "react-calendar";
import dayjs from "dayjs";
import {useDateStore} from "src/components/stores/DateStore";
import 'react-calendar/dist/Calendar.css';
import {LuCircleMinus, LuCirclePlus} from "react-icons/lu";
import {useChatStore} from "../stores/ChatStore";
import AuthModal from "../modals/AuthModal";
import i18n from "i18next";
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween';
import {faBell, faCopy} from "@fortawesome/free-regular-svg-icons";
import CertificationModal from "../modals/CertificationModal";
import ImagePreviewModal from "./ImagePreviewModal";
import CommonAlert from "../util/CommonAlert";
import {
    Export,
    MinusCircle

} from "phosphor-react";
import {
    ChatCenteredDots,
    Copy,
    House,
    Money,
    PlusCircle,
    Prohibit,
    Toilet, UserCircle, Warning,
    WarningCircle,
    Buildings,
    CalendarDot,
    CalendarDots,
    City,
    Door,
    Elevator,
    LetterCircleP, MapPinArea, MapPinSimpleArea,
    MapTrifold, ReceiptX, SealCheck
} from "@phosphor-icons/react";
import {ArrowLeft, Building2, CheckCircle, Info} from "lucide-react";
import GoogleMapRoom from "../map/GoolgeMapRoom";

dayjs.extend(utc);
dayjs.extend(isBetween);

export default function RoomDetailScreen() {
    const {roomId, locale} = useParams(); // URL 파라미터 추출
    const [room, setRoom] = useState<RoomData | null>(null);
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {
        startDate, setStartDate,
        endDate, setEndDate,
        calUnit, setCalUnit,
        weekValue, setWeekValue,
        monthValue, setMonthValue
    } = useDateStore();
    const [slideIsOpen, setSlideIsOpen] = useState(false);
    const {createRoom} = useChatStore();
    const connect = useChatStore((state) => state.connect);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [userLocale, setUserLocale] = useState(i18n.language);
    const [blockDates, setBlockDates] = useState<string[]>([]);
    // 체크인 날짜들
    const [checkInList, setCheckInList] = useState<string[]>([]);
    // 체크아웃 날짜들
    const [checkOutList, setCheckOutList] = useState<string[]>([]);
    // 1박2일 날짜들
    const [oneDayList, setOneDayList] = useState<string[]>([]);
    const [userCurrency, setUserCurrency] = useState(localStorage.getItem('userCurrency') ?? 'KRW');

    // 본인인증, 여권인증 모달
    const [certificationModal, setCertificationModal] = useState(false);
    const [userIsKorean, setUserIsKorean] = useState(true);

    //사진 미리보기
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // 공용 얼럿창 상태
    const [alertOpen, setAlertOpen] = useState(false);
    const handleConfirm = (result: boolean) => {
        setAlertOpen(false);
        if (result) setAuthModalOpen(true);
    };

    useEffect(() => {
        const loadRoomData = async () => {
            if (roomId) {
                console.log(`Room ID: ${roomId}`);
                try {
                    if (locale != null) {
                        const response = await fetchRoomData(Number(roomId));
                        const responseJson = await response.json();
                        const roomData = responseJson.data;
                        console.log('데이터 :', roomData);
                        setRoom(roomData);

                        // 사용불가 날짜 커스텀 클래스 추가
                        const blockDateArr: string[] = [];
                        const checkInListArr: string[] = [];
                        const checkOutListArr: string[] = [];
                        const oneDayListArr: string[] = [];

                        roomData.unavailable_dates?.reservations?.forEach((reservation: Reservation) => {
                            const startDate = dayjs.utc(reservation.check_in_date);
                            const endDate = dayjs.utc(reservation.check_out_date);
                            const today = dayjs().format('YYYY-MM-DD');

                            // 1박2일 예약 배열
                            if (endDate.diff(startDate, 'day') === 1 && startDate.format('YYYY-MM-DD') >= today) {
                                oneDayListArr.push(endDate.format('YYYY-MM-DD'));
                            }

                            // 커스텀 블락 날짜 배열
                            // 체크인 날짜들, 체크아웃 날짜들 처리를 위한 배열 (커스텀 블락 제외)
                            if (reservation.status === 'BLOCKED') {
                                if (startDate.format('YYYY-MM-DD') >= today) {
                                    blockDateArr.push(startDate.format('YYYY-MM-DD'));
                                }
                            } else if (startDate.format('YYYY-MM-DD') >= today) {
                                checkInListArr.push(startDate.format('YYYY-MM-DD'));
                                checkOutListArr.push(endDate.format('YYYY-MM-DD'));
                            }

                            // 예약된 날짜를 체크인 다음날부터 체크아웃 하루 전까지만 막음 (체크인/체크아웃은 가능)
                            let currentDate = startDate.add(1, 'day'); // 체크인 날짜 제외, 다음날부터 차단
                            while (currentDate.isBefore(endDate)) { // 체크아웃 날짜는 제외 (체크인 가능하게 하기 위해)
                                const formattedDate = currentDate.format('YYYY-MM-DD');

                                if (formattedDate >= today) {
                                    blockDateArr.push(formattedDate);
                                }

                                currentDate = currentDate.add(1, 'day'); // 하루씩 증가
                            }
                        });

                        // checkInListArr와 checkOutListArr에 모두 포함된 날짜 찾기
                        const duplicateDates = checkInListArr.filter(date => checkOutListArr.includes(date));

                        // 해당 날짜를 checkInListArr, checkOutListArr에서 제거하고 blockDateArr에 추가
                        duplicateDates.forEach(date => {
                            blockDateArr.push(date);
                        });

                        // checkInListArr와 checkOutListArr에서 중복된 날짜 제거
                        const filteredCheckInList = checkInListArr.filter(date => !duplicateDates.includes(date));
                        const filteredCheckOutList = checkOutListArr.filter(date => !duplicateDates.includes(date));

                        setBlockDates(blockDateArr);
                        setCheckInList(filteredCheckInList);
                        setCheckOutList(filteredCheckOutList);
                        setOneDayList(oneDayListArr);
                    }
                } catch (error) {
                    console.error('방 정보 불러오기 실패:', error);
                }
            }
        };
        loadRoomData();

        let token = localStorage.getItem('authToken');
        if (token) {
            addRoomHistory(Number(roomId));
            token = token.replace(/^Bearer\s/, ""); // 🔥 "Bearer " 제거
            connect(token); // ✅ WebSocket 연결
        } else {
            console.error('❌ Auth Token이 없습니다.');
        }

    }, [roomId, locale]); // roomId와 locale 변경 시 실행

    // 공유 함수 추가
    const handleShare = async () => {
        if (navigator.share) {
            try {
                const thumbnailUrl = room?.detail_urls && room.detail_urls.length > 0
                    ? room.detail_urls[0]
                    : '/default-image.jpg';

                // 현재 페이지 URL 가져오기
                const shareUrl = window.location.href;

                await navigator.share({
                    title: room?.title,
                    text: room?.description ? room.description.substring(0, 100) + '...' : '이 숙소를 확인해보세요!',
                    url: shareUrl
                });
                console.log('공유 성공');
            } catch (error) {
                console.error('공유 실패:', error);
            }
        } else {
            // Web Share API가 지원되지 않는 브라우저
            alert('이 브라우저에서는 공유 기능을 지원하지 않습니다.');

            // 링크를 클립보드에 복사하는 대안 제공
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('링크가 클립보드에 복사되었습니다.');
            } catch (err) {
                console.error('클립보드 복사 실패:', err);
            }
        }
    };

    const handleDayClick = (date: Date) => {
        const dateString = dayjs(date).format('YYYY-MM-DD');

        // checkInList 배열을 돌면서 dateString과 같은 날짜가 있는지 확인
        const isCheckInDate = checkInList.some((checkIn) => checkIn === dateString);
        // checkOutList 배열을 돌면서 dateString과 같은 날짜가 있는지 확인
        const isCheckOutDate = checkOutList.some((checkIn) => checkIn === dateString);
        if (calUnit) {
            monthDateSet(dateString);
        } else {
            weekDateSet(dateString);
        }
    };

    // 블록 날짜 범위 검사 함수
    function hasBlockedDatesInRange(start: string, end: string, blockDates: string[]) {
        // start ~ end 사이에 하나라도 blockDates가 있으면 true
        return blockDates.some(blockedDate =>
            dayjs(blockedDate).isBetween(start, end, 'day', '[]')
        );
    }

    const weekDateSet = (dateString: string) => {
        const startDateObj = new Date(dateString);
        const endDateObj = new Date(dateString);
        endDateObj.setDate(startDateObj.getDate() + (weekValue * 7)); // 주 단위 계산
        const formattedEndDate = dayjs(endDateObj).format('YYYY-MM-DD');

        // 블록 날짜 범위 검사
        if (hasBlockedDatesInRange(dateString, formattedEndDate, blockDates)) {
            alert('선택한 날짜 범위에 예약 불가 날짜가 포함되어 있습니다.');
            setStartDate(null);
            setEndDate(null);
        } else {
            setStartDate(dateString);
            setEndDate(formattedEndDate);
        }
    };

    const monthDateSet = (dateString: string) => {
        const startDateObj = new Date(dateString);
        const endDateObj = new Date(dateString);
        endDateObj.setDate(startDateObj.getDate() + (monthValue * 30)); // 월 단위 계산
        const formattedEndDate = dayjs(endDateObj).format('YYYY-MM-DD');

        // 블록 날짜 범위 검사
        if (hasBlockedDatesInRange(dateString, formattedEndDate, blockDates)) {
            alert('선택한 날짜 범위에 예약 불가 날짜가 포함되어 있습니다.');
            setStartDate(null);
            setEndDate(null);
        } else {
            setStartDate(dateString);
            setEndDate(formattedEndDate);
        }
    };

    const handleWeekValue = (value: boolean) => {
        if (value) {
            // 플러스 버튼 클릭 시
            setWeekValue(prev => prev + 1);
        } else {
            // 마이너스 버튼 클릭 시
            if (weekValue === 1) return;
            setWeekValue(prev => prev - 1);
        }

        // 만약 이미 startDate가 선택되어 있다면, 주(week) 값 변경 후 다시 검사
        if (startDate) {
            weekDateSet(startDate);
        }
    };

    const handleMonthValue = (value: boolean) => {
        if (value) {
            // 플러스 버튼 클릭 시
            setMonthValue(prev => prev + 1);
        } else {
            // 마이너스 버튼 클릭 시
            if (monthValue === 1) return;
            setMonthValue(prev => prev - 1);
        }
        console.log('monthValue', monthValue);

        // 만약 이미 startDate가 선택되어 있다면, 월(month) 값 변경 후 다시 검사
        if (startDate) {
            console.log('startDate', startDate);
            monthDateSet(startDate);
        }
    };

    const getTileClassName = ({date}: { date: Date }) => {
        const dateString = dayjs(date).format('YYYY-MM-DD');
        if (dateString === startDate) {
            return 'start-date';
        }
        if (dateString === endDate) {
            return 'end-date';
        }
        if (startDate && endDate && date > new Date(startDate) && date < new Date(endDate)) {
            return 'in-range';
        }
        if (blockDates.includes(dateString)) {
            return 'reservation-date';
        }
        if (checkInList.includes(dateString)) {
            return 'checkInList';
        }
        if (checkOutList.includes(dateString)) {
            return 'checkOutList';
        }
        return null;
    };

    const monthUnit = () => {
        setCalUnit(true);
        setWeekValue(1);
        setMonthValue(1);
        setStartDate(null);
        setEndDate(null);
    };

    const weekUnit = () => {
        setCalUnit(false);
        setWeekValue(1);
        setMonthValue(1);
        setStartDate(null);
        setEndDate(null);
    };

    useEffect(() => {
        // startDate, endDate 설정이 되어 있으면 weekDateSet 다시
        if (startDate && endDate && !calUnit) {
            weekDateSet(startDate);
        }
        // startDate, endDate 설정이 되어 있으면 monthDateSet 다시
        if (startDate && endDate && calUnit) {
            monthDateSet(startDate);
        }
    }, [weekValue, monthValue]);

    const reservationBtnCertification = async () => {
        let identity_verified = false;

        // 로그인 여부 확인
        const isAuthenticated = !!localStorage.getItem("authToken");
        if (!isAuthenticated) {
            // alert('로그인 후 이용 가능합니다.');
            // setAuthModalOpen(true);
            setAlertOpen(true);
            return;
        }

        // 날짜 선택이 안되어 있으면 얼럿, 리턴
        if (!startDate || !endDate) {
            alert('체크인, 체크아웃 날짜를 선택해주세요.');
            return;
        }

        try {
            const response = await checkIdentification();
            const responseJson = await response.json();
            identity_verified = responseJson.identity_verified;
        } catch (e) {
            console.error('인증 여부 확인 실패', e);
        }

        if (identity_verified) {
            console.log("인증 계정! 예약 진행");
            reservationBtn();
        } else {
            // 인증 모달 열기
            setCertificationModal(true);
        }

    };

    // 인증 완료 콜백 함수
    const handleCertificationComplete = async (isSuccess: boolean, impUid: string) => {
        setCertificationModal(false); // 모달 닫기

        if (isSuccess) {
            console.log("인증 성공! 예약 진행");
            // 인증 성공 시 identity_verified true 처리, 예약 진행
            const res = await handleUploadIdentification(impUid);
            if (res) {
                reservationBtn();
            } else {
                alert('인증 처리 중 문제가 발생하였습니다. 다시 시도해주세요.');
            }
        } else {
            console.log("인증 실패");
            alert('본인인증에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 인증 완료 처리 api 호출 함수
    const handleUploadIdentification = async (impUid: string) => {
        try {
            const response = await uploadIdentification(impUid);
            const responseJson = await response.json();
            return responseJson.success;
        } catch (e) {
            console.error('인증 완료 처리 실패', e);
            return false;
        }
    };

    const reservationBtn = () => {
        // 기본 주간 가격 저장
        let price = (Number(room?.week_price!.toFixed(2)) || 0);
        let depositPrice = (Number(room?.deposit_week!.toFixed(2)) || 0);
        let maintenancePrice = (Number(room?.maintenance_fee_week!.toFixed(2)) || 0);

        if (calUnit) {
            // 월간 가격 저장
            price = (Number(room?.month_price!.toFixed(2)) || 0);
            depositPrice = (Number(room?.deposit_month!.toFixed(2)) || 0);
            maintenancePrice = (Number(room?.maintenance_fee_month!.toFixed(2)) || 0);
        }

        let feePrice;
        if (userCurrency === 'USD') {
            console.log('통화 USD');
            feePrice = Math.ceil((price + maintenancePrice) * 0.08 * 100) / 100;

        } else if (userCurrency === 'JPY') {
            console.log('통화 JPY');
            feePrice = Math.ceil((price + maintenancePrice) * 0.08);

        } else {
            console.log('통화 기본(KRW)');
            feePrice = Number(((price + maintenancePrice) * 0.08).toFixed(2));
        }

        const thisRoom = room;
        navigate(`/detail/${roomId}/${locale}/reservation`, {
            state: {
                price,
                depositPrice,
                maintenancePrice,
                feePrice,
                thisRoom
            },
        });
    };

    const createChatRoom = () => {
        const isAuthenticated = !!localStorage.getItem("authToken"); // 로그인 여부 확인
        if (!isAuthenticated) {
            // alert('로그인 후 이용 가능합니다.');
            // setAuthModalOpen(true);
            setAlertOpen(true);
            return;
        }

        console.log('룸:', Number(roomId), '호스트:', room?.host_id);
        if (room?.host_id) {
            createRoom(Number(roomId), room.host_id);
        }
        window.location.href = '/chat';
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

    const handleGoBack = () => {
        navigate('/');
    };
    // 2. useState 추가 (기존 state들 다음에 추가)


    // 3. 이미지 모달 관련 핸들러 함수들 추가
    const handleImageClick = (index: number) => {
        setCurrentImageIndex(index);
        setImageModalOpen(true);
    };

    const handlePreviousImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? (room?.detail_urls?.length || 1) - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === (room?.detail_urls?.length || 1) - 1 ? 0 : prev + 1
        );
    };

    useEffect(() => {
        if (localStorage.getItem('isKorean')) {
            if (localStorage.getItem('isKorean') === 'true') {
                setUserIsKorean(true);
            } else {
                setUserIsKorean(false)
            }
        }
    }, []);

    return (
        <div className="relative overflow-visible max-w-[1200px] mx-auto pb-24 md:pb-0 md:my-8 my-0">
            {authModalOpen && (
                <AuthModal visible={authModalOpen} onClose={() => setAuthModalOpen(false)} type="login"/>
            )}
            {/*인증 모달 컴포넌트 (조건부 렌더링)*/}
            {certificationModal && (
                <CertificationModal
                    visible={certificationModal}
                    onClose={() => setCertificationModal(false)}
                    isKorean={userIsKorean}
                    onCertificationComplete={handleCertificationComplete}
                />
            )}
            {room ? (
                <div className="flex flex-col md:flex-row gap-8">
                    {/* 메인 콘텐츠 영역 */}
                    <div className="md:w-3/5 w-full mx-auto md:px-0">
                        {/* 이미지 갤러리 영역 */}
                        <div className="relative mb-10">
                            {/* 백 버튼 추가 - 모바일에서만 표시 */}
                            <button
                                onClick={handleGoBack}
                                className="absolute left-4 top-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md md:hidden"
                            >
                                <ArrowLeft size={22} />
                            </button>

                            {/* 공유 버튼 추가 - 모바일에서만 표시 */}
                            <button
                                onClick={handleShare}
                                className="absolute right-4 top-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md md:hidden"
                            >
                                <Export size={24} />
                            </button>

                            {room.detail_urls && room.detail_urls.length > 0 ? (
                                <div onClick={() => handleImageClick(0)} className="cursor-pointer">
                                    <ImgCarousel
                                        images={room.detail_urls}
                                        customClass="md:rounded-lg h-64 md:h-[30rem] object-cover"
                                    />
                                </div>
                            ) : (
                                <img
                                    src="/default-image.jpg"
                                    alt="thumbnail"
                                    className="w-full md:h-[30rem] h-64 object-cover rounded-lg cursor-pointer"
                                    onClick={() => handleImageClick(0)}
                                />
                            )}
                        </div>
                        <div className="px-4 md:px-1 space-y-8">
                            {room.is_verified && (
                                <div
                                    className="inline-flex items-center px-4 py-1.5 bg-indigo-50 rounded-full text-sm font-medium text-indigo-600 mb-2">
                                    <SealCheck size={32} />
                                    {t('[인증숙박업소]')}
                                </div>
                            )}

                            {/* 제목 */}
                            <h1 className="text-2xl font-bold mb-4 text-gray-800">{room.title}</h1>

                            {/* 가격 및 관리비 설명 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    {/*<Money size={32} />*/}
                                    {" "}{t("가격")}
                                </h2>

                                {/* Main pricing grid */}
                                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 shadow-sm">
                                    <div className="text-gray-700 grid md:grid-cols-2 gap-6">
                                        {/* 월 단위 */}
                                        {typeof room.month_price === 'number' && room.month_price > 0 && (
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-medium text-gray-800 mb-2 pb-1 border-b border-gray-200 flex items-center">
                                                    {/*<CalendarDots size={32} />*/}
                                                    {t('월 단위')}
                                                </h3>
                                                <div
                                                    className="flex justify-between items-center py-2 rounded-md px-2 transition-all">
                                                    <span className="text-gray-600">{t("월 가격")}</span>
                                                    <span className="font-medium text-roomi">
                                                        {room.symbol} {room.month_price.toLocaleString()}
                                                    </span>
                                                </div>
                                                {typeof room.maintenance_fee_month === 'number' && room.maintenance_fee_month > 0 && (
                                                    <div
                                                        className="flex justify-between items-center py-2 rounded-md px-2 transition-all">
                                                        <span className="text-gray-600">{t("service_charge")}</span>
                                                        <span className="font-medium">
                                                          {room.symbol} {room.maintenance_fee_month.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* 주 단위 */}
                                        {typeof room.week_price === 'number' && room.week_price > 0 && (
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-medium text-gray-800 mb-2 pb-1 border-b border-gray-200 flex items-center">
                                                    {/*<CalendarDot size={32} />*/}
                                                    {t('주 단위')}
                                                </h3>
                                                <div
                                                    className="flex justify-between items-center py-2 rounded-md px-2 transition-all">
                                                    <span className="text-gray-600">{t("주 가격")}</span>
                                                    <span className="font-medium text-roomi">
                                                        {room.symbol} {room.week_price.toLocaleString()}
                                                    </span>
                                                </div>
                                                {typeof room.maintenance_fee_week === 'number' && room.maintenance_fee_week > 0 && (
                                                    <div
                                                        className="flex justify-between items-center py-2 rounded-md px-2 transition-all">
                                                        <span className="text-gray-600">{t("service_charge")}</span>
                                                        <span className="font-medium">
                                                            {room.symbol} {room.maintenance_fee_week.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Maintenance details */}
                                <div className="mt-6 ml-1">
                                    <h3 className="text-gray-800 font-medium mb-3 flex items-center">
                                        <Info size={13} />
                                        {" "}{t('서비스 비용 포함 내역')}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line pl-1">
                                        {t('종합 시설 관리 서비스 비용 (인터넷, 운영비 포함)\n청소 서비스, 보안 서비스, 시설 유지 관리 서비스 이용료 포함\n공용 공간 편의 서비스, 24시간 안전 관리 서비스 포함 실내 환경 관리(냉난방), 엘리베이터 유지 서비스, 주차 편의 서비스 이용료, 공용 시설 이용 서비스, 인터넷 연결 서비스, 종합 생활 편의 서비스 비용 포함')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    {/*<House size={32} />*/}
                                    {t("공간 안내")}
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap ml-1">{room.description}</p>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    {/*<Buildings size={32} />*/}
                                    {t("room_info")}
                                </h2>

                                {/* 핵심 정보 (방, 화장실, 주차, 엘리베이터) - 상단 그리드 */}
                                <div className="grid grid-cols-4 gap-2 mt-4 mb-6 border-b border-gray-100 pb-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2">
                                            <Door size={32} />
                                        </div>
                                        <p className="font-medium text-sm sm:text-base">{t('방')} : {room.room_count ?? 0}</p>
                                    </div>

                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2">
                                            <Toilet size={32} />
                                        </div>
                                        <p className="font-medium text-sm sm:text-base">{t('화장실')} : {room.bathroom_count ?? 0}</p>
                                    </div>

                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2">
                                            <LetterCircleP size={32} />

                                        </div>
                                        <p className="font-medium text-sm sm:text-base flex items-center gap-1">
                                            {t('주차')} : {room.has_parking ? <CheckCircle size={20}/> : <Prohibit size={20}/>}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2">
                                            <Elevator size={32} />
                                        </div>
                                        <p className="font-medium text-sm sm:text-base flex items-center gap-1">
                                            <span>{t('엘리베이터')}:</span>
                                            {room.has_elevator ? <CheckCircle size={20}/> : <Prohibit size={20}/>}
                                        </p>
                                    </div>
                                </div>

                                {/* 상세 정보 - 모바일에서는 1열, 데스크톱에서는 2열 그리드 레이아웃 */}
                                <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-4 sm:space-y-0">
                                    {/* 첫 번째 항목 그룹 */}
                                    <div className="space-y-3">
                                        <div
                                            className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 text-sm sm:text-base">{t("전용 면적")}</span>
                                            <span
                                                className="font-medium text-sm sm:text-base">{`${room.floor_area ?? 0}m²`}</span>
                                        </div>

                                        <div
                                            className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 text-sm sm:text-base">{t("건물 유형")}</span>
                                            <span
                                                className="font-medium text-sm sm:text-base">{t(room.building_type ?? "")}</span>
                                        </div>


                                        <div
                                            className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 text-sm sm:text-base">{t("최대이용인원")}</span>
                                            <span
                                                className="font-medium text-sm sm:text-base">{`${room.max_guests ?? 0}${t('guest_unit')}`}</span>
                                        </div>
                                    </div>

                                    {/* 두 번째 항목 그룹 */}
                                    <div className="space-y-3">
                                        <div
                                            className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 text-sm sm:text-base">{t("숙소유형")}</span>
                                            <span
                                                className="font-medium text-sm sm:text-base">{room.accommodation_type || "-"}</span>
                                        </div>

                                        <div
                                            className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 text-sm sm:text-base">{t("층수")}</span>
                                            <span
                                                className="font-medium text-sm sm:text-base">{`${room.floor ?? 0}`}</span>
                                        </div>


                                        <div
                                            className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 text-sm sm:text-base">{t("입실/퇴실")}</span>
                                            <span
                                                className="font-medium text-sm sm:text-base">{`${room.check_in_time ?? "0"} / ${room.check_out_time ?? "0"}`}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 제공 서비스 */}
                            {(room.breakfast_service || room.checkin_service) && (
                                <div className="space-y-4 pb-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                        {/*<FontAwesomeIcon icon={faBell} className="text-roomi mr-2"/>*/}
                                        {t("제공 서비스")}
                                    </h2>

                                    <div className="bg-white rounded-lg p-4">
                                        <div className="space-y-3">
                                            {room.breakfast_service && (
                                                <div
                                                    className="flex items-center p-2 hover:bg-white transition-colors rounded-md">
                                                    <div
                                                        className="w-10 h-10 rounded-full bg-roomi-000 flex_center mr-4 flex-shrink-0">
                                                        <FontAwesomeIcon icon={faUtensils}
                                                                         className="text-roomi text-lg"/>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-800 mb-0.5">{t("조식 서비스")}</h3>
                                                        <p className="text-sm text-gray-600">{room.breakfast_service}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {room.checkin_service && (
                                                <div
                                                    className="flex items-center p-2 hover:bg-white transition-colors rounded-md">
                                                    <div
                                                        className="w-10 h-10 rounded-full bg-roomi-000 flex_center mr-4 flex-shrink-0">
                                                        <FontAwesomeIcon icon={faUserCheck}
                                                                         className="text-roomi text-lg"/>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-800 mb-0.5">{t("체크인 서비스")}</h3>
                                                        <p className="text-sm text-gray-600">{room.checkin_service}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 추가 서비스가 있다면 이곳에 추가 */}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 편의시설 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    {/*<City size={32} />*/}
                                    {t("기본 옵션")}
                                </h2>

                                <div className="grid grid-cols-4 gap-3 md:gap-6 mt-2">
                                    {room?.facilities &&
                                        Object.entries(room.facilities)
                                            .filter(([_, value]) => value)
                                            .map(([key, value], index) => (
                                                <div key={index} className="flex flex-col items-center text-center">
                                                    <div
                                                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-1 md:mb-2 opacity-80">
                                                        <FontAwesomeIcon icon={facilityIcons[key]}
                                                                         className="text-lg md:text-2xl"/>
                                                    </div>
                                                    <p className="text-xs md:text-sm text-gray-800">{value}</p>
                                                </div>
                                            ))}
                                </div>
                            </div>

                            {/* 추가 시설 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    {/*<PlusCircle size={32} />*/}
                                    {t("추가시설")}
                                </h2>

                                <div className="grid grid-cols-4 gap-3 md:gap-6 mt-2">
                                    {room?.additional_facilities &&
                                        Object.entries(room.additional_facilities)
                                            .filter(([_, value]) => value)
                                            .map(([key, value], index) => (
                                                <div key={index} className="flex flex-col items-center text-center">
                                                    <div
                                                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-1 md:mb-2 opacity-80">
                                                        <FontAwesomeIcon icon={facilityIcons[key]}
                                                                         className="text-lg md:text-2xl"/>
                                                    </div>
                                                    <p className="text-xs md:text-sm text-gray-800">{value}</p>
                                                </div>
                                            ))}
                                </div>
                            </div>

                            {/* 위치 정보 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    {/*<MapTrifold size={32} />*/}
                                    {t("위치정보")}
                                </h2>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex items-start">
                                        <div className="flex_center mr-3 mt-1 w-4 h-4">
                                            <MapPinArea size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-800 mb-1">{t("교통 안내")}</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">{room.transportation_info}</p>
                                        </div>
                                    </div>

                                    {room.address && (
                                        <div className="flex items-start mt-3">
                                            <div className="flex_center mr-3 mt-1 w-4 h-4">
                                                <MapPinSimpleArea size={32} />
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-sm font-medium text-gray-800 mb-1">{t("주소")}</h3>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-600">
                                                        {room.address}
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(room!.address!);
                                                            alert('주소가 클립보드에 복사되었습니다.');
                                                        }}
                                                        className="ml-2 p-1.5 text-gray-500 hover:text-roomi hover:bg-gray-100 rounded-full transition-colors"
                                                        title={t("주소 복사")}
                                                    >
                                                        <Copy size={24} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div
                                    className="h-60 md:h-80 rounded-lg overflow-hidden shadow-sm border border-gray-100">
                                    <NaverMapRoom room={room}/>
                                    {/*<GoogleMapRoom room={room}/>*/}
                                </div>
                            </div>

                            {/* 유의사항 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    {/*<WarningCircle size={32} />*/}
                                    {t("유의사항")}
                                </h2>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    {room.house_rules && room.house_rules.length > 0 && (
                                        <ul className="space-y-2.5 text-gray-700">
                                            {room.house_rules.split(/\\n|\n/).map((rule, index) => (
                                                <li key={index} className="flex items-baseline">
                                                    <span className="text-sm">{rule.trim()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* 금지사항 섹션 - 데이터가 있을 때만 표시 */}
                                    {room.prohibitions && room.prohibitions.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <h3 className="text-base font-medium text-gray-800 mb-3 flex items-center">
                                                <Warning size={20} className="mr-2"/>
                                                {t("금지사항")}
                                                <Warning size={20} className="ml-2"/>
                                            </h3>
                                            <ul className="space-y-2.5 text-gray-700">
                                                {room.prohibitions.map((item, index) => (
                                                    <li key={index} className="flex items-baseline">
                                                        {/*<Prohibit size={16} />*/}
                                                        <span className="ml-1 text-sm text-gray-700">{t(item)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* 호스트 정보 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    {/*<UserCircle size={32} />*/}
                                    {t("호스트 정보")}
                                </h2>

                                <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="mr-4">
                                                <img
                                                    src={room.host.profile_image ? room.host.profile_image : '/assets/images/profile.png'}
                                                    alt="프로필사진"
                                                    className="rounded-full w-16 h-16 object-cover border-2 border-white shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <div
                                                    className="font-medium text-gray-800 text-lg">{room.host.name}</div>
                                                {/*<div className="text-gray-500 text-sm">호스트</div>*/}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="px-5 py-2.5 rounded-lg bg-roomi text-white text-sm font-medium hover:bg-roomi-1 transition-colors shadow-sm flex items-center"
                                            onClick={createChatRoom}
                                        >
                                            <ChatCenteredDots size={16} className="mr-2" />
                                            {t('채팅하기')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 환불정책 */}
                            <div className="space-y-4 pb-6">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    {/*<ReceiptX size={32} />*/}
                                    {t("환불 정책")}
                                </h2>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-2.5">
                                        {room?.refund_policy
                                            ? room.refund_policy.replace(/\\n/g, '\n').split('\n').map((line, index) => (
                                                <div key={index} className="flex items-baseline">
                                                    {line.startsWith('•') ? (
                                                        <>
                                                            <CheckCircle size={15}
                                                                             className="text-roomi mr-3 text-sm flex-shrink-0"/>
                                                            <span
                                                                className="text-sm text-gray-700">{line.substring(1).trim()}</span>
                                                        </>
                                                    ) : (
                                                        <span
                                                            className={`text-sm ${index === 0 ? "font-medium text-gray-800" : "text-gray-700"}`}>
                                                            {line}
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                            : '유연한 환불 정책\n• 체크인 24시간 전까지 무료 취소\n• 체크인 24시간 전까지: 100% 환불\n• 체크인 24시간 전 ~ 당일: 50% 환불\n• 체크인 이후: 환불 불가'.split('\n').map((line, index) => (
                                                <div key={index} className="flex items-baseline">
                                                    {line.startsWith('•') ? (
                                                        <>
                                                            <FontAwesomeIcon icon={faCircleDot}
                                                                             className="text-roomi mr-3 text-sm flex-shrink-0"/>
                                                            <span
                                                                className="text-sm text-gray-700">{line.substring(1).trim()}</span>
                                                        </>
                                                    ) : (
                                                        <span
                                                            className={`text-sm ${index === 0 ? "font-medium text-gray-800" : "text-gray-700"}`}>
                                                            {line}
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*리모컨 영역*/}
                    <div className="md:w-2/5 md:h-fit md:sticky md:top-28 md:rounded-xl
                        border border-gray-200 md:p-6 p-4 break-words bg-white
                        w-full fixed bottom-0 z-[100]">
                        {/* 모바일 전용 아코디언 버튼 */}
                        <div
                            className="md:hidden w-full items-center p-4 rounded-lg cursor-pointer bg-roomi text-white scrollbar-hidden">
                            <button type="button" className="w-full flex justify-between items-center"
                                    onClick={() => setSlideIsOpen(!slideIsOpen)}>
                                <span className="font-bold">{t("price_info")}</span>
                                <FontAwesomeIcon icon={slideIsOpen ? faChevronDown : faChevronUp}/>
                            </button>
                        </div>
                        <div className={`transition-all duration-300 ease-in-out md:max-h-none md:opacity-100 md:overflow-visible scrollbar-hidden
                            ${slideIsOpen
                            // 아코디언이 열릴 때: 화면 높이 - 여유공간(예: 헤더/상단여백 80px)
                            ? "max-h-[calc(60vh)] overflow-y-auto opacity-100"
                            // 아코디언이 닫힐 때
                            : "max-h-0 overflow-hidden opacity-0"}`}
                        >
                            {/* 가격 정보 헤더 */}
                            {/* calUnit : true = 월 */}
                            {/* calUnit : false = 주 */}
                            <div className="p-3">
                                <h2 className="text-lg font-bold text-gray-800">
                                    {room.symbol}{calUnit ? room.month_price?.toLocaleString() : room.week_price?.toLocaleString()}
                                    <span className="text-sm font-normal text-gray-600 ml-1">
                                        / {calUnit ? t("월") : t("주")}
                                    </span>
                                </h2>
                            </div>
                            {/* 옵션 선택 탭 */}
                            <div
                                className="flex justify-center text-sm bg-gray-100 rounded-lg p-1 mb-6 w-full gap-2">
                                <button
                                    className={`w-1/2 flex items-center justify-center px-4 py-2 rounded-lg cursor-pointer transition-all
                                    ${calUnit ? "text-gray-700 " : "bg-roomi text-white"}`}
                                    onClick={weekUnit}
                                >
                                    <CalendarDot size={16} className="mr-1"/>
                                    {t("주")}
                                </button>

                                <button
                                    className={`w-1/2 flex items-center justify-center px-4 py-2 rounded-lg cursor-pointer transition-all 
                                    ${calUnit ? "bg-roomi text-white" : "text-gray-700 "}`}
                                    onClick={monthUnit}
                                >
                                    <CalendarDots size={16} className="mr-1"/>
                                    {t("월")}
                                </button>
                            </div>
                            {/* 주 단위 선택기 */}
                            {!calUnit ? (
                                <div className="flex_center mb-3 text-sm">
                                    <button
                                        className="w-8 h-8 flex_center rounded-full  text-gray-400 hover:text-roomi"
                                        onClick={() => handleWeekValue(false)}
                                    >
                                        <MinusCircle size={24}/>

                                    </button>
                                    <div className="mx-4 font-semibold">{weekValue} {t("주")}</div>
                                    <button
                                        className="w-8 h-8 flex_center rounded-full  text-gray-400 hover:text-roomi"
                                        onClick={() => handleWeekValue(true)}
                                    >
                                        <PlusCircle size={24}/>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex_center mb-3 text-sm">
                                    <button
                                        className="w-8 h-8 flex_center rounded-full text-gray-400 hover:text-roomi"
                                        onClick={() => handleMonthValue(false)}
                                    >
                                        <MinusCircle size={24}/>
                                    </button>
                                    <div className="mx-4 font-semibold">{monthValue} {t("달")}</div>
                                    <button
                                        className="w-8 h-8 flex_center rounded-full text-gray-400 hover:text-roomi"
                                        onClick={() => handleMonthValue(true)}
                                    >
                                        <PlusCircle size={24}/>
                                    </button>
                                </div>
                            )}
                            <div className="dateModal">
                                <Calendar
                                    onClickDay={handleDayClick}
                                    tileClassName={getTileClassName}
                                    minDate={new Date()}
                                    next2Label={null} // 추가로 넘어가는 버튼 제거
                                    prev2Label={null} // 이전으로 돌아가는 버튼 제거
                                    className="custom-calendar accordion-custom-calendar"
                                    formatDay={(locale, date) => dayjs(date).format('D')}
                                    locale={userLocale}
                                />
                            </div>
                            {/* 체크인/아웃 정보 */}
                            <div className="flex justify-between mb-4 text-xs">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 my-2">{t("check_in")}</span>
                                    <span className="font-bold">{startDate || '-'}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-gray-500 my-2">{t("check_out")}</span>
                                    <span className="font-bold">{endDate || '-'}</span>
                                </div>
                            </div>

                            {/* 예약 버튼 */}
                            <button
                                className="w-full py-3 bg-roomi text-white text-sm rounded-lg font-medium hover:bg-roomi-3 transition-colors shadow-sm"
                                onClick={reservationBtnCertification}
                            >
                                {t('confirm_reservation')}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <div role="status" className="m-10">
                        <svg aria-hidden="true"
                             className="inline w-8 h-8 text-gray-300 animate-spin fill-roomi"
                             viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"/>
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"/>
                        </svg>
                        <div>로딩중...</div>
                    </div>
                </div>
            )}
            {room?.detail_urls && (
                <ImagePreviewModal
                    images={room.detail_urls}
                    currentIndex={currentImageIndex}
                    isOpen={imageModalOpen}
                    onClose={() => setImageModalOpen(false)}
                    onPrevious={handlePreviousImage}
                    onNext={handleNextImage}
                />
            )}

            {alertOpen && (
                <CommonAlert
                    isOpen={alertOpen}
                    onRequestClose={() => setAlertOpen(false)}
                    content={t("로그인 후 이용 가능합니다.")}
                    confirm={true}
                    confirmResponse={handleConfirm}
                />
            )}

        </div>
    );
}