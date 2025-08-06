import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from "react-i18next";
import {hostAcceptReservation, hostRejectReservation, myContractList, myRoomList} from "../../api/api";
import { ReservationHistory, RoomData } from "../../types/rooms";
import { Search, ChevronDown, X } from 'lucide-react';
import ReservationDetail from './ContractDetail';
import dayjs from "dayjs";
import CommonAlert from "../util/CommonAlert";

const ContractManagement = () => {
    const { t } = useTranslation();
    const [reservations, setReservations] = useState<ReservationHistory[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<ReservationHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("current"); // "current" or "past"
    const [alertOpen, setAlertOpen] = useState(false);
    // Room data for room title filtering
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
    const roomDropdownRef = useRef<HTMLDivElement>(null);

    // Search query for additional filtering
    const [searchQuery, setSearchQuery] = useState("");

    // Selected reservation for detail view
    const [selectedReservation, setSelectedReservation] = useState<ReservationHistory | null>(null);
    // 상태 관리
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

// ref 추가
    const statusDropdownRef = useRef<HTMLDivElement | null>(null);

// 클릭 외부 감지 useEffect도 추가
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
            if (roomDropdownRef.current && !roomDropdownRef.current.contains(event.target as Node)) {
                setIsRoomDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    useEffect(() => {
        fetchReservations();
        fetchRooms();
    }, []);

    // Filter reservations when activeTab or filters change
    useEffect(() => {
        filterReservations();
    }, [activeTab, reservations, selectedRoomId, searchQuery]);

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (roomDropdownRef.current && !roomDropdownRef.current.contains(event.target as Node)) {
                setIsRoomDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchReservations = async () => {
        setIsLoading(true);
        try {
            const response = await myContractList();
            const responseJson = await response.json();
            const items = responseJson.data;
            setReservations(items);
            console.log('Reservation data loaded:', items);
        } catch (error: unknown) {
            console.error('Failed to load reservation data:', error);
            setError(error instanceof Error ? error.message : 'Error loading reservation data.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await myRoomList();
            const responseJson = await response.json();
            const items: RoomData[] = responseJson.data.items;
            setRooms(items);
            console.log('방 데이터 로드:', items);
        } catch (error) {
            console.error('방 데이터 로드 실패:', error);
        }
    };

    const filterReservations = () => {
        if (!reservations || reservations.length === 0) {
            setFilteredReservations([]);
            return;
        }

        let filtered = [...reservations];

        // Filter by tab (only two tabs now: current or past)
        if (activeTab === "current") {
            // Current: CONFIRMED and PENDING that are not completed or cancelled
            filtered = filtered.filter(res => {
                const status = res.status.toUpperCase() || '';
                return status !== 'COMPLETED' && status !== 'CANCELLED' && status !== 'CHECKED_OUT' && status !== 'REJECTED';
            });
        } else if (activeTab === "past") {
            // Past: COMPLETED or CANCELLED or CHECKED_OUT
            filtered = filtered.filter(res => {
                const status = res.status?.toUpperCase() || '';
                return status === 'COMPLETED' || status === 'CANCELLED' || status === 'CHECKED_OUT' || status === 'REJECTED';
            });
        }

        // Filter by selected room
        if (selectedRoomId) {
            filtered = filtered.filter(res =>
                res.room?.id === selectedRoomId
            );
        }

        // Filter by search query (room title or address)
        if (searchQuery.trim() !== "") {
            filtered = filtered.filter(res =>
                res.room?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                res.room?.address?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredReservations(filtered);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    const formatDateRange = (startDate?: string, endDate?: string) => {
        if (!startDate || !endDate) return '';

        const start = formatDate(startDate);
        const end = formatDate(endDate);

        return `${start} - ${end}`;
    };

    const formatPrice = (price: number | undefined) => {
        if (!price) return '0';
        return Number(price).toLocaleString();
    };

    const getStatusElement = (reservation: ReservationHistory) => {
        const status = reservation.status?.toUpperCase() || '';
        const paymentStatus = reservation.payment_status?.toUpperCase() || '';

        // Status badges mapping
        if (status === 'CONFIRMED' && paymentStatus === 'PAID') {
            return <span className="text-sm font-medium px-3 py-1 bg-green-100 text-green-800 rounded-full">이용중</span>;
        } else if (status === 'CANCELLED') {
            return <span className="text-sm font-medium px-3 py-1 bg-red-100 text-red-800 rounded-full">예약 거절</span>;
        } else if (status === 'PENDING') {
            return <span className="text-sm font-medium px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">예약 대기</span>;
        } else if (status === 'COMPLETED') {
            return <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">이용 완료</span>;
        }

        // Default case
        return <span className="text-sm font-medium px-3 py-1 bg-gray-100 text-gray-800 rounded-full">결제 대기</span>;
    };

    const getButtonLabel = (status: string) => {
        status = status.toUpperCase();
        if (status === 'CONFIRMED') return '이용중';
        if (status === 'CANCELLED') return '예약 취소';
        if (status === 'PENDING') return '예약 대기';
        if (status === 'COMPLETED') return '이용 완료';
        return '결제 대기';
    };

    const getButtonColor = (status: string) => {
        status = status.toUpperCase();
        if (status === 'CONFIRMED') return 'bg-green-500';
        if (status === 'CANCELLED') return 'bg-red-500';
        if (status === 'PENDING') return 'bg-yellow-500';
        if (status === 'COMPLETED') return 'bg-blue-500';
        return 'bg-gray-500';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-md mx-auto mt-10">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handlers for reservation actions
    const handleAcceptReservation = async (id: number) => {
        try {
            console.log('Accept reservation', id);
            await hostAcceptReservation(id);
            window.location.reload(); // ✅ 수락 후 새로고침
        } catch (e) {
            console.error('수락 중 오류 발생:', e);

            setAlertOpen(true);
        } finally {
            setSelectedReservation(null);
        }
    };

    const handleRejectReservation = async (id: number) => {
        console.log('Reject reservation', id);

        const confirmed = window.confirm('정말 이 예약을 거절하시겠습니까?');
        if (!confirmed) return;

        try {
            console.log('Reject reservation', id);
            await hostRejectReservation(id);
            window.location.reload(); // ✅ 새로고침
        } catch (e) {
            console.error('거절 중 오류 발생:', e);
            alert('예약 거절에 실패했습니다.');
        } finally {
            setSelectedReservation(null);
        }
    };

    const handleCancelReservation = async (id: number) => {
        console.log('Cancel reservation', id);

        // const confirmed = window.confirm('정말 이 예약을 거절하시겠습니까?');
        // if (!confirmed) return;
        //
        // try {
        //     console.log('Reject reservation', id);
        //     await hostRejectReservation(id);
        //     window.location.reload(); // ✅ 새로고침
        // } catch (e) {
        //     console.error('거절 중 오류 발생:', e);
        //     alert('예약 거절에 실패했습니다.');
        // } finally {
        //     setSelectedReservation(null);
        // }
    };

    const handleCompleteReservation = (id: number) => {
        console.log('Complete reservation', id);
        // Implement API call
        setSelectedReservation(null);
    };

    const handleDeleteReservation = (id: number) => {
        console.log('Delete reservation', id);
        // Implement API call
        setSelectedReservation(null);
    };

    const handleRefundDeduction = (id: number) => {
        console.log('Handle refund deduction', id);
        // Implement API call
        setSelectedReservation(null);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="min-h-screen">
            {/* 고정될 상단 부분 */}
            <div className="mx-auto py-5 px-4 flex flex-col gap-4 w-full bg-white sticky top-0">

                {!selectedReservation && (
                    <>
                        {/* 검색 및 필터링 영역 */}
                        <div className="w-full flex flex-col gap-3">
                            {/* 첫 번째 줄: 필터 드롭다운들 */}
                            <div className="flex gap-3">
                                {/* 예약 상태 필터 드롭다운 */}
                                <div className="relative w-1/2 sm:w-1/6" ref={statusDropdownRef}>
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between px-4 py-3 text-sm
                bg-white border border-gray-100 rounded-2xl transition shadow-sm hover:bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                        aria-haspopup="true"
                                        aria-expanded={isStatusDropdownOpen}
                                    >
                <span className="text-gray-700 font-medium">
                    {activeTab === "current" ? "현재 예약" : "지난 예약"}
                </span>
                                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                                            isStatusDropdownOpen ? 'rotate-180' : ''
                                        }`}/>
                                    </button>

                                    {/* 드롭다운 메뉴 */}
                                    {isStatusDropdownOpen && (
                                        <div
                                            className="absolute z-10 w-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-lg max-h-60 overflow-hidden"
                                            role="menu"
                                        >
                                            <div
                                                className={`px-4 py-3 cursor-pointer transition-colors
                        ${activeTab === "current"
                                                    ? 'bg-roomi-0 text-roomi font-medium'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                                onClick={() => {
                                                    setActiveTab("current");
                                                    setIsStatusDropdownOpen(false);
                                                }}
                                                role="menuitem"
                                            >
                                                {t('현재 예약')}
                                            </div>
                                            <div
                                                className={`px-4 py-3 cursor-pointer transition-colors
                        ${activeTab === "past"
                                                    ? 'bg-roomi-0 text-roomi font-medium'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                                onClick={() => {
                                                    setActiveTab("past");
                                                    setIsStatusDropdownOpen(false);
                                                }}
                                                role="menuitem"
                                            >
                                                {t('지난 예약')}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 방 선택 드롭다운 */}
                                <div className="relative w-1/2 sm:w-1/6" ref={roomDropdownRef}>
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between px-4 py-3 text-sm
                bg-white border border-gray-100 rounded-2xl transition shadow-sm hover:bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-roomi focus:border-transparent"
                                        onClick={() => setIsRoomDropdownOpen(!isRoomDropdownOpen)}
                                        aria-haspopup="true"
                                        aria-expanded={isRoomDropdownOpen}
                                    >
                <span className="text-gray-700 font-medium">
                    {selectedRoomId
                        ? rooms.find(room => room.id === selectedRoomId)?.title || '선택된 방'
                        : '방 선택'}
                </span>
                                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                                            isRoomDropdownOpen ? 'rotate-180' : ''
                                        }`}/>
                                    </button>

                                    {/* 드롭다운 메뉴 */}
                                    {isRoomDropdownOpen && (
                                        <div
                                            className="absolute z-10 w-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-lg max-h-60 overflow-y-auto overflow-hidden"
                                            role="menu"
                                        >
                                            <div
                                                className={`px-4 py-3 cursor-pointer transition-colors
                        ${!selectedRoomId
                                                    ? 'bg-roomi-0 text-roomi font-medium'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                                onClick={() => {
                                                    setSelectedRoomId(null);
                                                    setIsRoomDropdownOpen(false);
                                                }}
                                                role="menuitem"
                                            >
                                                전체 방
                                            </div>
                                            {rooms.map((room) => (
                                                <div
                                                    key={room.id}
                                                    className={`px-4 py-3 cursor-pointer transition-colors
                            ${selectedRoomId === room.id
                                                        ? 'bg-roomi-1 text-roomi font-medium'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedRoomId(room.id || null);
                                                        setIsRoomDropdownOpen(false);
                                                    }}
                                                    role="menuitem"
                                                >
                                                    {room.title}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 나머지 공간 */}
                                <div className="hidden sm:flex-1"></div>
                            </div>

                            {/* 두 번째 줄: 검색창 */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* 검색창 - 주석 처리된 부분 유지 */}
                                {/*<div className="relative w-full sm:w-2/6">*/}
                                {/*    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">*/}
                                {/*        <Search className="w-4 h-4 text-gray-500" aria-hidden="true"/>*/}
                                {/*    </div>*/}
                                {/*    <input*/}
                                {/*        type="search"*/}
                                {/*        className="w-full py-3 pl-10 pr-3 text-base border border-gray-100 rounded-2xl*/}
                                {/*        shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent*/}
                                {/*        bg-white placeholder-gray-500"*/}
                                {/*        placeholder="제목 또는 주소 입력"*/}
                                {/*        value={searchQuery}*/}
                                {/*        onChange={handleSearchChange}*/}
                                {/*        aria-label="검색"*/}
                                {/*    />*/}
                                {/*</div>*/}

                                {/* 모바일에서만 보이는 추가 버튼들 - 주석 처리된 부분 유지 */}
                                {/*<div className="flex sm:hidden gap-2">*/}
                                {/*    <button*/}
                                {/*        type="button"*/}
                                {/*        className="flex-1 px-4 py-2 text-sm font-medium rounded-2xl transition*/}
                                {/*        bg-white border border-gray-100 text-gray-700 hover:bg-gray-50 shadow-sm"*/}
                                {/*    >*/}
                                {/*        날짜 필터*/}
                                {/*    </button>*/}
                                {/*    <button*/}
                                {/*        type="button"*/}
                                {/*        className="flex-1 px-4 py-2 text-sm font-medium rounded-2xl transition*/}
                                {/*        bg-white border border-gray-100 text-gray-700 hover:bg-gray-50 shadow-sm"*/}
                                {/*    >*/}
                                {/*        금액 필터*/}
                                {/*    </button>*/}
                                {/*</div>*/}

                                {/* 추가 공간 (웹) */}
                                <div className="hidden sm:flex-1"></div>
                            </div>
                        </div>
                    </>
                )}

                {selectedReservation && (
                    <div className="flex items-center justify-between w-full">
                        {/* ← 뒤로가기 버튼 */}
                        <button
                            onClick={() => setSelectedReservation(null)}
                            className="flex items-center gap-1 text-sm text-gray-700 font-medium"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">뒤로가기</span>
                        </button>

                        {/* 가운데 "예약 상세정보" 텍스트 */}
                        <h2 className="text-xl text-center flex-1 -ml-5 sm:ml-0">
                            예약 상세정보
                        </h2>

                        {/* 오른쪽 비움 (중앙정렬 위해 공간 확보) */}
                        <div className="w-5 sm:w-20" />
                    </div>
                )}
            </div>

            {/*컨텐츠*/}
            <div className="px-4 pb-6">
                {selectedReservation ? (
                    /*예약 상세 정보*/
                    <ReservationDetail
                        reservation={selectedReservation}
                        onClose={() => setSelectedReservation(null)}
                        onAccept={handleAcceptReservation}
                        onReject={handleRejectReservation}
                        onCancel={handleCancelReservation}
                        onComplete={handleCompleteReservation}
                        onDelete={handleDeleteReservation}
                        onRefund={handleRefundDeduction}
                    />
                ) : (
                    /*예약 내역*/
                    <div>
                        {filteredReservations.length === 0 ? (
                            <div className="text-center py-10" role="status" aria-live="polite">
                                <div className="text-gray-500 text-lg">
                                    {activeTab === "current" ? "현재 예약이 없습니다." : "지난 예약이 없습니다."}
                                </div>
                                <div className="text-gray-400 mt-2">
                                    {activeTab === "current" ? "예약이 생성되면 이곳에 표시됩니다." : "지난 예약 내역이 없습니다."}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredReservations.map((reservation) => (
                                    <div
                                        key={reservation.id}
                                        className="bg-gray-50 rounded-lg overflow-hidden flex flex-col sm:flex-row cursor-pointer"
                                        onClick={() => setSelectedReservation(reservation)}
                                    >
                                        {/* 모바일 레이아웃 */}
                                        <div className="w-full sm:hidden">
                                            {/* 날짜 및 상태 */}
                                            <div className="flex justify-between items-center p-3 bg-gray-50">
                                                <span className="text-sm text-gray-600">
                                                    {formatDateRange(
                                                        reservation.check_in_date?.toString(),
                                                        reservation.check_out_date?.toString()
                                                    )}
                                                </span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded text-white ${
                                                        reservation.status === 'PENDING'
                                                            ? 'bg-yellow-700'
                                                            : reservation.status === 'CONFIRMED'
                                                                ? reservation.payment_status === 'UNPAID'
                                                                    ? 'bg-roomi'
                                                                    : reservation.payment_status === 'PAID'
                                                                        ? 'bg-blue-700'
                                                                        : 'bg-blue-700'
                                                                : reservation.status === 'COMPLETED'
                                                                    ? 'bg-green-700'
                                                                    : reservation.status === 'CANCELLED'
                                                                        ? 'bg-gray-700'
                                                                        : reservation.status === 'IN_USE'
                                                                            ? 'bg-gray-700'
                                                                            : reservation.status === 'CHECKED_OUT'
                                                                                ? 'bg-gray-700'
                                                                                : reservation.status === 'REJECTED'
                                                                                    ? 'bg-red-700'
                                                                                    : 'bg-black'
                                                    }`}
                                                >
                                                    {
                                                        reservation.status === 'CONFIRMED'
                                                            ? reservation.payment_status === 'UNPAID'
                                                                ? '결제대기'
                                                                : reservation.payment_status === 'PAID'
                                                                    ? '결제완료'
                                                                    : '이용중'
                                                            : reservation.status === 'COMPLETED'
                                                                ? '이용 완료'
                                                                : reservation.status === 'CANCELLED'
                                                                    ? '예약 취소'
                                                                    : reservation.status === 'IN_USE'
                                                                        ? '이용중'
                                                                        : reservation.status === 'CHECKED_OUT'
                                                                            ? '퇴실 완료'
                                                                            : reservation.status === 'PENDING'
                                                                                ? '승인 대기중'
                                                                                : reservation.status === 'REJECTED'
                                                                                    ? '거절됨'
                                                                                    : '상태 미정'
                                                    }
                                                </span>
                                            </div>

                                            {/* 방 정보 */}
                                            <div className="flex p-3 bg-gray-50">
                                                {/* 썸네일 */}
                                                <div
                                                    className="w-20 h-20 bg-gray-200 flex-shrink-0 rounded-md overflow-hidden">
                                                {reservation.room?.detail_urls && reservation.room.detail_urls.length > 0 && (
                                                        <img
                                                            src={reservation.room.detail_urls[0]}
                                                            alt={reservation.room?.title || "Room"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>

                                                {/* 방 내용 */}
                                                <div className="ml-3 flex-1 px-2">
                                                    <h3 className=" text-sm">
                                                        {reservation.room?.title || "Unnamed Room"}
                                                    </h3>
                                                    {/*<p className="text-xs text-gray-600 mt-1">*/}
                                                    {/*    {reservation.room?.address || "No address provided"} , {reservation.room?.address_detail || "No address provided"}*/}
                                                    {/*</p>*/}
                                                    <p className="text-xs text-gray-600 mt-1">
                                                      예약자   : {reservation.guest?.name || "No address provided"}
                                                    </p>
                                                    <p className="text-xs text-gray-600 ">
                                                        {`예약일   : ${reservation.created_at ? dayjs(reservation.created_at).format('YYYY-MM-DD') : 'No date provided'}`}
                                                    </p>
                                                    <p className="text-sm font-medium mt-1 mb-3">
                                                    {reservation.symbol}{formatPrice(reservation.price + reservation.deposit + reservation.maintenance_fee)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 데스크톱 레이아웃 - 숨김 처리 */}
                                        <div className="hidden sm:flex w-full">
                                            {/* Thumbnail */}
                                            <div
                                                className="w-24 h-24 bg-gray-200 flex-shrink-0 m-6 rounded-md overflow-hidden">
                                                {reservation.room?.detail_urls && reservation.room.detail_urls.length > 0 && (
                                                    <img
                                                        src={reservation.room.detail_urls[0]}
                                                        alt={reservation.room?.title || "Room"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-4 m-2 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="text-base">
                                                            {reservation.room?.title || "Unnamed Room"}
                                                        </h3>
                                                        <span className="text-sm text-gray-500">
                                                        {formatDateRange(
                                                            reservation.check_in_date?.toString(),
                                                            reservation.check_out_date?.toString()
                                                        )}
                                                    </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-1">
                                                        예약자 : {reservation.guest?.name || "No address provided"}
                                                    </p>
                                                    <p className="text-xs text-gray-600 ">
                                                        {`예약일   : ${reservation.created_at ? dayjs(reservation.created_at).format('YYYY-MM-DD') : 'No date provided'}`}
                                                    </p>
                                                    <div className="flex justify-between items-center mt-1 ">
                                                        <p className="font-base text-sm text-gray-800">
                                                        총
                                                            금액: {reservation.symbol}{formatPrice(reservation.price + reservation.deposit + reservation.maintenance_fee)}
                                                        </p>
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded text-white ${
                                                                reservation.status === 'PENDING'
                                                                    ? 'bg-[#4e4e4e]'
                                                                    : reservation.status === 'CONFIRMED'
                                                                        ? reservation.payment_status === 'UNPAID'
                                                                            ? 'bg-[#999999]'
                                                                            : reservation.payment_status === 'PAID'
                                                                                ? 'bg-roomi'
                                                                                : 'bg-roomi'
                                                                        : reservation.status === 'COMPLETED'
                                                                            ? 'bg-[#999999]'
                                                                            : reservation.status === 'CANCELLED'
                                                                                ? 'bg-[#999999]'
                                                                                : reservation.status === 'IN_USE'
                                                                                    ? 'bg-[#67b988]'
                                                                                    : reservation.status === 'CHECKED_OUT'
                                                                                        ? 'bg-[#999999]'
                                                                                        : reservation.status === 'REJECTED'
                                                                                            ? 'bg-red-700'
                                                                                            : 'bg-black'
                                                            }`}
                                                        >
                                                        {
                                                            reservation.status === 'CONFIRMED'
                                                                ? reservation.payment_status === 'UNPAID'
                                                                    ? '결제 대기'
                                                                    : reservation.payment_status === 'PAID'
                                                                        ? '예약 완료'
                                                                        : '예약 완료'
                                                                : reservation.status === 'COMPLETED'
                                                                    ? '이용 완료'
                                                                    : reservation.status === 'CANCELLED'
                                                                        ? '예약 취소'
                                                                        : reservation.status === 'IN_USE'
                                                                            ? ' 이용중 '
                                                                            : reservation.status === 'CHECKED_OUT'
                                                                                ? '퇴실 완료'
                                                                                : reservation.status === 'PENDING'
                                                                                    ? '승인 대기'
                                                                                    : reservation.status === 'REJECTED'
                                                                                        ? '거절됨'
                                                                                        : '상태 미정'
                                                        }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            //예약실패 알람 모달
            {alertOpen && (
                <CommonAlert
                    isOpen={alertOpen}
                    onRequestClose={() => setAlertOpen(false)}
                    content="예약 수락에 실패했습니다."
                />
            )}
        </div>


    );
};

export default ContractManagement;