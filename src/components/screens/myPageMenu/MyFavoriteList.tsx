import React, {useEffect, useState} from 'react';
import {RoomData} from "../../../types/rooms";
import {useTranslation} from "react-i18next";
import WishListButton from "../../util/WishListButton";
import {getRoomFavoriteList} from "../../../api/api";
import i18n from "../../../i18n";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";

export default function MyFavoriteList() {
    const {t} = useTranslation();
    const [roomData, setRoomData] = useState<RoomData[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getRoomFavoriteList();
                const responseJson = await response.json();
                const rooms: RoomData[] = responseJson.data.items;
                console.log('FavoriteList:', rooms);
                setRoomData(rooms);
            } catch (error) {
                console.error('API 호출 오류:', error);
            }
        };

        fetchData();
    }, []);

    const handleCardClick = (roomId: number) => {
        const currentLocale = i18n.language; // 현재 언어 감지
        window.open(`/detail/${roomId}/${currentLocale}`, '_blank');
    };

    return (
        <div className="p-4 py-0 md:px-8">
            {roomData && roomData.length > 0 ? (
                roomData.map((room, index) => (
                    <div
                        key={index}
                        className="my-4 rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all"
                        style={{backgroundColor: '#F5F5F5'}}
                        onClick={() => handleCardClick(room.id)}
                    >
                        {/* 모바일 버전 */}
                        <div className="md:hidden p-4 relative">
                            {/* 컨텐츠 영역 */}
                            <div className="flex">
                                {/* 이미지 - 정사각형 */}
                                <div className="w-1/4 mr-3">
                                    <div className="relative" style={{paddingBottom: '100%'}}>
                                        <img
                                            src={room.detail_urls?.[0] || '/placeholder-image.jpg'}
                                            alt="thumbnail"
                                            className="absolute inset-0 w-full h-full object-cover rounded-md"
                                        />
                                    </div>
                                </div>

                                {/* 정보 */}
                                <div className="w-3/4 flex flex-col">
                                    <div className="text-base font-semibold text-gray-900 flex items-center">
                                        {room.title}
                                    </div>

                                    <div className="text-sm text-gray-600 mt-1">
                                        {room.address}
                                    </div>

                                    <div className="mt-1">
                                        {(room.month_price! > 0) && (
                                            <div className="text-sm font-bold text-gray-700 mt-1">
                                                {room.symbol}{room.month_price!.toLocaleString()} / {t('month_symbol')}
                                            </div>
                                        )}
                                        {(room.week_price! > 0) && (
                                            <div className="text-sm font-bold text-gray-700 mt-1">
                                                {room.symbol}{room.week_price!.toLocaleString()} / {t('week_symbol')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center pl-3 ">

                                    <div className="absolute top-0 right-0">
                                        <WishListButton roomId={room.id} isFavorite={true}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 웹 버전 */}
                        <div
                            className=" relative hidden md:flex flex-row items-stretch px-4 py-4 w-full rounded-lg"
                            style={{backgroundColor: '#F5F5F5'}}
                        >
                            {/* 썸네일 이미지 */}
                            <div className="w-32 h-32 flex-shrink-0 mr-4 self-start relative">
                                <img
                                    src={room.detail_urls?.[0] || '/placeholder-image.jpg'}
                                    alt="thumbnail"
                                    className="w-full h-full object-cover rounded-md"
                                />

                            </div>

                            {/* 정보 영역 */}
                            <div className="flex flex-col justify-start flex-grow py-1 mt-5">
                                <div>
                                    <div className="text-base font-semibold text-gray-900 mt-1">
                                        {room.title}
                                    </div>

                                    <div className="text-sm text-gray-600 mt-1">
                                        {room.address}
                                    </div>

                                    <div className="mt-1">
                                        {(room.month_price! > 0) && (
                                            <div className="text-sm text-gray-700 mt-1">
                                                {room.symbol ?? '₩'}{room.month_price!.toLocaleString()} / {t('month_symbol')}
                                            </div>
                                        )}
                                        {(room.week_price! > 0) && (
                                            <div className="text-sm text-gray-700mt-1">
                                                {room.symbol ?? '₩'}{room.week_price!.toLocaleString()} / {t('week_symbol')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 화살표 - 세로 중앙 정렬 */}
                            <div className="flex items-center pl-3">

                                <div className="absolute top-0 right-0">
                                    <WishListButton roomId={room.id} isFavorite={true}/>
                                </div>
                            </div>

                        </div>
                    </div>
                ))
            ) : (
                <div className="flex_center">{t('관심 목록이 없습니다.')}</div>
            )}
        </div>
    );
};
