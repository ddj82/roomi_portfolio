import React, {useEffect} from "react";
import MyRoom from "src/components/hostMenu/MyRooms";
import ContractManagement from "src/components/hostMenu/ContractManagement";
import RoomStatus from "src/components/hostMenu/RoomStatus";
import MessageList from "src/components/hostMenu/MessageList";
import Settlement from "src/components/hostMenu/Settlement";
import {useHostTabNavigation} from "../stores/HostTabStore";
import {useHostModeStore} from "../stores/HostModeStore";
import {useNavigate} from "react-router-dom";
import MyReservations from "./myPageMenu/MyReservations";
import GuestMyPageContent from "./GuestMyPageContent";

interface HostScreenProps {
    selectedMenu?: string
}

export default function HostScreenContent({selectedMenu}: HostScreenProps) {

    // 메뉴 내용 렌더링 로직을 함수로 분리
    const renderMenuContent = () => {
        if (selectedMenu === 'my_room') {
            console.log("my_room");
            return <MyRoom/>;
        } else if (selectedMenu === 'contract_management') {
            console.log("contract_management");
            return <ContractManagement/>;
        } else if (selectedMenu === 'room_status') {
            console.log("room_status");
            return <RoomStatus/>;
        } else if (selectedMenu === 'message') {
            console.log("message");
            return <MessageList/>;
        } else if (selectedMenu === 'settlement') {
            console.log("settlement");
            return <Settlement/>;
        } else {
            return <div className="flex_center">선택된 탭이 없습니다.</div>;
        }
    };

    return (
        <div>
            {renderMenuContent()}
        </div>
    );
}
