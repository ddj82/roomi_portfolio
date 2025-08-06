import React, { useEffect, useState } from 'react';
import { useChatStore } from "../stores/ChatStore";
import Message from "./MessageList/Message";
import dayjs from "dayjs";
import { ChatRoom } from "../../types/chat";
import { Search, ArrowLeft, User, MessageCircle } from 'lucide-react';

export default function MessageList(): React.ReactElement {
    const { rooms, connect } = useChatStore();
    const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
    const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        const handleResize = (): void => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            connect(token);
        }
    }, [connect]);

    const handleSetSelectedChatRoom = (chatRoom: ChatRoom): void => {
        setSelectedChatRoom(chatRoom);
        setSelectedChatRoomId(chatRoom.id);
    };

    const handleOnBack = (): void => {
        setSelectedChatRoom(null);
        setSelectedChatRoomId(null);
    };

    const filteredRooms = rooms.filter((room: ChatRoom) => {
        const title = room.title || '';
        const lastMessage = room.lastMessage || '';
        const query = searchQuery.toLowerCase();

        return title.toLowerCase().includes(query) ||
            lastMessage.toLowerCase().includes(query);
    });

    const formatTimeOrDate = (timestamp: string | number | Date): string => {
        const today = dayjs();
        const messageDate = dayjs(timestamp);

        if (messageDate.isSame(today, 'day')) {
            return messageDate.format('HH:mm');
        } else if (messageDate.isSame(today.subtract(1, 'day'), 'day')) {
            return '어제';
        } else if (messageDate.isAfter(today.subtract(7, 'day'))) {
            return messageDate.format('ddd'); // Day of week
        } else {
            return messageDate.format('MM-DD');
        }
    };

    return (
        <div className={`flex w-full overflow-hidden bg-white scrollbar-hidden ${
            isMobile
                ? 'h-[calc(100vh-80px)]' // 모바일용 높이 조정 (상단 바 높이 56px 고려)
                : 'h-[calc(85vh)]'      // 데스크톱용 높이 살짝 늘림
        }`}>
            {(!isMobile || !selectedChatRoomId) && (
                <div className="flex flex-col overflow-hidden w-full md:w-2/5">
                    <div className="p-4 border-b border-gray-200 bg-white">
                        {/*<h2 className="text-xl font-semibold mb-2">메시지</h2>*/}
                        <div className="relative">
                            <input
                                type="search"
                                placeholder="대화 검색..."
                                className="w-full focus:outline-none p-2 pl-10 bg-gray-100 rounded-full text-sm"
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4"/>
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-hidden">
                        {filteredRooms.length > 0 ? (
                            filteredRooms.map((chatRoom: ChatRoom) => (
                                <div key={chatRoom.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSetSelectedChatRoom(chatRoom)}
                                        className={`flex items-center p-4 hover:bg-gray-50 w-full transition-colors ${
                                            selectedChatRoomId === chatRoom.id ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div
                                            className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden">
                                            <User className="h-6 w-6 text-gray-500"/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span
                                                    className="font-medium text-gray-900 truncate">{chatRoom.room?.roomName ?? ""}</span>
                                                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                                    {formatTimeOrDate(chatRoom.timestamp)}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 truncate">{chatRoom.lastMessage}</div>
                                        </div>
                                        {chatRoom.unreadCount > 0 && (
                                            <div className="ml-3 flex-shrink-0">
                                                <span
                                                    className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                    {chatRoom.unreadCount > 99 ? '99+' : chatRoom.unreadCount}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500 h-full p-8">
                                <MessageCircle className="h-12 w-12 text-gray-300 mb-3"/>
                                {searchQuery ? (
                                    <p>검색 결과가 없습니다.</p>
                                ) : (
                                    <p>📭 채팅방이 없습니다.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {(!isMobile || selectedChatRoomId) && (
                <div className="w-full md:w-3/5 flex flex-col h-full">
                    {selectedChatRoomId && selectedChatRoom ? (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-hidden">
                                <Message
                                    chatRoom={selectedChatRoom}
                                    chatRoomId={selectedChatRoomId}
                                    onBack={handleOnBack}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 h-full">
                            <MessageCircle className="h-16 w-16 text-gray-300 mb-4"/>
                            <p className="text-lg">📭 채팅방을 선택하세요.</p>
                            <p className="text-sm text-gray-400 mt-2">왼쪽에서 대화를 선택하여 시작하세요</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}