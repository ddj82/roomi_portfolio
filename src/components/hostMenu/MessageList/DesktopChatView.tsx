import React, { useRef, useState, useEffect } from 'react';
import { ChatRoom, Messages } from "../../../types/chat";
import { User } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faImage, faSmile, faPaperPlane, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';

interface DesktopChatViewProps {
    chatRoom: ChatRoom;
    myUserId: string | null;
    groupedMessages: Record<string, Messages[]>;
    onBack: () => void;
    formatDate: (date: string) => string;
    isConsecutiveMessage: (current: Messages, index: number, date: string) => boolean;
    handleSendMessage: (text: string) => void;
}

const DesktopChatView: React.FC<DesktopChatViewProps> = ({
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
        <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
            {/* 데스크톱 채팅방 상단 바 - 더 넓은 공간 활용 */}
            <div className="px-5 py-4 flex items-center border-b border-gray-200 bg-white">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4 overflow-hidden flex-shrink-0">
                    <User className="h-6 w-6 text-gray-500" />
                </div>
                <div className="flex-1 flex flex-col items-start">
                    <span className="font-semibold text-lg">{chatRoom.title}</span>
                    <span className="text-sm text-gray-500">온라인</span>
                </div>
                <button
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                    onClick={onBack}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>

            {/* 채팅 메시지 영역 - 데스크톱용 최적화 */}
            <div
                ref={chatContainerRef}
                className="flex-1 py-5 px-6 overflow-y-auto"
            >
                {Object.keys(groupedMessages).length > 0 ? (
                    Object.keys(groupedMessages).map((date) => (
                        <div key={date} className="mb-6">
                            {/* 날짜 헤더 */}
                            <div className="text-center my-5">
                <span className="inline-block bg-gray-200 px-4 py-1.5 rounded-full text-sm text-gray-600 font-medium">
                  {formatDate(date)}
                </span>
                            </div>
                            {groupedMessages[date].map((msg, index) => {
                                const isMyMessage = String(msg.senderId) === myUserId;
                                const consecutive = isConsecutiveMessage(msg, index, date);

                                return (
                                    <div key={`${date}-${index}`} className={`flex ${isMyMessage ? "justify-end" : "justify-start"} ${consecutive ? "mt-1" : "mt-6"}`}>
                                        {!isMyMessage && !consecutive && (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                                                <User className="h-5 w-5 text-gray-500" />
                                            </div>
                                        )}
                                        {!isMyMessage && consecutive && <div className="w-10 mr-3"></div>}

                                        <div className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"} max-w-[70%]`}>
                                            {!consecutive && !isMyMessage && (
                                                <div className="text-sm text-gray-500 mb-1.5 ml-1">사용자 이름</div>
                                            )}
                                            <div className="flex items-end">
                                                {!isMyMessage && (
                                                    <div className="text-gray-400 text-xs mr-2 mb-1">
                                                        {dayjs(msg.createdAt).format("HH:mm")}
                                                    </div>
                                                )}
                                                <div
                                                    className={`py-3 px-4 rounded-2xl break-words ${
                                                        isMyMessage
                                                            ? "bg-roomi text-white"
                                                            : "bg-white text-gray-800 border border-gray-200"
                                                    } ${consecutive && isMyMessage ? "rounded-tr-md" : ""} ${consecutive && !isMyMessage ? "rounded-tl-md" : ""}`}
                                                >
                                                    {msg.content}
                                                </div>
                                                {isMyMessage && (
                                                    <div className="text-gray-400 text-xs ml-2 mb-1">
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
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                            <FontAwesomeIcon icon={faPaperPlane} className="text-gray-300 text-2xl" />
                        </div>
                        <p className="text-center text-lg">📭 메시지가 없습니다.</p>
                        <p className="text-base text-gray-400 mt-2">첫 메시지를 보내보세요!</p>
                    </div>
                )}
            </div>

            {/* 데스크톱용 메시지 입력창 - 더 넓은 공간 활용 */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                    {/*<button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full mr-1">*/}
                    {/*    <FontAwesomeIcon icon={faImage} />*/}
                    {/*</button>*/}
                    <input
                        ref={inputRef}
                        className="flex-1 bg-transparent px-3 py-2.5 focus:outline-none"
                        type="text"
                        placeholder="메시지 입력..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full mr-2">
                        <FontAwesomeIcon icon={faSmile} />
                    </button>
                    {input.trim() ? (
                        <button
                            className="p-2.5 bg-roomi text-white rounded-full hover:bg-roomi transition-colors"
                            onClick={sendMessage}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    ) : (
                        <button className="p-2.5 text-gray-500 hover:bg-gray-200 rounded-full">
                            <FontAwesomeIcon icon={faMicrophone} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesktopChatView;