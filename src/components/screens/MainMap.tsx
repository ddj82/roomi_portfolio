import React, {useCallback, useEffect, useState} from 'react';
import {RoomData} from "src/types/rooms";
import 'src/css/MainHome.css';
import HomeScreen from "src/components/screens/HomeScreen";
import {useTranslation} from "react-i18next";
import GoogleMap from "../map/GoogleMap";
import NaverMap from "../map/NaverMap";

export default function MainMap({isMobile}: Readonly<{ isMobile: boolean; }>) {
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [mobileRoomListOpen, setMobileRoomListOpen] = useState(false);
    const {t} = useTranslation();
    const handleRoomsUpdate = useCallback((newRooms: RoomData[]) => {
        console.log('Rooms updated in App:', newRooms);
        setRooms(newRooms);
    }, []);

    useEffect(() => {
        if (localStorage.getItem('mainReload') && localStorage.getItem('mainReload') === 'true') {
            localStorage.removeItem('mainReload'); // 플래그 제거 (한 번만 새로고침하도록)
            window.location.reload();
        }
    }, []);

    return (
        <div className="mainHome main-container !h-[calc(100dvh-5rem)]">
            {isMobile ? (
                <>
                    {/* 모바일 */}
                    <div className="relative w-full !h-[calc(100dvh-5rem)] overflow-hidden">
                        {/* 지도 영역 */}
                        <div
                            className={`absolute inset-0 mb-[2.5rem] transition-transform duration-300 ${mobileRoomListOpen ? 'translate-y-full' : 'translate-y-0'}`}
                        >
                            <GoogleMap onRoomsUpdate={handleRoomsUpdate}/>
                            {/*<NaverMap onRoomsUpdate={handleRoomsUpdate}/>*/}
                        </div>

                        {/* 리스트 영역 */}
                        <div
                            className={`
                                absolute inset-0 overflow-y-auto scrollbar-hidden
                                transition-transform duration-300
                                ${mobileRoomListOpen ? 'translate-y-0 pb-16' : 'translate-y-full'}
                            `}
                        >
                            <HomeScreen rooms={rooms}/>
                        </div>

                        {/* 토글 버튼 (컨테이너 안에 두셔도 되고, 밖에 두셔도 됩니다) */}
                        <div className="absolute left-0 right-0 bottom-0">
                            <button
                                type="button"
                                onClick={() => setMobileRoomListOpen(prev => !prev)}
                                className="bg-roomi w-full p-2 text-white"
                            >
                                {mobileRoomListOpen ? t('지도 보기') : t('목록 보기')}
                            </button>
                        </div>
                    </div>

                </>
            ) : (
                <div className="flex !h-[calc(100vh-5rem)] w-full"> {/* 브라우저 */}
                    {/* 왼쪽 지도 영역 - 70% */}
                    <div className="w-[70%] h-full relative">
                        <GoogleMap onRoomsUpdate={handleRoomsUpdate}/>
                        {/*<NaverMap onRoomsUpdate={handleRoomsUpdate}/>*/}
                    </div>
                    {/* 오른쪽 리스트 영역 - 30% */}
                    <div className="w-[30%] h-full border-l border-gray-200 overflow-y-auto pb-4 scrollbar-hidden">
                        <HomeScreen rooms={rooms}/>
                    </div>
                </div>
            )}
        </div>
    );
};
