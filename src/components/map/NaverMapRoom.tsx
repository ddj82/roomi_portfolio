import React, { useEffect, useRef } from 'react';
import { RoomData } from "../../types/rooms";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faLocationDot, faMapPin} from "@fortawesome/free-solid-svg-icons";
import ReactDOMServer from "react-dom/server";

const NaverMapRoom = ({ room }: { room: RoomData }) => {
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null); // 마커 참조 저장

    useEffect(() => {
        const initMap = async () => {
            if (!window.naver || !window.naver.maps) return;

            const mapOptions = {
                center: new window.naver.maps.LatLng(room.coordinate_lat, room.coordinate_long),
                zoom: 17,
                minZoom: 17,
                maxZoom: 18,
                // draggable: false,               // 드래그 비활성화 (사용자가 이동 못함)
                pinchZoom: false,               // 모바일 핀치 줌 비활성화
                // scrollWheel: false,             // 스크롤 휠 줌 비활성화
                disableDoubleClickZoom: true,   // 더블 클릭 줌 비활성화
                keyboardShortcuts: false,       // 키보드 이동(방향키) 비활성화
            };

            const map = new window.naver.maps.Map('map', mapOptions);
            mapRef.current = map;

            // 마커 추가
            addMarker(map, room);
        };

        const addMarker = (map: any, room: RoomData) => {
            // 기존 마커가 있으면 제거
            if (markerRef.current) {
                markerRef.current.setMap(null);
            }

            // 새 마커 추가 (이벤트 없이)
            const position = new window.naver.maps.LatLng(room.coordinate_lat, room.coordinate_long);
            // FontAwesome 아이콘을 포함한 HTML 문자열 생성
            const markerContent = ReactDOMServer.renderToString(
                <div
                    className="flex_center text-roomi text-[1.5rem] cursor-default pointer-events-none relative -translate-x-1/2 -translate-y-[110%] drop-shadow-md"
                >
                    <FontAwesomeIcon icon={faLocationDot}/>
                </div>
            );
            const marker = new window.naver.maps.Marker({
                position,
                map,
                title: room.title,
                icon: {
                    content: markerContent,
                },
            });

            window.naver.maps.Event.clearListeners(marker, "click");
            markerRef.current = marker; // 마커 저장
        };

        if (window.naver && window.naver.maps) {
            initMap();
        } else {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=ztg68tla5j`;
            script.onload = initMap;
            document.head.appendChild(script);
        }
    }, [room]); // room이 변경될 때마다 실행

    return (
        <div style={styles.mapContainer}>
            <div id="map" style={styles.map}/>
        </div>
    );
};

export default NaverMapRoom;

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
