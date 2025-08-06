import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import '../../css/LocationModal.css';
import {useLocationStore} from "../stores/LocationStore";
import {useTranslation} from "react-i18next";

interface LocationModalProps {
    visible: boolean;
    onClose: () => void;
    position: { x: number; y: number };
}

const LocationModal = ({ visible, onClose, position }: LocationModalProps) => {
    // const [searchText, setSearchText] = useState('');
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 875);
    const {selectedLocation, setSelectedLocation} = useLocationStore();
    const {t} = useTranslation();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 875);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const popularLocations = [
        t('seoul'), t('busan'), t('jeju'), t('gangwon'),
        t('gyeonggi'), t('incheon'), t('daegu'), t('daejeon'),
        t('gwangju'), t('ulsan')
    ];

    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden'; // 스크롤 방지
        } else {
            document.body.style.overflow = 'auto'; // 스크롤 복원
        }
        return () => {
            document.body.style.overflow = 'auto'; // 컴포넌트 언마운트 시 복원
        };
    }, [visible]);

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            overlayClassName="overlay"
            style={{
                content: {
                    position: isMobile ? 'initial' : 'absolute',
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    width: '360px',
                    maxHeight: '400px',
                    backgroundColor: '#FFF',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                },
            }}
            className="locationModal"
        >
            <div className="locationModal modal-container">
                <div className="locationModal search-container">
                    <input
                        type="text"
                        className="locationModal search-input"
                        placeholder={t('where_text')}
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                    />
                </div>

                <div className="locationModal content">
                    <h3 className="locationModal section-title">{t('hot_place')}</h3>
                    <div className="locationModal location-grid">
                        {popularLocations.map((location) => (
                            <button
                                key={location}
                                className="locationModal location-item text-sm"
                                onClick={() => setSelectedLocation(location)}
                            >
                                {location}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default LocationModal;
