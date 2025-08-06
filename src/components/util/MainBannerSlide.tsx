import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const banners = [
    {
        image: '/assets/images/thumbnailbanner_1.png',
        title: 'banner.title1',
        description: 'banner.desc1',
    },
    {
        image: '/assets/images/thumbnailbanner_2.png',
        title: 'banner.title2',
        description: 'banner.desc2',
    },
    // 필요 시 더 추가
];

export default function MainBannerSlide() {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const slideCount = 2; // 항상 2열 보여주기

    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + slideCount) % banners.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isHovered]);

    const renderSlides = () => {
        const result = banners.slice(currentIndex, currentIndex + slideCount);
        if (result.length < slideCount) {
            return result.concat(banners.slice(0, slideCount - result.length));
        }
        return result;
    };

    return (
        <div
            className="relative w-full overflow-hidden rounded-xl bg-white"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 데스크톱: 2열 고정 표시 */}
            <div className="hidden md:flex gap-4 px-5 py-4 justify-center">
                {renderSlides().map((banner, index) => (
                    <div
                        key={index}
                        className="w-1/2 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                        <div className="relative w-full" style={{ aspectRatio: '1477/309' }}>
                            <img
                                src={banner.image}
                                alt={`banner-${index}`}
                                className="w-full h-full object-contain bg-gray-50"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* 모바일: 슬라이더 */}
            <div className="md:hidden overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out p-4"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {banners.map((banner, index) => (
                        <div
                            key={index}
                            className="w-full flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden mx-2 first:ml-0 last:mr-0"
                        >
                            <div className="relative w-full" style={{ aspectRatio: '1477/309' }}>
                                <img
                                    src={banner.image}
                                    alt={`banner-${index}`}
                                    className="w-full h-full object-contain bg-gray-50"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 인디케이터 (모바일에서만 표시) */}
            {/*<div className="md:hidden absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 py-3">*/}
            {/*    {banners.map((_, index) => (*/}
            {/*        <button*/}
            {/*            key={index}*/}
            {/*            className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${*/}
            {/*                index === currentIndex ? 'bg-gray-800 scale-110' : 'bg-gray-400'*/}
            {/*            }`}*/}
            {/*            onClick={() => setCurrentIndex(index)}*/}
            {/*        />*/}
            {/*    ))}*/}
            {/*</div>*/}

            {/* 터치 슬라이드를 위한 이벤트 핸들러가 필요한 경우 */}
            <div
                className="md:hidden absolute inset-0 flex"
                onTouchStart={(e) => {
                    const touchStart = e.touches[0].clientX;
                    e.currentTarget.dataset.touchStart = touchStart.toString();
                }}
                onTouchEnd={(e) => {
                    const touchStart = parseFloat(e.currentTarget.dataset.touchStart || '0');
                    const touchEnd = e.changedTouches[0].clientX;
                    const diff = touchStart - touchEnd;

                    if (Math.abs(diff) > 50) { // 50px 이상 스와이프
                        if (diff > 0 && currentIndex < banners.length - 1) {
                            setCurrentIndex(currentIndex + 1); // 다음 슬라이드
                        } else if (diff < 0 && currentIndex > 0) {
                            setCurrentIndex(currentIndex - 1); // 이전 슬라이드
                        }
                    }
                }}
            />
        </div>
    );
}