import React, {useEffect, useState} from 'react';
import {mainSlideList} from "../../types/MainSlideList";
import {useTranslation} from "react-i18next";

export default function MainSlides() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slides = mainSlideList;
    const [isHovered, setIsHovered] = useState(false);
    const {t} = useTranslation();
    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === slides.length - 1 ? 0 : prevIndex + 1
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [slides.length, isHovered]);

    return (
        <div className="relative w-full bg-white">
            {/* 데스크톱: 3개 그리드 */}
            <div className="hidden lg:block py-6">
                <div className="flex xl:gap-14 lg:gap-10 w-full px-1 mx-auto justify-center">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className="bg-gray-100 rounded-2xl p-4 flex items-start gap-5 hover:shadow-md transition-all duration-300"
                        >
                            {/* 이미지 왼쪽 */}
                            <div className="flex-shrink-0">
                                <img
                                    src={slide.image}
                                    alt={`Slide ${index + 1}`}
                                    className="w-24 h-24 object-cover rounded-xl inline-block"
                                />
                            </div>

                            {/* 텍스트 오른쪽 */}
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-900 mb-2">{t(slide.title)}</h3>
                                <p className="text-sm text-gray-600 leading-snug">{t(slide.description)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 모바일: 슬라이드 (더 작게) */}
            <div className="lg:hidden relative">
                <div className="relative overflow-hidden rounded-lg h-40">
                    <div
                        className="flex transition-transform duration-700 ease-in-out h-full"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className="w-full flex-shrink-0 relative"
                            >
                                <img
                                    src={slide.image}
                                    className="w-full h-full object-cover"
                                    alt={`Slide ${index + 1}`}
                                />

                                {/* 텍스트 오버레이 - 모바일용 간소화 */}
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
                                    <div className="text-white p-4 w-full">
                                        <h3 className="text-base font-bold mb-1">
                                            {t(slide.title)}
                                        </h3>
                                        <p className="text-xs opacity-90 line-clamp-2">
                                            {t(slide.description)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 모바일용 인디케이터 */}
                <div className="flex justify-center space-x-2 mt-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? 'bg-gray-800 scale-110'
                                    : 'bg-gray-400'
                            }`}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}