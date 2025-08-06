import React, { useCallback, useEffect, useRef } from 'react';
import { ApiResponse, RoomData } from "src/types/rooms";
import i18n from "../../i18n";
import { mainRoomData } from "../../api/api";
import ReactDOMServer from "react-dom/server";
import ImgCarousel from "../util/ImgCarousel";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretDown} from "@fortawesome/free-solid-svg-icons";

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
        // @googlemaps/markerclusterer 라이브러리
        MarkerClusterer: new (options: MarkerClustererOptions) => MarkerClustererInstance;
        GridAlgorithm: new (options: { gridSize: number }) => any;
        SuperClusterAlgorithm: new (options?: any) => any;
        initMap: () => void;
    }
}

// MarkerClusterer 관련 타입 정의
interface MarkerClustererOptions {
    map: google.maps.Map;
    markers: google.maps.Marker[];
    algorithm?: any;
    renderer?: ClusterRenderer;
    onClusterClick?: (event: any, cluster: any, map: google.maps.Map) => void;
}

interface MarkerClustererInstance {
    clearMarkers(): void;
    addMarkers(markers: google.maps.Marker[]): void;
    removeMarkers(markers: google.maps.Marker[]): void;
    addMarker(marker: google.maps.Marker): void;
    removeMarker(marker: google.maps.Marker): void;
    getMarkers(): google.maps.Marker[];
    getClusters(): any[];
    render(): void;
}

interface ClusterRenderer {
    render: (cluster: ClusterRenderData, stats: any) => google.maps.Marker | HTMLElement;
}

interface ClusterRenderData {
    count: number;
    position: google.maps.LatLng;
    markers: google.maps.Marker[];
}

interface GoogleMapViewProps {
    onRoomsUpdate: (rooms: RoomData[]) => void;
}

