import PortOne from "@portone/browser-sdk/v2"
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {RoomData} from "../../types/rooms";
import {useTranslation} from "react-i18next";
import {useDateStore} from "../stores/DateStore";
import ImgCarousel from "../util/ImgCarousel";
import {useGuestsStore} from "../stores/GuestsStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faChevronUp,
    faUser,
    faPhone,
    faEnvelope,
    faCalendarDay,
    faCheckCircle, faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import {LuCircleMinus, LuCirclePlus} from "react-icons/lu";
import {FormDataState} from "src/components/pay/Checkout.jsx";
import dayjs from "dayjs";
import {MyReservation} from "../../types/reservation";
import {confirmPayment, getVirtualAccountInfo, verifyPayment} from "../../api/api";
import SuccessPage from "../pay/SuccessPage";
import Modal from "react-modal";
import {
    PaymentFailedResponse,
    PaymentSuccessResponse,
    SuccessVirtualAccountResponse
} from "../../types/PaymentResponse";
import FailPage from "../pay/FailPage";
import SuccessVirtualAccountPage from "../pay/SuccessVirtualAccountPage";

interface FormDataType {
    name: string;
    phone: string;
    email: string;
    currency: string;
}
interface PaymentData {
    bookReservation: MyReservation,
    bookRoom: RoomData,
    formDataState: FormDataState,
    price: number,
}

