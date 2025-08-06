import React, {useState} from 'react';
import {SearchModal} from "./SearchModal";
import {useDateStore} from "../../stores/DateStore";
import {useGuestsStore} from "../../stores/GuestsStore";
import {useLocationStore} from "../../stores/LocationStore";
import {MapPin} from "lucide-react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

interface SearchBarProps {
    searchModalOpen: boolean;
    setSearchModalOpen: (b: boolean) => void;
    oneLine?: boolean;
}

type LocationOption = {
    name: string;
    country: string;
};
type ActiveCardType = 'location' | 'date' | 'guests' | null;

const SearchBar = ({searchModalOpen, setSearchModalOpen, oneLine}: SearchBarProps) => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {startDate, endDate,} = useDateStore();
    const {guestCount} = useGuestsStore();
    const {selectedLocation, setSelectedLocation} = useLocationStore();

    const [activeCard, setActiveCard] = useState<ActiveCardType>('location');

    const openSearchModal = () => {
        if (window.location.pathname === '/map') {
            // 이미 /map 페이지면 모달 열기
            setSearchModalOpen(true);
            document.body.style.overflow = 'hidden';
        } else {
            // 아니라면 /map 으로 이동
            navigate('/map');
        }
    };

    const handleSelectLocation = (location: LocationOption) => {
        setSelectedLocation(location.name);
        toggleCard('date');
    };

    const performSearch = () => {
        setSearchModalOpen(false);
        console.log('Search performed with:', {
            location: selectedLocation,
            dates: {startDate, endDate},
            guests: guestCount
        });
    };

    const toggleCard = (cardName: ActiveCardType) => {
        if (activeCard === cardName) {
            setActiveCard(null);
        } else {
            setActiveCard(cardName);
        }
    };

    return (
        <>
            <div
                onClick={openSearchModal}
                className={`
                    ${oneLine ?
                        /* HeaderOneLine */
                        "h-12 xl:w-[48rem] lg:w-[36rem] text-sm flex items-center justify-between bg-white shadow-lg border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-xl"
                        :
                        /* Header */
                        "h-12 w-full max-w-5xl text-sm flex items-center justify-between bg-white/90 backdrop-blur-sm shadow-[0_4px_8px_rgba(167,97,97,0.2)] cursor-pointer transition-all duration-300 hover:bg-white hover:shadow-[0_6px_12px_rgba(167,97,97,0.2)]"
                    }
                `}
                style={{borderRadius: '9999px', overflow: 'hidden'}}
            >
                {/* 장소 */}
                <div
                    className="flex-1 flex items-center px-6 py-3 hover:bg-gray-50 transition-colors duration-200">
                    <MapPin className="w-4 h-4 text-gray-600 mr-3"/>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900">{t('장소')}</span>
                        <span className="text-gray-500 text-xs truncate">{t('장소, 이름, 키워드 검색')}</span>
                    </div>
                </div>

                {/* 구분선 */}
                <div className="hidden md:block w-px h-8 bg-gray-300"/>

                {/* 입주일 */}
                <div
                    className="hidden md:flex flex-1 items-center px-6 py-3 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900">{t('입주일')}</span>
                        <span className="text-gray-500 text-xs">{t('입주일 선택')}</span>
                    </div>
                </div>

                {/* 구분선 */}
                <div className="hidden md:block w-px h-8 bg-gray-300"/>

                {/* 인원 */}
                <div
                    className="hidden md:flex flex-1 items-center px-6 py-3 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900">{t('인원')}</span>
                        <span className="text-gray-500 text-xs">{t('인원 선택')}</span>
                    </div>
                </div>

                {/* 검색 버튼 */}
                {oneLine ? (
                    /* HeaderOneLine */
                    <button
                        className="w-8 h-8 m-2 flex_center bg-roomi hover:bg-roomi-3 rounded-full shadow-md transition-all duration-200 hover:scale-105"
                        onClick={(e) => {
                            e.stopPropagation();
                            performSearch();
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="text-white text-xs"
                        />
                    </button>
                ) : (
                    /* Header */
                    <button
                        className="w-10 h-10 m-2 flex items-center justify-center bg-roomi  rounded-full shadow-md transition-all duration-200 hover:scale-105"
                        onClick={(e) => {
                            e.stopPropagation();
                            performSearch();
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="text-white text-base md:text-lg"
                        />
                    </button>
                )}
            </div>

            {/* 검색 모달 */}
            {searchModalOpen && (
                <SearchModal
                    visible={searchModalOpen}
                    onClose={() => setSearchModalOpen(false)}
                    toggleCard={toggleCard}
                    activeCard={activeCard}
                    performSearch={performSearch}
                    handleSelectLocation={handleSelectLocation}
                />
            )}
        </>
    );
};

export default SearchBar;