const GoogleMap22: React.FC<GoogleMapViewProps> = ({ onRoomsUpdate }) => {
    const GOOGLE_MAP_API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
    const markers = useRef<google.maps.Marker[]>([]);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const markerCluster = useRef<MarkerClustererInstance | null>(null);
    const infoWindow = useRef<google.maps.InfoWindow | null>(null);

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


    // 마커 업데이트 (클러스터링 포함)

    // InfoWindow 컨텐츠 생성 함수 - 완전히 수정
    const createInfoWindowContent = (room: RoomData): string => {
        // 기본 InfoWindow 구조에 맞춘 HTML 생성
        return `
        <div class="custom-room-info" 
            style="
            width: 300px;
            background: white;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
            "
        >
            <!-- 커스텀 닫기 버튼 -->
            <button 
                class="custom-close-btn flex_center"
                style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    z-index: 1000;
                    width: 28px;
                    height: 28px;
                    background: rgba(0,0,0,0.6);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background-color 0.2s;
                "
                onmouseover="this.style.background='rgba(0,0,0,0.8)'"
                onmouseout="this.style.background='rgba(0,0,0,0.6)'"
            >
                <div class="flex_center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                    </svg>
                </div>
            </button>
            
            <!-- 메인 콘텐츠 영역 -->
            <div class="room-main-content" style="cursor: pointer;">
                <!-- 이미지 영역 -->
                <div style="
                    height: 200px;
                    width: 100%;
                    background: #f5f5f5;
                    position: relative;
                    overflow: hidden;
                    border-radius: 12px;
                ">
                    ${generateImageHTML(room)}
                </div>
                
                <!-- 정보 영역 -->
                <div style="padding: 16px 0;">
                    <!-- 제목 -->
                    <h3 style="
                        margin: 0 0 8px 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: #1a1a1a;
                        line-height: 1.3;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    ">${room.title || '제목 없음'}</h3>
                    
                    <!-- 주소 -->
                    <p style="
                        margin: 0 0 12px 0;
                        font-size: 14px;
                        color: #666;
                        display: -webkit-box;
                        -webkit-line-clamp: 1;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    ">${room.address || '주소 정보 없음'}</p>
                    
                    <!-- 가격 정보 구분선 -->
                    <div style="
                        height: 1px;
                        background: #e5e5e5;
                        margin: 12px 0;
                    "></div>
                    
                    <!-- 가격 정보 -->
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <!-- 주간 가격 -->
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 14px; color: #666;">주간 가격</span>
                            <span style="font-size: 18px; font-weight: 700; color: #1a1a1a;">
                                ₩${Number(room.week_price || 0).toLocaleString()}
                            </span>
                        </div>
                        
                        <!-- 보증금 -->
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 13px; color: #888;">보증금</span>
                            <span style="font-size: 13px; color: #333;">${room.deposit || '정보 없음'}</span>
                        </div>
                        
                        <!-- 관리비 -->
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 13px; color: #888;">관리비</span>
                            <span style="font-size: 13px; color: #333;">${room.maintenance_fee || '정보 없음'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    };

    const generateImageHTML = (room: RoomData): string => {
        console.log('이미지 데이터 확인:', {
            detail_urls: room.detail_urls,
            thumbnail_url: room.thumbnail_url,
            room_id: room.id
        });

        // detail_urls 배열 확인
        if (room.detail_urls && Array.isArray(room.detail_urls) && room.detail_urls.length > 0) {
            const imageUrl = room.detail_urls[0];
            console.log('detail_urls 첫 번째 이미지 사용:', imageUrl);

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
            console.log('thumbnail_url 사용:', room.thumbnail_url);
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
        console.log('이미지 없음, 플레이스홀더 사용 - 방 ID:', room.id);
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

    // InfoWindow 스타일 조정 함수 - 더 안정적으로 수정
    const adjustInfoWindowStyles = () => {
        const adjustWithRetry = (attempt = 0) => {
            if (attempt > 8) {
                console.warn('InfoWindow 스타일 조정 최대 시도 횟수 초과');
                return;
            }

            setTimeout(() => {
                try {
                    // InfoWindow 외부 컨테이너 (gm-style-iw-c)
                    const iwContainer = document.querySelector('.gm-style-iw-c') as HTMLElement;
                    if (iwContainer) {
                        // max-width: 320px !important;
                        // overflow: visible !important;
                        // border-radius: 12px !important;
                        // padding: 0 !important;
                        // border: none !important;
                        // box-shadow: none !important;
                        // background: transparent !important;
                        //     iwContainer.style.cssText = `
                        //     padding: 0;
                        // `;
                    }

                    // InfoWindow 내부 컨테이너 (gm-style-iw-chr)
                    const iwContentRoot = document.querySelector('.gm-style-iw-chr') as HTMLElement;
                    // if (iwContentRoot) {
                    //     iwContentRoot.style.cssText = `display: none;`;
                    //     iwContentRoot.style.cssText = `
                    //     overflow: visible !important;
                    //     padding: 0 !important;
                    //     margin: 0 !important;
                    //     background: white !important;
                    // `;
                    // }

                    // InfoWindow 실제 콘텐츠 (gm-style-iw-d)
                    const iwContent = document.querySelector('.gm-style-iw-d') as HTMLElement;
                    if (iwContent) {
                        iwContent.style.cssText = `
                        overflow: visible !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: transparent !important;
                        box-shadow: none !important;
                    `;
                    }

                    // Google 기본 닫기 버튼 숨기기
                    const defaultCloseBtn = document.querySelector('.gm-ui-hover-effect') as HTMLElement;
                    if (defaultCloseBtn) {
                        defaultCloseBtn.style.display = 'none !important';
                    }

                    // InfoWindow 꼬리 부분 유지
                    const iwTail = document.querySelector('.gm-style-iw-tc') as HTMLElement;
                    if (iwTail) {
                        iwTail.style.display = 'block !important';
                    }

                    // 모든 요소가 준비되었는지 확인
                    if (iwContainer && iwContentRoot && iwContent) {
                        console.log('✅ InfoWindow 네이티브 구조 스타일 적용 완료');

                        // 이벤트 리스너 추가
                        setupInfoWindowEventListeners();
                    } else {
                        console.log(`🔄 InfoWindow 구조 대기 중... (${attempt + 1}/8)`);
                        adjustWithRetry(attempt + 1);
                    }

                } catch (error) {
                    console.warn('InfoWindow 스타일 조정 오류:', error);
                    if (attempt < 5) {
                        adjustWithRetry(attempt + 1);
                    }
                }
            }, 80 + (attempt * 50));
        };

        adjustWithRetry();
    };

    // 3. 마커 클릭 이벤트 핸들러 수정
    const updateMarkers = (map: google.maps.Map, rooms: RoomData[]): void => {
        clearMarkers();

        // InfoWindow 재생성
        if (infoWindow.current) {
            infoWindow.current.close();
            infoWindow.current = null;
        }

        infoWindow.current = new window.google.maps.InfoWindow({
            disableAutoPan: false,
            pixelOffset: new window.google.maps.Size(0, -10),
        });

        const newMarkers: google.maps.Marker[] = rooms.map(room => {
            const position = new window.google.maps.LatLng(
                room.coordinate_lat,
                room.coordinate_long
            );

            let marker: google.maps.Marker;

            const hasMapId = mapRef.current && (mapRef.current as any).mapId;
            const hasAdvancedMarker = window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement;

            if (hasMapId && hasAdvancedMarker) {
                try {
                    const content = createMarkerContent(room);
                    content.setAttribute("gmp-clickable", "false");
                    marker = new window.google.maps.marker.AdvancedMarkerElement({
                        position,
                        map: null,
                        title: room.title,
                        content: content,
                    });
                } catch (error) {
                    console.warn('Advanced Marker 생성 실패:', error);
                    marker = createStandardMarker(position, room);
                }
            } else {
                marker = createStandardMarker(position, room);
            }

            // 마커 클릭 이벤트
            marker.addListener('click', () => {
                console.log('🎯 마커 클릭됨:', room.id);

                // 이전 InfoWindow 닫기
                if (infoWindow.current) {
                    infoWindow.current.close();
                }

                setTimeout(() => {
                    try {
                        // 네이티브 구조를 활용한 컨텐츠 생성
                        const content = createInfoWindowContent(room);

                        if (infoWindow.current) {
                            // room ID를 데이터 속성으로 추가
                            const contentWithId = content.replace(
                                'class="custom-room-info"',
                                `class="custom-room-info" data-room-id="${room.id}"`
                            );

                            infoWindow.current.setContent(contentWithId);
                            infoWindow.current.open(map, marker);

                            console.log('✅ InfoWindow 열림 성공');

                            // 네이티브 구조에 맞춘 스타일 조정
                            adjustInfoWindowStyles();

                            // 닫힘 이벤트 리스너
                            const closeListener = infoWindow.current.addListener('closeclick', () => {
                                console.log('🔒 InfoWindow 닫힘');
                                try {
                                    window.google.maps.event.removeListener(closeListener);
                                } catch (e) {
                                    console.warn('리스너 제거 실패:', e);
                                }
                            });
                        }
                    } catch (error) {
                        console.error('❌ InfoWindow 열기 실패:', error);
                    }
                }, 120);
            });

            return marker;
        });

        markers.current = newMarkers;

        // 클러스터링 로직은 기존과 동일
        try {
            if (markerCluster.current) {
                markerCluster.current.clearMarkers();
            }

            if (window.MarkerClusterer && window.GridAlgorithm) {
                markerCluster.current = new window.MarkerClusterer({
                    map: map,
                    markers: newMarkers,
                    algorithm: new window.GridAlgorithm({ gridSize: 100 }),
                    renderer: {
                        render({ count, position }) {
                            const div = document.createElement("div");
                            div.className = "roomi-cluster";
                            div.textContent = String(count);

                            return new google.maps.Marker({
                                position,
                                icon: {
                                    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                                        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                                          <circle cx="20" cy="20" r="20" fill="#f47366" />
                                          <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="14" font-weight="bold">${count}</text>
                                        </svg>
                                        `)
                                    ,
                                    scaledSize: new google.maps.Size(40, 40),
                                },
                            });
                        }
                    }
                });
            }else {
                console.warn('⚠️ MarkerClusterer 없음, 개별 마커 사용');
                newMarkers.forEach(marker => marker.setMap(map));
            }
        } catch (error) {
            console.warn('❌ 클러스터링 실패:', error);
            newMarkers.forEach(marker => marker.setMap(map));
        }
    };
    const setupInfoWindowEventListeners = () => {
        // 커스텀 닫기 버튼
        const customCloseBtn = document.querySelector('.custom-close-btn') as HTMLElement;
        if (customCloseBtn) {
            customCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (infoWindow.current) {
                    infoWindow.current.close();
                }
            });
        }

        // 메인 콘텐츠 클릭 이벤트
        const mainContent = document.querySelector('.room-main-content') as HTMLElement;
        if (mainContent) {
            mainContent.addEventListener('click', (e) => {
                // 닫기 버튼이 아닌 경우만 페이지 이동
                if (!(e.target as HTMLElement).closest('.custom-close-btn')) {
                    const roomInfo = document.querySelector('.custom-room-info') as HTMLElement;
                    if (roomInfo) {
                        const roomId = roomInfo.getAttribute('data-room-id');
                        if (roomId) {
                            handleRoomMarker(parseInt(roomId));
                        }
                    }
                }
            });
        }

        // 이벤트 전파 방지
        const roomInfo = document.querySelector('.custom-room-info') as HTMLElement;
        if (roomInfo) {
            roomInfo.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            roomInfo.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
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
                        stylers: [{ visibility: "off" }]
                    }
                ]
            };

            const map = new window.google.maps.Map(
                document.getElementById('map') as HTMLElement,
                mapOptions
            );
            mapRef.current = map;

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

            // 컴포넌트 최초 생성 시
            infoWindow.current = new window.google.maps.InfoWindow({
                disableAutoPan: false,
                pixelOffset: new window.google.maps.Size(0, -10),
            });
        };

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

                // MarkerClusterer 라이브러리 로드 - 최신 버전 사용
                const clusterScript = document.createElement('script');
                clusterScript.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
                clusterScript.onload = () => {
                    console.log('MarkerClusterer library loaded successfully');
                    // 전역 객체에서 MarkerClusterer와 GridAlgorithm 추출
                    if ((window as any).markerClusterer) {
                        window.MarkerClusterer = (window as any).markerClusterer.MarkerClusterer;
                        window.GridAlgorithm = (window as any).markerClusterer.GridAlgorithm;
                        console.log('MarkerClusterer and GridAlgorithm are now available');
                    }
                };
                clusterScript.onerror = (error) => {
                    console.warn('MarkerClusterer library failed to load:', error);
                };
                document.head.appendChild(clusterScript);
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

export default GoogleMap22;

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