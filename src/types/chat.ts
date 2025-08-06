export interface ChatRoom {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    room? : ChatRoomDetail;
}

export interface Messages {
    id: string;
    content: string;
    chatRoomId: string;
    createdAt: string;
    senderId: number | string;
    isRead: boolean;
}

export interface ChatRoomDetail {
    id : string,
    roomName: string;
}