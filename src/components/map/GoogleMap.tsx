import React, {useCallback, useEffect, useRef} from 'react';
import ReactDOM from "react-dom/client";
import { ApiResponse, RoomData } from "src/types/rooms";
import i18n from "../../i18n";
import { mainRoomData } from "../../api/api";
import ReactDOMServer from "react-dom/server";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretDown, faXmark} from "@fortawesome/free-solid-svg-icons";
import {
    MarkerClusterer,
    SuperClusterAlgorithm,
    type Renderer,
} from "@googlemaps/markerclusterer";


// Google Maps 및 MarkerClusterer 타입 선언
declare global {
    interface Window {
        google: {
            maps: {
                Map: any;
                Marker: any;
                InfoWindow: any;
                LatLng: any;
                Point: any;
                Size: any;
                marker: {
                    AdvancedMarkerElement: any;
                    PinElement: any;
                };
            };
        };
        initMap: () => void;
    }
}

interface GoogleMapViewProps {
    onRoomsUpdate: (rooms: RoomData[]) => void;
}

const GoogleMap: React.FC<GoogleMapViewProps> = ({ onRoomsUpdate }) => {
    const GOOGLE_MAP_API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
    const markers = useRef<google.maps.Marker[]>([]);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const markerCluster = useRef<MarkerClusterer | null>(null);
    const infoWindow = useRef<google.maps.InfoWindow | null>(null);

    const selectedRoomId = useRef<number|null>(null);
    const currentOverlay = useRef<google.maps.OverlayView | null>(null);

    // 마커 초기화
    const clearMarkers = (): void => {
        if (markerCluster.current) {
            markerCluster.current.clearMarkers();
        }
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
    };

    // 지도 영역 내 데이터 로드 (디바운스 적용)
    const debouncedLoadRooms = useCallback((map: google.maps.Map) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            loadRoomsInBounds(map);
        }, 500);
    }, []);

    const loadRoomsInBounds = async (map: google.maps.Map): Promise<void> => {
        try {
            // 지도가 완전히 로드되었는지 확인
            if (!map || typeof map.getBounds !== 'function') {
                console.warn('Map not ready or getBounds method not available');
                return;
            }

            const bounds = map.getBounds();

            // bounds가 유효한지 확인
            if (!bounds) {
                console.warn('Map bounds not available yet');
                return;
            }

            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();

            // 좌표가 유효한지 확인
            if (!sw || !ne || typeof sw.lat !== 'function' || typeof ne.lat !== 'function') {
                console.warn('Invalid bounds coordinates');
                return;
            }

            const currentLocale = i18n.language;

            const response = await mainRoomData(sw.lat(), sw.lng(), ne.lat(), ne.lng(), currentLocale);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ApiResponse = await response.json();
            const rooms = result.data?.items || [];

            onRoomsUpdate(rooms);
            updateMarkers(map, rooms);

        } catch (error) {
            console.error('Error loading rooms:', error);
            onRoomsUpdate([]);
        }
    };

    // 커스텀 마커 HTML 생성
    const createMarkerContent = (room: RoomData): HTMLElement => {
        const div = document.createElement('div');

        div.innerHTML = ReactDOMServer.renderToString(
            <div
                className="relative bg-roomi text-white text-[13px] font-bold px-2 py-1 rounded-md shadow-md"
                style={{whiteSpace: 'nowrap'}}
            >
                ₩ {Number(room.week_price).toLocaleString()}
                <div
                    className="flex_center absolute w-2 h-2 -bottom-1 left-1/2 -translate-x-1/2"
                >
                    <FontAwesomeIcon icon={faCaretDown} className="text-roomi text-xl"/>
                </div>
            </div>
        );
        return div.firstElementChild as HTMLElement;
    };


    // 표준 마커 생성 헬퍼 함수
    const createStandardMarker = (position: google.maps.LatLng, room: RoomData): google.maps.Marker => {
        const svgIcon: google.maps.Icon = {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">
                    <rect x="5" y="5" width="110" height="25" rx="5" fill="#ff8282" stroke="white" stroke-width="2"/>
                    <text x="60" y="20" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">
                        ₩ ${Number(room.week_price).toLocaleString()}
                    </text>
                    <polygon points="55,30 60,40 65,30" fill="#ff8282"/>
                </svg>
            `),
            scaledSize: new window.google.maps.Size(120, 40),
            anchor: new window.google.maps.Point(60, 40),
        };

        return new window.google.maps.Marker({
            position,
            map: null,
            title: room.title,
            icon: svgIcon,
        });
    };


    // 마커 업데이트
    // React 컴포넌트를 HTML 문자열로 변환하는 함수
    const RoomOverlayContent: React.FC<{ room: RoomData; onClose: () => void; onRoomClick: (roomId: number) => void }> = ({
                                                                                                                              room,
                                                                                                                              onClose,
                                                                                                                              onRoomClick
                                                                                                                          }) => {
        const generateImageHTML = (room: RoomData): string => {
            // detail_urls 배열 확인
            if (room.detail_urls && Array.isArray(room.detail_urls) && room.detail_urls.length > 0) {
                const imageUrl = room.detail_urls[0];
                return `
                    <img 
                        src="${imageUrl}"
                        alt="${room.title || '방 이미지'}"
                        style="
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            display: block;
                        "
                        onload="console.log('✅ 이미지 로드 성공:', '${imageUrl}')"
                        onerror="
                            console.error('❌ 이미지 로드 실패:', '${imageUrl}');
                            this.style.display = 'none';
                            this.nextElementSibling.style.display = 'flex';
                        "
                    />
                    <div style="
                        width: 100%;
                        height: 100%;
                        display: none;
                        align-items: center;
                        justify-content: center;
                        background: #f0f0f0;
                        flex-direction: column;
                        color: #999;
                    ">
                        <div style="font-size: 48px; margin-bottom: 8px;">🏠</div>
                        <div style="font-size: 14px;">이미지를 불러올 수 없습니다</div>
                    </div>
                `;
            }

            // thumbnail_url 확인
            if (room.thumbnail_url) {
                return `
                    <img 
                        src="${room.thumbnail_url}"
                        alt="${room.title || '방 이미지'}"
                        style="
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            display: block;
                        "
                        onload="console.log('✅ 썸네일 로드 성공:', '${room.thumbnail_url}')"
                        onerror="
                            console.error('❌ 썸네일 로드 실패:', '${room.thumbnail_url}');
                            this.style.display = 'none';
                            this.nextElementSibling.style.display = 'flex';
                        "
                    />
                    <div style="
                        width: 100%;
                        height: 100%;
                        display: none;
                        align-items: center;
                        justify-content: center;
                        background: #f0f0f0;
                        flex-direction: column;
                        color: #999;
                    ">
                        <div style="font-size: 48px; margin-bottom: 8px;">🏠</div>
                        <div style="font-size: 14px;">이미지를 불러올 수 없습니다</div>
                    </div>
                `;
            }

            // 이미지가 없는 경우 플레이스홀더
            return `
                <div style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    flex-direction: column;
                    color: #666;
                ">
                    <div style="font-size: 48px; margin-bottom: 12px;">🏠</div>
                    <div style="font-size: 14px; font-weight: 500;">이미지 없음</div>
                </div>
            `;
        };

        return (
            <div
                className="max-w-[300px] rounded-xl relative"
                style={{
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                }}
            >
                <button
                    className="flex_center hover:bg-[rgba(0,0,0,0.8)] bg-[rgba(0,0,0,0.6)]"
                    style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        zIndex: 1001,
                        width: '28px',
                        height: '28px',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        borderRadius: '50%',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'background-color 0.2s',
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                >
                    <div className="flex_center text-white">
                        <FontAwesomeIcon icon={faXmark}/>
                    </div>
                </button>

                <div
                    className="room-main-content"
                    style={{cursor: 'pointer'}}
                    onClick={(e) => {
                        if (!(e.target as HTMLElement).closest('button')) {
                            onRoomClick(room.id);
                        }
                    }}
                >
                    <div
                        style={{
                            height: '200px',
                            width: '100%',
                            background: '#f5f5f5',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '12px',
                        }}
                    >
                        <div dangerouslySetInnerHTML={{__html: generateImageHTML(room)}}/>
                    </div>

                    <div className="p-4">
                        <h3
                            style={{
                                margin: '0 0 8px 0',
                                fontSize: '18px',
                                fontWeight: 600,
                                color: '#1a1a1a',
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {room.title || '제목 없음'}
                        </h3>
                        <p
                            style={{
                                margin: '0 0 12px 0',
                                fontSize: '14px',
                                color: '#666',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {room.address || '주소 정보 없음'}
                        </p>

                        <div
                            style={{
                                height: '1px',
                                background: '#e5e5e5',
                                margin: '12px 0',
                            }}
                        />

                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span style={{fontSize: '14px', color: '#666'}}>주간 가격</span>
                                <span style={{fontSize: '18px', fontWeight: 700, color: '#1a1a1a'}}>
                                    ₩{Number(room.week_price || 0).toLocaleString()}
                                </span>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span style={{fontSize: '13px', color: '#888'}}>보증금</span>
                                <span style={{fontSize: '13px', color: '#333'}}>{room.deposit || '정보 없음'}</span>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span style={{fontSize: '13px', color: '#888'}}>관리비</span>
                                <span style={{fontSize: '13px', color: '#333'}}>{room.maintenance_fee || '정보 없음'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    function createCustomOverlay(
        position: google.maps.LatLng,
        content: HTMLElement
    ): google.maps.OverlayView {
        // 1) OverlayView 인스턴스 생성
        const overlay = new window.google.maps.OverlayView();

        // 2) 임의 속성 부착
        (overlay as any).position = position;
        (overlay as any).content  = content;
        (overlay as any).div      = null;

        // 3) onAdd / draw / onRemove 구현
        overlay.onAdd = function () {
            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.zIndex    = '1000';
            div.appendChild((this as any).content);
            this.getPanes()!.floatPane!.appendChild(div);
            (this as any).div = div;
        };

        overlay.draw = function () {
            const div = (this as any).div as HTMLDivElement|null;
            if (!div) return;
            const proj = this.getProjection();
            if (!proj) return;

            const posPx = proj.fromLatLngToDivPixel((this as any).position);
            if (!posPx) return;

            // 오버레이 위치
            const width  = div.offsetWidth;
            const height = div.offsetHeight;
            const markerPinHeight = 25; // 마커 아이콘에 맞춰 조절
            div.style.left = `${posPx.x - (width / 2)}px`;
            div.style.top  = `${posPx.y - (height + markerPinHeight)}px`;

        };

        overlay.onRemove = function () {
            const div = (this as any).div as HTMLDivElement|null;
            if (div && div.parentNode) div.parentNode.removeChild(div);
            (this as any).div = null;
        };

        return overlay;
    }

    // 오버레이 생성 및 표시
    const showRoomOverlay = (room: RoomData, marker: google.maps.Marker) => {
        // 기존 오버레이 제거
        if (currentOverlay.current) {
            currentOverlay.current.setMap(null);
            currentOverlay.current = null;
        }

        // 오버레이 컨테이너＋리액트 루트 준비
        const overlayContainer = document.createElement('div');
        const root = ReactDOM.createRoot(overlayContainer);

        // 위치 계산
        let position: google.maps.LatLng | null;
        if (typeof marker.getPosition === 'function') {
            position = marker.getPosition()!;
        } else {
            position = (marker as any).position ?? null;
        }
        if (!position) return;

        // 새 오버레이 생성
        // const overlay = new CustomOverlay(position, overlayContainer);
        const overlay = createCustomOverlay(position, overlayContainer);

        // 리액트 컴포넌트 렌더링 + onClose에서는 setMap(null)만!
        root.render(
            <RoomOverlayContent
                room={room}
                onClose={() => {
                    overlay.setMap(null);    // ← 여기서만 써요
                    root.unmount();
                    selectedRoomId.current = null;
                    currentOverlay.current = null;
                }}
                onRoomClick={handleRoomMarker}
            />
        );

        // 화면에 “붙이기”
        overlay.setMap(mapRef.current);

        currentOverlay.current = overlay;
        selectedRoomId.current = room.id;
    };

    const updateMarkers = (map: google.maps.Map, rooms: RoomData[]): void => {
        // 1) 기존 마커를 id → 마커 객체 맵으로 변환
        const oldMap = new Map<number, google.maps.Marker>();
        markers.current.forEach(m => {
            const id = (m as any).roomId as number;
            oldMap.set(id, m);
        });

        // 2) 다음에 쓸 마커 배열 생성
        const nextMarkers: google.maps.Marker[] = rooms.map(room => {
            // 이미 있던 마커가 있으면 재사용
            const existing = oldMap.get(room.id);
            if (existing) {
                oldMap.delete(room.id);
                return existing;
            }

            // 없다면 새로 생성
            const position = new window.google.maps.LatLng(
                room.coordinate_lat,
                room.coordinate_long
            );

            let marker: google.maps.Marker;
            const hasMapId = mapRef.current && (mapRef.current as any).mapId;
            const hasAdvanced = window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement;

            if (hasMapId && hasAdvanced) {
                try {
                    const content = createMarkerContent(room);
                    content.setAttribute("gmp-clickable", "false");
                    marker = new window.google.maps.marker.AdvancedMarkerElement({
                        position,
                        map: null,
                        title: room.title,
                        content,
                    });
                } catch (error) {
                    console.warn('Advanced Marker 생성 실패:', error);
                    marker = createStandardMarker(position, room);
                }
            } else {
                marker = createStandardMarker(position, room);
            }

            (marker as any).roomId = room.id;

            marker.addListener('click', () => showRoomOverlay(room, marker));

            return marker;
        });

        // 3) oldMap에 남아있는(사라진) 마커만 제거
        oldMap.forEach(m => {
            m.setMap(null);
            if (markerCluster.current) {
                markerCluster.current.removeMarker(m);
            }
        });

        // 4) markers.current 업데이트
        markers.current = nextMarkers;

        // 클러스터링 로직
        if (markerCluster.current) {
            markerCluster.current.clearMarkers();
            markerCluster.current.addMarkers(markers.current);
            // addMarkers 후 자동으로 렌더링
        } else {
            // (폴백) 뷰에 직접 그리기
            markers.current.forEach(m => m.setMap(map));
        }
    };

    const handleRoomMarker = (roomId: number): void => {
        const locale = i18n.language;
        window.open(`/detail/${roomId}/${locale}`, '_blank');
    };

    useEffect(() => {

        const initMap = async (): Promise<void> => {
            if (!window.google || !window.google.maps) return;

            const mapOptions: google.maps.MapOptions = {
                center: new window.google.maps.LatLng(37.554722, 126.970833), // 서울시청
                zoom: 12,
                minZoom: 6,
                maxZoom: 18,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: true,
                // Advanced Marker 사용을 위한 지도 ID 추가
                mapId: "DEMO_MAP_ID", // Google Cloud Console에서 생성한 지도 ID 사용
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{visibility: "off"}]
                    }
                ]
            };

            const map = new window.google.maps.Map(
                document.getElementById('map') as HTMLElement,
                mapOptions
            );
            mapRef.current = map;

            // 맵 초기화가 완료된 시점에 한 번만 클러스터러 객체를 생성
            markerCluster.current = new MarkerClusterer({
                map,                  // 구글맵 인스턴스
                markers: [],          // 초기에는 빈 배열
                algorithm: new SuperClusterAlgorithm({
                    radius: 60         // 클러스터링 반경(px), 필요에 따라 조절
                }),
                renderer: clusterRenderer  // import 해온 ClusterRenderer 타입
            });

            // 지도가 완전히 로드될 때까지 기다림
            const waitForMapLoad = (): Promise<void> => {
                return new Promise<void>((resolve) => {
                    const checkMapReady = () => {
                        if (map.getBounds && map.getBounds()) {
                            resolve();
                        } else {
                            setTimeout(checkMapReady, 100);
                        }
                    };
                    checkMapReady();
                });
            };

            // 지도 로드 완료 후 데이터 로드
            await waitForMapLoad();
            await loadRoomsInBounds(map);

            // 지도 이동 시 룸 데이터 다시 불러오기
            map.addListener('idle', () => {
                debouncedLoadRooms(map);
            });

            // 지도 초기화 완료 후 추가적인 안전장치
            map.addListener('bounds_changed', () => {
                // bounds가 변경될 때마다 디바운스된 로딩 실행
                debouncedLoadRooms(map);
            });

            // 1) 컴포넌트 최초 생성 시
            infoWindow.current = new window.google.maps.InfoWindow({
                disableAutoPan: false,
                pixelOffset: new window.google.maps.Size(0, -10),
            });
        };

        // 스크립트 로드 로직
        const loadGoogleMapsScript = (): Promise<void> => {
            return new Promise<void>((resolve, reject) => {
                if (window.google && window.google.maps) {
                    resolve();
                    return;
                }

                const supportedLanguages = ["ko", "en", "ja", "zh-CN", "zh-TW"];
                const locale = supportedLanguages.includes(i18n.language) ?
                    (i18n.language.startsWith('zh') ? 'zh' : i18n.language) : "en";

                window.initMap = () => {
                    initMap().then(resolve).catch(reject);
                };

                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}&language=${locale}&libraries=marker&callback=initMap&language=${i18n.language}`;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };

        loadGoogleMapsScript().catch(console.error);

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            clearMarkers();
        };
    }, [debouncedLoadRooms]);

    // 클러스터러 커스터마이징
    const clusterRenderer: Renderer = {
        render: ({ count, position }) => {
            // 구글 맵의 Marker에 label 기능을 활용
            return new window.google.maps.Marker({
                position,
                icon: {
                    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="20" cy="20" r="20" fill="#f47366" />
                          <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="14" font-weight="bold">${count}</text>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(40, 40),
                },
            });
        }
    };

    useEffect(() => {
        // InfoWindow 전역 클릭 이벤트 방지
        const handleGlobalClick = (e: MouseEvent) => {
            // InfoWindow 내부 클릭인지 확인
            const target = e.target as HTMLElement;
            if (target.closest('.custom-info-window-overlay')) {
                e.stopPropagation();
                return;
            }
        };

        // 지도 클릭 시 InfoWindow 닫기 방지
        const handleMapClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.gm-style-iw-c') || target.closest('.custom-info-window-overlay')) {
                e.stopPropagation();
            }
        };

        document.addEventListener('click', handleGlobalClick, true);
        document.addEventListener('mousedown', handleMapClick, true);

        return () => {
            document.removeEventListener('click', handleGlobalClick, true);
            document.removeEventListener('mousedown', handleMapClick, true);
        };
    }, []);

    return (
        <div style={styles.mapContainer}>
            <div id="map" style={styles.map}/>
        </div>
    );
};

export default GoogleMap;

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