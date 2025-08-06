import React, { useEffect, useRef } from 'react';
import { RoomData } from "../../types/rooms";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import ReactDOMServer from "react-dom/server";

// Google Maps 타입 선언
declare global {
    interface Window {
        initGoogleMapRoom: () => void;
    }
}

const GoogleMapRoom = ({ room }: { room: RoomData }) => {
    const GOOGLE_MAP_API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
    const mapRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);

    useEffect(() => {
        const initMap = async () => {
            if (!window.google || !window.google.maps) return;

            const mapOptions: google.maps.MapOptions = {
                center: new window.google.maps.LatLng(room.coordinate_lat, room.coordinate_long),
                zoom: 17,
                minZoom: 17,
                maxZoom: 18,
                // draggable: false,               // 드래그 비활성화 (사용자가 이동 못함)
                scrollwheel: false,             // 스크롤 휠 줌 비활성화
                disableDoubleClickZoom: true,   // 더블 클릭 줌 비활성화
                keyboardShortcuts: false,       // 키보드 이동(방향키) 비활성화
                gestureHandling: 'none',        // 모든 제스처 비활성화
                mapTypeControl: false,          // 지도 유형 컨트롤 숨기기
                streetViewControl: false,       // 스트리트 뷰 컨트롤 숨기기
                fullscreenControl: false,       // 전체화면 컨트롤 숨기기
                zoomControl: true,              // 줌 컨트롤만 유지
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            };

            const map = new window.google.maps.Map(
                document.getElementById('google-map-room') as HTMLElement,
                mapOptions
            );
            mapRef.current = map;

            // 마커 추가
            addMarker(map, room);
        };

        const addMarker = (map: google.maps.Map, room: RoomData) => {
            // 기존 마커가 있으면 제거
            if (markerRef.current) {
                markerRef.current.setMap(null);
            }

            const position = new window.google.maps.LatLng(room.coordinate_lat, room.coordinate_long);

            // 커스텀 마커 HTML 생성
            const createMarkerContent = (): HTMLElement => {
                const div = document.createElement('div');
                div.innerHTML = ReactDOMServer.renderToString(
                    <div
                        className="flex_center text-roomi text-[1.5rem] cursor-default pointer-events-none relative drop-shadow-md"
                        style={{
                            transform: 'translate(-50%, -100%)',
                            fontSize: '24px',
                            color: '#ff8282'
                        }}
                    >
                        <FontAwesomeIcon icon={faLocationDot} />
                    </div>
                );
                return div.firstElementChild as HTMLElement;
            };

            let marker: google.maps.Marker;

            // Advanced Marker 사용 가능한지 확인
            const hasMapId = mapRef.current && (mapRef.current as any).mapId;
            const hasAdvancedMarker = window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement;

            if (hasMapId && hasAdvancedMarker) {
                try {
                    // Advanced Marker 사용
                    const content = createMarkerContent();
                    content.setAttribute("gmp-clickable", "false");

                    marker = new window.google.maps.marker.AdvancedMarkerElement({
                        position,
                        map,
                        title: room.title,
                        content: content,
                    });
                } catch (error) {
                    console.warn('Advanced Marker 생성 실패, 표준 마커 사용:', error);
                    marker = createStandardMarker(position, room, map);
                }
            } else {
                // 표준 마커 사용
                marker = createStandardMarker(position, room, map);
            }

            // 마커 클릭 이벤트 제거 (상세보기에서는 클릭 불필요)
            // if (marker.addListener) {
            //     // 기존 리스너 제거
            //     window.google.maps.event.clearListeners(marker, 'click');
            // }

            markerRef.current = marker;
        };

        // 표준 마커 생성 함수
        const createStandardMarker = (
            position: google.maps.LatLng,
            room: RoomData,
            map: google.maps.Map
        ): google.maps.Marker => {
            const svgIcon: google.maps.Icon = {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
                        <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 20 12 20s12-12.8 12-20c0-6.6-5.4-12-12-12z" fill="#ff8282"/>
                        <circle cx="12" cy="12" r="6" fill="white"/>
                    </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 32),
                anchor: new window.google.maps.Point(12, 32),
            };

            return new window.google.maps.Marker({
                position,
                map,
                title: room.title,
                icon: svgIcon,
                clickable: false, // 클릭 비활성화
            });
        };

        const loadGoogleMapsScript = (): Promise<void> => {
            return new Promise<void>((resolve, reject) => {
                if (window.google && window.google.maps) {
                    resolve();
                    return;
                }

                window.initGoogleMapRoom = () => {
                    initMap().then(resolve).catch(reject);
                };

                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}&libraries=marker&callback=initGoogleMapRoom&language=ko`;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };

        if (window.google && window.google.maps) {
            initMap();
        } else {
            loadGoogleMapsScript().catch(console.error);
        }

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (markerRef.current) {
                markerRef.current.setMap(null);
            }
        };
    }, [room, GOOGLE_MAP_API_KEY]); // room이 변경될 때마다 실행

    return (
        <div style={styles.mapContainer}>
            <div id="google-map-room" style={styles.map} />
        </div>
    );
};

export default GoogleMapRoom;

const styles = {
    mapContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
    } as React.CSSProperties,
    map: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        transition: 'all 0.3s ease-in-out',
    } as React.CSSProperties
};