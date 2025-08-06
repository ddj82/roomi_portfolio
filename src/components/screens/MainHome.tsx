import React, {useCallback, useEffect, useState} from 'react';
import {RoomData} from "src/types/rooms";
import 'src/css/MainHome.css';
import HomeScreen from "src/components/screens/HomeScreen";
import {useTranslation} from "react-i18next";
import GoogleMap from "../map/GoogleMap";

export default function MainHome() {
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const {t} = useTranslation();

    const handleRoomsUpdate = useCallback((newRooms: RoomData[]) => {
        console.log('Rooms updated in App:', newRooms);
        setRooms(newRooms);
    }, []);

    // const [bottomValue, setBottomValue] = useState("30px"); // 기본값
    // useEffect(() => {
    //     const handleScroll = () => {
    //         if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    //             setShowTopButton(true);
    //             setBottomValue(window.innerWidth < 768 ? "30px" : "161px"); // 모바일인지 체크
    //         } else {
    //             setShowTopButton(false);
    //             setBottomValue("30px");
    //         }
    //     };

    //     window.addEventListener("scroll", handleScroll);
    //     return () => window.removeEventListener("scroll", handleScroll);
    // }, []);

    useEffect(() => {
        if (localStorage.getItem('mainReload') && localStorage.getItem('mainReload') === 'true') {
            localStorage.removeItem('mainReload'); // 플래그 제거 (한 번만 새로고침하도록)
            window.location.reload();
        }
    }, []);

    // const scrollToTop = () => {
    //     window.scrollTo({ top: 0, behavior: "smooth" });
    // };

    return (
        <div className="mainHome main-container">
            {/* 상단 필터바 */}
            {/*<FilterBar/>*/}

            {/* 70% 지도 + 30% 리스트 레이아웃 */}
            <div className="flex h-screen w-full">
                {/* 왼쪽 지도 영역 - 70% */}
                <div className="w-[70%] h-full relative">
                    <GoogleMap onRoomsUpdate={handleRoomsUpdate}/>
                </div>

                {/* 오른쪽 리스트 영역 - 30% */}
                <div className="w-[30%] h-full overflow-hidden border-l border-gray-200" data-nosnippet>
                    <HomeScreen rooms={rooms}/>
                </div>
            </div>

            {/* 하단 토글 버튼 주석 처리 */}
            {/* <button className="mainHome toggle-button text-base bg-roomi hover:bg-roomi-3"
                    style={{ position: 'fixed', bottom: bottomValue }}
                    onClick={toggleView}>
                {homeVisible ? t('목록보기') : t('지도보기')}
            </button> */}

            {/* 위로 올리기 버튼 주석 처리 */}
            {/* {showTopButton && (
                <button onClick={scrollToTop}
                    className="flex_center
                    fixed bottom-[35px] right-[20px] md:bottom-[171px] md:right-[30px]
                    text-white text-sm md:text-base
                    bg-roomi rounded-full hover:ring-4 hover:ring-roomi-00
                    w-8 h-8 md:w-10 md:h-10"
                    style={{
                        cursor: "pointer",
                        zIndex: '1000',
                    }}>
                    <FontAwesomeIcon icon={faArrowUp} />
                </button>
            )} */}
        </div>
    );
}