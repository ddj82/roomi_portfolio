import React, {useEffect, useRef, useState} from 'react';
import {Globe, User} from "lucide-react";
import {useAuthStore} from "../../stores/AuthStore";
import {useIsHostStore} from "../../stores/IsHostStore";
import {useHostModeStore} from "../../stores/HostModeStore";
import {useTranslation} from "react-i18next";
import {SocialAuth} from "../../util/SocialAuth";
import {logout} from "../../../api/api";
import {useChatStore} from "../../stores/ChatStore";
import CommonAlert from "../../util/CommonAlert";
import {useNavigate} from "react-router-dom";

export default function AuthButton(
    {
        currentLang,
        handleSetHostMode,
        handleLanguageSet,
        userVisible,
        setUserVisible,
        setAuthModalVisible
    }: Readonly<{
        currentLang: string,
        handleSetHostMode: () => void,
        handleLanguageSet: () => void,
        userVisible: boolean,
        setUserVisible: (value: (((prevState: boolean) => boolean) | boolean)) => void,
        setAuthModalVisible: (value: (((prevState: boolean) => boolean) | boolean)) => void
    }>) {

    const {t} = useTranslation();
    const {authToken, profileImg} = useAuthStore();
    const {isHost} = useIsHostStore();
    const {hostMode, resetUserMode} = useHostModeStore();
    const disconnect = useChatStore((state) => state.disconnect);
    const navigate = useNavigate();

    const dropdownRef = useRef<HTMLDivElement>(null);
    const toggleDropdown = () => {
        setUserVisible((prev) => !prev);
    };

    // 공용 얼럿창 상태
    const [alertOpen, setAlertOpen] = useState(false);
    const handleConfirm = (result: boolean) => {
        setAlertOpen(false);
        if (result) handleLogout();
    };

    const handleLogout = async () => {
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

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setUserVisible(false);
        }
    };

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

    const handleDropDownMenu = (menu: string) => {
        navigate(menu);
    };
    
    return (
        <div className="md:mr-4 mr-1.5">
            {/* 프로필/로그인 영역 */}
            {authToken ? (
                <div className="flex_center gap-3">
                    {/*<div className="flex_center md:text-xs text-xxs">*/}
                    {/*    <button*/}
                    {/*        type="button"*/}
                    {/*        onClick={() => window.location.href = '/'}*/}
                    {/*        // onClick={() => setAlertOpen(true)}*/}
                    {/*    >*/}
                    {/*        방 등록하러 가기*/}
                    {/*        /!*공용 얼럿*!/*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                    {(isHost && currentLang === 'ko') && (
                        <>
                            {hostMode ? (
                                <div className="flex_center md:text-xs text-xxs">
                                    <button
                                        type="button"
                                        onClick={handleSetHostMode}
                                        className="w-full text-start block p-2"
                                    >
                                        {t("게스트로 전환")}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex_center md:text-xs text-xxs">
                                    <button
                                        type="button"
                                        onClick={handleSetHostMode}
                                        className="w-full text-start block p-2"
                                    >
                                        {t("호스트로 전환")}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    {!hostMode && (
                        <div className="flex_center">
                            <button
                                type="button"
                                className="w-8 h-8 md:w-10 md:h-10 flex_center bg-gray-200 backdrop-blur-sm rounded-full transition duration-200"
                            >
                                <Globe
                                    className="w-6 h-6 text-black stroke-[1.3]"
                                    onClick={handleLanguageSet}
                                />
                            </button>
                        </div>
                    )}


                    <div className="flex">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-roomi-000 text-roomi rounded-full shadow-md"
                                onClick={toggleDropdown}
                            >
                                <img
                                    src={profileImg}
                                    alt="프로필사진"
                                    className="rounded-full md:w-10 md:h-10 w-8 h-8"
                                />
                            </button>
                            {userVisible && (
                                <div
                                    className="absolute right-0 mt-2 bg-white/95 backdrop-blur-sm divide-y divide-gray-100 rounded-lg shadow-lg w-40 z-[9000] border border-gray-200">
                                    <ul className="py-2 text-sm text-gray-700">
                                        <li>
                                            {hostMode ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDropDownMenu("/host/myPage")}
                                                    className="block px-4 py-2 hover:bg-gray-100/70"
                                                >
                                                    {t('마이페이지')}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDropDownMenu("/myPage")}
                                                    className="block px-4 py-2 hover:bg-gray-100/70"
                                                >
                                                    {t('마이페이지')}
                                                </button>
                                            )}
                                        </li>
                                        <li>
                                            {!hostMode && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDropDownMenu("/chat")}
                                                    className="block px-4 py-2 hover:bg-gray-100/70"
                                                >
                                                    {t('메시지')}
                                                </button>
                                            )}
                                        </li>
                                        {(isHost && currentLang === 'ko') && (
                                            <li>
                                                <button
                                                    type="button"
                                                    onClick={handleSetHostMode}
                                                    className="w-full text-start block px-4 py-2 hover:bg-gray-100/70"
                                                >
                                                    {hostMode ? t("게스트로 전환") : t("호스트로 전환")}
                                                </button>
                                            </li>
                                        )}
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
            ) : (
                <div className="flex gap-3">
                    {!hostMode && (
                        <div className="flex_center">
                            <button
                                type="button"
                                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-100 backdrop-blur-sm rounded-full transition duration-200"
                            >
                                <Globe
                                    className="w-6 h-6 text-black stroke-[1.3]"
                                    onClick={handleLanguageSet}
                                />
                            </button>
                        </div>
                    )}
                    <div>
                        <button
                            type="button"
                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-100 backdrop-blur-sm rounded-full transition duration-200"
                            onClick={() => setAuthModalVisible(true)}
                        >
                            <User className="w-6 h-6 text-black stroke-[1.3]"/>
                        </button>
                    </div>
                </div>
            )}

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
        </div>
    );
};
