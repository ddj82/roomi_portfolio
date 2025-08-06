import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons';

interface ImagePreviewModalProps {
    images: string[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
                                                                 images,
                                                                 currentIndex,
                                                                 isOpen,
                                                                 onClose,
                                                                 onPrevious,
                                                                 onNext,
                                                             }) => {
    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            } else if (event.key === 'ArrowLeft') {
                onPrevious();
            } else if (event.key === 'ArrowRight') {
                onNext();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // 모달이 열릴 때 스크롤 막기
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            // 모달이 닫힐 때 스크롤 복원
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose, onPrevious, onNext]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center">
            {/* 배경 클릭으로 닫기 */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* 모달 컨텐츠 */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all"
                >
                    <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>

                {/* 이미지 카운터 */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                    {currentIndex + 1} / {images.length}
                </div>

                {/* 이전 버튼 */}
                {images.length > 1 && (
                    <button
                        onClick={onPrevious}
                        className="absolute left-4 z-10 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
                    </button>
                )}

                {/* 다음 버튼 */}
                {images.length > 1 && (
                    <button
                        onClick={onNext}
                        className="absolute right-4 z-10 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all"
                    >
                        <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
                    </button>
                )}

                {/* 메인 이미지 */}
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                    <img
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        style={{ maxHeight: 'calc(100vh - 120px)' }}
                    />
                </div>

                {/* 썸네일 네비게이션 (하단) */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2 bg-black bg-opacity-50 p-2 rounded-lg max-w-full overflow-x-auto">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    // 썸네일 클릭 시 해당 이미지로 이동하는 로직은 부모 컴포넌트에서 처리
                                }}
                                className={`w-16 h-12 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                                    index === currentIndex
                                        ? 'border-white'
                                        : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                            >
                                <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImagePreviewModal;