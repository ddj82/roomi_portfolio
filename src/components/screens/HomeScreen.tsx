import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'src/css/HomeScreen.css';
import { RoomData } from "src/types/rooms";
import i18n from "src/i18n";
import GoogleMap from "../map/GoogleMap";
import RoomAccommodationCard from "../util/RoomAccommodationCard";

interface HomeScreenProps {
    rooms: RoomData[];
}

// Main Component
const HomeScreen: React.FC<HomeScreenProps> = ({ rooms: externalRooms }) => {
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [loading, setLoading] = useState(true);

    const handleRoomsUpdate = useCallback((newRooms: RoomData[]) => {
        console.log('Rooms updated:', newRooms);
        setRooms(newRooms);
        setLoading(false);
    }, []);

    useEffect(() => {
        setRooms(externalRooms);
    }, [externalRooms]);

    const handleCardClick = (roomId: number) => {
        const currentLocale = i18n.language; // 현재 언어 감지
        window.open(`/detail/${roomId}/${currentLocale}`, '_blank');
    };

    const renderMap = useCallback(
        () => <GoogleMap onRoomsUpdate={handleRoomsUpdate} />,
        [handleRoomsUpdate]
    );

    const renderAccommodations = useMemo(() => {
        if (loading) {
            return <div className="homeScreen loading">로딩 중...</div>;
        }

        if (rooms.length === 0) {
            return <div className="homeScreen error">표시할 숙소가 없습니다.</div>;
        }

        return (
            <div className="homeScreen accommodation-grid">
                {rooms.map((item) => (
                    <RoomAccommodationCard
                        key={item.id}
                        item={item}
                        onClick={() => handleCardClick(item.id)} // id 전달
                    />
                ))}
            </div>
        );
    }, [rooms, loading]);

    return (
        <div className="homeScreen container mx-auto">
            {renderMap()}
            <div className="homeScreen room-content-container">{renderAccommodations}</div>
        </div>
    );
};

export default HomeScreen;
