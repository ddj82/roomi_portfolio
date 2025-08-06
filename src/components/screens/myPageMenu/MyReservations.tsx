import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {getReservationHistory} from "../../../api/api";
import {ReservationHistory} from "../../../types/rooms";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import MyReservationDetails from "./MyReservationDetails";
import {useMediaQuery} from "react-responsive";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";

dayjs.extend(utc);

export default function MyReservations() {
    const {t} = useTranslation();
    const [nowReserved, setNowReserved] = useState<ReservationHistory[] | null>(null);
    const [beforeReserved, setBeforeReserved] = useState<ReservationHistory[] | null>(null);
    const [reservedListSet, setReservedListSet] = useState(true);
    const [reservedDetails, setReservedDetails] = useState<ReservationHistory | null>(null);
    const isMobile = useMediaQuery({ maxWidth: 768 }); // 768px 이하를 모바일로 간주

    useEffect(() => {
        const reservationHistory = async () => {
            try {
                const response = await getReservationHistory();
                const responseJson = await response.json();
                console.log('예약내역 데이터:', responseJson.data);

                const today = dayjs().format('YYYY-MM-DD');

                // 🔥 예약을 nowReserved와 beforeReserved로 분류
                const nowReservedData = responseJson.data.filter(
                    (reservation: ReservationHistory) =>
                        (
                            dayjs.utc(reservation.check_in_date).format('YYYY-MM-DD') >= today ||
                            dayjs.utc(reservation.check_out_date).format('YYYY-MM-DD') >= today
                        ) &&
                        reservation.status !== 'CANCELLED' &&
                        reservation.status !== 'CHECKED_OUT'
                );

                const beforeReservedData = responseJson.data.filter(
                    (reservation: ReservationHistory) =>
                        dayjs.utc(reservation.check_out_date).format('YYYY-MM-DD') < today ||
                        reservation.status === 'CANCELLED'
                );
                const sortedNowReserved = nowReservedData.sort((a: ReservationHistory, b: ReservationHistory) => {
                    const today = dayjs().format('YYYY-MM-DD');

                    // 이용중 상태 확인
                    const aIsInUse = (
                        (a.status === 'CONFIRMED' && a.payment_status === 'PAID' &&
                            dayjs.utc(a.check_out_date).format('YYYY-MM-DD') >= today &&
                            dayjs.utc(a.check_in_date).format('YYYY-MM-DD') <= today) ||
                        a.status === 'IN_USE'
                    );

                    const bIsInUse = (
                        (b.status === 'CONFIRMED' && b.payment_status === 'PAID' &&
                            dayjs.utc(b.check_out_date).format('YYYY-MM-DD') >= today &&
                            dayjs.utc(b.check_in_date).format('YYYY-MM-DD') <= today) ||
                        b.status === 'IN_USE'
                    );

                    // 이용중인 것을 최상단으로
                    if (aIsInUse && !bIsInUse) return -1;
                    if (!aIsInUse && bIsInUse) return 1;

                    // 같은 상태면 체크인 날짜 기준 정렬 (최신순)
                    return dayjs.utc(a.check_in_date).valueOf() - dayjs.utc(b.check_in_date).valueOf();
                });

                // 지난 예약 데이터 정렬 (체크인 날짜 기준 최신순)
                const sortedBeforeReserved = beforeReservedData.sort((a: ReservationHistory, b: ReservationHistory) => {
                    return dayjs.utc(a.check_in_date).valueOf() - dayjs.utc(b.check_in_date).valueOf();
                });
                // setNowReserved(nowReservedData);
                // setBeforeReserved(beforeReservedData);
                // 이렇게 바꿔야 합니다:
                setNowReserved(sortedNowReserved);      // ✅ 정렬된 데이터
                setBeforeReserved(sortedBeforeReserved); // ✅ 정렬된 데이터
            } catch (e) {
                console.error('예약내역 가져오기 실패', e);
            }
        };
        reservationHistory();
    }, []);

    const renderReservationUI = (reservations: ReservationHistory[], emptyMessage: string) => {
        if (!reservations || reservations.length === 0) {
            return <div className="flex_center">{emptyMessage}</div>;
        }
        return renderReservationList(reservations);
    };

    const renderStatus = (status: string, paymentStatus: string, checkIn: string, checkOut: string) => {
        const today = dayjs().format('YYYY-MM-DD');

        if (status === 'CONFIRMED') { // 승인 완료
            if (paymentStatus === 'UNPAID') { // 승인 완료, 결제전
                return renderStatusUI('bg-[#999999]', t('결제대기'));
            } else if (paymentStatus === 'PAID') { // 승인 완료, 결제 완료
                if (checkOut >= today && checkIn <= today) { // 이용중
                    return renderStatusUI('bg-[#67b988]',  t('이용중'));
                }
                return renderStatusUI('bg-roomi',  t('예약완료'));
            }
        } else if (status === 'COMPLETED') { // 계약 종료
            // 보증금환불여부 확인
            return renderStatusUI('bg-[#999999]',  t('계약종료'));
        } else if (status === 'CANCELLED') { // 취소
            return renderStatusUI('bg-[#999999]',  t('계약취소'));
        } else if (status === 'REJECTED') { // 승인 거절
            return renderStatusUI('bg-red-700',  t('승인거절'));
        }else if (status === 'IN_USE') { // 승인 거절
            return renderStatusUI('bg-[#67b988]',  t('이용중'));
        }else if (status === 'CHECKED_OUT') { // 승인 거절
            return renderStatusUI('bg-[#999999]',  t('환급대기'));
        }

        else { // 승인 대기, 결제전, 기본값
            return renderStatusUI('bg-gray-500',  t('승인대기'));
        }
    };

    const renderStatusUI = (backgroundColor: string, message: string) => {
        return (
            <div className={`text-xs text-white p-1 px-2.5 rounded ${backgroundColor}`}>
                <span>{message}</span>
            </div>
        );
    };

    // 텍스트 메시지를 결정하는 로직만 따로 분리
    const getStatusMessage = (status: string, paymentStatus: string, checkIn: string, checkOut: string): { backgroundColor: string, message: string } => {
        const today = dayjs().format('YYYY-MM-DD');

        if (status === 'CONFIRMED') {
            if (paymentStatus === 'UNPAID') {
                return { backgroundColor: 'bg-gray-700', message: '결제대기' };
            } else if (paymentStatus === 'PAID') {
                if (checkOut >= today && checkIn <= today) {
                    return { backgroundColor: 'bg-green-500', message: '이용중' };
                }
                return { backgroundColor: 'bg-roomi', message: '예약완료' };
            }
        } else if (status === 'COMPLETED') {
            return { backgroundColor: 'bg-gray-500', message: '계약종료' };
        } else if (status === 'IN_USE') {
            return { backgroundColor: 'bg-[#67b988]', message: '이용중' };
        }else if (status === 'CHECKED_OUT') {
            return { backgroundColor: 'bg-gray-700', message: '환급대기' };
        }
        else if (status === 'CANCELLED') {
            return { backgroundColor: 'bg-gray-700', message: '계약취소' };
        }

        return { backgroundColor: 'bg-gray-500', message: '승인대기' };
    };

    const renderReservationList = (list: ReservationHistory[]) => {
        return list.map((item) => (
            // 모바일에서는 세로형, 웹에서는 가로형 레이아웃
            <div
                key={item.order_id}
                className="my-4 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all "
                style={{backgroundColor: '#F7F7F7'}}
                onClick={() => setReservedDetails(item)}
            >
                {/* 모바일 버전 - 두 번째 이미지 스타일 */}
                <div className="md:hidden p-4">
                    {/* 상단 날짜 정보 */}
                    <div className="text-gray-500 text-sm mb-3">
                        {dayjs.utc(item.check_in_date).format('YYYY.MM.DD')} - {dayjs.utc(item.check_out_date).format('YYYY.MM.DD')}

                        <div className="inline-block ml-2">
                            {renderStatus(
                                item.status,
                                item.payment_status,
                                dayjs.utc(item.check_in_date).format('YYYY-MM-DD'),
                                dayjs.utc(item.check_out_date).format('YYYY-MM-DD')
                            )}
                        </div>
                    </div>

                    <div className="mt-2">


                    </div>

                    {/* 컨텐츠 영역 */}
                    <div className="flex">
                        {/* 이미지 - 정사각형 */}
                        <div className="w-1/4 mr-3">
                            <div className="relative" style={{paddingBottom: '100%'}}>
                            <img
                                    src={item.room.detail_urls?.[0] || '/placeholder-image.jpg'}
                                    alt="thumbnail"
                                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                                />
                            </div>
                        </div>

                        {/* 정보 */}
                        <div className="w-3/4 flex flex-col">
                            <div className="text-base font-semibold text-gray-900 flex items-center">
                                {item.room.title}
                            </div>

                            <div className="text-sm text-gray-600 mt-1">
                                {item.room.address}
                            </div>


                            <div className="text-base font-bold mt-2 mb-2">
                                {item.symbol}{item.total_price.toLocaleString()}
                            </div>
                        </div>

                    </div>

                    {/* 상태 - 좌측 정렬 */}

                </div>

                <div
                    className="hidden md:flex flex-row items-stretch px-4 py-4 w-full rounded-lg"
                    style={{backgroundColor: '#F5F5F5'}}
                >
                    {/* 썸네일 이미지 */}
                    <div className="w-32 h-32 flex-shrink-0 mr-5 self-start">
                        <img
                            src={item.room.detail_urls?.[0] || '/placeholder-image.jpg'}
                            alt="thumbnail"
                            className="w-full h-full object-cover rounded-md"
                        />
                    </div>

                    {/* 정보 영역 */}
                    <div className="flex flex-col justify-start flex-grow py-1">
                        {/* 위쪽: 제목, 날짜, 주소, 금액 */}
                        <div>
                            <div className="text-base font-semibold text-gray-900">
                                {item.room.title}
                            </div>

                            <div className="text-sm text-gray-600 mt-1">
                                {dayjs.utc(item.check_in_date).format('YYYY.MM.DD')} - {dayjs.utc(item.check_out_date).format('YYYY.MM.DD')}
                            </div>

                            <div className="text-sm text-gray-600 mt-1">{item.room.address}</div>

                            <div className="text-sm text-gray-900 font-bold mt-1">
                                총 금액: {item.symbol}{item.total_price.toLocaleString()}
                            </div>
                        </div>

                        {/* 아래쪽: 상태 뱃지 */}
                        <div className="mt-2 w-fit">
                            {renderStatus(
                                item.status,
                                item.payment_status,
                                dayjs.utc(item.check_in_date).format('YYYY-MM-DD'),
                                dayjs.utc(item.check_out_date).format('YYYY-MM-DD')
                            )}
                        </div>
                    </div>

                    {/* 화살표 - 세로 중앙 정렬 */}
                    <div className="flex items-center pl-3">
                        <FontAwesomeIcon icon={faChevronRight} className="text-gray-500 text-xl"/>
                    </div>
                </div>
            </div>
        ));
    };
    return (
        <div className=" py-0 md:px-8 relative">
            {/*타이틀*/}
            <div className="flex justify-between items-center mb-4">
                {reservedDetails ? (
                    /*예약 상세 정보*/
                    <button type="button" onClick={() => setReservedDetails(null)}
                            className="py-2 px-4 text-sm rounded font-bold">
                        {t('목록 보기')}
                    </button>
                ) : (
                    /*예약 내역*/
                    <div>
                        <button type="button" onClick={() => setReservedListSet(true)}
                                className={`py-2 px-4 text-sm rounded font-bold ${!reservedListSet && 'text-gray-400'}`}
                        >
                            {t('현재 예약')}
                        </button>
                        <button type="button" onClick={() => setReservedListSet(false)}
                                className={`py-2 px-4 text-sm rounded font-bold ${reservedListSet && 'text-gray-400'}`}
                        >
                            {t('지난 예약')}
                        </button>
                    </div>
                )}
            </div>
            {/*컨텐츠*/}
            <div>
                {reservedDetails ? (
                    /*예약 상세 정보*/
                    <MyReservationDetails
                        reserveData={reservedDetails}
                        statusInfo={getStatusMessage(
                            reservedDetails.status,
                            reservedDetails.payment_status,
                            dayjs.utc(reservedDetails.check_in_date).format('YYYY-MM-DD'),
                            dayjs.utc(reservedDetails.check_out_date).format('YYYY-MM-DD')
                        )}
                    />
                ) : (
                    /*예약 내역*/
                    <>
                        {reservedListSet ? (
                            <>{nowReserved && renderReservationUI(nowReserved, "현재 예약이 없습니다.")}</>
                        ) : (
                            <>{beforeReserved && renderReservationUI(beforeReserved, "지난 예약이 없습니다.")}</>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
