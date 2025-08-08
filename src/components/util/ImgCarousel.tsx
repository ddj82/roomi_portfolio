import React, {useRef, useState} from 'react';
import {faAngleLeft, faAngleRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface CarouselProps {
    images: string[];
    customClass?: string; // 선택적 height prop 추가
    customClassImg?: string; // 선택적 prop 추가
}

const ImgCarousel: React.FC<CarouselProps> = ({ images, customClass = "", customClassImg = ""}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const startX = useRef(0);
    const endX = useRef(0);

    const prevSlide = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation(); // 이벤트 전파 방지
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextSlide = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation(); // 이벤트 전파 방지
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    // 터치 시작 위치 저장
    const handleTouchStart = (event: React.TouchEvent) => {
        startX.current = event.touches[0].clientX;
    };

    // 터치 종료 후 방향에 따라 슬라이드 이동
    const handleTouchEnd = (event: React.TouchEvent) => {
        event.stopPropagation(); // 이벤트 전파 방지
        endX.current = event.changedTouches[0].clientX;
        handleSwipe();
    };

    // 스와이프 처리 함수 (버튼 함수와 별도)
    const handleSwipe = () => {
        const swipeDistance = startX.current - endX.current;
        if (swipeDistance > 50) {
            // 왼쪽으로 스와이프 -> 다음 슬라이드
            swipeNextSlide();
        } else if (swipeDistance < -50) {
            // 오른쪽으로 스와이프 -> 이전 슬라이드
            swipePrevSlide();
        }
    };

    // 스와이프 시 다음 슬라이드
    const swipeNextSlide = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    // 스와이프 시 이전 슬라이드
    const swipePrevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToSlide = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        event.stopPropagation(); // 이벤트 전파 방지
        setCurrentIndex(index);
    };

    const getPublicUrl = (path: string) => {
        return `${process.env.PUBLIC_URL ?? ''}${path}`;
    };

    return (
        <div id="carousel" className="relative w-full"
             onTouchStart={handleTouchStart}
             onTouchEnd={handleTouchEnd}
        >
            <div className={`relative overflow-hidden ${customClass}`}>
                {images.map((src, index) => (
                    <div
                        key={index}
                        className={`absolute w-full h-full transition-opacity duration-700 ease-in-out ${
                            index === currentIndex ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <img src={getPublicUrl(src)}
                             className={`block w-full h-full object-cover`}
                             style={{ aspectRatio: "16 / 9" }}
                             alt={`Slide ${index + 1}`}/>
                    </div>
                ))}
            </div>
            <button onClick={prevSlide}
                    className="absolute top-0 left-0 z-30 flex_center h-full px-2 cursor-pointer group focus:outline-none">
                <FontAwesomeIcon icon={faAngleLeft} className="text-white"/>
            </button>
            <button onClick={nextSlide}
                    className="absolute top-0 right-0 z-30 flex_center h-full px-2 cursor-pointer group focus:outline-none">
                <FontAwesomeIcon icon={faAngleRight} className="text-white"/>
            </button>
        </div>
    );
};

export default ImgCarousel;
