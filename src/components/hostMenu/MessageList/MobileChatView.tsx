import React, { useRef, useState, useEffect } from 'react';
import { ChatRoom, Messages } from "../../../types/chat";
import { ArrowLeft, User } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faSmile, faPaperPlane, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';

interface MobileChatViewProps {
    chatRoom: ChatRoom;
    myUserId: string | null;
    groupedMessages: Record<string, Messages[]>;
    onBack: () => void;
    formatDate: (date: string) => string;
    isConsecutiveMessage: (current: Messages, index: number, date: string) => boolean;
    handleSendMessage: (text: string) => void;
}

const MobileChatView: React.FC<MobileChatViewProps> = ({
                                                           chatRoom,
                                                           myUserId,
                                                           groupedMessages,
                                                           onBack,
                                                           formatDate,
                                                           isConsecutiveMessage,
                                                           handleSendMessage
                                                       }) => {
    const [input, setInput] = useState<string>("");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 스크롤을 최하단으로 이동하는 함수
    const scrollToBottom = (): void => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    // 채팅 업데이트 시 자동 스크롤
    useEffect(() => {
        scrollToBottom();
    }, [groupedMessages]);

    // 메시지 전송 핸들러
    const sendMessage = (): void => {
        if (input.trim()) {
            handleSendMessage(input);
            setInput("");
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    // 엔터키 핸들러
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* 모바일 채팅방 상단 바 - 간결하게 재설계 */}
            <div className="px-3 py-3 flex items-center border-b border-gray-200 bg-white">
                <button
                    onClick={onBack}
                    className="p-1.5 rounded-full hover:bg-gray-100 mr-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 overflow-hidden flex-shrink-0">
                    <User className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1 flex flex-col items-start">
                    <span className="font-semibold text-sm">{chatRoom.title}</span>
                </div>
            </div>

            {/* 채팅 메시지 영역 - 모바일용 최적화 */}
            <div
                ref={chatContainerRef}
                className="flex-1 py-2 px-2 overflow-y-auto"
            >
                {Object.keys(groupedMessages).length > 0 ? (
                    Object.keys(groupedMessages).map((date) => (
                        <div key={date} className="mb-2">
                            {/* 날짜 헤더 - 모바일에 맞게 크기 조정 */}
                            <div className="text-center my-2">
                <span className="inline-block bg-gray-200 px-2 py-0.5 rounded-full text-xs text-gray-600 font-medium">
                  {formatDate(date)}
                </span>
                            </div>
                            {groupedMessages[date].map((msg, index) => {
                                const isMyMessage = String(msg.senderId) === myUserId;
                                const consecutive = isConsecutiveMessage(msg, index, date);

                                return (
                                    <div key={`${date}-${index}`} className={`flex ${isMyMessage ? "justify-end" : "justify-start"} ${consecutive ? "mt-0.5" : "mt-2"}`}>
                                        {!isMyMessage && !consecutive && (
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-1 flex-shrink-0 mt-1">
                                                <User className="h-3 w-3 text-gray-500" />
                                            </div>
                                        )}
                                        {!isMyMessage && consecutive && <div className="w-6 mr-1"></div>}

                                        <div className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"} max-w-[80%]`}>
                                            {!consecutive && !isMyMessage && (
                                                <div className="text-xs text-gray-500 mb-0.5 ml-1">사용자 이름</div>
                                            )}
                                            <div className="flex items-end">
                                                {!isMyMessage && (
                                                    <div className="text-gray-400 text-xs mr-1 mb-0.5">
                                                        {dayjs(msg.createdAt).format("HH:mm")}
                                                    </div>
                                                )}
                                                <div
                                                    className={`py-1.5 px-2.5 rounded-2xl break-words text-sm ${
                                                        isMyMessage
                                                            ? "bg-roomi text-white"
                                                            : "bg-white text-gray-800 border border-gray-100"
                                                    } ${consecutive && isMyMessage ? "rounded-tr-md" : ""} ${consecutive && !isMyMessage ? "rounded-tl-md" : ""}`}
                                                >
                                                    {msg.content}
                                                </div>
                                                {isMyMessage && (
                                                    <div className="text-gray-400 text-xs ml-1 mb-0.5">
                                                        {dayjs(msg.createdAt).format("HH:mm")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <FontAwesomeIcon icon={faPaperPlane} className="text-gray-300 text-lg" />
                        </div>
                        <p className="text-center text-sm">📭 메시지가 없습니다.</p>
                        <p className="text-xs text-gray-400 mt-1">첫 메시지를 보내보세요!</p>
                    </div>
                )}
            </div>

            {/* 모바일용 메시지 입력창 - 더 컴팩트하게 */}
            <div className="p-2 bg-white border-t border-gray-200">
                <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                    {/*<button className="p-1.5 text-gray-500">*/}
                    {/*    <FontAwesomeIcon icon={faImage} className="text-sm" />*/}
                    {/*</button>*/}
                    <input
                        ref={inputRef}
                        className="flex-1 bg-transparent px-2 py-1.5 text-sm focus:outline-none"
                        type="text"
                        placeholder="메시지 입력..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    {input.trim() ? (
                        <button
                            className="p-1.5 bg-roomi text-white rounded-full"
                            onClick={sendMessage}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                        </button>
                    ) : (
                        <div className="flex">
                            <button className="p-1.5 text-gray-500">
                                <FontAwesomeIcon icon={faSmile} className="text-sm" />
                            </button>
                            <button className="p-1.5 text-gray-500">
                                <FontAwesomeIcon icon={faMicrophone} className="text-sm" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileChatView;