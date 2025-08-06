import React, {useEffect, useState} from 'react';
import dayjs, {Dayjs} from "dayjs";
import {RoomData, Schedules} from "src/types/rooms";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import {createBulkBlocks, unblockDate} from "src/api/api";
import {useDataUpdateStore} from "src/components/stores/DataUpdateStore";
import i18n from "i18next";
import utc from 'dayjs/plugin/utc';
import ConfirmationModal from "../../modals/ComfirmationModal";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
interface AirbnbStyleCalendarProps {
    blockDates: string[];
    reservationDates: string[];
    locale: string;
    // dayPrice: number | null;
    onDateClick?: (dateString: string) => void;
    startDate: string | null;
    endDate: string | null;
}
// 에어비앤비 스타일 캘린더 컴포넌트
// 에어비앤비 스타일 캘린더 컴포넌트 완전 수정본
const AirbnbStyleCalendar: React.FC<AirbnbStyleCalendarProps> = ({
                                                                     blockDates,
                                                                     reservationDates,
                                                                     locale,
                                                                     onDateClick,
                                                                     startDate,
                                                                     endDate
                                                                 }) => {
    // 반응형 디자인을 위한 화면 크기 상태 관리
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkIfDesktop = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        // 초기 확인
        checkIfDesktop();

        // resize 이벤트 리스너 추가
        window.addEventListener('resize', checkIfDesktop);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => window.removeEventListener('resize', checkIfDesktop);
    }, []);

    const today = dayjs();
    const months = Array.from({ length: 6 }, (_, i) => today.add(i, 'month'));
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    const generateDaysForMonth = (month: Dayjs) => {
        const firstDayOfMonth = month.startOf('month');
        const lastDayOfMonth = month.endOf('month');

        // 달력 시작점 (첫째 주 일요일)
        const firstDayOfCalendar = firstDayOfMonth.subtract(firstDayOfMonth.day(), 'day');
        // 달력 끝점 (마지막 주 토요일)
        const lastDayOfCalendar = lastDayOfMonth.add(6 - lastDayOfMonth.day(), 'day');

        const days = [];
        let day = firstDayOfCalendar;

        while (day.isBefore(lastDayOfCalendar) || day.isSame(lastDayOfCalendar, 'day')) {
            days.push({
                date: day,
                isCurrentMonth: day.month() === month.month()
            });
            day = day.add(1, 'day');
        }

        return days;
    };

    // 날짜가 선택된 범위 내에 있는지 확인하는 함수
    const isInRange = (date: Dayjs) => {
        if (!startDate || !endDate) return false;
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        const currentDate = date.format('YYYY-MM-DD');
        // 시작일과 종료일 사이에 있는 날짜인지 확인
        return date.isAfter(start) && date.isBefore(end);
    };

    // 날짜가 시작일인지 확인
    const isStartDate = (date: Dayjs) => {
        if (!startDate) return false;
        return date.format('YYYY-MM-DD') === startDate;
    };

    // 날짜가 종료일인지 확인
    const isEndDate = (date: Dayjs) => {
        if (!endDate) return false;
        return date.format('YYYY-MM-DD') === endDate;
    };

    // 날짜 클릭 핸들러 - 예약된 날짜 클릭을 완전히 차단
    const handleDateClick = (dateString: string) => {
        // 예약된 날짜는 클릭 불가
        if (reservationDates.includes(dateString)) {
            console.log('예약된 날짜는 선택할 수 없습니다.');
            return;
        }

        // 날짜 클릭 이벤트 전달
        onDateClick?.(dateString);
    };

    return (
        <div className="airbnb-calendar-container overflow-auto scrollbar-hidden bg-white p-6 w-full"
             style={{
                 height: 'calc(100vh - 240px)',
                 maxWidth: '900px',
             }}>
            {months.map((month, monthIndex) => (
                <div key={monthIndex} className="month-container mb-10 w-full">
                    <div className="month-header text-xl font-bold mb-6 text-gray-800 pl-2 border-l-4 border-roomi">
                        {month.format('YYYY년 M월')}
                    </div>
                    <div className="weekday-header grid grid-cols-7 mb-4">
                        {weekdays.map((day, i) => (
                            <div
                                key={i}
                                className={`text-center text-sm font-semibold py-2
                                ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="days-grid grid grid-cols-7">
                        {generateDaysForMonth(month).map((dayObj, dayIndex) => {
                            // 현재 달에 속하지 않은 날짜는 빈 셀로 표시
                            if (!dayObj.isCurrentMonth) {
                                return <div key={dayIndex} className="w-full"></div>;
                            }

                            const dateString = dayObj.date.format('YYYY-MM-DD');
                            const isBlocked = blockDates.includes(dateString);
                            const isReserved = reservationDates.includes(dateString);
                            const isUnavailable = isBlocked || isReserved;
                            const isPast = dayObj.date.isBefore(today, 'day');

                            // 중요: 예약된 날짜는 선택 불가능하게 설정
                            const isSelectable = !isPast && !isReserved;

                            // 날짜 선택 상태 관련 변수
                            const isStart = isStartDate(dayObj.date);
                            const isEnd = isEndDate(dayObj.date);
                            const isRange = isInRange(dayObj.date);

                            return (
                                <div
                                    key={dayIndex}
                                    className={`
                                    w-full flex items-center justify-center
                                    relative transition-all duration-200 ease-in-out text-sm
                                    ${isSelectable ? 'text-gray-800' : 'text-gray-400'}
                                    ${isReserved ? 'text-red-500' : ''}
                                    ${isRange ? 'bg-roomi/10' : ''}
                                    ${isStart && endDate ? 'rounded-l-full' : ''}
                                    ${isEnd ? 'rounded-r-full' : ''}
                                    ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed'}
                                `}
                                    onClick={() => {
                                        // 예약된 날짜는 클릭해도 아무런 동작도 하지 않음
                                        if (isSelectable) {
                                            handleDateClick(dateString);
                                        }
                                    }}
                                    title={isReserved ? '예약된 날짜입니다 (수정 불가)' : isBlocked ? '블록된 날짜입니다 (클릭하여 해제)' : '클릭하여 날짜 선택'}
                                >
                                    <div
                                        className={`flex items-center justify-center ${isStart || isEnd ? 'bg-roomi text-white rounded-full z-10' : ''}`}
                                        style={{
                                            height: isDesktop ? '40px' : '32px',
                                            width: isDesktop ? '40px' : '32px',
                                            fontSize: isDesktop ? '1.1rem' : '0.9rem'
                                        }}
                                    >
                                        {dayObj.date.date()}
                                    </div>

                                    {/* 블록된 날짜와 예약된 날짜에 대한 가로 선 표시 - 색상 차이 적용 */}
                                    {isUnavailable && (
                                        <div
                                            className="absolute pointer-events-none z-10 w-full h-full flex items-center justify-center">
                                            <div className={`${isReserved ? 'bg-red-500' : 'bg-gray-500'} w-1/3 h-0.5`}></div>
                                        </div>
                                    )}

                                    {/* 시작일 후의 연결선 */}
                                    {isStart && endDate && (
                                        <div className="absolute right-0 top-0 h-full w-1/2 bg-roomi/10"></div>
                                    )}

                                    {/* 종료일 전의 연결선 */}
                                    {isEnd && (
                                        <div className="absolute left-0 top-0 h-full w-1/2 bg-roomi/10"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

const RoomStatusConfig = ({data, selectedRoom}: { data: RoomData[], selectedRoom?: number }) => {
    // 반응형 디자인을 위한 화면 크기 상태 관리
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkIfDesktop = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        // 초기 확인
        checkIfDesktop();

        // resize 이벤트 리스너 추가
        window.addEventListener('resize', checkIfDesktop);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => window.removeEventListener('resize', checkIfDesktop);
    }, []);
    const [customBlockDatesRSC, setCustomBlockDatesRSC] = useState<string[]>([]);
    const [reservationDatesRSC, setReservationDatesRSC] = useState<string[]>([]);
    const [startDateRSC, setStartDateRSC] = useState<string | null>(null);
    const [endDateRSC, setEndDateRSC] = useState<string | null>(null);
    const [dateRangeRSC, setDateRangeRSC] = useState<string[]>([]);
    const [isReasonChk, setIsReasonChk] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isBlockDate, setIsBlockDate] = useState('');
    const {dataUpdate, toggleDataUpdate} = useDataUpdateStore();
    const [calendarKey, setCalendarKey] = useState(0);
    const [userLocale, setUserLocale] = useState(i18n.language);

    // RoomStatusConfig 컴포넌트 내부의 handleDayClick 함수
    const handleDayClick = (dateString: string) => {
        // 중요: AirbnbStyleCalendar 컴포넌트에서 이미 예약된 날짜 클릭을 필터링하므로
        // 여기서는 예약된 날짜가 들어오지 않아야 합니다. 하지만 추가 안전장치로 다시 체크합니다.
        if (reservationDatesRSC.includes(dateString)) {
            console.log('예약된 날짜는 수정할 수 없습니다:', dateString);
            return;
        }

        // 블록된 날짜인지 확인 - 블록 해제 모달 표시
        if (customBlockDatesRSC.includes(dateString)) {
            console.log('블록된 날짜 선택됨:', dateString);
            // 블록 해제 모달 오픈
            setShowModal(true);
            // 블락 일자 업데이트
            setIsBlockDate(dateString);
            setStartDateRSC(null);
            setEndDateRSC(null);
            setDateRangeRSC([]);
            return;
        }

        // 일반 날짜 선택 로직
        if (!startDateRSC || (startDateRSC && endDateRSC)) {
            setStartDateRSC(dateString);
            setEndDateRSC(null);
            setDateRangeRSC([]);
            setIsReasonChk(false);
        } else {
            if (new Date(dateString) >= new Date(startDateRSC)) {
                setEndDateRSC(dateString);
            } else {
                setStartDateRSC(dateString);
                setEndDateRSC(null);
                setDateRangeRSC([]);
                setIsReasonChk(false);
            }
        }
    };

    // startDateRSC 또는 endDateRSC 가 변경 될 때
    useEffect(() => {
        // 둘 다 값이 있을 경우
        if (startDateRSC && endDateRSC) {
            const generateDateRange = (start: string, end: string) => {
                const startDate = dayjs(start, 'YYYY-MM-DD'); // 시작 날짜
                const endDate = dayjs(end, 'YYYY-MM-DD'); // 끝 날짜
                const dates: string[] = [];

                let currentDate = startDate;

                // 현재 선택된 방의 데이터를 가져옵니다.
                const selectedRoomData = data.find((room) => room.id === selectedRoom);
                // 예약 데이터 가져오기
                const reservations = selectedRoomData?.unavailable_dates?.reservations || [];
                console.log('예약 데이터 가져옴', reservations);

                // 날짜 범위 생성
                while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
                    const formattedDate = currentDate.format('YYYY-MM-DD');
                    // 비교용
                    const formattedDateUTC = dayjs.utc(formattedDate, 'YYYY-MM-DD');

                    // 해당 날짜가 예약된 날짜인지 확인
                    const isUnavailable = reservations.some((reservation) =>
                        reservation.status &&
                        dayjs.utc(reservation.check_in_date).isSameOrBefore(formattedDateUTC, 'day') &&
                        dayjs.utc(reservation.check_out_date).isSameOrAfter(formattedDateUTC, 'day')
                    );

                    console.log('formattedDate',formattedDate, 'isUnavailable',isUnavailable);
                    // 예약되지 않은 날짜만 추가
                    if (!isUnavailable) {
                        dates.push(formattedDate);
                    }

                    currentDate = currentDate.add(1, 'day'); // 하루씩 증가
                }

                return dates;
            };
            // 범위 내 날짜 배열 생성
            const result = generateDateRange(startDateRSC, endDateRSC);
            setDateRangeRSC(result);
        }
    }, [startDateRSC, endDateRSC]);

    // selectedRoom 값이 바뀔 때마다 관련된 날짜 업데이트
    useEffect(() => {
        if (!selectedRoom) return;

        const selectedRoomData = data.find((room) => room.id === selectedRoom);

        if (!selectedRoomData) {
            setCustomBlockDatesRSC([]);
            setReservationDatesRSC([]);
            return;
        }

        const customBlockArrRSC: string[] = [];
        const reservationArrRSC: string[] = [];

        selectedRoomData.unavailable_dates?.reservations?.forEach((reservation) => {
            const startDate = dayjs.utc(reservation.check_in_date);
            const endDate = dayjs.utc(reservation.check_out_date);
            const today = dayjs().format('YYYY-MM-DD');

            // 날짜 범위 생성
            let currentDate = startDate;
            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
                const formattedDate = currentDate.format('YYYY-MM-DD');
                if (reservation.status === 'BLOCKED') {
                    if (formattedDate >= today) {
                        customBlockArrRSC.push(formattedDate);
                    }
                } else {
                    if (formattedDate >= today) {
                        reservationArrRSC.push(formattedDate);
                    }
                }
                currentDate = currentDate.add(1, 'day');
            }
        });

        setCustomBlockDatesRSC(customBlockArrRSC);
        setReservationDatesRSC(reservationArrRSC);
        // 페이지가 새로고침되거나 컴포넌트가 처음 마운트될 때 key를 0으로 설정
        setCalendarKey(0);
    }, [selectedRoom, data, dataUpdate]);

    // 블락 처리 함수
    const handleSubmitBtn = async () => {
        // 사용 불가 처리 라디오가 체크면 실행
        try {
            // 현재 선택된 방의 데이터를 가져옵니다.
            const selectedRoomData = data.find((room) => room.id === selectedRoom);
            if (selectedRoomData) {
                const roomId = selectedRoomData.id;
                const day_price: number | null = selectedRoomData.day_price ?? null;
                const schedulesData: Schedules[] = [];
                dateRangeRSC.map((date, index) => (
                    schedulesData.push({
                        "date": new Date(date),
                        "dayPrice": day_price,
                        "isAvailable": false,
                        "description": "객실 사용 불가",
                        "reason": "사용불가 사유",
                        "isBlocked": "true"
                    })
                ));
                const response = await createBulkBlocks(roomId, schedulesData);
                console.log(response);
                toggleDataUpdate();
            }
            setShowUpdateModal(false);
            setStartDateRSC(null);
            setEndDateRSC(null);
            setDateRangeRSC([]);
            setIsBlockDate('');
            setIsReasonChk(false);
            // 캘린더 리렌더링 (포커스 해제)
            setCalendarKey(prevKey => prevKey + 1);
        } catch (error) {
            console.error("실패:", error);
        }
    };

    // 블락 해제 함수
    const handleUnblockBtn = async () => {
        try {
            // 현재 선택된 방의 데이터를 가져옵니다.
            const selectedRoomData = data.find((room) => room.id === selectedRoom);
            if (selectedRoomData) {
                const roomId = selectedRoomData.id;
                const date = new Date(isBlockDate);
                const response = await unblockDate(roomId, date.toISOString());
                console.log(response);
                toggleDataUpdate();
            }
            setShowModal(false);
            setStartDateRSC(null);
            setEndDateRSC(null);
            setDateRangeRSC([]);
            setIsBlockDate('');
            // 캘린더 리렌더링 (포커스 해제)
            setCalendarKey(prevKey => prevKey + 1);
        } catch (error) {
            console.error("실패:", error);
        }
    };

    // 모달 취소, 블락 일자 업뎃
    const hanbleCencelBtn = () => {
        setIsBlockDate('');
        setShowModal(false);
        setShowUpdateModal(false);
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 bg-white rounded-lg shadow-sm p-6"
             style={{minHeight: 'calc(100vh - 100px)'}}>
            {/* 캘린더 영역 - 에어비앤비 스타일 */}
            <div className="md:w-2/3 w-full flex flex-col">
                {/*<h3 className="text-xl font-semibold mb-4 text-gray-800">날짜 관리</h3>*/}
                {/* 웹에서 더 큰 달력을 위한 스타일 수정 */}
                <div className=" rounded-lg overflow-hidden">
                    <AirbnbStyleCalendar
                        blockDates={customBlockDatesRSC}
                        reservationDates={reservationDatesRSC}
                        locale={userLocale}
                        onDateClick={handleDayClick}
                        startDate={startDateRSC}
                        endDate={endDateRSC}
                    />
                </div>

                <div className="flex flex-wrap gap-6 mt-6 justify-center">
                    <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-red-100 mr-2"></div>
                        <span className="text-base text-gray-600">예약중</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-gray-100 mr-2 relative">
                            <div className="absolute inset-0 overflow-hidden">
                                <div
                                    className="absolute bg-red-500"
                                    style={{
                                        width: "140%",
                                        height: "3px",
                                        transform: "rotate(45deg)",
                                        transformOrigin: "0 0",
                                        top: "0",
                                        left: "0"
                                    }}
                                ></div>
                            </div>
                        </div>
                        <span className="text-base text-gray-600">차단됨</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-roomi/10 mr-2"></div>
                        <span className="text-base text-gray-600">선택 범위</span>
                    </div>
                </div>
            </div>

            <div className="md:w-1/3 w-full">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">선택 정보</h3>
                <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                    <div className="mb-6">
                        {startDateRSC !== null || endDateRSC !== null ? (
                            <div className="text-gray-800 font-medium text-lg">{startDateRSC} - {endDateRSC || ('?')}</div>
                        ) : (
                            <div className="text-gray-500 font-medium">날짜를 선택해주세요.</div>
                        )}
                    </div>

                    <div className="w-full mb-6 p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-center mb-3">
                            <input id="blockRadio"
                                   type="checkbox"
                                   value=""
                                   className="w-5 h-5 text-white focus:ring-roomi accent-roomi"
                                   checked={isReasonChk}
                                   onChange={(e) => setIsReasonChk(e.target.checked)}
                                   disabled={startDateRSC === null || endDateRSC === null}/>
                            <label htmlFor="blockRadio" className="ms-3 text-base font-medium text-gray-900">
                                사용불가 처리
                            </label>
                        </div>
                        {isReasonChk && (
                            <div className="mt-4">
                                <div className="text-sm text-gray-600 mb-2">
                                    <label htmlFor="reason">사용불가 사유를 입력해주세요.</label>
                                </div>
                                <input
                                    id="reason"
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi"
                                    placeholder="사유 입력"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            className="text-white text-base bg-roomi hover:bg-roomi/90 rounded-lg px-6 py-3 font-medium transition duration-300 ease-in-out"
                            onClick={() => setShowUpdateModal(true)}
                            disabled={startDateRSC === null || endDateRSC === null || !isReasonChk}
                        >
                            완료
                        </button>
                    </div>
                </div>
            </div>

            {/* 블록 해제 모달 */}
            {showModal && (
                <ConfirmationModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onConfirm={handleUnblockBtn}
                    title="블락을 해제하시겠습니까??"
                    confirmText="확인인"
                    cancelText="취소"
                    icon="question"
                    confirmButtonStyle="primary"
                />
            )}

            {/* 블록 설정 확인 모달 */}
            {showUpdateModal && (
                <ConfirmationModal
                    isOpen={showUpdateModal}
                    onClose={() => setShowUpdateModal(false)}
                    onConfirm={handleSubmitBtn}
                    title="사용불가 처리 하시겠습니까????!"
                    confirmText="확인"
                    cancelText="취소"
                    icon="warning"
                    confirmButtonStyle="primary"
                />
            )}
        </div>
    );
};

export default RoomStatusConfig;