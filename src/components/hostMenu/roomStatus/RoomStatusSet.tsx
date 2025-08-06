import React, {useEffect, useState} from 'react';
import dayjs, {Dayjs} from "dayjs";
import {RoomData} from "src/types/rooms";
import i18n from "i18next";
import utc from 'dayjs/plugin/utc';
import {ChevronLeft, ChevronRight} from 'lucide-react';

dayjs.extend(utc);

// 날짜 타일에 대한 인터페이스
interface DayObject {
    date: Dayjs;
    isCurrentMonth: boolean;
    isPrevMonth?: boolean;
    isNextMonth?: boolean;
}

// 에어비앤비 스타일 캘린더 컴포넌트 Props 인터페이스
interface AirbnbStyleCalendarProps {
    blockDates: string[];
    reservationDates: string[];
    locale: string;
    // dayPrice: number | null;
    onDateClick?: (dateString: string) => void;
}

// 에어비앤비 스타일 세로 스크롤 캘린더 컴포넌트
const AirbnbStyleCalendar: React.FC<AirbnbStyleCalendarProps> = ({
                                                                     blockDates,
                                                                     reservationDates,
                                                                     locale,
                                                                     // dayPrice,
                                                                     onDateClick
                                                                 }) => {
    // 오늘 날짜부터 12개월 생성 (1년)
    const today = dayjs();
    const generateMonths = (): Dayjs[] => {
        const months: Dayjs[] = [];
        for (let i = 0; i < 12; i++) {
            months.push(today.add(i, 'month'));
        }
        return months;
    };

    const months = generateMonths();

    // 각 월의 날짜 생성
    const generateDaysForMonth = (month: Dayjs): DayObject[] => {
        const startOfMonth = month.startOf('month');
        const endOfMonth = month.endOf('month');
        const daysInMonth = endOfMonth.date();

        // 이번 달의 시작 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)
        const startDayOfWeek = startOfMonth.day();

        // 달력에 표시할 날짜들
        const days: DayObject[] = [];

        // 이전 달의 날짜들로 첫 주 채우기
        const prevMonth = month.subtract(1, 'month');
        const prevMonthDays = prevMonth.daysInMonth();

        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({
                date: prevMonth.date(prevMonthDays - startDayOfWeek + i + 1),
                isCurrentMonth: false,
                isPrevMonth: true
            });
        }

        // 현재 달의 날짜들
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: month.date(i),
                isCurrentMonth: true
            });
        }

        // 다음 달의 날짜들로 마지막 주 채우기
        const nextMonth = month.add(1, 'month');
        const remainingDays = 7 - (days.length % 7);

        if (remainingDays < 7) {
            for (let i = 1; i <= remainingDays; i++) {
                days.push({
                    date: nextMonth.date(i),
                    isCurrentMonth: false,
                    isNextMonth: true
                });
            }
        }

        return days;
    };

    // 요일 표시
    const weekdays: string[] = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <div className="airbnb-calendar-container overflow-auto scrollbar-hidden bg-white rounded-lg shadow-lg p-8 w-full max-w-6xl mx-auto"
             style={{height: 'calc(100vh - 160px)'}}>
            {months.map((month, monthIndex) => (
                <div key={monthIndex} className="month-container mb-16 w-full">
                    <div className="month-header text-3xl font-bold mb-8 text-gray-800 pl-4">
                        {month.format('YYYY년 M월')}
                    </div>
                    <div className="weekday-header grid grid-cols-7 mb-4">
                        {weekdays.map((day, i) => (
                            <div
                                key={i}
                                className={`text-center text-lg font-semibold py-4
                          ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="days-grid grid grid-cols-7 gap-3">
                        {generateDaysForMonth(month).map((dayObj, dayIndex) => {
                            const dateString = dayObj.date.format('YYYY-MM-DD');
                            const isBlocked = blockDates.includes(dateString);
                            const isPast = dayObj.date.isBefore(today, 'day');
                            const isToday = dayObj.date.format('YYYY-MM-DD') === today.format('YYYY-MM-DD');
                            const isSelectable = dayObj.isCurrentMonth && !isPast && !isBlocked;

                            return (
                                <div
                                    key={dayIndex}
                                    className={`
                                aspect-square w-full flex items-center justify-center
                                relative transition-all duration-200 ease-in-out
                                text-xl font-medium
                                ${!dayObj.isCurrentMonth ? 'text-gray-200' : isSelectable ? 'text-gray-800' : 'text-gray-400'}
                                ${isToday ? 'bg-blue-500 text-white rounded-xl font-bold' : ''}
                                ${isBlocked ? 'bg-gray-100 text-gray-400' : ''}
                                ${isSelectable ? 'hover:bg-blue-50 hover:text-blue-600 cursor-pointer' : 'cursor-default'}
                              `}
                                    onClick={() => {
                                        if (isSelectable) {
                                            onDateClick?.(dateString);
                                        }
                                    }}
                                >
                                    <div className={`h-16 w-16 flex items-center justify-center rounded-xl
                                ${isToday ? 'bg-blue-500' : ''}`}>
                                        {dayObj.date.date()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

// 예약 인터페이스
interface Reservation {
    id: number;
    status: string;
    guest_name: string;
    check_in_date: string;
    check_out_date: string;
}

// 상태 레이블 반환 타입
interface StatusLabel {
    label: string;
    className: string;
}

// RoomStatusSet 컴포넌트
const RoomStatusSet: React.FC<{ data: RoomData[], selectedRoom?: number }> = ({
                                                                                  data,
                                                                                  selectedRoom
                                                                              }) => {
    const [customBlockDatesRSS, setCustomBlockDatesRSS] = useState<string[]>([]);
    const [reservationDatesRSS, setReservationDatesRSS] = useState<string[]>([]);
    const [userLocale, setUserLocale] = useState<string>(i18n.language);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 예약 데이터 가져오기
    useEffect(() => {
        if (!selectedRoom) return;

        const fetchReservations = async (): Promise<void> => {
            setLoading(true);
            setError(null);

            try {
                // API 호출 (실제 구현 시 주석 해제)
                // const response = await fetch(`/api/rooms/${selectedRoom}/reservations`);
                // if (!response.ok) throw new Error('예약 데이터를 불러오는데 실패했습니다.');
                // const data = await response.json();

                // 더미 데이터 (API 연동 시 제거)
                const dummyData: Reservation[] = [
                    {
                        id: 1,
                        status: 'PENDING',
                        guest_name: '김예약',
                        check_in_date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
                        check_out_date: dayjs().add(5, 'day').format('YYYY-MM-DD')
                    },
                    {
                        id: 2,
                        status: 'APPROVED',
                        guest_name: '이승인',
                        check_in_date: dayjs().add(10, 'day').format('YYYY-MM-DD'),
                        check_out_date: dayjs().add(17, 'day').format('YYYY-MM-DD')
                    },
                    {
                        id: 3,
                        status: 'APPROVED',
                        guest_name: '박확정',
                        check_in_date: dayjs().add(20, 'day').format('YYYY-MM-DD'),
                        check_out_date: dayjs().add(22, 'day').format('YYYY-MM-DD')
                    },
                    {
                        id: 4,
                        status: 'REJECTED',
                        guest_name: '최거절',
                        check_in_date: dayjs().add(25, 'day').format('YYYY-MM-DD'),
                        check_out_date: dayjs().add(30, 'day').format('YYYY-MM-DD')
                    }
                ];

                setReservations(dummyData);
                setLoading(false);
            } catch (err) {
                setError((err as Error).message);
                setLoading(false);
            }
        };

        fetchReservations();
    }, [selectedRoom]);

    // 예약 상태에 따른 날짜 계산
    useEffect(() => {
        if (!selectedRoom) return;

        const selectedRoomData = data.find((room) => room.id === selectedRoom);

        if (!selectedRoomData) {
            setCustomBlockDatesRSS([]);
            setReservationDatesRSS([]);
            return;
        }

        const customBlockArrRSS: string[] = [];
        const reservationArrRSS: string[] = [];

        // API에서 가져온 예약 데이터 처리
        reservations.forEach((reservation) => {
            const startDate = dayjs(reservation.check_in_date);
            const endDate = dayjs(reservation.check_out_date);
            const today = dayjs().format('YYYY-MM-DD');

            // Generate date range
            let currentDate = startDate;
            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
                const formattedDate = currentDate.format('YYYY-MM-DD');
                if (reservation.status === 'BLOCKED') {
                    if (formattedDate >= today) {
                        customBlockArrRSS.push(formattedDate);
                    }
                } else if (formattedDate >= today) {
                    reservationArrRSS.push(formattedDate);
                }
                currentDate = currentDate.add(1, 'day');
            }
        });

        // 기존 데이터도 유지
        selectedRoomData.unavailable_dates?.reservations?.forEach((reservation) => {
            const startDate = dayjs.utc(reservation.check_in_date);
            const endDate = dayjs.utc(reservation.check_out_date);
            const today = dayjs().format('YYYY-MM-DD');

            let currentDate = startDate;
            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
                const formattedDate = currentDate.format('YYYY-MM-DD');
                if (reservation.status === 'BLOCKED') {
                    if (formattedDate >= today) {
                        customBlockArrRSS.push(formattedDate);
                    }
                } else if (formattedDate >= today) {
                    reservationArrRSS.push(formattedDate);
                }
                currentDate = currentDate.add(1, 'day');
            }
        });

        setCustomBlockDatesRSS(customBlockArrRSS);
        setReservationDatesRSS(reservationArrRSS);
    }, [selectedRoom, data, reservations]);

    // 날짜 클릭 처리
    const handleDateClick = (dateString: string): void => {
        console.log('선택한 날짜:', dateString);
        // 여기에 날짜 클릭 시 수행할 동작 추가
    };

    // 상태 라벨 변환
    const getStatusLabel = (status: string): StatusLabel => {
        switch (status) {
            case 'PENDING':
                return {
                    label: '승인대기',
                    className: 'bg-yellow-100 text-yellow-800'
                };
            case 'APPROVED':
                return {
                    label: '승인',
                    className: 'bg-green-100 text-green-800'
                };
            case 'REJECTED':
                return {
                    label: '거절',
                    className: 'bg-red-100 text-red-800'
                };
            case 'CANCELED':
                return {
                    label: '취소',
                    className: 'bg-gray-100 text-gray-800'
                };
            case 'BLOCKED':
                return {
                    label: '차단됨',
                    className: 'bg-gray-300 text-gray-700'
                };
            default:
                return {
                    label: '기타',
                    className: 'bg-blue-100 text-blue-800'
                };
        }
    };

    // 방 정보 (가격 정보 등) 가져오기
    const roomInfo = data.find((room) => room.id === selectedRoom);
    const dayPrice = roomInfo?.day_price || null;

    return (
        <div className="flex flex-col md:flex-row gap-6 bg-white rounded-lg p-4 h-full"
             style={{minHeight: 'calc(100vh - 100px)'}}>
            {/* 캘린더 영역 - 에어비앤비 스타일 */}
            <div className="md:w-3/4 w-full flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">예약 현황</h3>
                <div className="calendar-container rounded-lg overflow-hidden border border-gray-200">
                    <AirbnbStyleCalendar
                        blockDates={customBlockDatesRSS}
                        reservationDates={reservationDatesRSS}
                        locale={userLocale}
                        // dayPrice={dayPrice}
                        onDateClick={handleDateClick}
                    />
                </div>

                {/* 범례 */}
                <div className="flex gap-6 mt-4 justify-center">
                    <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-red-100 mr-2"></div>
                        <span className="text-sm text-gray-600">예약중</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-gray-200 mr-2"></div>
                        <span className="text-sm text-gray-600">차단됨</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
                        <span className="text-sm text-gray-600">오늘</span>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default RoomStatusSet;