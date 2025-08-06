import React from 'react';
import MyInfoEdit from "./myPageMenu/MyInfoEdit";
import MyReservations from "./myPageMenu/MyReservations";
import MyFavoriteList from "./myPageMenu/MyFavoriteList";
import MyHistoryList from "./myPageMenu/MyHistoryList";
import NotificationSet from "./myPageMenu/NotificationSet";
import LanguageSet from "./myPageMenu/LanguageSet";
import CurrencySet from "./myPageMenu/CurrencySet";
import Notices from "./myPageMenu/Notices";
import FAQ from "./myPageMenu/FAQ";
import HelpCenter from "./myPageMenu/HelpCenter";

interface GuestMyPageContentProps {
    selectedMenu?: string
}

export default function GuestMyPageContent({selectedMenu}: GuestMyPageContentProps) {

    // 메뉴 내용 렌더링 로직을 함수로 분리
    const renderMenuContent = () => {
        if (selectedMenu === '내 정보') {
            return <MyInfoEdit/>;
        } else if (selectedMenu === '예약 내역') {
            return <MyReservations/>;
        } else if (selectedMenu === '관심 목록') {
            return <MyFavoriteList/>;
        } else if (selectedMenu === '최근 본 게시물') {
            return <MyHistoryList/>;
        } else if (selectedMenu === '알림 설정') {
            return <NotificationSet/>;
        } else if (selectedMenu === '언어 설정') {
            return <LanguageSet/>;
        } else if (selectedMenu === '통화 설정') {
            return <CurrencySet/>;
        } else if (selectedMenu === '공지사항') {
            return <Notices/>;
        } else if (selectedMenu === 'FAQ') {
            return <FAQ/>;
        } else if (selectedMenu === '고객센터') {
            return <HelpCenter/>;
        } else {
            return <div className="flex_center">메뉴를 선택해주세요.</div>;
        }
    };

    return (
        <div>
            {renderMenuContent()}
        </div>
    );
};
