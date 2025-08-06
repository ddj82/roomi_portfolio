import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import Calendar from 'react-calendar';
import 'src/css/DateModal.css';
import 'react-calendar/dist/Calendar.css'; // 스타일 파일도 import
import dayjs from 'dayjs';
import {useDateStore} from "src/components/stores/DateStore";
import {useTranslation} from "react-i18next";
import {faCalendarDay} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";
import i18n from "i18next";

interface DateModalProps {
    visible: boolean;
    onClose: () => void;
    position: { x: number; y: number };
    embedded?: boolean;
}

const DateModal = ({ visible, onClose, position }: DateModalProps) => {
    const {
        startDate, setStartDate,
        endDate, setEndDate,
        calUnit, setCalUnit,
        weekValue, setWeekValue } = useDateStore();
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
        const dateString = formatDate(date);
        if (calUnit) {
            if (!startDate || (startDate && endDate)) {
                setStartDate(dateString);
                setEndDate(null);
            } else {
                if (new Date(dateString) >= new Date(startDate)) {
                    setEndDate(dateString);
                } else {
                    setStartDate(dateString);
                    setEndDate(null);
                }
            }
        } else {
            weekDateSet(dateString);
        }
    };

    const weekDateSet = (dateString : string) => {
        setStartDate(dateString);
        const startDateObj = new Date(dateString);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + (weekValue * 7)); // 주 단위 계산
        const formattedEndDate = formatDate(endDateObj);
        setEndDate(formattedEndDate);
    };

    const getTileClassName = ({ date }: { date: Date }) => {
        const dateString = formatDate(date);
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
            setStartDate(startDate);
            setEndDate(endDate);
            onClose();
        }
    };

    // 날짜 문자열 변환 함수
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden'; // 스크롤 방지
        } else {
            document.body.style.overflow = 'auto'; // 스크롤 복원
        }
        return () => {
            document.body.style.overflow = 'auto'; // 컴포넌트 언마운트 시 복원
        };
    }, [visible]);

    const dayUnit = () => {
        setCalUnit(true);
        setWeekValue(1);
        setStartDate(null);
        setEndDate(null);
    };

    const weekUnit = () => {
        setCalUnit(false);
        setStartDate(null);
        setEndDate(null);
    };

    const handleWeekValue = (value : boolean) => {
        if (value) {
            // 플러스 버튼 클릭 시
            setWeekValue(prev => prev + 1);
        } else {
            // 마이너스 버튼 클릭 시
            if (weekValue === 1) return;
            setWeekValue(prev => prev - 1);
        }
    };

    useEffect(() => {
        // startDate, endDate 설정이 되어 있으면 weekDateSet 다시
        if (startDate && endDate && !calUnit) {
            weekDateSet(startDate);
        }
    }, [weekValue]);

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            overlayClassName="overlay"
            style={{
                content: {
                    backgroundColor: '#FFF',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    position: isMobile ? 'initial' : 'absolute',
                    width: '350px',
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                }
            }}
            className="dateModal"
        >
            <div className="dateModal modal-container">
                <div className="dateModal header-text flex justify-end">
                    <div className="flex text-xs rounded-lg bg-gray-200 px-1.5 p-0.5">
                        <div className={`flex_center ${calUnit ? "bg-roomi rounded text-white" : ""}`}>
                            <button onClick={dayUnit} className="px-2.5 py-1">
                                <FontAwesomeIcon icon={faCalendarDay} className="mr-1"/>{t("일")}
                            </button>
                        </div>
                        <div className={`flex_center ${calUnit ? "" : "bg-roomi rounded text-white"}`}>
                            <button onClick={weekUnit} className="px-2.5 py-1">
                                <FontAwesomeIcon icon={faCalendarDay} className="mr-1"/>{t("주")}
                            </button>
                        </div>
                    </div>
                </div>
                {!calUnit && (
                    <div className="flex_center m-4">
                        <button className="text-lg" onClick={() => handleWeekValue(false)}>
                            <LuCircleMinus/>
                        </button>
                        <div className="text-xs font-bold mx-3">{weekValue}{t("주")}</div>
                        <button className="text-lg" onClick={() => handleWeekValue(true)}>
                            <LuCirclePlus />
                        </button>
                    </div>
                )}
                <Calendar
                    onClickDay={handleDayClick}
                    tileClassName={getTileClassName}
                    minDate={new Date()}
                    next2Label={null} // 추가로 넘어가는 버튼 제거
                    prev2Label={null} // 이전으로 돌아가는 버튼 제거
                    className="custom-calendar"
                    formatDay ={(locale, date) => dayjs(date).format('D')}
                    locale={userLocale}
                />
                {startDate && endDate && (
                    <button className="dateModal confirm-button" onClick={handleConfirm}>
                        선택 완료
                    </button>
                )}
            </div>
        </Modal>
    );
};

export default DateModal;
