import React, {useEffect, useState} from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { RoomData, RoomFormData, Discounts } from "../../../types/rooms";
import MyRoomForm from "./MyRoomForm";
import {updateRoom} from "../../../api/api";

async function urlsToFiles(urls: string[]): Promise<File[]> {
    const files = await Promise.all(
        urls.map(async (url) => {
            try {
                // 이미지 URL에 캐시 방지 파라미터 추가
                const cacheBuster = `${url}${url.includes('?') ? '&' : '?'}cb=${Date.now()}`;
                const res = await fetch(cacheBuster);
                const blob = await res.blob();
                const filename = url.split('/').pop()?.split('?')[0] || 'file';
                return new File([blob], filename, { type: blob.type });
            } catch (error) {
                console.error("Failed to fetch:", url, error);
                // 에러 발생 시 빈 파일 반환 또는 다른 오류 처리
                return new File([], "failed-to-load", { type: "image/jpeg" });
            }
        })
    );
    return files;
}

const DEFAULT_DISCOUNTS: Discounts[] = [
    { type: "weekly", days: 14, percentage: 0 },
    { type: "weekly", days: 28, percentage: 0 },
    { type: "weekly", days: 84, percentage: 0 },
    { type: "monthly", days: 30, percentage: 0 },
    { type: "monthly", days: 90, percentage: 0 },
    { type: "monthly", days: 180, percentage: 0 },
];

// ✅ 비동기 map 함수
async function mapRoomToFormData(room: RoomData): Promise<RoomFormData> {
    const files = await urlsToFiles(room.detail_urls ?? []);

    return {
        detail: {
            room_structure: room.room_structure ?? "",
            facilities: room.facilities ?? {},
            additional_facilities: room.additional_facilities ?? {},
            breakfast_service: room.breakfast_service ?? "",
            checkin_service: room.checkin_service ?? "",
            tags: room.tags ?? [],
            prohibitions: room.prohibitions ?? [],
            floor_area: room.floor_area ?? 0,
            floor: room.floor ?? 0,
            room_count: room.room_count ?? 0,
            bathroom_count: room.bathroom_count ?? 0,
            max_guests: room.max_guests ?? 0,
            description: room.description ?? "",
            house_rules: room.house_rules ?? "",
            transportation_info: room.transportation_info ?? "",
            check_in_time: room.check_in_time ?? "",
            check_out_time: room.check_out_time ?? "",
        },
        room_type: room.room_type ?? "",
        title: room.title ?? "",
        address: room.address ?? "",
        address_detail: room.address_detail ?? "",
        detail_urls: files,
        has_elevator: room.has_elevator,
        has_parking: room.has_parking,
        building_type: room.building_type ?? "",
        is_auto_accepted: room.is_auto_accepted,
        week_enabled: room.week_enabled,
        month_enabled: room.month_enabled,
        week_price: room.week_price ?? 0,
        deposit_week: room.deposit_week ?? 0,
        maintenance_fee_week: room.maintenance_fee_week ?? 0,
        month_price: room.month_price ?? 0,
        deposit_month: room.deposit_month ?? 0,
        maintenance_fee_month: room.maintenance_fee_month ?? 0,
        discounts: room.discounts ?? DEFAULT_DISCOUNTS,
        refund_policy: room.refund_policy ?? "",
        business_number: room.business_number ?? "",
        business_name: room.business_name ?? "",
        business_representative: room.business_representative ?? "",
        business_address: room.business_address ?? "",
        business_additionalAddress: room.business_additionalAddress ?? "",
        business_licenseNumber: room.business_licenseNumber ?? "",
        business_licenseFile: room.business_licenseFile ?? null,
        business_identificationFile: room.business_identificationFile ?? null,
        business_licenseType: room.business_licenseType ?? "",
    };
}

export default function MyRoomUpdate() {
    const navigate = useNavigate();
    const location = useLocation();
    const room = (location.state as { room: RoomData } | undefined)?.room;
    const [roomFormData, setRoomFormData] = useState<RoomFormData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!room) {
            navigate(-1);
            return;
        }
        setLoading(true);
        (async () => {
            const formData = await mapRoomToFormData(room);
            setRoomFormData(formData);
            setLoading(false);
        })();
    }, [room]);

    const handleUpdate = async (data: RoomFormData, files: File[]) => {
        if (!room) return;
        try {
            const response = await updateRoom(room.id, data, files);
            if (response.ok) {
                console.log("방 수정 성공");
                navigate("/host"); // 성공 시 호스트 페이지로 이동
            } else {
                // throw new Error("방 수정 실패");
                console.log("방 수정 실패");
                navigate("/host"); // 성공 시 호스트 페이지로 이동
            }
        } catch (e) {
            console.error("방 수정 실패", e);
        }
    };

    if (loading || !roomFormData) {
        return (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                <div role="status" className="m-10 flex flex-col items-center">
                    <svg
                        aria-hidden="true"
                        className="inline w-8 h-8 text-gray-300 animate-spin fill-roomi"
                        viewBox="0 0 100 101"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                        />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                        />
                    </svg>
                    <div className="mt-2">불러오는중...</div>
                </div>
            </div>
        );
    }

    return <MyRoomForm mode="update" initialData={roomFormData} onSubmit={handleUpdate}/>;
}