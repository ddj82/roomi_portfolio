import { create } from "zustand";
import { io, Socket } from "socket.io-client";

interface ChatRoom {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    messages: Message[];
}

interface Message {
    id: string;
    content: string;
    chatRoomId: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
}

interface ChatStore {
    socket: Socket | null;
    isConnected: boolean;
    rooms: ChatRoom[];
    connect: (token: string) => void;
    disconnect: () => void;
    sendMessage: (chatRoomId: string, content: string) => void;
    getRoomMessages: (chatRoomId: string) => Message[];  // ✅ 특정 채팅방 메시지 가져오기
    createRoom: (roomId: number, hostId: number) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    socket: null,
    isConnected: false,
    rooms: [],  // ✅ 여러 개의 채팅방과 메시지를 저장할 배열

    connect: (token: string) => {
        token = token.replace(/^Bearer\s/, ""); // 🔥 "Bearer " 제거
        // console.log("🔗 WebSocket 연결 시도 :", token);

        if (get().isConnected) {
            console.warn("⚠️ 이미 WebSocket이 연결됨, 중복 실행 방지");
            return;
        }

        const socket = io("https://roomi.co.kr/", {
            transports: ["websocket"], // ✅ Flutter와 동일한 설정
            query: { token }, // ✅ 토큰 추가
            // 서버와 연결이 안될 경우 무한 루프 방지
            reconnectionAttempts: 5, // ✅ 5번 재연결 시도
            // reconnectionDelay: 1000, // ✅ 1초 후 재연결 // 기본값임
        });

        socket.on("connect", () => {
            console.log("✅ WebSocket 연결됨 (서버 응답)");
            set({ isConnected: true, socket });
        });

        socket.on("connect_error", (error) => {
            console.error("❌ WebSocket 연결 실패:", error);
        });

        socket.on("disconnect", (reason) => {
            console.log(`🔴 WebSocket 연결 해제됨 (이유: ${reason})`);
            set({ isConnected: false, socket: null });
        });

        // ✅ 서버에서 초기 데이터를 받아와 Zustand 상태에 저장
        socket.on("initial_data", (data) => {
            // console.log("📥 서버에서 받은 초기 데이터:", data);
            console.log("📥 서버에서 받은 초기 데이터 저장");
            if (data.rooms) {
                const filteredRooms = data.rooms.filter((room: ChatRoom) => room.messages.length !== 0);
                set({ rooms: filteredRooms });
                // set({ rooms: data.rooms });
            }
        });

        // ✅ 실시간 메시지 업데이트 (new_message 이벤트)
        socket.on("new_message", (message: Message) => {
            console.log("📩 새 메시지 도착:", message);

            set((state) => {
                // ✅ 해당 `chatRoomId`의 채팅방을 찾고 메시지 업데이트
                const updatedRooms = state.rooms.map((room) => {
                    if (room.id === message.chatRoomId) {
                        return {
                            ...room,
                            messages: [...room.messages, message], // ✅ 새 메시지 추가
                            lastMessage: message.content,
                            timestamp: message.createdAt,
                            unreadCount: room.unreadCount + 1, // ✅ 읽지 않은 메시지 증가
                        };
                    }
                    return room;
                });

                return { rooms: updatedRooms };
            });
        });

        socket.on("new_room", (room) => {
            console.log("🆕 새 채팅방 생성됨:", room);

            set((state) => ({
                rooms: [...state.rooms, room],
            }));
        });

        set({ socket });
    },

    disconnect: () => {
        const socket = get().socket;
        if (socket) {
            console.log("🔴 WebSocket 명시적 해제 요청");
            socket.disconnect();
            set({ socket: null, isConnected: false });
        }
    },

    sendMessage: (chatRoomId, content) => {
        const socket = get().socket;
        const myUserId: string = localStorage.getItem('userId') ?? ""; // ✅ userId가 null이면 빈 문자열 반환

        if (socket && socket.connected) {
            socket.emit("send_message",{
                roomId: chatRoomId,
                content: content
            });
            console.log("📤 메시지 보냄:", { chatRoomId, content });

            // ✅ 메시지를 보낸 직후, 클라이언트에서도 즉시 업데이트
            const newMessage: Message = {
                id: new Date().getTime().toString(), // 임시 ID
                content,
                chatRoomId,
                createdAt: new Date().toISOString(),
                senderId: myUserId, // ✅ 로그인한 사용자 ID
                isRead: false,
            };

            set((state) => {
                const updatedRooms = state.rooms.map((room) => {
                    if (room.id === chatRoomId) {
                        return {
                            ...room,
                            messages: [...room.messages, newMessage],
                        };
                    }
                    return room;
                });

                return { rooms: updatedRooms };
            });
        } else {
            console.warn("⚠️ WebSocket 연결이 안 되어 있음");
        }
    },

    createRoom: (roomId, hostId) => {
        const socket = get().socket;
        if (socket && socket.connected) {
            socket.emit("create_room", { roomId, hostId });
            console.log("🏠 채팅방 생성 요청:", { roomId, hostId });
        } else {
            console.warn("⚠️ WebSocket 연결이 안 되어 있음");
        }
    },

    getRoomMessages: (chatRoomId) => {
        const rooms = get().rooms;
        const room = rooms.find((room) => room.id === chatRoomId);
        return room ? room.messages : [];
    },
}));
