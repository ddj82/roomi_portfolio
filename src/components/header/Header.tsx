import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAuthStore} from "src/components/stores/AuthStore";
import AuthModal from "src/components/modals/AuthModal";
import HostHeader from "src/components/header/HostHeader";
import {useHeaderBtnVisibility} from "src/components/stores/HeaderBtnStore";
import {useHostHeaderBtnVisibility} from "../stores/HostHeaderBtnStore";
import dayjs from "dayjs";
import {useDateStore} from "../stores/DateStore";
import {useHostModeStore} from "../stores/HostModeStore";
import {useTranslation} from "react-i18next";
import i18n from "i18next";
import '../../css/Header.css';
import LanguageSet from "../screens/myPageMenu/LanguageSet";
import AuthButton from "./util/AuthButton";
import CommonModal from "../util/CommonModal";
import HeaderOneLine from "./HeaderOneLine";
import SearchBar from "./util/SearchBar";

const Header = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const {authToken} = useAuthStore();
    const isVisible = useHeaderBtnVisibility();
    const isVisibleHostScreen = useHostHeaderBtnVisibility();
    const {startDate, endDate,} = useDateStore();
    const {hostMode, setHostMode, resetUserMode} = useHostModeStore();
    const [userVisible, setUserVisible] = useState(false);
    const currentLang = i18n.language;

    // 검색 모달 관련 상태 추가
    const [searchModalOpen, setSearchModalOpen] = useState(false);

    const formatDateRange = () => {
        if (startDate && endDate) {
            return `${dayjs(startDate).format('MM-DD')} ~ ${dayjs(endDate).format('MM-DD')}`;
        }
        return t('date_select');
    };

    useEffect(() => {
        formatDateRange();
    }, [startDate, endDate]);

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

    // 헤더 설정
    const [hasReached, setHasReached] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // 모바일
            if (window.innerWidth < 768) {
                setIsMobile(true);
                const y = window.scrollY;
                if (!hasReached && y >= 219) {
                    setHasReached(true);
                } else if (hasReached && y < 219) {
                    setHasReached(false);
                }

            } else {
                setIsMobile(false);
                const y = window.scrollY;

                // 아직 322px에 도달하지 않았고, 이제 도달했으면
                if (!hasReached && y >= 322) {
                    setHasReached(true);
                }
                // 이미 도달했었고, 다시 322px 아래로 내려오면
                else if (hasReached && y < 322) {
                    setHasReached(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasReached]);

    // 그라데이션 효과
    const gradientStyle = {
        background: 'linear-gradient(to top, rgba(255, 236, 236, 0.8) 0%, rgba(255, 236, 236, 0.4) 20%, rgba(255, 255, 255, 0) 100%)'
    };

    // 헤더 메인 번역기능
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [languageSetModal, setLanguageSetModal] = useState(false);

    const handleLanguageSet = () => {
        if (authToken) {
            // 로그인 상태
            setIsUserLoggedIn(true);
        }

        setLanguageSetModal(true);
    };

    return (
        <>
            {/* 기본 헤더 */}
            <div className={`bg-white ${!hasReached && 'hidden'} ${isMobile ? 'h-[307px]' : 'h-[387px]'}`}/>
            {hasReached ? (
                <HeaderOneLine/>
            ) : (
                <div className={`border-b border-gray-200`} style={gradientStyle}>
                    <div className={`h header container mx-auto md:mt-8 mt-6`}>
                        <div className="mx-auto container md:px-0 px-4">
                            <div className={`h top-row flex items-center md:mb-8 mb-6`}>
                                {/* 로고 영역 */}
                                <div className="h logo-container">
                                    <button onClick={handleLogo}>
                                        <img src="/assets/images/roomi.png" alt="Logo" className="md:h-10 h-6"/>
                                    </button>
                                </div>

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

                            {/* 호스트 모드가 아닐 때만 텍스트 표시 */}
                            {(isVisible && !hostMode) && (
                                <div className={`flex_center flex-col mb-6`}>
                                    <p className="flex_center text-roomi text-lg md:text-3xl font-semibold mb-2.5">
                                        {t("주단위부터 월단위까지, 보증금도 자유롭게")}
                                    </p>
                                    <p className="flex_center text-xl md:text-3xl font-bold text-[#AF483E]">
                                        {t("전 세계 게스트와 연결되는 루미")}
                                    </p>
                                </div>
                            )}

                            {/* 서치바 영역 */}
                            {isVisible && (
                                <div className="h search-bar-container w-full flex justify-center mb-8">
                                    <img
                                        src="/assets/images/thumbnail.png"
                                        alt="Roomi 캐릭터"
                                        className={`h-12 md:h-20 mr-30 md:mr-50`}
                                    />
                                    <SearchBar searchModalOpen={searchModalOpen} setSearchModalOpen={setSearchModalOpen}/>
                                </div>
                            )}
                        </div>

                        {isVisibleHostScreen && (
                            <HostHeader/>
                        )}
                    </div>
                </div>
            )}


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

            <AuthModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} type="login"/>
        </>
    );
};

export default Header;