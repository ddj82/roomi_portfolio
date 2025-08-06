import React, {useEffect, useState} from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import {useDateStore} from "src/components/stores/DateStore";
import {useTranslation} from "react-i18next";
import {faCalendarDay} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";
import i18n from "i18next";
import '../../../css/AccordionCalendar.css'; // 새로운 CSS 파일 생성

interface AccordionCalendarProps {
    onSave?: () => void; // 날짜 선택 완료 시 호출될 콜백 함수
}

const AccordionCalendar: React.FC<AccordionCalendarProps> = ({ onSave }) => {
    const {
        startDate, setStartDate,
        endDate, setEndDate,
        calUnit, setCalUnit,
        weekValue, setWeekValue,
        monthValue, setMonthValue
    } = useDateStore();

    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 875);
    const {t} = useTranslation();
    const [userLocale, setUserLocale] = useState(i18n.language);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 875);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDayClick = (date: Date) => {
        const dateString = dayjs(date).format('YYYY-MM-DD');
        if (calUnit) {
            monthDateSet(dateString);
        } else {
            weekDateSet(dateString);
        }
    };

    const weekDateSet = (dateString: string) => {
        setStartDate(dateString);
        const startDateObj = new Date(dateString);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + (weekValue * 7)); // 주 단위 계산
        const formattedEndDate = dayjs(endDateObj).format('YYYY-MM-DD');
        setEndDate(formattedEndDate);
    };

    const monthDateSet = (dateString: string) => {
        setStartDate(dateString);
        const startDateObj = new Date(dateString);
        const endDateObj = new Date(dateString);
        endDateObj.setDate(startDateObj.getDate() + (monthValue * 30)); // 월 단위 계산
        const formattedEndDate = dayjs(endDateObj).format('YYYY-MM-DD');
        setEndDate(formattedEndDate);
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

    const getTileClassName = ({ date }: { date: Date }) => {
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
        return null;
    };

    const handleConfirm = () => {
        if (startDate && endDate) {
            // 날짜 저장 시 onSave 콜백 호출
            if (onSave) {
                onSave();
            }
        }
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

    // 날짜 범위 표시 형식
    const getDateRangeText = () => {
        if (startDate && endDate) {
            const start = dayjs(startDate).format('YYYY-MM-DD');
            const end = dayjs(endDate).format('YYYY-MM-DD');
            return `${start} ~ ${end}`;
        }
        return t('날짜를 선택하세요');
    };

    return (
        <div className="accordion-calendar">
            <div className="calendar-header flex justify-between items-center mb-4">
                <div className="selected-dates text-sm">
                    {getDateRangeText()}
                </div>
                <div className="flex text-xs rounded-lg bg-roomi-light px-1.5 p-0.5">
                    <div className={`flex_center ${calUnit ? "" : "bg-roomi rounded text-white"}`}>
                        <button onClick={weekUnit} className="px-2.5 py-1">
                            <FontAwesomeIcon icon={faCalendarDay} className="mr-1"/>{t("주")}
                        </button>
                    </div>
                    <div className={`flex_center ${calUnit ? "bg-roomi rounded text-white" : ""}`}>
                        <button onClick={monthUnit} className="px-2.5 py-1">
                            <FontAwesomeIcon icon={faCalendarDay} className="mr-1"/>{t("월")}
                        </button>
                    </div>
                </div>
            </div>

            {!calUnit ? (
                <div className="flex_center my-3">
                    <button
                        className="w-6 h-6 flex_center rounded-full border border-gray-200 text-roomi"
                        onClick={() => handleWeekValue(false)}
                    >
                        <LuCircleMinus/>
                    </button>
                    <div className="text-xs font-bold mx-3">{weekValue} {t("주")}</div>
                    <button
                        className="w-6 h-6 flex_center rounded-full border border-gray-200 text-roomi"
                        onClick={() => handleWeekValue(true)}
                    >
                        <LuCirclePlus />
                    </button>
                </div>
            ) : (
                <div className="flex_center my-3">
                    <button
                        className="w-6 h-6 flex_center rounded-full border border-gray-200 text-roomi"
                        onClick={() => handleMonthValue(false)}
                    >
                        <LuCircleMinus/>
                    </button>
                    <div className="text-xs font-bold mx-3">{monthValue} {t("달")}</div>
                    <button
                        className="w-6 h-6 flex_center rounded-full border border-gray-200 text-roomi"
                        onClick={() => handleMonthValue(true)}
                    >
                        <LuCirclePlus/>
                    </button>
                </div>
            )}

            <div className="calendar-container">
                <Calendar
                    onClickDay={handleDayClick}
                    tileClassName={getTileClassName}
                    minDate={new Date()}
                    next2Label={null}
                    prev2Label={null}
                    className="custom-calendar accordion-custom-calendar"
                    formatDay={(locale, date) => dayjs(date).format('D')}
                    locale={userLocale}
                />
            </div>

            {startDate && endDate && (
                <button
                    className="confirm-button w-full mt-4 p-3 bg-roomi text-white rounded-lg font-medium"
                    onClick={handleConfirm}
                >
                    {t('선택 완료')}
                </button>
            )}
        </div>
    );
};

export default AccordionCalendar;