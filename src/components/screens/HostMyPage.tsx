import React, {useEffect, useState} from 'react';
import {useChatStore} from "../stores/ChatStore";
import {logout} from "../../api/api";
import {useHostModeStore} from "../stores/HostModeStore";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowLeft, faBullhorn, faHeadset, faSignOutAlt, faUserMinus,
    faPenToSquare, faChartLine, faReceipt, faQuestionCircle, faTimes, faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import Notices from "./myPageMenu/Notices";
import FAQ from "./myPageMenu/FAQ";
import HelpCenter from "./myPageMenu/HelpCenter";
import MyInfoEdit from "./myPageMenu/MyInfoEdit";
import HostFAQ from "./myPageMenu/HostFAQ";
import {ArrowLeft, LogOut, X} from "lucide-react";
import CommonAlert from "../util/CommonAlert";

export default function HostMyPage() {
    const {t} = useTranslation();
    const {resetUserMode} = useHostModeStore();
    const disconnect = useChatStore((state) => state.disconnect);
    const navigate = useNavigate();
    const {menu} = useParams();
    const selectedMenu = menu ?? "";
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [profileImg, setProfileImg] = useState('');

    // 공용 얼럿창 상태
    const [alertOpen, setAlertOpen] = useState(false);
    const handleConfirm = (result: boolean) => {
        setAlertOpen(false);
        if (result) handleLogout();
    };

    useEffect(() => {
        const img = localStorage.getItem('userProfileImg');
        if (img) setProfileImg(img);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        window.scrollTo({top: 0});
    }, [selectedMenu]);

    const handleLogout = async () => {
        // const confirmCancel = window.confirm(t('로그아웃 하시겠습니까?'));
        // if (!confirmCancel) return;
        try {
            const response = await logout();
            console.log(response);
            resetUserMode();// hostMode 초기화
            disconnect(); // 소켓 서버 닫기
            window.location.href = '/';
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    // 메뉴 내용 렌더링 로직을 함수로 분리
    const renderMenuContent = () => {
        if (loading) return <div className="flex items-center justify-center p-4">Loading...</div>;

        switch (selectedMenu) {
            case '수입 및 통계':
                return (
                    <div className="p-2">
                        <p className="text-gray-600 mb-4">{t("호스트 활동의 수입과 통계 정보를 확인할 수 있습니다.")}</p>

                        {/* 수입 요약 */}
                        <div className="bg-white shadow rounded-lg p-4 mb-4">
                            <h4 className="font-medium mb-3">{t("이번 달 수입")}</h4>
                            <div className="text-2xl font-bold text-green-600">₩0</div>
                            <div className="mt-2 text-sm text-gray-500">{t("아직 수입이 발생하지 않았습니다.")}</div>
                        </div>

                        {/* 통계 정보 */}
                        <div className="bg-white shadow rounded-lg p-4">
                            <h4 className="font-medium mb-3">{t("방문자 통계")}</h4>
                            <div className="text-sm text-gray-500">{t("등록된 통계 정보가 없습니다.")}</div>
                        </div>
                    </div>
                );

            case '영수증':
                return (
                    <div className="p-2">
                        <p className="text-gray-600 mb-4">{t("거래 내역 및 영수증을 확인할 수 있습니다.")}</p>

                        {/* 영수증 목록 */}
                        <div className="bg-white shadow rounded-lg p-4">
                            <h4 className="font-medium mb-3">{t("거래 내역")}</h4>
                            <div className="text-sm text-gray-500">{t("최근 거래 내역이 없습니다.")}</div>
                        </div>
                    </div>
                );

            case '공지사항':
                return <Notices/>;

            case 'FAQ':
                return <HostFAQ/>;

            case '고객센터':
                return <HelpCenter/>;

            case '내 정보':
                return <MyInfoEdit/>;

            default:
                return <MyInfoEdit/>;
            // return (
            //     <div className="flex items-center justify-center h-64">
            //         <p className="text-gray-500">{t("선택된 메뉴가 없습니다.")}</p>
            //     </div>
            // );
        }
    };

    const handleSetSelectedMenu = (selectMenu: string) => {
        navigate(`/host/myPage/${selectMenu}`);
    };

    return (
        <div className="w-full mb-4 flex flex-col md:flex-row relative text-black">
            {/* 웹 버전 메뉴 */}
            <div className="host-mypage-left md:border-r md:w-1/4 lg:w-1/5 hidden md:block bg-white">
                {/* 프로필 섹션 */}
                <div className="p-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="relative inline-block mb-4">
                                <img
                                    src={profileImg}
                                    alt="프로필사진"
                                    className="rounded-full w-20 h-20 object-cover border-2 border-gray-200"
                                />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                {localStorage.getItem('userName')}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                {localStorage.getItem('userEmail')}
                            </p>
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-roomi-1 text-white">
                            {t('호스트')}
                        </span>
                        </div>
                    </div>
                </div>

                {/* 메뉴 섹션들 */}
                <div className="px-6 pb-6 space-y-4">
                    {/* 호스트 관리 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <h4 className="font-semibold text-gray-900">{t("호스트 관리")}</h4>
                        </div>
                        <div className="p-2">
                            <button
                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors text-sm flex items-center"
                                onClick={() => handleSetSelectedMenu('수입 및 통계')}>
                                <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 mr-3 text-gray-500"/>
                                {t("수입 및 통계")}
                            </button>
                            <button
                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors text-sm flex items-center"
                                onClick={() => handleSetSelectedMenu('영수증')}>
                                <FontAwesomeIcon icon={faReceipt} className="w-4 h-4 mr-3 text-gray-500"/>
                                {t("영수증")}
                            </button>
                        </div>
                    </div>

                    {/* 고객 지원 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <h4 className="font-semibold text-gray-900">{t("고객 지원")}</h4>
                        </div>
                        <div className="p-2">
                            <button
                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors text-sm flex items-center"
                                onClick={() => handleSetSelectedMenu('공지사항')}>
                                <FontAwesomeIcon icon={faBullhorn} className="w-4 h-4 mr-3 text-gray-500"/>
                                {t("공지사항")}
                            </button>
                            <button
                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors text-sm flex items-center"
                                onClick={() => handleSetSelectedMenu('FAQ')}>
                                <FontAwesomeIcon icon={faQuestionCircle} className="w-4 h-4 mr-3 text-gray-500"/>
                                FAQ
                            </button>
                            <button
                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors text-sm flex items-center"
                                onClick={() => handleSetSelectedMenu('고객센터')}>
                                <FontAwesomeIcon icon={faHeadset} className="w-4 h-4 mr-3 text-gray-500"/>
                                {t("고객센터")}
                            </button>
                        </div>
                    </div>

                    {/* 계정 설정 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <h4 className="font-semibold text-gray-900">{t("계정 설정")}</h4>
                        </div>
                        <div className="p-2">
                            <button
                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors text-sm flex items-center"
                                onClick={() => handleSetSelectedMenu('내 정보')}>
                                <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4 mr-3 text-gray-500"/>
                                {t("내 정보")}
                            </button>
                            <button
                                type="button"
                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors text-sm flex items-center"
                                onClick={() => setAlertOpen(true)}
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3 text-gray-500"/>
                                {t("로그아웃")}
                            </button>
                            <button
                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors text-sm flex items-center">
                                <FontAwesomeIcon icon={faUserMinus} className="w-4 h-4 mr-3 text-red-500"/>
                                <span className="text-red-600">{t("회원탈퇴")}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모바일 버전 메뉴 */}
            <div className="host-mypage-left md:hidden bg-white min-h-screen">
                {/* 상단 앱바 영역 */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-700"/>
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">{t('마이 루미')}</h1>
                        <button
                            type="button"
                            onClick={() => setAlertOpen(true)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <LogOut className="w-6 h-6 text-red-500"/>
                        </button>
                    </div>
                </div>

                {/* 프로필 카드 */}
                <div className="bg-white mx-4 my-4 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                        onClick={() => handleSetSelectedMenu('내 정보')}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <img
                                    src={profileImg}
                                    alt="프로필사진"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold text-gray-900">{localStorage.getItem('userName')}</h2>
                                <p className="text-sm text-gray-500">{localStorage.getItem('userEmail')}</p>
                                <div className="mt-2">
                                <span
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {t('호스트')}
                                </span>
                                </div>
                            </div>
                            <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5 text-gray-400"/>
                        </div>
                    </button>
                </div>

                {/* 메뉴 섹션들 */}
                <div className="space-y-6 px-4 pb-8">
                    {/* 호스트 관리 */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 px-2">
                            {t("호스트 관리")}
                        </h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                onClick={() => handleSetSelectedMenu('수입 및 통계')}
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <FontAwesomeIcon icon={faChartLine} className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                                {t("수입 및 통계")}
                            </span>
                                <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5 text-gray-400"/>
                            </button>

                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors"
                                onClick={() => handleSetSelectedMenu('영수증')}
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <FontAwesomeIcon icon={faReceipt} className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                                {t("영수증")}
                            </span>
                                <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5 text-gray-400"/>
                            </button>
                        </div>
                    </div>

                    {/* 고객 지원 */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 px-2">
                            {t("고객 지원")}
                        </h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                onClick={() => handleSetSelectedMenu('공지사항')}
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <FontAwesomeIcon icon={faBullhorn} className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                                {t("공지사항")}
                            </span>
                                <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5 text-gray-400"/>
                            </button>

                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                onClick={() => handleSetSelectedMenu('FAQ')}
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <FontAwesomeIcon icon={faQuestionCircle} className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                                FAQ
                            </span>
                                <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5 text-gray-400"/>
                            </button>

                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors"
                                onClick={() => handleSetSelectedMenu('고객센터')}
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <FontAwesomeIcon icon={faHeadset} className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                                {t("고객센터")}
                            </span>
                                <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5 text-gray-400"/>
                            </button>
                        </div>
                    </div>

                    {/* 계정 설정 */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 px-2">
                            {t("계정 설정")}
                        </h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                onClick={() => handleSetSelectedMenu('내 정보')}
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                                    <FontAwesomeIcon icon={faPenToSquare} className="w-5 h-5 text-gray-600"/>
                                </div>
                                <span className="text-base font-medium text-gray-900 flex-1 text-left">
                                {t("내 정보")}
                            </span>
                                <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5 text-gray-400"/>
                            </button>

                            <button
                                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors"
                                onClick={() => handleSetSelectedMenu('회원탈퇴')}
                            >
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                                    <FontAwesomeIcon icon={faUserMinus} className="w-5 h-5 text-red-600"/>
                                </div>
                                <span className="text-base font-medium text-red-600 flex-1 text-left">
                                {t("회원탈퇴")}
                            </span>
                                <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5 text-gray-400"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 데스크톱 전용 오른쪽 콘텐츠 */}
            <div className="host-mypage-right md:w-3/4 lg:w-4/5 hidden md:flex flex-col bg-white">
                {/* 제목 고정 */}
                <div className="px-8 pt-6 pb-2 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {selectedMenu === '' ? '호스트 정보' : selectedMenu}
                    </h2>
                </div>

                {/* 아래 내용만 스크롤되게 */}
                <div
                    id="myPageContent"
                    className="host-mypage-right flex-1 overflow-y-auto px-8 pb-8 scrollbar-hidden"
                >
                    {renderMenuContent()}
                </div>
            </div>

            {/* 모바일에서만 오버레이 표시 */}
            {isMobile && selectedMenu && (
                <div className="fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col overflow-hidden">
                    {/* 상단 앱바 영역 */}
                    <div className="bg-white border-b border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => handleSetSelectedMenu('')}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-700"/>
                            </button>
                            <h1 className="text-lg font-semibold text-gray-900">{t(selectedMenu)}</h1>
                            <div className="w-10 h-10"></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {renderMenuContent()}
                    </div>
                </div>
            )}

            {/* 로그아웃 얼럿 */}
            {alertOpen && (
                <CommonAlert
                    isOpen={alertOpen}
                    onRequestClose={() => setAlertOpen(false)}
                    confirm={true}
                    content={t("로그아웃 하시겠습니까?")}
                    confirmResponse={handleConfirm}
                />
            )}
        </div>
    );
}