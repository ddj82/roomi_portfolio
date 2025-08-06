import React, {useEffect, useState, useRef} from 'react';
import {myRoomList} from "src/api/api";
import { RoomData } from "src/types/rooms";
import {useNavigate} from "react-router-dom";
import { Search, ChevronDown } from 'lucide-react';
import CommonModal from "../util/CommonModal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopy, faSquarePlus} from "@fortawesome/free-regular-svg-icons";
import {PlusCircle, Copy} from "@phosphor-icons/react";
import RoomInsertBtn from "./myRooms/RoomInsertBtn";
import roomInsertBtn from "./myRooms/RoomInsertBtn";

const MyRooms = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<RoomData[]>([]);
    const [filteredData, setFilteredData] = useState<RoomData[]>([]); // ✅ 필터링된 데이터
    const [searchQuery, setSearchQuery] = useState(""); // ✅ 검색어 상태
    const [roomCondition, setRoomCondition] = useState(""); // ✅ 방 상태 필터
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [roomInsertModal, setRoomInsertModal] = useState(false);
    const [isRoomCopy, setIsRoomCopy] = useState(false);

    // 드롭다운 옵션 정의
    const conditions = [
        { value: '', label: '전체' },
        { value: '활성화', label: '활성화' },
        { value: '비활성화', label: '비활성화' },
        { value: '승인대기', label: '승인대기' },
        { value: '승인거절', label: '승인거절' }
    ];

    // 현재 선택된 조건의 라벨 표시
    const displayValue = roomCondition ?
        conditions.find(item => item.value === roomCondition)?.label :
        '전체';

    useEffect(() => {
        const myRoomAPI = async () => {
            try {
                const response = await myRoomList();
                const responseJson = await response.json();
                const items: RoomData[] = responseJson.data.items; // API 데이터 가져오기
                setData(items); // 상태 업데이트
                setFilteredData(items); // 필터링된 데이터 초기화
                console.log('나의 방 api 리스폰스 :', items);
            } catch (error) {
                console.error('API 호출 중 에러 발생:', error);
            }
        };
        myRoomAPI();
    }, []);

    // ✅ 방 상태를 문자열로 변환하는 함수
    const getRoomStatus = (room: RoomData) => {
        if (room.is_rejected) return "승인거절";
        if (!room.is_confirmed) return "승인대기";
        return room.is_active ? "활성화" : "비활성화";
    };

    // ✅ 필터링 함수 (검색어 & 승인 상태 반영)
    useEffect(() => {
        let filtered = data;

        // 🔹 검색어 필터 적용 (방 제목 or 주소)
        if (searchQuery.trim() !== "") {
            filtered = filtered.filter(
                (room) =>
                    room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    room.address?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 🔹 방 상태 필터 적용 (계층적으로 검사)
        if (roomCondition !== "") {
            filtered = filtered.filter((room) => getRoomStatus(room) === roomCondition);
        }

        setFilteredData(filtered);
    }, [searchQuery, roomCondition, data]);

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, []);

    const handleInsertBtn = () => {
        console.log('방 등록 클릭');
        navigate("/host/insert");
    };

    const handleRoomUpdateBtn = (roomId: number) => {
        const room = data.find((item) => item.id === roomId);
        if (!room) return;

        console.log('방수정 클릭 해당 방', room);

        navigate(`/host/update/${roomId}`, { state: { room } });
    };

    const formatPrice = (price: number | undefined) => {
        if (!price) return '0';
        return Number(price).toLocaleString();
    };

    return (
        <div className="min-h-screen">
            {(roomInsertModal || isRoomCopy) && (
                <RoomInsertBtn
                    isOpen={roomInsertModal}
                    onRequestClose={() => setRoomInsertModal(false)}
                    handleInsertBtn={handleInsertBtn}
                    isRoomCopy={isRoomCopy}
                    roomCopyOpen={() => setIsRoomCopy(true)}
                    roomCopyClose={() => setIsRoomCopy(false)}
                    rooms={data}
                />
            )}
            {/* 고정 헤더 */}
            <div className="bg-white py-3.5 sticky top-0 md:static">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="flex flex-row gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-40" ref={dropdownRef}>
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm
                                    bg-white border border-gray-100 rounded-xl transition shadow-sm hover:bg-gray-50"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className="text-gray-700 font-medium">{displayValue}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
                                        isDropdownOpen ? 'rotate-180' : ''
                                    }`}/>
                                </button>
                                {isDropdownOpen && (
                                    <div
                                        className="absolute w-full mt-1 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
                                        {conditions.map((condition) => (
                                            <div
                                                key={condition.value || 'empty'}
                                                className={`px-4 py-2 text-sm cursor-pointer transition-colors
                                                  ${roomCondition === condition.value
                                                        ? 'bg-roomi-0 text-roomi font-medium'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                                onClick={() => {
                                                    setRoomCondition(condition.value);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {condition.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative w-full sm:w-60">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4 text-gray-500"/>
                                </div>
                                <input
                                    type="search"
                                    className="w-full py-2.5 pl-10 pr-3 text-sm border border-gray-100 rounded-xl
                                    shadow-sm focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent
                                    bg-white placeholder-gray-500"
                                    placeholder="제목 또는 주소 입력"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-full sm:w-auto">
                            <button
                                type="button"
                                className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-white bg-roomi rounded-xl shadow-sm hover:bg-roomi-1 transition-colors"
                                // onClick={handleInsertBtn}
                                onClick={() => setRoomInsertModal(true)}
                            >
                                <span className="mr-2">+</span>
                                방 등록하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 컨텐츠 영역 */}
            <div className="py-6">
                {/* 필터링된 방 목록 */}
                {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredData.map((room, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-lg overflow-hidden flex flex-col sm:flex-row cursor-pointer hover:shadow-sm transition-shadow duration-300"
                            >
                                {/* 모바일 레이아웃 */}
                                <div className="w-full sm:hidden">
                                    {/* 상태 및 가격 정보 */}
                                    <div className="flex justify-between items-center p-3 bg-gray-50">
                                        <span
                                            className={`rounded-l inline-block px-2 py-1 text-xs font-semibold rounded 
                                                ${getRoomStatus(room) === "활성화"
                                                ? "bg-roomi text-white"
                                                : getRoomStatus(room) === "비활성화"
                                                    ? "bg-gray-400 text-white"
                                                    : getRoomStatus(room) === "승인거절"
                                                        ? "bg-red-500 text-white"
                                                        : "bg-gray-400 text-white"
                                            }`}
                                        >
                                            {getRoomStatus(room)}
                                        </span>
                                        <span className="text-sm font-bold">
                                            {room.symbol} {formatPrice(room.month_price)}/월
                                        </span>
                                    </div>

                                    {/* 방 정보 */}
                                    <div className="flex p-3 bg-gray-50">
                                        {/* 썸네일 */}
                                        <div className="w-20 h-20 bg-gray-200 flex-shrink-0 rounded-md overflow-hidden">
                                            <img
                                                className="object-cover w-full h-full"
                                                src={room.detail_urls?.[0]}
                                                alt="thumbnail"
                                            />
                                        </div>

                                        {/* 방 내용 */}
                                        <div className="ml-3 flex-1">
                                            <h3 className="font-medium text-base">
                                                {room.title}
                                            </h3>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {room.address}<br/>
                                                {room.address_detail}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                주간: {room.symbol} {formatPrice(room.week_price)}/주
                                            </p>
                                        </div>
                                    </div>

                                    {/* 버튼 영역 */}
                                    <div className="p-3 pt-0 flex gap-2">
                                        <button
                                            className="rounded-xl flex-1 text-sm px-3 py-2 border border-gray-300 text-black rounded hover:bg-gray-100 transition"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRoomUpdateBtn(room.id);
                                            }}
                                        >
                                            수정
                                        </button>
                                        <button
                                            className="rounded-xl flex-1 text-sm px-3 py-2 border border-gray-300 text-black rounded hover:bg-gray-100 transition"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>

                                {/* 데스크톱 레이아웃 */}
                                <div className="hidden sm:flex w-full">
                                    {/* Thumbnail */}
                                    <div className="w-24 h-24 bg-gray-200 flex-shrink-0 m-6 rounded-md overflow-hidden">
                                        <img
                                            className="object-cover w-full h-full"
                                            src={room.detail_urls?.[0]}
                                            alt="thumbnail"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium text-base">
                                                    {room.title}
                                                </h3>
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs font-semibold rounded 
                                                        ${getRoomStatus(room) === "활성화"
                                                        ? "bg-roomi text-white"
                                                        : getRoomStatus(room) === "비활성화"
                                                            ? "bg-gray-400 text-white"
                                                            : getRoomStatus(room) === "승인거절"
                                                                ? "bg-red-500 text-white"
                                                                : "bg-gray-400 text-white"
                                                    }`}
                                                >
                                                    {getRoomStatus(room)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {room.address}<br/>
                                                {room.address_detail}
                                            </p>
                                            <div className="flex justify-between items-center mt-2">
                                                <div className="text-sm text-gray-600">
                                                    <span
                                                        className="mr-4">주간: {room.symbol} {formatPrice(room.week_price)}/주</span>
                                                    <span>월간: {room.symbol} {formatPrice(room.month_price)}/월</span>
                                                </div>

                                                {/* 버튼 영역 - 가격과 같은 행에 배치 */}
                                                <div className="flex gap-2">
                                                    <button
                                                        className="rounded-xl text-sm px-5 py-1.5 border border-gray-300 text-black rounded hover:bg-gray-100 transition"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRoomUpdateBtn(room.id);
                                                        }}
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        className="rounded-xl text-sm px-5 py-1.5 border border-gray-300 text-black rounded hover:bg-gray-100 transition"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-gray-50 rounded-lg p-10">
                        <div className="text-gray-500 text-lg">🔍 검색 결과가 없습니다.</div>
                        <div className="text-gray-400 mt-2">다른 검색어나 필터를 사용해보세요.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRooms;