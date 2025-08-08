import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {useHostModeStore} from "../stores/HostModeStore";
import {useAuthStore} from "../stores/AuthStore";
import i18n from "i18next";
import LanguageSet from "../screens/myPageMenu/LanguageSet";
import AuthModal from "../modals/AuthModal";
import AuthButton from "./util/AuthButton";
import '../../css/Header.css';
import {useHeaderBtnVisibility} from "../stores/HeaderBtnStore";
import {useHostHeaderBtnVisibility} from "../stores/HostHeaderBtnStore";
import HostHeader from "./HostHeader";
import {useMapVisibility} from "../stores/MapStore";
import CommonModal from "../util/CommonModal";
import SearchBar from "./util/SearchBar";
import {useSearchVisibility} from "../stores/MapSearchStore";
import {SearchModal} from "./util/SearchModal";
import {useDateStore} from "../stores/DateStore";
import {useGuestsStore} from "../stores/GuestsStore";
import {useLocationStore} from "../stores/LocationStore";

type LocationOption = {
    name: string;
    country: string;
};
type ActiveCardType = 'location' | 'date' | 'guests' | null;

export default function HeaderOneLine() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {hostMode, setHostMode, resetUserMode} = useHostModeStore();
    const {authToken} = useAuthStore();
    const isVisible = useHeaderBtnVisibility();
    const isVisibleHostScreen = useHostHeaderBtnVisibility();
    const isMapVisible = useMapVisibility();
    const isSearchVisible = useSearchVisibility();
    const currentLang = i18n.language;
    const {startDate, endDate,} = useDateStore();
    const {guestCount} = useGuestsStore();
    const {selectedLocation, setSelectedLocation} = useLocationStore();

    // 반응형 (테블릿, lg:, 1024px)
    const [isTeblet, setIsTeblet] = useState(window.innerWidth <= 1024);

    const [activeCard, setActiveCard] = useState<ActiveCardType>('location');

    useEffect(() => {
        const handleResize = () => {
            setIsTeblet(window.innerWidth <= 1024);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [userVisible, setUserVisible] = useState(false);
    const [authModalVisible, setAuthModalVisible] = useState(false);

    // 검색 모달 관련 상태 추가
    const [searchModalOpen, setSearchModalOpen] = useState(false);

    // 헤더 메인 번역기능
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [languageSetModal, setLanguageSetModal] = useState(false);

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

    const handleLogo = () => {
        navigate('/');
        window.location.reload();
    };

    const handleSetHostMode = () => {
        if (hostMode) {
            resetUserMode();
            window.location.href = '/';
        } else {
            setHostMode(true);
            window.location.href = '/host';
        }
    };

    // 헤더 메인 번역기능
    const handleLanguageSet = () => {
        if (authToken) {
            // 로그인 상태
            setIsUserLoggedIn(true);
        }

        setLanguageSetModal(true);
    };

    const toggleCard = (cardName: ActiveCardType) => {
        if (activeCard === cardName) {
            setActiveCard(null);
        } else {
            setActiveCard(cardName);
        }
    };

    const performSearch = () => {
        setSearchModalOpen(false);
        console.log('Search performed with:', {
            location: selectedLocation,
            dates: {startDate, endDate},
            guests: guestCount
        });
    };

    const handleSelectLocation = (location: LocationOption) => {
        setSelectedLocation(location.name);
        toggleCard('date');
    };

    const getPublicUrl = (path: string) => {
        return `${process.env.PUBLIC_URL ?? ''}${path}`;
    };

    return (
        <>
            <div className="h-20"/>
            <div className={`border-b border-gray-200 fixed top-0 left-0 w-full h-20 z-[9998] bg-white`}>
                <div className={`h header container mx-auto h-16 my-2`}>
                    <div className="mx-auto container md:px-0 px-4">
                        <div className={`h top-row flex items-center h-16`}>
                            {/* 로고 영역 */}
                            <div className="h logo-container">
                                <button onClick={handleLogo}>
                                    <img
                                        src={getPublicUrl("/assets/images/roomi.png")}
                                        alt="Logo"
                                        className="md:h-10 h-6"
                                    />
                                </button>
                            </div>

                            {/* 검색창 */}
                            {((!isTeblet && !hostMode) && isVisible) ? (
                                <SearchBar searchModalOpen={searchModalOpen} setSearchModalOpen={setSearchModalOpen} oneLine={true}/>
                            ) : (
                                <>
                                    {(isMapVisible || isSearchVisible) && (
                                        <div>
                                            <button
                                                type="button"
                                                onClick={openSearchModal}
                                                className="w-8 h-8 flex items-center justify-center
                                                    bg-gray-100 rounded-full shadow-md
                                                    transition-all duration-200 hover:scale-105"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faSearch}
                                                    className="text-black text-base"
                                                />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* 프로필/로그인 영역 */}
                            <AuthButton
                                currentLang={currentLang}
                                handleSetHostMode={handleSetHostMode}
                                handleLanguageSet={handleLanguageSet}
                                userVisible={userVisible}
                                setUserVisible={setUserVisible}
                                setAuthModalVisible={setAuthModalVisible}
                            />
                        </div>
                    </div>
                </div>

                {isVisibleHostScreen && (
                    <HostHeader/>
                )}
            </div>

            {/* 헤더 번역 모달 */}
            {languageSetModal && (
                <CommonModal
                    isOpen={languageSetModal}
                    onRequestClose={() => setLanguageSetModal(false)}
                    title="언어 설정"
                >
                    <LanguageSet userLoggedIn={isUserLoggedIn}/>
                </CommonModal>
            )}

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

            <AuthModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} type="login"/>
        </>
    );
};
