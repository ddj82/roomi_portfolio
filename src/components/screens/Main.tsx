import React, {useState, useEffect, useCallback, useRef} from 'react';
import {ApiResponse, RoomData} from "../../types/rooms";
import {useTranslation} from "react-i18next";
import {mainRoomData} from "../../api/api";
import {ChevronLeft, ChevronRight} from "lucide-react";
import RoomScrollList from "../util/RoomScrollList";
import {mainPopularRegion} from "../../types/MainSlideList";
import MainSlides from "../util/MainSlides";
import {useQuery} from "@tanstack/react-query";
import MainBannerSlide from "../util/MainBannerSlide";

interface MainProps {
    rooms: RoomData[];
}

// Custom Hook
const useRoomData = () => {
    const { i18n } = useTranslation();
    const currentLocale = i18n.language;

    return useQuery({
        queryKey: ['rooms', currentLocale], // 언어가 바뀌면 다시 요청
        queryFn: async (): Promise<any[]> => {
            const response = await mainRoomData(0.0, 0.0, 0.0, 0.0, currentLocale);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result: ApiResponse = await response.json();
            console.log('방 데이터', result);
            return result.data?.items || [];
        },
        staleTime: 5 * 60 * 1000, // 5분간 캐시된 데이터를 fresh로 간주
        gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    });
};

const Main: React.FC<MainProps> = () => {
    const {t} = useTranslation();
    const popularRegion = mainPopularRegion;
    // 스크롤 관련 상태와 ref
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const SCROLL_SPEED = 0.5;
    // 리액트 쿼리
    const { data: rooms = [], isLoading, error, refetch } = useRoomData();

    // 스크롤 상태 체크 함수
    const checkScrollButtons = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    }, []);

    // 스크롤 함수
    const scrollLeft = useCallback(() => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * SCROLL_SPEED;
            scrollContainerRef.current.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        }
    }, []);

    const scrollRight = useCallback(() => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * SCROLL_SPEED;
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    }, []);

    // 스크롤 이벤트 리스너
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollButtons);
            checkScrollButtons(); // 초기 상태 체크

            return () => {
                container.removeEventListener('scroll', checkScrollButtons);
            };
        }
    }, [checkScrollButtons, rooms.length]);

    // 로딩 상태 처리
    if (isLoading) {
        return <div className="homeScreen loading">로딩 중...</div>;
    }

    // 에러 상태 처리
    if (error) {
        console.error('Error loading rooms:', error);
        return <div className="homeScreen error">문제가 발생했습니다. 새로고침 해주세요.</div>;
    }

    const getPublicUrl = (path: string) => {
        return `${process.env.PUBLIC_URL ?? ''}${path}`;
    };

    return (
        <div className="p-4">
            <div className="mb-6">
                <MainBannerSlide/>
            </div>
            {/* 인기 있는 장소 */}
            <div className="flex flex-col gap-2">
                <div className="font-bold text-lg">{t('인기 있는 장소')}</div>

                {/* 화살표와 그리드를 감싸는 컨테이너 */}
                <div className="relative flex items-center">
                    {/* 왼쪽 스크롤 버튼 */}
                    {canScrollLeft && (
                        <button
                            onClick={scrollLeft}
                            className="absolute -left-4 z-[999] bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors hidden md:block"
                            aria-label="이전 방 목록"
                        >
                            <ChevronLeft size={20} className="text-gray-600"/>
                        </button>
                    )}

                    {/* 오른쪽 스크롤 버튼 */}
                    {canScrollRight && (
                        <button
                            onClick={scrollRight}
                            className="absolute -right-4 z-[999] bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors hidden md:block"
                            aria-label="다음 방 목록"
                        >
                            <ChevronRight size={20} className="text-gray-600"/>
                        </button>
                    )}

                    {/* 가로 스크롤 */}
                    <div
                        ref={scrollContainerRef}
                        className="overflow-x-auto scrollbar-none scrollbar-hidden w-full mb-6"
                    >
                        <div
                            className="grid grid-rows-1 gap-4 md:gap-4 w-max"
                            style={{
                                gridTemplateColumns: `repeat(${Math.ceil(popularRegion.length)}, ${window.innerWidth >= 768 ? '195px' : '160px'})`
                            }}
                        >
                            {popularRegion.map((region, index) => (
                                <div key={index} className="relative">
                                    <div>
                                        <img
                                            src={getPublicUrl(region.image)}
                                            alt={region.title}
                                            loading="lazy"
                                            className="rounded-lg w-40 h-36 md:w-52 md:h-48"
                                        />
                                    </div>
                                    <div className="absolute inset-0 flex items-end text-white">
                                        <div className="p-2">{t(region.title)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 모든 공간 */}
            <div className="flex flex-col gap-2">
                <div className="font-bold text-lg">{t('모든 공간')}</div>
                <RoomScrollList rooms={rooms}/>
            </div>

            {/* 인기 있는 공간 */}
            <div className="flex flex-col gap-2">
                <div className="font-bold text-lg">{t('인기 있는 공간 둘러보기')}</div>
                <RoomScrollList rooms={rooms}/>
            </div>

            {/* 신규 등록한 공간 둘러보기 */}
            <div className="flex flex-col gap-2">
                <div className="font-bold text-lg">{t('신규 등록한 공간 둘러보기')}</div>
                <RoomScrollList rooms={rooms}/>
            </div>

            {/* 하단 설명 메뉴 */}
            <div>
                <MainSlides/>
            </div>
        </div>
    );
};

export default Main;