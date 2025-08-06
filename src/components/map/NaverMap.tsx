import React, { useCallback, useEffect, useRef } from 'react';
import { ApiResponse, RoomData } from "src/types/rooms";
import i18n from "../../i18n";
import {mainRoomData} from "../../api/api";
import ReactDOMServer from "react-dom/server";
import ImgCarousel from "../util/ImgCarousel";
import {createRoot} from "react-dom/client";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleXmark} from "@fortawesome/free-solid-svg-icons";

// naver.maps 타입을 명시적으로 선언
declare global {
    interface Window {
        naver: any;
    }
}

interface NaverMapViewProps {
    onRoomsUpdate: (rooms: RoomData[]) => void;
}

const NaverMap = ({ onRoomsUpdate }: NaverMapViewProps) => {
    const markers = useRef<any[]>([]);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const mapRef = useRef<any>(null);

    // 마커 초기화
    const clearMarkers = () => {
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
    };

    // 지도 영역 내 데이터 로드 (디바운스 적용)
    const debouncedLoadRooms = useCallback((map: any) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            loadRoomsInBounds(map);
        }, 500);
    }, []);

    const loadRoomsInBounds = async (map: any) => {
        const bounds = map.getBounds(); // 네이버 지도에서는 getBounds() 사용
        const sw = bounds.getSW(); // 남서쪽 좌표
        const ne = bounds.getNE(); // 북동쪽 좌표
        const currentLocale = i18n.language; // 현재 언어 감지

        try {
            const response = await mainRoomData(sw.y, sw.x, ne.y, ne.x, currentLocale);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse = await response.json();
            const rooms = result.data?.items || [];

            // 업데이트
            onRoomsUpdate(rooms);
            updateMarkers(map, rooms);

        } catch (error) {
            console.error('Error loading rooms:', error);
            onRoomsUpdate([]);
        }
    };

    // 마커 업데이트
    const updateMarkers = (map: any, rooms: RoomData[]) => {
        clearMarkers(); // 기존 마커 삭제

        rooms.forEach(room => {
            const position = new window.naver.maps.LatLng(
                room.coordinate_lat,
                room.coordinate_long
            );

            const markerContent = ReactDOMServer.renderToString(
                <div
                    className="relative bg-roomi text-white text-[13px] font-bold px-2 py-1 rounded-md shadow-md"
                    style={{ transform: 'translate(-50%, -100%)', whiteSpace: 'nowrap' }}
                >
                    ₩ {Number(room.week_price).toLocaleString()}
                    <div
                        className="absolute w-0 h-0"
                        style={{
                            bottom: '-6px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '8px solid #ff8282',
                        }}
                    ></div>
                </div>
            );

            // 마커 생성
            const marker = new window.naver.maps.Marker({
                position,
                map,
                icon: {
                    content: markerContent,
                },
            });

            // InfoWindow용 컨테이너 생성
            const container = document.createElement('div');
            const reactDiv = document.createElement('div');
            container.appendChild(reactDiv);

            const infowindow = new window.naver.maps.InfoWindow({
                content: container,
                disableAnchor: true
            });

            // React 컴포넌트 마운트 (닫기버튼 포함)
            const root = createRoot(reactDiv);
            root.render(
                <div className="relative w-[270px] bg-white rounded-xl shadow-xl overflow-hidden">
                    {/* 닫기 버튼 */}
                    <button
                        onClick={() => infowindow.close()}
                        className="absolute top-3 right-3 flex_center w-2 h-2 p-2 text-lg text-gray-800 font-bold z-[100]"
                    >
                        <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                    <div role="button" tabIndex={0} onClick={() => handleRoomMarker(room.id)} className="cursor-pointer">
                        {/* 이미지 캐러셀 */}
                        <div className="h-[180px] w-full">
                            {room.detail_urls && room.detail_urls.length > 0 ? (
                                <ImgCarousel images={room.detail_urls} customClass="h-48" />
                            ) : (
                                <img
                                    src="/default-image.jpg"
                                    alt="thumbnail"
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>

                        {/* 내용 */}
                        <div className="p-4 space-y-2 text-[14px]">
                            <div className="text-[16px] font-semibold text-gray-900">{room.title}</div>

                            <div className="text-gray-600">
                                <div className="flex gap-1">
                                    <span className="text-blue-500">📍</span>
                                    <span className="line-clamp-2">{room.address}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-500">💰</span>
                                    <span className="font-medium text-gray-800">{Number(room.week_price).toLocaleString()} /주</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-green-600">💵</span>
                                    <span>{room.deposit}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-amber-500">💡</span>
                                    <span>{room.maintenance_fee}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );


            // 마커 클릭 시 InfoWindow 열기
            window.naver.maps.Event.addListener(marker, 'click', () => {
                markers.current.forEach(m => {
                    if (m.infowindow) m.infowindow.close();
                });

                infowindow.open(map, marker);

                setTimeout(() => {
                    const wrapper = container?.parentElement?.parentElement;
                    if (wrapper) {
                        wrapper.style.background = 'transparent';
                        wrapper.style.border = 'none';
                        wrapper.style.padding = '0';
                        wrapper.style.boxShadow = 'none';
                        wrapper.style.margin = '0';
                    }
                }, 10);

            });

            // InfoWindow를 마커에 연결
            marker.infowindow = infowindow;

            // 마커 배열에 추가
            markers.current.push(marker);
        });
    };

    const handleRoomMarker = (roomId: number) => {
        const locale = i18n.language; // 현재 언어 감지
        window.open(`/detail/${roomId}/${locale}`, '_blank');
    };

    useEffect(() => {
        const initMap = async () => {
            if (!window.naver || !window.naver.maps) return;

            const mapOptions = {
                // 강남역
                // center: new  window.naver.maps.LatLng(37.498095, 127.027610),
                center: new  window.naver.maps.LatLng(37.5558634, 126.9317907),
                zoom: 15,
                minZoom: 9,
                maxZoom: 18,
            };

            const map = new window.naver.maps.Map('map', mapOptions);
            mapRef.current = map;

            // 초기 데이터 로드
            await loadRoomsInBounds(map);

            // 지도 이동 시 룸 데이터 다시 불러오기
            window.naver.maps.Event.addListener(map, 'idle', () => {
                debouncedLoadRooms(map);
            });
        };

        // 지원하는 언어 목록
        const supportedLanguages = ["ko", "en", "ja", "zh-CN", "zh-TW"];
        const locale = supportedLanguages.includes(i18n.language) ? i18n.language : "en";

        if (window.naver && window.naver.maps) {
            initMap();
        } else {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=ztg68tla5j&language=${locale}`;
            script.onload = initMap;
            document.head.appendChild(script);
        }
    }, []);

    return (
        <div style={styles.mapContainer}>
            <div id="map" style={styles.map}/>
        </div>
    );
};

export default NaverMap;

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