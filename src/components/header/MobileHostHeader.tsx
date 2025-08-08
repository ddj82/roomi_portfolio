import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useAuthStore } from "src/components/stores/AuthStore";
import { useHostModeStore } from "src/components/stores/HostModeStore";
import { logout } from "../../api/api";
import { SocialAuth } from "../util/SocialAuth";
import { useChatStore } from "../stores/ChatStore";
import {useIsHostStore} from "../stores/IsHostStore";
import CommonAlert from "../util/CommonAlert";

const MobileHostHeader: React.FC = () => {
    const { t } = useTranslation();
    const { profileImg } = useAuthStore();
    const disconnect = useChatStore((state) => state.disconnect);
    const [userVisible, setUserVisible] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const {hostMode, setHostMode, resetUserMode} = useHostModeStore();
    const {isHost} = useIsHostStore();

    // 공용 얼럿창 상태
    const [alertOpen, setAlertOpen] = useState(false);
    const handleConfirm = (result: boolean) => {
        setAlertOpen(false);
        if (result) handleLogout();
    };

    const handleLogo = () => {
        window.location.href = '/';
    };

    const handleSetHostMode = () => {
        resetUserMode();
        window.location.href = '/';
    };

    const toggleDropdown = () => {
        setUserVisible((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setUserVisible(false);
        }
    };

    const handleLogout = async () => {
        // const confirmCancel = window.confirm(t('로그아웃 하시겠습니까?'));
        // if (!confirmCancel) return;
        try {
            if (localStorage.getItem('authMode') && localStorage.getItem('authMode') === 'kakao') {
                const response = await SocialAuth.kakaoLogout();
                console.log('소셜로그아웃 메소드 실행 후', response);
                if (!response) return;
            }
            const response = await logout();
            console.log(response);
            resetUserMode();
            disconnect();
            window.location.reload();
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // 스크롤이 50px 이상이면 헤더 숨김, 최상단(10px 이하)이면 헤더 표시
            if (currentScrollY > 50) {
                setIsVisible(false);
            } else if (currentScrollY <= 10) {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (userVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userVisible]);

    return (
        <>
            {/* 모바일 호스트 헤더 */}
            <div className={`fixed top-0 left-0 right-0 z-[9999] bg-white/90 backdrop-blur-sm border-b border-gray-200/50 transition-transform duration-300 ${
                isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
            }`}
                 style={{
                     boxShadow: '0 2px 8px rgba(167, 97, 97, 0.15)'
                 }}
            >
                <div className="flex items-center justify-between py-3 px-4">
                    {/* 로고 */}
                    <div>
                        <button onClick={handleLogo}>
                            <img
                                src="/assets/images/roomi.png"
                                alt="Logo"
                                className="h-6"
                            />
                        </button>
                    </div>

                    <div className="flex items-center gap-5">
                        {/* 호스트/게스트 전환 버튼 */}
                        {isHost && (
                            <div className="flex_center text-xs">
                                <button onClick={handleSetHostMode}
                                        className="text-xs text-black hover:text-roomi transition-colors "
                                        style={{fontSize: '9.6px'}}>
                                    {hostMode ? t("게스트로 전환") : t("호스트로 전환")}
                                </button>
                            </div>
                        )}

                        {/* 프로필 */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                className="w-8 h-8 flex items-center justify-center bg-roomi-000 text-roomi rounded-full"
                                style={{
                                    boxShadow: '0 2px 4px rgba(167, 97, 97, 0.2)'
                                }}
                                onClick={toggleDropdown}>
                                <img src={profileImg} alt="프로필사진" className="rounded-full w-8 h-8"/>
                            </button>
                            {userVisible && (
                                <div className="absolute right-0 top-12 mt-2 bg-white/95 backdrop-blur-sm divide-y divide-gray-100 rounded-lg w-40 z-[2000] border border-gray-200"
                                     style={{
                                         boxShadow: '0 4px 12px rgba(167, 97, 97, 0.15)'
                                     }}
                                >
                                    <ul className="py-2 text-sm text-gray-700">
                                        <li>
                                            <a href="/host/myPage" className="block px-4 py-2 hover:bg-gray-100/70">{t('마이페이지')}</a>
                                        </li>
                                        <li>
                                            <button onClick={handleSetHostMode}
                                                    className="w-full text-start block px-4 py-2 hover:bg-gray-100/70">
                                                {t("게스트로 전환")}
                                            </button>
                                        </li>
                                    </ul>
                                    <div className="py-2">
                                        <button
                                            type="button"
                                            onClick={() => setAlertOpen(true)}
                                            className="w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/70"
                                        >
                                            {t('로그아웃')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 로그아웃 얼럿 */}
            {alertOpen && (
                <CommonAlert
                    isOpen={alertOpen}
                    onRequestClose={() => setAlertOpen(false)}
                    content={t("로그아웃 하시겠습니까?")}
                    confirm={true}
                    confirmResponse={handleConfirm}
                />
            )}

            {/* 헤더 높이만큼 여백 - 항상 유지 */}
            <div className="h-14"></div>
        </>
    );
};

export default MobileHostHeader;