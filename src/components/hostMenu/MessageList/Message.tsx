import React from 'react';
import { ChatRoom } from "../../../types/chat";
import ChatContainer from "./ChatContainer";

interface MessageProps {
    chatRoom: ChatRoom;
    chatRoomId: string;
    onBack: () => void;
}

export default function Message({ chatRoom, chatRoomId, onBack }: MessageProps): React.ReactElement {
    return (
        <ChatContainer
            chatRoom={chatRoom}
            chatRoomId={chatRoomId}
            onBack={onBack}
        />
    );
}