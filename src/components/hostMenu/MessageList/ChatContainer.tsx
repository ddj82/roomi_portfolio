import React, { useEffect, useState } from 'react';
import { ChatRoom, Messages } from "../../../types/chat";
import { useChatStore } from "src/components/stores/ChatStore";
import MobileChatView from './MobileChatView';
import DesktopChatView from './DesktopChatView';

interface MessageProps {
    chatRoom: ChatRoom;
    chatRoomId: string;
    onBack: () => void;
}

export default function ChatContainer({ chatRoom, chatRoomId, onBack }: MessageProps): React.ReactElement {
    const { getRoomMessages, sendMessage } = useChatStore();
    const messages: Messages[] = getRoomMessages(chatRoomId);
    const myUserId = localStorage.getItem('userId');
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = (): void => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 날짜별로 메시지 그룹화 & 오름차순 정렬
    const groupMessagesByDate = (messages: Messages[]): Record<string, Messages[]> => {
        return messages
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .reduce<Record<string, Messages[]>>((acc, msg) => {
                const dateKey = new Date(msg.createdAt).toISOString().split('T')[0];
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push(msg);
                return acc;
            }, {});
    };

    // 날짜별로 그룹화된 메시지
    const groupedMessages: Record<string, Messages[]> = groupMessagesByDate(messages);

    // 메시지 포맷 함수
    const formatDate = (date: string): string => {
        const messageDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const messageDay = new Date(messageDate);
        messageDay.setHours(0, 0, 0, 0);

        if (messageDay.getTime() === today.getTime()) {
            return '오늘';
        } else if (messageDay.getTime() === yesterday.getTime()) {
            return '어제';
        } else {
            return `${messageDate.getFullYear()}년 ${messageDate.getMonth() + 1}월 ${messageDate.getDate()}일`;
        }
    };

    // 연속 메시지 확인 (같은 사용자가 보낸 연속 메시지인지)
    const isConsecutiveMessage = (current: Messages, index: number, date: string): boolean => {
        if (index === 0) return false;

        const prevMessage = groupedMessages[date][index - 1];
        const currentTime = new Date(current.createdAt).getTime();
        const prevTime = new Date(prevMessage.createdAt).getTime();
        const timeDiff = (currentTime - prevTime) / (1000 * 60); // 분 단위 차이

        return prevMessage.senderId === current.senderId && timeDiff < 5;
    };

    // 메시지 전송 함수
    const handleSendMessage = (text: string): void => {
        if (text.trim()) {
            sendMessage(chatRoomId, text);
        }
    };

    // 공통 Props
    const chatViewProps = {
        chatRoom,
        myUserId,
        groupedMessages,
        onBack,
        formatDate,
        isConsecutiveMessage,
        handleSendMessage
    };


    return (
        <>
            {isMobile ? (
                <MobileChatView {...chatViewProps} />
            ) : (
                <DesktopChatView {...chatViewProps} />
            )}
        </>
    );

}