export default function GuestReservationScreen() {
    const {roomId, locale} = useParams();
    const [room, setRoom] = useState<RoomData | null>(null);
    const {t} = useTranslation();
    const {calUnit} = useDateStore();
    const {guestCount, setGuestCount} = useGuestsStore();
    const navigate = useNavigate();
    const location = useLocation();

    let {
        price = 0,
        depositPrice = 0,
        maintenancePrice = 0,
        fee = 0,
        totalPrice = 0,
        totalNight = 0,
        formData = {
            name: "",
            phone: "",
            email: "",
        },
        thisRoom = null,
        bookData = {
            reservation: {},
            room: {},
        },
        JPY = 0,
        USD = 0,
        unit = 0,
        maintenancePerUnit = 0,
        pricePerUnit = 0,
        checkIn = "",
        checkOut = "",
    } = location.state || {};

    const [formDataState, setFormDataState] = useState<FormDataType>(formData);

    // const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [slideIsOpen, setSlideIsOpen] = useState(false);
    const [isChecked1, setIsChecked1] = useState(false);
    const [isChecked2, setIsChecked2] = useState(false);
    const [isChecked3, setIsChecked3] = useState(false);
    const [isChecked4, setIsChecked4] = useState(false);
    const [userCurrency, setUserCurrency] = useState('');
    const [userIsKorean, setUserIsKorean] = useState(true);

    const [selectedPayment, setSelectedPayment] = useState<string>("CARD");
    const [portOneModal, setPortOneModal] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    // 결제 성공 상태
    const [paymentSuccessResponse, setPaymentSuccessResponse] = useState<PaymentSuccessResponse | null>(null);
    const [virtualAccountSuccessResponse, setVirtualAccountSuccessResponse] = useState<SuccessVirtualAccountResponse | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    // 결제 실패 상태
    const [paymentFailedResponse, setPaymentFailedResponse] = useState<PaymentFailedResponse | null>(null);

    // const PORT_ONE_STORE_ID = process.env.REACT_APP_PORT_ONE_STORE_ID;
    // const PORT_ONE_CHANNEL_KEY = process.env.REACT_APP_PORT_ONE_CHANNEL_KEY;


    useEffect(() => {
        if (localStorage.getItem('isKorean')) {
            if (localStorage.getItem('isKorean') === 'true') {
                setUserIsKorean(true);
            } else {
                setUserIsKorean(false)
            }
        }
    }, []);

    useEffect(() => {
        setRoom(thisRoom);
        setUserCurrency(localStorage.getItem('userCurrency') ?? "");
    }, [roomId, locale]);

    const handleguestValue = (increase: boolean) => {
        if (increase) {
            setGuestCount(prev => prev + 1);
        } else if (guestCount > 1) {
            setGuestCount(prev => prev - 1);
        }
    };

    // Update form data state when user makes changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormDataState({
            ...formDataState,
            [e.target.id]: e.target.value
        });
    };

    // Payment method selection handler
    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPayment(e.target.value);
    };

    // 페이먼트ID 생성
    const generateRandom7Digits = () => {
        // 0부터 9999999까지의 숫자 중 하나를 랜덤으로 뽑고, 앞에 0이 있으면 채워서 길이를 7자리로 맞춤
        const randomNumber = Math.floor(Math.random() * 10_000_000); // 0 이상 10^7 미만
        return String(randomNumber).padStart(7, '0');
    };

    const paymentBtn = async () => {
        if (!isChecked1 || !isChecked2 || !isChecked3) {
            alert('필수 약관에 동의해주세요.');
            return;
        }

        const today = dayjs().format('YYYYMMDD');
        const paymentId = today + generateRandom7Digits();
        console.log('paymentId만듬',paymentId);

        if (selectedPayment === "VIRTUAL_ACCOUNT") {
            const validUntil = new Date();
            validUntil.setMinutes(validUntil.getMinutes() + 29);

            const payment = await PortOne.requestPayment({
                storeId: "store-7bb98274-0fb5-4b2e-8d60-d3bff2f3ca85",
                channelKey: "channel-key-14a7fa72-0d06-4bb5-9502-f721b189eb86",
                paymentId: paymentId,
                orderName: bookData.room.title,
                // totalAmount: Math.round(paymentData.price),
                totalAmount: 1000,
                currency: "CURRENCY_KRW",
                payMethod: "VIRTUAL_ACCOUNT",
                redirectUrl: window.location.origin + "/payMobile/redirect",
                customer: {
                    customerId: formDataState.phone, // 변경해야함
                    fullName: formDataState.name,
                    phoneNumber: formDataState.phone,
                    email: formDataState.email
                },
                // ✅ virtualAccount 설정 수정 - accountExpiry를 올바른 객체 형태로 설정
                virtualAccount: {
                    accountExpiry: {
                        dueDate: validUntil.toString(),   // 유효 기간을 validUntil로 설정
                    },
                }
            });

            if (payment) {
                // 결제 후 검증
                const verifyPaymentResponse = await verifyPayment(payment.paymentId);
                const verifyPaymentResponseJson = await verifyPaymentResponse.json();
                console.log('결제 후 검증 verifyPaymentResponseJson',verifyPaymentResponseJson);

                if (verifyPaymentResponse.ok) {
                    /* 가상계좌 발급 성공 */
                    try {
                        const completeResponse = await getVirtualAccountInfo(payment.paymentId);
                        const paymentComplete = await completeResponse.json();
                        console.log('발급 된 가상계좌 조회 json',paymentComplete);

                        if (!completeResponse.ok) {
                            console.log('발급 된 가상계좌 조회 중 오류');
                            alert('발급 된 가상계좌 조회 중 오류가 발생했습니다.');
                            return;
                        }

                        if (verifyPaymentResponseJson.status === "VIRTUAL_ACCOUNT_ISSUED") {
                            setVirtualAccountSuccessResponse(paymentComplete);
                            setPaymentSuccess(true);
                        } else {
                            setPaymentFailedResponse(verifyPaymentResponseJson);
                        }

                    } catch (e) {
                        console.error('발급 된 가상계좌 조회 중 오류', e);
                    }
                } else {
                    /* 가상계좌 발급 실패 */
                    setPaymentFailedResponse(verifyPaymentResponseJson);
                    console.log('가상계좌 발급 실패');
                }

                setPortOneModal(true);
            }
        } else if (selectedPayment === "FOREIGNER") {
            const payment = await PortOne.requestPayment({
                storeId: "store-7bb98274-0fb5-4b2e-8d60-d3bff2f3ca85",
                channelKey: "channel-key-0dfb8c53-05f6-4017-8ce5-6cff2f815022",
                paymentId: paymentId,
                orderName: bookData.room.title,
                // totalAmount: Math.round(paymentData.price),
                totalAmount: 1000,
                locale : 'EN_US',
                currency: "CURRENCY_USD",
                payMethod: "CARD",
                redirectUrl: window.location.origin + "/payMobile/redirect",
                customer: {
                    customerId: formDataState.phone, // 변경해야함
                    fullName: formDataState.name,
                    phoneNumber: formDataState.phone,
                    email: formDataState.email
                },
            });

            if (payment) {
                // 결제 후 검증
                const verifyPaymentResponse = await verifyPayment(payment.paymentId);
                const verifyPaymentResponseJson = await verifyPaymentResponse.json();
                console.log('결제 후 검증 verifyPaymentResponseJson',verifyPaymentResponseJson);

                if (verifyPaymentResponseJson.status === "PAID") {
                    /* 결제 성공 */
                    setPaymentSuccessResponse(verifyPaymentResponseJson);
                    try {
                        const completeResponse = await confirmPayment(payment.paymentId, bookData.reservation.id.toString());
                        const paymentComplete = await completeResponse.json();

                        if (!paymentComplete.success) {
                            console.log('결제 상태 업데이트 중 오류');
                            alert('결제 상태 업데이트 중 오류가 발생했습니다.');
                            return;
                        }
                        setPaymentSuccess(true);
                    } catch (e) {
                        console.error('결제 상태 업데이트 중 오류', e);
                    }
                } else {
                    /* 결제 실패 */
                    setPaymentFailedResponse(verifyPaymentResponseJson);
                    console.log('결제 실패');
                }

                setPortOneModal(true);
            }
        } else {
            const payment = await PortOne.requestPayment({
                storeId: "store-7bb98274-0fb5-4b2e-8d60-d3bff2f3ca85",
                channelKey: "channel-key-14a7fa72-0d06-4bb5-9502-f721b189eb86",
                paymentId: paymentId,
                orderName: bookData.room.title,
                // totalAmount: Math.round(paymentData.price),
                totalAmount: 1000,
                currency: "CURRENCY_KRW",
                payMethod: "CARD",
                redirectUrl: window.location.origin + "/payMobile/redirect" + `?${bookData.reservation.id.toString()}`,
                customer: {
                    customerId: formDataState.phone, // 변경해야함
                    fullName: formDataState.name,
                    phoneNumber: formDataState.phone,
                    email: formDataState.email
                },
            });

            if (payment) {
                // 결제 후 검증
                const verifyPaymentResponse = await verifyPayment(payment.paymentId);
                const verifyPaymentResponseJson = await verifyPaymentResponse.json();
                console.log('결제 후 검증 verifyPaymentResponseJson',verifyPaymentResponseJson);

                if (verifyPaymentResponseJson.status === "PAID") {
                    /* 결제 성공 */
                    setPaymentSuccessResponse(verifyPaymentResponseJson);
                    try {
                        const completeResponse = await confirmPayment(payment.paymentId, bookData.reservation.id.toString());
                        const paymentComplete = await completeResponse.json();

                        if (!paymentComplete.success) {
                            console.log('결제 상태 업데이트 중 오류');
                            alert('결제 상태 업데이트 중 오류가 발생했습니다.');
                            return;
                        }
                        setPaymentSuccess(true);
                    } catch (e) {
                        console.error('결제 상태 업데이트 중 오류', e);
                    }
                } else {
                    /* 결제 실패 */
                    setPaymentFailedResponse(verifyPaymentResponseJson);
                    console.log('결제 실패');
                }

                setPortOneModal(true);
            }
        }
    };

    interface PaymentOptionProps {
        id: string;
        label: string;
        selected: boolean;
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    }
    function PaymentOption({id, label, selected, onChange}: Readonly<PaymentOptionProps>) {
        return (
            <div>
                <input
                    type="radio"
                    id={id}
                    name="paymentMethod"
                    value={id}
                    className="hidden"
                    checked={selected}
                    onChange={onChange}
                />
                <label
                    htmlFor={id}
                    className={`cursor-pointer flex justify-center items-center rounded-lg py-3 border transition-colors ${
                        selected ? "border-roomi text-roomi" : "border-gray-300 text-gray-500 hover:bg-gray-100"
                    }`}
                >
                    {t(label)}
                </label>
            </div>
        );
    }

    useEffect(() => {
        if (slideIsOpen || portOneModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        // 컴포넌트 언마운트 시 스크롤 복원
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [slideIsOpen, portOneModal]);

    return (
        <div className="my-8 relative overflow-visible max-w-[1200px] mx-auto pb-24 md:pb-0">
            {room ? (
                <div className="flex flex-col md:flex-row gap-8">
                    {/* 메인 콘텐츠 영역 */}
                    <div className="px-4 md:w-3/5 w-full">
                        <div className="mb-8 text-xl font-bold text-gray-800">{t("결제하기")}</div>
                        <div className="md:flex md:p-6 border border-gray-200 rounded-xl shadow-sm mb-6 bg-white">
                            <div className="md:w-3/5">
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
                            <div className="md:w-2/5 md:ml-6 md:my-auto p-4">
                                <div className="text-xl font-semibold text-gray-800 my-3">{room.title}</div>
                                <div className="my-3 flex items-center text-roomi">
                                    {room.is_verified ? (
                                        <span
                                            className="inline-flex items-center text-sm font-medium py-0.5 text-roomi mr-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-2"/>
                                                                        {t('[인증숙박업소]')}
                                        </span>
                                    ) : ('')}
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
                            {/* 예약자 정보 추가 - 고정값으로 표시 */}
                            <div className="p-4 rounded-lg bg-roomi-light mb-4">
                                <div className="text-sm text-gray-500">{t("예약자 정보")}</div>
                                <div className="font-bold text-gray-800 mt-1">
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faUser} className="mr-2 text-roomi"/>
                                            <span>{formData.name || "이름을 입력해주세요"}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faPhone} className="mr-2 text-roomi"/>
                                            <span>{formData.phone || "전화번호를 입력해주세요"}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-roomi"/>
                                            <span>{formData.email || "이메일을 입력해주세요"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-roomi-light">
                                <div className="text-sm text-gray-500">{t("입실")}</div>
                                <div className="font-bold text-gray-800 mt-1 flex items-center">
                                    <FontAwesomeIcon icon={faCalendarDay} className="mr-2 text-roomi"/>
                                    { dayjs(bookData?.reservation?.check_in_date).format("YYYY-MM-DD") || checkIn || dayjs(location.state.bookData?.reservation?.reservation.check_in_date).format("YYYY-MM-DD") || '날짜 없음'}
                                    ({bookData?.room.detail?.check_in_time || location.state.bookData?.reservation?.room.detail.check_in_time})
                                </div>
                            </div>
                            <div className="mt-4 p-4 rounded-lg bg-roomi-light">
                                <div className="text-sm text-gray-500">{t("퇴실")}</div>
                                <div className="font-bold text-gray-800 mt-1 flex items-center">
                                    <FontAwesomeIcon icon={faCalendarDay} className="mr-2 text-roomi"/>
                                    { dayjs(bookData?.reservation?.check_out_date).format("YYYY-MM-DD") || checkOut || dayjs(location.state.bookData?.reservation?.reservation.check_out_date).format("YYYY-MM-DD") || '날짜 없음'}
                                    ({ bookData?.room.detail?.check_out_time || location.state.bookData?.reservation?.room.detail.check_out_time })
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
                                {t("결제자 정보")}
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                <span className="absolute start-0 bottom-2 text-roomi">
                                    <FontAwesomeIcon icon={faUser}/>
                                </span>
                                    <input type="text" id="name" value={formDataState.name} onChange={handleChange}
                                           className="block py-3 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-roomi peer"
                                           placeholder=""/>
                                    <label htmlFor="name"
                                           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-roomi peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                        {t("이름")}
                                    </label>
                                </div>
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                <span className="absolute start-0 bottom-2 text-roomi">
                                    <FontAwesomeIcon icon={faPhone}/>
                                </span>
                                    <input type="text" id="phone" value={formDataState.phone} onChange={handleChange}
                                           className="block py-3 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-roomi peer"
                                           pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}" placeholder=""/>
                                    <label htmlFor="phone"
                                           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-roomi peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                        {t("전화번호")}
                                    </label>
                                </div>
                            </div>
                            <div className="my-5">
                                <div className="relative z-0">
                                <span className="absolute start-0 bottom-2 text-roomi">
                                    <FontAwesomeIcon icon={faEnvelope}/>
                                </span>
                                    <input type="text" id="email" value={formDataState.email} onChange={handleChange}
                                           className="block py-3 px-6 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-roomi peer"
                                           placeholder=""/>
                                    <label htmlFor="email"
                                           className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:start-6 peer-focus:start-0 peer-focus:text-roomi peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                                        {t("이메일")}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {userIsKorean ? (
                            <div className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white mb-6">
                                <div className="font-bold text-gray-800 mb-4">{t("결제 수단")}</div>
                                <div className="grid gap-4 grid-cols-2">
                                    <PaymentOption id="CARD" label="국내 카드" selected={selectedPayment === "CARD"}
                                                   onChange={handlePaymentChange}/>
                                    <PaymentOption id="VIRTUAL_ACCOUNT" label="가상 계좌" selected={selectedPayment === "VIRTUAL_ACCOUNT"}
                                                   onChange={handlePaymentChange}/>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white mb-6">
                                <div className="font-bold text-gray-800 mb-4">{t("결제 수단")}</div>
                                <div className="grid gap-4 grid-cols-2">
                                    <PaymentOption id="FOREIGNER" label="해외 카드" selected={selectedPayment === "FOREIGNER"}
                                                   onChange={handlePaymentChange}/>
                                </div>
                            </div>
                        )}
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
                                        {calUnit
                                            ? `${t('원')}${pricePerUnit.toLocaleString()} × ${totalNight}${t('달')}`
                                            : `${t('원')}${pricePerUnit.toLocaleString()} × ${totalNight}${t('주')}`
                                        }
                                    </div>
                                    <div className="font-bold text-gray-800">
                                        {t('원')}{(price).toLocaleString()}
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
                                    <div className="font-bold text-gray-800">{t('원')}{maintenancePrice.toLocaleString()}</div>
                                </div>
                                {/*청소비*/}
                                <div className="flex justify-between py-2">
                                    <div className="text-gray-700">수수료</div>
                                    <div className="font-bold text-gray-800">{t('원')}{fee.toLocaleString()}</div>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 mt-3 pt-4">
                                    <div className="text-gray-800 font-medium">{t("총결제금액")}</div>
                                    <div className="font-bold text-roomi text-xl">{t("원")}{(totalPrice-depositPrice).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="mt-6 text-sm space-y-6 max-w-lg mx-auto">
                                <div className="space-y-4">
                                    {/* 1. 전자금융거래 이용약관 */}
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
                                                              strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-600 group-hover:text-gray-800 transition-colors">
                                            {t("전자금융거래 이용약관에 동의합니다. (필수)")}
                                            <a href="https://roomi.co.kr/api/policies/e-terms" target="_blank" rel="noopener noreferrer"
                                               className="text-roomi underline ml-2">
                                              {t('[상세보기]')}
                                            </a>
                                          </span>
                                    </label>

                                    {/* 2. 개인정보 수집 및 이용 */}
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
                                                              strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-600 group-hover:text-gray-800 transition-colors">
                                            {t("결제 취소 및 환불 규정에 동의합니다. (필수)")}
                                            <a href="https://roomi.co.kr/api/policies/refund-policy" target="_blank" rel="noopener noreferrer"
                                               className="text-roomi underline ml-2">
                                              {t('[상세보기]')}
                                            </a>
                                          </span>
                                    </label>

                                    {/* 3. 개인정보 제3자 제공 */}
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={isChecked3}
                                                onChange={() => setIsChecked3(!isChecked3)}
                                                className="sr-only peer"
                                            />
                                            <div
                                                className="w-5 h-5 border-2 border-roomi rounded transition-all peer-checked:bg-roomi flex items-center justify-center">
                                                {isChecked3 && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-600 group-hover:text-gray-800 transition-colors">
                                            {t("개인정보 제3자 제공에 동의합니다. (필수)")}
                                            <a href="https://roomi.co.kr/api/policies/third-party" target="_blank" rel="noopener noreferrer"
                                               className="text-roomi underline ml-2">
                                              {t('[상세보기]')}
                                            </a>
                                          </span>
                                    </label>

                                    {/* 4. 마케팅 수신 동의 (선택) */}
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={isChecked4}
                                                onChange={() => setIsChecked4(!isChecked4)}
                                                className="sr-only peer"
                                            />
                                            <div
                                                className="w-5 h-5 border-2 border-roomi rounded transition-all peer-checked:bg-roomi flex items-center justify-center">
                                                {isChecked4 && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none"
                                                         stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-600 group-hover:text-gray-800 transition-colors">
                                            {t("마케팅 이메일 수신에 동의합니다. (선택)")}
                                            <a href="https://roomi.co.kr/api/policies/marketing-policy" target="_blank" rel="noopener noreferrer"
                                               className="text-roomi underline ml-2">
                                              {t('[상세보기]')}
                                            </a>
                                          </span>
                                    </label>
                                </div>

                                {/* 결제하기 버튼 */}
                                <button
                                    className="w-full py-3 px-4 bg-roomi hover:bg-roomi-3 text-white font-medium rounded-lg transition-colors"
                                    onClick={paymentBtn}
                                >
                                    {t("결제하기")}
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
                        <span className="mt-3 text-gray-500">{t('로딩중...')}</span>
                    </div>
                </div>
            )}

            {(portOneModal && !isMobile) && (
                <Modal
                    isOpen={portOneModal}
                    onRequestClose={() => setPortOneModal(false)}
                    shouldCloseOnOverlayClick={false}   // 바깥영역 클릭 막기
                    shouldCloseOnEsc={false}            // Esc 닫기 막기 (선택)
                    style={{
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 10000,           // 헤더(2000)보다, 리모컨(100)보다 훨씬 크게
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        content: {
                            position: 'relative',    // overlay가 flex container가 되므로 굳이 fixed 안 해도 중앙 정렬됩니다.
                            inset: 'auto',           // 기본 inset(0) 제거
                            border: 'none',
                            background: 'transparent',
                            padding: '0',
                            overflow: 'visible',
                            // 필요하다면 content에도 zIndex 지정 가능
                            zIndex: 10001,
                        },
                    }}
                >
                    {(paymentSuccess) ? (
                        /* 결제 성공 모달 */
                        <>
                            {selectedPayment === "VIRTUAL_ACCOUNT" ? (
                                /* 가상계좌 발급 성공 */
                                <SuccessVirtualAccountPage res={virtualAccountSuccessResponse!} modalClose={() => setPortOneModal(false)}/>
                            ) : (
                                /* 카드결제 성공 */
                                <SuccessPage res={paymentSuccessResponse!}/>
                            )}
                        </>
                    ) : (
                        /* 결제 실패 모달 */
                        <FailPage res={paymentFailedResponse!} modalClose={() => setPortOneModal(false)}/>
                    )}
                </Modal>
            )}
        </div>

    );
}