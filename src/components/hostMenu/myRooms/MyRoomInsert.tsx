import React, {useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {RoomData, RoomFormData} from "../../../types/rooms";
import {createRoom} from "../../../api/api";
import MyRoomForm from "./MyRoomForm";

interface LocationState {
    roomToCopy: RoomData
}

const EMPTY_FORM: RoomFormData = {
    room_type: "",
    title: "",
    address: "",
    address_detail: "",
    detail_urls: [],
    has_elevator: false,
    has_parking: false,
    building_type: "",
    is_auto_accepted: false,
    week_enabled: true,
    month_enabled: false,
    detail: {
        room_structure: "",
        facilities : {},
        additional_facilities: {},
        breakfast_service: "",
        checkin_service: "",
        tags: [],
        prohibitions: [],
        floor_area: 0,
        floor: 0,
        room_count: 0,
        bathroom_count: 0,
        max_guests: 0,
        description: "",
        house_rules: "",
        transportation_info: "",
        check_in_time: "",
        check_out_time: "",
    },
    week_price: 0,
    deposit_week: 0,
    maintenance_fee_week: 0,
    month_price: 0,
    deposit_month: 0,
    maintenance_fee_month: 0,
    discounts: [
        { type: "weekly", days: 14, percentage: 0 },
        { type: "weekly", days: 28, percentage: 0 },
        { type: "weekly", days: 84, percentage: 0 },
        { type: "monthly", days: 30, percentage: 0 },
        { type: "monthly", days: 90, percentage: 0 },
        { type: "monthly", days: 180, percentage: 0 },
    ],
    refund_policy: "",
    business_number: "",
    business_name: "",
    business_representative: "",
    business_address: "",
    business_additionalAddress: "",
    business_licenseFile: null,
    business_licenseNumber: "",
    business_identificationFile: null,
    business_licenseType: "",
};

const mapRoomToForm = (room: RoomData): RoomFormData => ({
    room_type: room.room_type,
    title: room.title,
    address: room.address ?? "",
    address_detail: room.address_detail ?? "",
    detail_urls: [],
    has_elevator: room.has_elevator,
    has_parking: room.has_parking,
    building_type: room.building_type ?? "",
    week_enabled: room.week_enabled,
    month_enabled: room.month_enabled,
    week_price: room.week_price ?? 0,
    deposit_week: room.deposit_week ?? 0,
    maintenance_fee_week: room.maintenance_fee_week ?? 0,
    month_price: room.month_price ?? 0,
    deposit_month: room.deposit_month ?? 0,
    maintenance_fee_month: room.maintenance_fee_month ?? 0,
    discounts: room.discounts ?? [],
    is_auto_accepted: room.is_auto_accepted,
    refund_policy: room.refund_policy ?? "",

    detail: {
        checkin_service: room.checkin_service ?? "",
        breakfast_service: room.breakfast_service ?? "",
        description: room.description ?? "",
        transportation_info: room.transportation_info ?? "",
        house_rules: room.house_rules ?? "",
        room_structure: room.room_structure ?? "",
        room_count: room.room_count ?? 0,
        bathroom_count: room.bathroom_count ?? 0,
        floor: room.floor ?? 0,
        floor_area: room.floor_area ?? 0,
        max_guests: room.max_guests ?? 0,
        check_in_time: room.check_in_time ?? "",
        check_out_time: room.check_out_time ?? "",
        facilities: room.facilities ?? {},
        additional_facilities: room.additional_facilities ?? {},
        tags: room.tags ?? [],
        prohibitions: room.prohibitions ?? [],
    },

    business_number: room.business_number ?? "",
    business_name: room.business_name ?? "",
    business_representative: room.business_representative ?? "",
    business_address: room.business_address ?? "",
    business_additionalAddress: room.business_additionalAddress ?? "",
    business_licenseFile: null,
    business_identificationFile: null,
    business_licenseNumber: room.business_licenseNumber ?? "",
    business_licenseType: room.business_licenseType ?? "",
});

const MyRoomInsert = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { roomToCopy } = (location.state as LocationState) || {};

    // 복사 모드가 아니면 빈 폼으로
    const initialData: RoomFormData = roomToCopy ? mapRoomToForm(roomToCopy) : EMPTY_FORM;

    const handleCreate = async (data: RoomFormData, files: File[]) => {
        try {
            await createRoom(data, files);
            navigate("/host");
        } catch (e) {
            console.error("방 등록 실패", e);
        }
    };

    return <MyRoomForm mode="insert" initialData={initialData} onSubmit={handleCreate} />;
};

export default MyRoomInsert;
