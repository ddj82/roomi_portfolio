import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
    FontAwesomeIcon,
} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faCircle, faBuilding} from "@fortawesome/free-regular-svg-icons";
import {
    faArrowLeft, faArrowUpFromBracket, faCheck,
    faElevator, faFileImage, faHashtag,
    faImages,
    faInfo,
    faMagnifyingGlass,
    faP,
    faPlus, faWonSign, faX
} from "@fortawesome/free-solid-svg-icons";
import {
    ImageItem,
    RoomFormData,
} from "../../../types/rooms";
import {
    buildingTypes,
    businessLicenseType,
    roomStructures,
} from "src/types/roomOptions";
import { facilityIcons } from "src/types/facilityIcons";
import Modal from "react-modal";
import DaumPostcode from "react-daum-postcode";
import RoomPreviewModal from "./RoomPreviewModal";
import ConfirmationModal from "../../modals/ComfirmationModal";
import CommonAlert from "../../util/CommonAlert";

export interface MyRoomFormProps {
    mode: "insert" | "update";
    initialData: RoomFormData;
    onSubmit: (data: RoomFormData, files: File[]) => Promise<void>;
}

const MyRoomForm: React.FC<MyRoomFormProps> = ({
                                                   mode,
                                                   initialData,
                                                   onSubmit,
                                               }) => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [roomFormData, setRoomFormData] = useState<RoomFormData>(initialData);
    const [loading, setLoading] = useState(false);
    const [roomPreview, setRoomPreview] = useState(false);
    //alert 모달
    const [imageAlertOpen, setImageAlertOpen] = useState(false);
    const [uploadAlertOpen, setUploadAlertOpen] = useState(false);
    const [tagAlertOpen, setTagAlertOpen] = useState(false);

    //
    const totalSteps = useMemo(() => {
        if (roomFormData.room_type === "LODGE") return 15;
        if (roomFormData.room_type === "LEASE") return 14;
        return 15;
    }, [roomFormData.room_type]);

    // 주소 모달
    const [daumAddressModal, setDaumAddressModal] = useState(false);

    // 기본시설 목록
    const basicFacilities = [
        { key: "wifi", label: "와이파이" },
        { key: "tv", label: "테레비" },
        { key: "kitchen", label: "주방" },
        { key: "washing_machine", label: "세탁기" },
        { key: "dry", label: "건조기" },
        { key: "ac_unit", label: "에어컨" },
        { key: "medical_services", label: "구급상자" },
        { key: "fire_extinguisher", label: "소화기" },
    ];

    const [basic_facilitiesModal, setBasic_facilitiesModal] = useState(false);
    const [addFacilities, setAddFacilities] = useState<{ key: string; label: string; iconKey: string }[]>([]);
    const [customFacilityName, setCustomFacilityName] = useState("");
    const [selectedIconKey, setSelectedIconKey] = useState<string | null>(null);
    const [editingFacility, setEditingFacility] = useState<{ key: string; label: string; iconKey: string } | null>(null);

    // 추가시설 목록
    const additionalFacilities = [
        { key: "gym", label: "헬스장" },
        { key: "pool", label: "수영장" },
        { key: "hot_tub", label: "사우나" },
        { key: "cafe", label: "카페" },
        { key: "garden", label: "정원" },
        { key: "grill", label: "바베큐" },
        { key: "weekend", label: "라운지" },
        { key: "cctv", label: "CCTV" },
    ];

    const [additional_facilitiesModal, setAdditional_facilitiesModal] = useState(false);
    const [addAdditionalFacilities, setAddAdditionalFacilities] = useState<{ key: string; label: string; iconKey: string }[]>([]);
    const [customAdditionalFacilityName, setCustomAdditionalFacilityName] = useState("");
    const [selectedAdditionalIconKey, setSelectedAdditionalIconKey] = useState<string | null>(null);
    const [editingAdditionalFacility, setEditingAdditionalFacility] = useState<{ key: string; label: string; iconKey: string } | null>(null);

    // 사진파일 관련
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);

    // 태그상태
    const [tagInput, setTagInput] = useState("");

    // 금지사항 목록
    const prohibitionsList = [
        "파티 금지",
        "반려동물 금지",
        "흡연 금지",
        "음식 조리 금지",
        "추가 인원 금지",
    ];

    // 사업자 신고 관련
    type UploadType = 'business_licenseFile' | 'business_identificationFile';
    const businessFileInputRef = {
        business_licenseFile: useRef<HTMLInputElement>(null),
        business_identificationFile: useRef<HTMLInputElement>(null),
    };

    const [businessPreviewImages, setBusinessPreviewImages] = useState<{
        business_licenseFile: ImageItem | null;
        business_identificationFile: ImageItem | null;
    }>({
        business_licenseFile: null,
        business_identificationFile: null,
    });

    const handleChange = (field: string, value: any) => {
        if (field.startsWith("detail.")) {
            const key = field.replace("detail.", "");
            setRoomFormData((prev) => ({
                ...prev,
                detail: {
                    ...prev.detail,
                    [key]: value,
                },
            }));
        } else {
            setRoomFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleNext = () => {
        if (currentStep < totalSteps) setCurrentStep((p) => p + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep((p) => p - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(roomFormData, selectedImages.map((img) => img.file));
        } finally {
            setLoading(false);
        }
    };

    /* --- util 함수 --- */
    const handleAddress = (data: any) => {
        console.log('다음 주소', data.address);
        handleChange("address", data.address);
        setDaumAddressModal(false);
    };

    useEffect(() => {
        if (basic_facilitiesModal || editingFacility || additional_facilitiesModal || editingAdditionalFacility) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [basic_facilitiesModal, editingFacility, additional_facilitiesModal, editingAdditionalFacility]);

    // 주요 시설 렌더링 함수
    const renderFacilities = (type: string) => {
        if (type === 'basic') {
            /*필수 시설*/
            return (
                <div className="border border-gray-300 rounded-xl p-4 mt-4">
                    <div className="flex justify-between font-bold">
                        <div className="flex_center">필수 시설</div>
                        <button type="button"
                                onClick={() => setBasic_facilitiesModal(true)}
                                className="p-2 rounded-xl text-roomi text-sm bg-roomi-000"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2"/>
                            커스텀 시설 추가
                        </button>
                    </div>
                    {/*커스텀 시설 추가 모달*/}
                    <Modal
                        isOpen={basic_facilitiesModal}
                        onRequestClose={() => setBasic_facilitiesModal(false)}
                        className="bg-white p-6 rounded-xl border border-gray-300 mx-auto w-[400px] h-fit"
                        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    >
                        <div className="font-bold text-lg mb-2">커스텀 시설 추가</div>

                        <div className="mb-2">
                            <input
                                type="text"
                                value={customFacilityName}
                                placeholder="시설 이름"
                                onChange={(e) => setCustomFacilityName(e.target.value)}
                                className="w-full p-3 mt-1 border border-gray-300 rounded-xl focus:outline-none focus:border-roomi"
                            />
                        </div>

                        <div className="mb-2">
                            <span className="text-sm text-gray-700">아이콘 선택</span>
                            <div className="grid grid-cols-6 gap-2 mt-1 max-h-[200px] overflow-y-auto">
                                {Object.entries(facilityIcons)
                                    // ✅ 이미 사용된 아이콘 key 제외
                                    .filter(([key]) => !basicFacilities.some(b => b.key === key))
                                    .map(([key, icon]) => (
                                        <button type="button" key={key} onClick={() => setSelectedIconKey(key)}>
                                            <div
                                                className={`border p-4 rounded-xl cursor-pointer flex_center 
                                                                ${selectedIconKey === key ? "border-roomi bg-roomi-000" : "border-gray-300 hover:bg-gray-50"}`}
                                            >
                                                <FontAwesomeIcon icon={icon}/>
                                            </div>
                                        </button>
                                    ))}

                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button type="button" onClick={() => setBasic_facilitiesModal(false)} className="text-roomi px-4 py-2">
                                취소
                            </button>
                            <button type="button"
                                    onClick={() => {
                                        if (!customFacilityName || !selectedIconKey) return;

                                        // ✅ key는 icon key로, value는 사용자 입력 이름
                                        const key = selectedIconKey;

                                        // 중복 방지
                                        if (addFacilities.some(f => f.key === key)) return;

                                        // 커스텀 시설 목록 추가
                                        setAddFacilities(prev => [
                                            ...prev,
                                            {key, label: customFacilityName, iconKey: selectedIconKey}
                                        ]);

                                        // ✅ roomFormData에 추가 (key: iconKey, value: label)
                                        setRoomFormData(prev => ({
                                            ...prev,
                                            detail: {
                                                ...prev.detail,
                                                facilities: {
                                                    ...prev.detail.facilities,
                                                    [key]: customFacilityName,
                                                },
                                            },
                                        }));

                                        setCustomFacilityName("");
                                        setSelectedIconKey(null);
                                        setBasic_facilitiesModal(false);
                                    }}
                                    className="bg-roomi text-white px-4 py-2 rounded-xl"
                            >
                                추가
                            </button>
                        </div>
                    </Modal>
                    {/*시설 표시*/}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        {basicFacilities.map((item) => (
                            <label
                                key={item.key}
                                className={`flex items-center gap-2 border rounded-xl p-3 cursor-pointer transition-all 
                                                ${roomFormData.detail.facilities[item.key] ?
                                    "bg-roomi-000 border-roomi text-roomi font-bold" :
                                    "border-gray-300 text-gray-700 hover:bg-gray-50"}
                                                `}
                            >
                                <input
                                    type="checkbox"
                                    checked={roomFormData.detail.facilities[item.key] !== undefined}
                                    onChange={(e) =>
                                        setRoomFormData((prev) => {
                                            const updated = { ...prev.detail.facilities };
                                            if (e.target.checked) {
                                                updated[item.key] = item.label;
                                            } else {
                                                delete updated[item.key];
                                            }
                                            return {
                                                ...prev,
                                                detail: {
                                                    ...prev.detail,
                                                    facilities: updated,
                                                },
                                            };
                                        })
                                    }
                                    className="hidden"
                                />
                                <FontAwesomeIcon icon={facilityIcons[item.key]}
                                                 className={`${roomFormData.detail.facilities[item.key] ?
                                                     "text-roomi" : "text-gray-700"}`}
                                />
                                <span className="text-sm">{item.label}</span>
                            </label>
                        ))}
                        {addFacilities.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={(e) => {
                                    // 체크박스 직접 클릭한 경우는 무시
                                    if ((e.target as HTMLElement).tagName !== "INPUT") {
                                        setEditingFacility(item);
                                    }
                                }}
                                className={`flex items-center gap-2 border rounded-xl p-3 cursor-pointer transition-all w-full text-left
                                                    ${roomFormData.detail.facilities[item.key]
                                    ? "bg-roomi-000 border-roomi text-roomi font-bold"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={roomFormData.detail.facilities[item.key] !== undefined}
                                    onChange={(e) =>
                                        setRoomFormData((prev) => {
                                            const updated = { ...prev.detail.facilities };
                                            if (e.target.checked) {
                                                updated[item.key] = item.label;
                                            } else {
                                                delete updated[item.key];
                                            }
                                            return {
                                                ...prev,
                                                detail: {
                                                    ...prev.detail,
                                                    facilities: updated,
                                                },
                                            };
                                        })
                                    }
                                    className="hidden"
                                />
                                <FontAwesomeIcon icon={facilityIcons[item.iconKey]}/>
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}
                        {editingFacility && (
                            <Modal
                                isOpen={!!editingFacility}
                                onRequestClose={() => setEditingFacility(null)}
                                className="bg-white p-6 rounded-xl border border-gray-300 mx-auto w-[400px] h-fit"
                                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                            >
                                <div className="font-bold text-lg mb-2">커스텀 시설 수정</div>

                                <div className="mb-2">
                                    <input
                                        type="text"
                                        value={editingFacility.label}
                                        onChange={(e) =>
                                            setEditingFacility({...editingFacility, label: e.target.value})
                                        }
                                        className="w-full p-3 mt-1 border border-gray-300 rounded-xl focus:outline-none focus:border-roomi"
                                    />
                                </div>

                                <div className="mb-2">
                                    <span className="text-sm text-gray-700">아이콘 선택</span>
                                    <div className="grid grid-cols-6 gap-2 mt-1 max-h-[200px] overflow-y-auto">
                                        {Object.entries(facilityIcons)
                                            // ✅ 기본 시설에 없는 아이콘만 보여줌
                                            .filter(([key]) => !basicFacilities.some(b => b.key === key))
                                            .map(([key, icon]) => (
                                                <button type="button"
                                                        key={key}
                                                        onClick={() =>
                                                            setEditingFacility((prev) =>
                                                                prev ? {...prev, iconKey: key} : prev
                                                            )
                                                        }
                                                >
                                                    <div
                                                        className={`border p-4 rounded-xl cursor-pointer flex_center 
                                                                        ${editingFacility.iconKey === key ? "border-roomi bg-roomi-000" : "border-gray-300 hover:bg-gray-50"}`}
                                                    >
                                                        <FontAwesomeIcon icon={icon}/>
                                                    </div>
                                                </button>
                                            ))}

                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 mt-6">
                                    {/* 삭제 버튼 */}
                                    <button type="button"
                                            onClick={() => {
                                                setAddFacilities((prev) =>
                                                    prev.filter((f) => f.key !== editingFacility.key)
                                                );
                                                setRoomFormData((prev) => {
                                                    const updated = { ...prev.detail.facilities };
                                                    delete updated[editingFacility.key];
                                                    return {
                                                        ...prev,
                                                        detail: {
                                                            ...prev.detail,
                                                            facilities: updated,
                                                        },
                                                    };
                                                });
                                                setEditingFacility(null);
                                            }}
                                            className="text-red-500 px-4 py-2"
                                    >
                                        삭제
                                    </button>

                                    {/* 저장 버튼 */}
                                    <button type="button"
                                            onClick={() => {
                                                setAddFacilities((prev) =>
                                                    prev.map((f) =>
                                                        f.key === editingFacility.key ? editingFacility : f
                                                    )
                                                );
                                                setEditingFacility(null);
                                            }}
                                            className="bg-roomi text-white px-4 py-2 rounded-xl"
                                    >
                                        저장
                                    </button>
                                </div>
                            </Modal>
                        )}
                    </div>
                </div>
            )
        } else { // (type === 'additional')
            /*추가 시설*/
            return (
                <div className="border border-gray-300 rounded-xl p-4 mt-4">
                    <div className="flex justify-between font-bold">
                        <div className="flex_center">추가 시설</div>
                        <button type="button"
                                onClick={() => setAdditional_facilitiesModal(true)}
                                className="p-2 rounded-xl text-roomi text-sm bg-roomi-000"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2"/>
                            커스텀 시설 추가
                        </button>
                    </div>
                    {/*커스텀 시설 추가 모달*/}
                    <Modal
                        isOpen={additional_facilitiesModal}
                        onRequestClose={() => setAdditional_facilitiesModal(false)}
                        className="bg-white p-6 rounded-xl border border-gray-300 mx-auto w-[400px] h-fit"
                        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    >
                        <div className="font-bold text-lg mb-2">커스텀 시설 추가</div>

                        <div className="mb-2">
                            <input
                                type="text"
                                value={customAdditionalFacilityName}
                                placeholder="시설 이름"
                                onChange={(e) => setCustomAdditionalFacilityName(e.target.value)}
                                className="w-full p-3 mt-1 border border-gray-300 rounded-xl focus:outline-none focus:border-roomi"
                            />
                        </div>

                        <div className="mb-2">
                            <span className="text-sm text-gray-700">아이콘 선택</span>
                            <div className="grid grid-cols-6 gap-2 mt-1 max-h-[200px] overflow-y-auto">
                                {Object.entries(facilityIcons)
                                    // ✅ 이미 사용된 아이콘 key 제외
                                    .filter(([key]) => !additionalFacilities.some(b => b.key === key))
                                    .map(([key, icon]) => (
                                        <button type="button" key={key} onClick={() => setSelectedAdditionalIconKey(key)}>
                                            <div
                                                className={`border p-4 rounded-xl cursor-pointer flex_center 
                                                                ${selectedAdditionalIconKey === key ? "border-roomi bg-roomi-000" : "border-gray-300 hover:bg-gray-50"}`}
                                            >
                                                <FontAwesomeIcon icon={icon}/>
                                            </div>
                                        </button>
                                    ))}

                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button type="button" onClick={() => setAdditional_facilitiesModal(false)}
                                    className="text-roomi px-4 py-2">
                                취소
                            </button>
                            <button type="button"
                                    onClick={() => {
                                        if (!customAdditionalFacilityName || !selectedAdditionalIconKey) return;

                                        // ✅ key는 icon key로, value는 사용자 입력 이름
                                        const key = selectedAdditionalIconKey;

                                        // 중복 방지
                                        if (addAdditionalFacilities.some(f => f.key === key)) return;

                                        // 커스텀 시설 목록 추가
                                        setAddAdditionalFacilities(prev => [
                                            ...prev,
                                            {key, label: customAdditionalFacilityName, iconKey: selectedAdditionalIconKey}
                                        ]);

                                        // ✅ roomFormData에 추가 (key: iconKey, value: label)
                                        setRoomFormData(prev => ({
                                            ...prev,
                                            detail: {
                                                ...prev.detail,
                                                additional_facilities: {
                                                    ...prev.detail.additional_facilities,
                                                    [key]: customAdditionalFacilityName
                                                }
                                            }
                                        }));

                                        setCustomAdditionalFacilityName("");
                                        setSelectedAdditionalIconKey(null);
                                        setAdditional_facilitiesModal(false);
                                    }}
                                    className="bg-roomi text-white px-4 py-2 rounded-xl"
                            >
                                추가
                            </button>
                        </div>
                    </Modal>
                    {/*시설 표시*/}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        {additionalFacilities.map((item) => (
                            <label
                                key={item.key}
                                className={`flex items-center gap-2 border rounded-xl p-3 cursor-pointer transition-all 
                                                ${roomFormData.detail.additional_facilities[item.key] ?
                                    "bg-roomi-000 border-roomi text-roomi font-bold" :
                                    "border-gray-300 text-gray-700 hover:bg-gray-50"}
                                                `}
                            >
                                <input
                                    type="checkbox"
                                    checked={roomFormData.detail.additional_facilities[item.key] !== undefined}
                                    onChange={(e) =>
                                        setRoomFormData((prev) => {
                                            const updated = { ...prev.detail.additional_facilities };
                                            if (e.target.checked) {
                                                updated[item.key] = item.label;
                                            } else {
                                                delete updated[item.key];
                                            }
                                            return {
                                                ...prev,
                                                detail: {
                                                    ...prev.detail,
                                                    additional_facilities: updated,
                                                },
                                            };
                                        })
                                    }

                                    className="hidden"
                                />
                                <FontAwesomeIcon icon={facilityIcons[item.key]}
                                                 className={`${roomFormData.detail.additional_facilities[item.key] ?
                                                     "text-roomi" : "text-gray-700"}`}
                                />
                                <span className="text-sm">{item.label}</span>
                            </label>
                        ))}
                        {addAdditionalFacilities.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={(e) => {
                                    // 체크박스 직접 클릭한 경우는 무시
                                    if ((e.target as HTMLElement).tagName !== "INPUT") {
                                        setEditingAdditionalFacility(item);
                                    }
                                }}
                                className={`flex items-center gap-2 border rounded-xl p-3 cursor-pointer transition-all w-full text-left
                                                    ${roomFormData.detail.additional_facilities[item.key]
                                    ? "bg-roomi-000 border-roomi text-roomi font-bold"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={roomFormData.detail.additional_facilities[item.key] !== undefined}
                                    onChange={(e) =>
                                        setRoomFormData((prev) => {
                                            const updated = {...prev.detail.additional_facilities};
                                            if (e.target.checked) {
                                                updated[item.key] = item.label; // ✅ key: 사용자 입력값
                                            } else {
                                                delete updated[item.key];
                                            }
                                            return {...prev, additional_facilities: updated};
                                        })
                                    }
                                    className="hidden"
                                />
                                <FontAwesomeIcon icon={facilityIcons[item.iconKey]}/>
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}
                        {editingAdditionalFacility && (
                            <Modal
                                isOpen={!!editingAdditionalFacility}
                                onRequestClose={() => setEditingAdditionalFacility(null)}
                                className="bg-white p-6 rounded-xl border border-gray-300 mx-auto w-[400px] h-fit"
                                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                            >
                                <div className="font-bold text-lg mb-2">커스텀 시설 수정</div>

                                <div className="mb-2">
                                    <input
                                        type="text"
                                        value={editingAdditionalFacility.label}
                                        onChange={(e) =>
                                            setEditingAdditionalFacility({
                                                ...editingAdditionalFacility,
                                                label: e.target.value
                                            })
                                        }
                                        className="w-full p-3 mt-1 border border-gray-300 rounded-xl focus:outline-none focus:border-roomi"
                                    />
                                </div>

                                <div className="mb-2">
                                    <span className="text-sm text-gray-700">아이콘 선택</span>
                                    <div className="grid grid-cols-6 gap-2 mt-1 max-h-[200px] overflow-y-auto">
                                        {Object.entries(facilityIcons)
                                            // ✅ 기본 시설에 없는 아이콘만 보여줌
                                            .filter(([key]) => !additionalFacilities.some(b => b.key === key))
                                            .map(([key, icon]) => (
                                                <button type="button"
                                                        key={key}
                                                        onClick={() =>
                                                            setEditingAdditionalFacility((prev) =>
                                                                prev ? {...prev, iconKey: key} : prev
                                                            )
                                                        }
                                                >
                                                    <div
                                                        className={`border p-4 rounded-xl cursor-pointer flex_center 
                                                                        ${editingAdditionalFacility.iconKey === key ? "border-roomi bg-roomi-000" : "border-gray-300 hover:bg-gray-50"}`}
                                                    >
                                                        <FontAwesomeIcon icon={icon}/>
                                                    </div>
                                                </button>
                                            ))}

                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 mt-6">
                                    {/* 삭제 버튼 */}
                                    <button type="button"
                                            onClick={() => {
                                                setAddAdditionalFacilities((prev) =>
                                                    prev.filter((f) => f.key !== editingAdditionalFacility.key)
                                                );
                                                setRoomFormData((prev) => {
                                                    const newAdditional = { ...prev.detail.additional_facilities };
                                                    delete newAdditional[editingAdditionalFacility.key];
                                                    return {
                                                        ...prev,
                                                        detail: {
                                                            ...prev.detail,
                                                            additional_facilities: newAdditional,
                                                        },
                                                    };
                                                });

                                                setEditingAdditionalFacility(null);
                                            }}
                                            className="text-red-500 px-4 py-2"
                                    >
                                        삭제
                                    </button>

                                    {/* 저장 버튼 */}
                                    <button type="button"
                                            onClick={() => {
                                                setAddAdditionalFacilities((prev) =>
                                                    prev.map((f) =>
                                                        f.key === editingAdditionalFacility.key ? editingAdditionalFacility : f
                                                    )
                                                );
                                                setEditingAdditionalFacility(null);
                                            }}
                                            className="bg-roomi text-white px-4 py-2 rounded-xl"
                                    >
                                        저장
                                    </button>
                                </div>
                            </Modal>
                        )}
                    </div>
                </div>
            )
        }
    };

    /*사진 파일 관련*/
    // roomFormData.detail_urls(File[])가 변경될 때마다 selectedImages 업데이트
    useEffect(() => {
        if (roomFormData.detail_urls && roomFormData.detail_urls.length > 0) {
            const existingImages = roomFormData.detail_urls.map((file) => ({
                file,
                previewUrl: URL.createObjectURL(file),
            }));
            setSelectedImages(existingImages);
        }
    }, [roomFormData.detail_urls]);

    // 숨겨진 파일 input 클릭 트리거
    const handleInputFileSet = () => {
        fileInputRef.current?.click();
    };
    // 파일 선택 시 실행될 함수
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        // FileList를 배열로 변환
        const filesArray = Array.from(e.target.files);
        // 이미지 파일만 필터링 (MIME 타입이 image/로 시작하는지 확인)
        let validImageFiles = filesArray.filter((file) => file.type.startsWith("image/"));

        // 총 이미지 수가 50장을 넘지 않도록 체크
        if (validImageFiles.length + selectedImages.length > 50) {
            alert("최대 50장까지만 업로드가 가능합니다.");
            validImageFiles = validImageFiles.slice(0, 50 - selectedImages.length);
        }

        // 각 파일에 대해 미리보기 URL 생성
        const newImages = validImageFiles.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        // 상태 업데이트
        setSelectedImages((prev) => [...prev, ...newImages]);

        // 폼 데이터의 detail_urls 필드에 업로드된 file만 배열에 담아서 저장
        setRoomFormData((prev) => ({
            ...prev,
            detail_urls: [
                ...(prev.detail_urls || []),
                ...newImages.map((image) => image.file),
            ],
        }));

        // 같은 파일 재업로드 시 onChange 이벤트가 발생하도록 input value 초기화
        e.target.value = "";
    };

    // 특정 인덱스의 이미지 삭제 함수
    const handleRemoveImage = (index: number) => {
        const imageToRemove = selectedImages[index];

        setSelectedImages((prev) => {
            // 메모리 누수를 막기 위해 object URL 해제
            URL.revokeObjectURL(prev[index].previewUrl);
            return prev.filter((_, i) => i !== index);
        });

        // roomFormData.detail_urls에서도 해당 파일 제거
        setRoomFormData((prev) => ({
            ...prev,
            detail_urls: (prev.detail_urls || []).filter((file) => file !== imageToRemove.file),
        }));
    };

    /*태그 관련*/
    // 중복 태그 추가 방지 로직 포함 태그 추가 함수
    const handleAddTag = () => {
        const newTag = tagInput.trim();
        if (!newTag) return;

        if (roomFormData.detail.tags && roomFormData.detail.tags.includes(newTag)) {
            alert("이미 추가된 태그입니다.");
            setTagInput("");
            return;
        }

        setRoomFormData((prev) => ({
            ...prev,
            detail: {
                ...prev.detail,
                tags: [...(prev.detail.tags || []), newTag],
            },
        }));
        setTagInput("");
    };
    // 태그 삭제 함수
    const handleRemoveTag = (index: number) => {
        setRoomFormData((prev) => {
            if (!prev.detail.tags) return prev;
            const updatedTags = [...prev.detail.tags];
            updatedTags.splice(index, 1);
            return {
                ...prev,
                detail: {
                    ...prev.detail,
                    tags: updatedTags,
                },
            };
        });
    };


    /*입 퇴실 시간 선택 함수*/
    const generateTimeOptions = () => {
        const times = [];
        for (let h = 1; h <= 24; h++) {
            if (h === 24) {
                times.push('24:00');
                continue;
            }
            const hour = h.toString().padStart(2, '0');
            times.push(`${hour}:00`);
        }
        return times;
    };
    const timeOptions = generateTimeOptions();

    /*요금 설정 함수*/
    const renderSetPriceInput = (unit: boolean, field: string, placeholder: string) => {
        const value = roomFormData[field as keyof RoomFormData];
        const isEmpty = value === 0 || value === null || value === undefined;
        let placeholderUnit;

        if (placeholder === "기본 요금") { // 기본 요금
            placeholderUnit = unit ? "월 기본 요금" : "주 기본 요금";
        } else if (placeholder === "보증금") { // 보증금
            placeholderUnit = unit ? "월 보증금" : "주 보증금";
        } else if (placeholder === "관리비") { // 관리비
            placeholderUnit = unit ? "월 관리비" : "주 관리비";
        }

        return (
            <div className="relative mb-2">
                <div className="absolute left-3.5 top-3 pointer-events-none">
                    <FontAwesomeIcon icon={faWonSign} className="w-4 h-4 text-gray-400"/>
                </div>
                <input
                    type="text"
                    inputMode="numeric"
                    id={field}
                    name={field}
                    placeholder={placeholderUnit}
                    value={isEmpty ? "" : formatWithComma(value as number)}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/,/g, ''); // 콤마 제거
                        handleChange(field, raw);
                    }}
                    className="w-full border border-gray-300 rounded-xl p-3 pl-10 focus:outline-none focus:border-roomi appearance-none"
                />
            </div>
        );
    };
    // 천 단위 콤마 포맷 함수
    const formatWithComma = (value: string | number) => {
        const numStr = value.toString().replace(/[^0-9]/g, '');
        if (!numStr) return '';
        return Number(numStr).toLocaleString();
    };

    /*할인 설정 함수*/
    const renderDiscountsSet = (type: string, dayUnit: number) => {
        const isWeekly = type === "weekly";
        const days = isWeekly ? dayUnit * 7 : dayUnit * 30;
        const discountLabel = `${dayUnit}${isWeekly ? "주" : "개월"} 이상`;

        return (
            <div className="flex flex-col gap-2">
                <div className="md:text-base text-sm">{discountLabel}</div>
                <div className="relative">
                    <input
                        type="number"
                        min="0"
                        value={getDiscountValue(type, days)}
                        onChange={(e) => handleDiscountsChange(e, type, days)}
                        className="w-full border border-gray-300 rounded-xl p-3 pr-10 focus:outline-none focus:border-roomi appearance-none"
                    />
                    <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 text-sm font-bold">
                    %
                </span>
                </div>
            </div>
        );
    };
    const handleDiscountsChange = (e: React.ChangeEvent<HTMLInputElement>, type: string, days: number) => {
        const value = Number(e.target.value);
        setRoomFormData((prev) => ({
            ...prev,
            discounts: prev.discounts.map((item) =>
                item.type === type && item.days === days
                    ? {...item, percentage: value}
                    : item
            ),
        }));
    };
    const getDiscountValue = (type: string, days: number): string | number => {
        const discount = roomFormData.discounts.find(
            (d) => d.type === type && d.days === days
        );
        return !discount || discount.percentage === 0 ? "" : discount.percentage;
    };

    /*사업자 신고 함수*/
    // 사업장 주소
    const handleBusinessAddress = (data: any) => {
        console.log('다음 주소', data.address);
        handleChange("business_address", data.address);
        setDaumAddressModal(false);
    };
    // 사업자 등록증 업로드 트리거
    const handleBusinessFileSet = (type: UploadType) => {
        businessFileInputRef[type].current?.click();
    };
    // 파일 선택 시 실행될 함수
    const handleBusinessFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: UploadType) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 업로드 가능합니다.");
            return;
        }

        // 기존 미리보기 정리
        if (businessPreviewImages[type]?.previewUrl) {
            URL.revokeObjectURL(businessPreviewImages[type]!.previewUrl);
        }

        const previewUrl = URL.createObjectURL(file);
        const image = { file, previewUrl };

        setBusinessPreviewImages(prev => ({
            ...prev,
            [type]: image,
        }));

        setRoomFormData(prev => ({
            ...prev,
            [type]: file,
        }));

        e.target.value = "";
    };
    // 랜더링 함수
    const renderBusinessUploadSection = (title: string, description: string, type: UploadType) => (
        <div className="mt-4">
            <div className="text-sm text-gray-500 font-bold">{title}</div>
            <div className="mt-1">
                <div className="flex_center flex-col text-gray-400 font-bold bg-gray-100 border border-gray-300 rounded-xl h-56">
                    {businessPreviewImages[type] ? (
                        <div className="relative">
                            <img
                                src={businessPreviewImages[type]!.previewUrl}
                                alt={`${title} 미리보기`}
                                className="h-48 object-contain rounded-xl"
                            />
                            <button type="button"
                                    onClick={() => {
                                        URL.revokeObjectURL(businessPreviewImages[type]!.previewUrl);
                                        setBusinessPreviewImages(prev => ({
                                            ...prev,
                                            [type]: null,
                                        }));
                                        setRoomFormData(prev => ({
                                            ...prev,
                                            [type]: "",
                                        }));
                                    }}
                                    className="absolute top-1 right-1 bg-gray-500 text-white text-xxs rounded-full w-5 h-5 flex_center"
                            >
                                <FontAwesomeIcon icon={faX}/>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <FontAwesomeIcon icon={faArrowUpFromBracket} className="h-12 mb-2"/>
                            <div>{description}</div>
                        </div>
                    )}
                </div>
                <div className="flex_center mt-4">
                    <button
                        type="button"
                        onClick={() => handleBusinessFileSet(type)}
                        className="md:w-1/3 w-full rounded-xl bg-roomi text-white text-sm p-4 flex_center gap-2"
                    >
                        <FontAwesomeIcon icon={faFileImage}/>
                        {title} 업로드
                    </button>
                    <input
                        ref={businessFileInputRef[type]}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleBusinessFileChange(e, type)}
                    />
                </div>
            </div>
        </div>
    );

    // 폼 데이터 단계별 렌더링 함수
    const renderStepTitle = (currentStep: number) => {
        let stepTitle;
        let stepContent;
        switch (currentStep) {
            case 1: {
                stepTitle = '공간 유형';
                stepContent = '게스트가 이용할 공간 유형을 선택해주세요.';
                break;
            }
            case 2: {
                stepTitle = '공간 이름';
                stepContent = '게스트에게 보여질 공간의 이름을 입력해주세요.';
                break;
            }
            case 3: {
                stepTitle = '위치 정보';
                stepContent = '공간의 정확한 주소를 입력해주세요.';
                break;
            }
            case 4: {
                stepTitle = '건물 정보';
                stepContent = '건물의 유형과 면적을 선택해주세요.';
                break;
            }
            case 5: {
                stepTitle = '공간 구조';
                stepContent = '공간의 구조와 형태를 선택해주세요.';
                break;
            }
            case 6: {
                stepTitle = '주요 시설';
                stepContent = '건물의 주요 시설을 선택해주세요.';
                break;
            }
            case 7: {
                stepTitle = '사진 등록';
                stepContent = '공간의 사진을 등록해주세요. (최소 5장)';
                break;
            }
            case 8: {
                stepTitle = '공간 소개';
                stepContent = '공간의 특징과 장점을 소개해주세요.';
                break;
            }
            case 9: {
                stepTitle = '이용 안내';
                stepContent = '게스트를 위한 이용 방법을 설명해주세요.';
                break;
            }
            case 10: {
                stepTitle = '체크인/체크아웃';
                stepContent = '체크인/체크아웃 시간을 설정해주세요.';
                break;
            }
            case 11: {
                stepTitle = '요금 설정';
                stepContent = '기본 요금과 보증금을 설정해주세요.';
                break;
            }
            case 12: {
                stepTitle = '할인 설정';
                stepContent = '장기 이용, 등의 할인을 설정해주세요.';
                break;
            }
            case 13: {
                stepTitle = '예약 규정';
                stepContent = '예약 방식과 환불 규정을 선택해주세요.';
                break;
            }
            case 14: {
                if (roomFormData.room_type === "LEASE") {
                    stepTitle = '미리보기';
                    stepContent = '등록하기 전 최종 확인해주세요.';
                } else if (roomFormData.room_type === "LODGE") {
                    stepTitle = '사업자 신고증';
                    stepContent = '사업자 등록 추가 서류를 등록해주세요.';
                }
                break;
            }
            case 15: {
                if (roomFormData.room_type === "LODGE") {
                    stepTitle = '미리보기';
                    stepContent = '등록하기 전 최종 확인해주세요.';
                }
                break;
            }

        }
        return (
            <>
                <div className="text-xl font-bold">{stepTitle}</div>
                <div className="text-gray-600">{stepContent}</div>
            </>
        );
    };

    return (
        <form className="p-4">
            {/* 상단 헤더 */}
            <div className="mb-6 p-4 border rounded-xl flex">
                <button
                    type="button"
                    className="rounded-xl p-2 w-10 h-10"
                    onClick={() => setShowModal(true)}
                >
                    <FontAwesomeIcon icon={faArrowLeft}/>
                </button>
                <div className="mx-4 flex-1">{renderStepTitle(currentStep)}</div>
            </div>

            {/* 진행 바 */}
            <div className="w-full mb-4">
                <div className="relative h-2 bg-gray-200 rounded-full">
                    <div
                        className="absolute h-2 bg-roomi rounded-full transition-all duration-300"
                        style={{width: `${(currentStep / totalSteps) * 100}%`}}
                    />
                </div>
                <div className="text-sm text-gray-600 mt-1 ml-2">
                    {currentStep} / {totalSteps}
                </div>
            </div>

            {/* 페이지 컨텐츠 */}
            <div className="mb-6 p-4 border rounded-xl">
                {currentStep === 1 && (
                    /*공간 유형*/
                    <div>
                        {/*안내*/}
                        <div className="p-4 rounded-xl bg-roomi-000">
                            <div className="flex items-center text-roomi m-2">
                                <div className="w-5 h-5 flex_center border border-roomi rounded-full">
                                    <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                </div>
                                <div className="ml-4 font-bold">안내사항</div>
                            </div>
                            <div className="text-gray-500 text-sm">
                                <div className="p-1 px-2">
                                    <strong> · </strong>불법 숙박업소 운영 시 관련법에 따라 처벌 될 수 있습니다.
                                </div>
                                <div className="p-1 px-2">
                                    <strong> · </strong>선택하신 유형에 따라 필요한 서류가 요청 될 수 있습니다.
                                </div>
                                <div className="p-1 px-2">
                                    <strong> · </strong>허위로 공간 유형을 선택 할 경우 계정이 제한 될 수 있습니다.
                                </div>
                            </div>
                        </div>
                        <div className={`md:flex mt-4 gap-4 ${mode === "update" && 'pointer-events-none'}`}>
                            {/* 단기임대 */}
                            <div className="md:w-1/2">
                                <label htmlFor="LEASE"
                                       className={`flex flex-col h-full p-4 border rounded-xl cursor-pointer transition mb-4 md:mb-0
                                        ${roomFormData.room_type === "LEASE" ?
                                           "bg-roomi-000 border-roomi" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                >
                                    <div className="flex">
                                        <div className={`flex_center bg-gray-200 p-4 rounded-xl 
                                                ${roomFormData.room_type === "LEASE" && "bg-roomi-00 text-roomi"}`}
                                        >
                                            <FontAwesomeIcon icon={faBuilding} className="w-6 h-6"/>
                                        </div>
                                        <div className="w-full ml-4">
                                            <div
                                                className={`font-bold 
                                                    ${roomFormData.room_type === "LEASE" && "text-roomi"}`}
                                            >
                                                주/월 단위 단기임대 공간
                                            </div>
                                            <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                주단위 또는 월단위로 운영되는 일반 임대주택 입니다.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex text-gray-500 md:text-sm text-xs mt-2">
                                        <div className="p-4">
                                            <div className="w-6 h-6"></div>
                                        </div>
                                        <div
                                            className={`w-full ml-4 p-3 
                                                ${roomFormData.room_type === "LEASE" && "bg-gray-50 rounded-xl"}`}
                                        >
                                            <div className="my-2">
                                                <strong> · </strong>주단위/월단위 임대 가능
                                            </div>
                                            <div className="my-2">
                                                <strong> · </strong>일반 임대주택
                                            </div>
                                        </div>
                                        <div className="md:p-4">
                                            <div className="w-6 h-6"></div>
                                        </div>
                                    </div>
                                </label>
                                <input type="radio" name="roomType" id="LEASE" value="LEASE"
                                       checked={roomFormData.room_type === "LEASE"}
                                       onChange={(e) => handleChange("room_type", e.target.value)}
                                       className="hidden"
                                />
                            </div>
                            {/* 숙박업소 */}
                            <div className="md:w-1/2">
                                <label htmlFor="LODGE"
                                       className={`flex flex-col h-full p-4 border rounded-xl cursor-pointer transition 
                                           ${roomFormData.room_type === "LODGE" ?
                                           "bg-roomi-000 border-roomi" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                >
                                    <div className="flex">
                                        <div className={`flex_center bg-gray-200 p-4 rounded-xl 
                                                ${roomFormData.room_type === "LODGE" && "bg-roomi-00 text-roomi"}`}
                                        >
                                            <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                        </div>
                                        <div className="w-full ml-4">
                                            <div
                                                className={`font-bold 
                                                    ${roomFormData.room_type === "LODGE" && "text-roomi"}`}
                                            >
                                                사업자 신고 완료 공간
                                            </div>
                                            <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                공식 등록된 사업자로 운영되는 공간 입니다.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex text-gray-500 md:text-sm text-xs mt-2">
                                        <div className="p-4">
                                            <div className="w-6 h-6"></div>
                                        </div>
                                        <div
                                            className={`w-full ml-4 p-3 ${roomFormData.room_type === "LODGE" && "bg-gray-50 rounded-xl"}`}>
                                            <div className="my-2">
                                                <strong> · </strong>단기 거주용 쉐어하우스, 게스트하루스 등
                                            </div>
                                            <div className="my-2">
                                                <strong> · </strong>루미 인증 공간
                                            </div>
                                        </div>
                                        <div className="md:p-4">
                                            <div className="w-6 h-6"></div>
                                        </div>
                                    </div>
                                </label>
                                <input type="radio" name="roomType" id="LODGE" value="LODGE"
                                       checked={roomFormData.room_type === "LODGE"}
                                       onChange={(e) => handleChange("room_type", e.target.value)}
                                       className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                )}
                {currentStep === 2 && (
                    /*공간 이름*/
                    <div>
                        {/*안내*/}
                        <div className="p-4 rounded-xl bg-roomi-000">
                            <div className="flex items-center text-roomi m-2">
                                <div className="w-5 h-5 flex_center border border-roomi rounded-full">
                                    <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                </div>
                                <div className="ml-4 font-bold">도움말</div>
                            </div>
                            <div className="text-gray-500 text-sm">
                                <div className="p-1 px-2">
                                    <strong> · </strong>위치, 특징, 분위기를 잘 나타내는 이름을 추천드려요.
                                </div>
                                <div className="p-1 px-2">
                                    <strong> · </strong>지나치게 과장 된 표현은 피해주세요.
                                </div>
                                <div className="p-1 px-2">
                                    <strong> · </strong>이모지 사용 가능해요.
                                </div>
                            </div>
                        </div>
                        {/*이름*/}
                        <div className="mt-4">
                            <input
                                type="text"
                                value={roomFormData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                placeholder="공간 이름"
                                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:border-roomi"
                            />
                        </div>
                    </div>
                )}
                {currentStep === 3 && (
                    /* 위치 정보 */
                    <div>
                        {/*안내*/}
                        <div className="p-4 rounded-xl bg-roomi-000">
                            <div className="flex items-center text-roomi m-2">
                                <div className="w-5 h-5 flex_center border border-roomi rounded-full">
                                    <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                </div>
                                <div className="ml-4 font-bold">개인정보 보호</div>
                            </div>
                            <div className="text-gray-500 text-sm">
                                <div className="p-1 px-2">
                                    <strong> · </strong>정확한 위치는 예약 완료 후에만 게스트에게 공개됩니다.
                                </div>
                            </div>
                        </div>
                        {/*주소*/}
                        <div className="mt-4 relative">
                            <input
                                type="text"
                                value={roomFormData.address}
                                readOnly
                                onClick={() => setDaumAddressModal(true)}
                                placeholder="주소"
                                className="w-full border border-gray-300 rounded-xl p-3 pr-10 cursor-pointer focus:outline-none focus:border-roomi"
                            />
                            <div className="absolute right-3.5 top-3 text-roomi pointer-events-none">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4"/>
                            </div>
                            <Modal
                                isOpen={daumAddressModal}
                                onRequestClose={() => setDaumAddressModal(false)}
                                className="bg-white p-6 rounded-xl border border-gray-300 mx-auto"
                                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                            >
                                <DaumPostcode
                                    style={{width: 400, height: 600}}
                                    onComplete={handleAddress}
                                />
                            </Modal>
                            <input
                                type="text"
                                value={roomFormData.address_detail}
                                onChange={(e) => handleChange("address_detail", e.target.value)}
                                placeholder="상세 주소"
                                className="w-full border border-gray-300 rounded-xl p-3 mt-4 focus:outline-none focus:border-roomi"
                            />
                        </div>
                    </div>
                )}
                {currentStep === 4 && (
                    /* 건물 정보 */
                    <div>
                        {/*안내*/}
                        <div className="p-4 rounded-xl bg-roomi-000">
                            <div className="flex items-center text-roomi m-2">
                                <div className="w-5 h-5 flex_center border border-roomi rounded-full">
                                    <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                </div>
                                <div className="ml-4 font-bold">단기 임대 공간 정보</div>
                            </div>
                            <div className="text-gray-500 text-sm">
                                <div className="p-1 px-2">
                                    <strong> · </strong>단기 임대로 운영 되는 주거 공간에 적합한 건물 유형을 선택해주세요.
                                </div>
                            </div>
                        </div>
                        {/*건물*/}
                        <div className="mt-4">
                            {/*건물 유형*/}
                            <div className="mb-4">
                                <select
                                    value={roomFormData.building_type}
                                    onChange={(e) => handleChange("building_type", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-roomi text-gray-700"
                                >
                                    <option value="">건물 유형을 선택해주세요</option>
                                    {buildingTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4 mb-4">
                                {/* 전용 면적 */}
                                <div className="relative w-1/3">
                                    <input
                                        value={roomFormData.detail.floor_area === 0 ? "" : roomFormData.detail.floor_area}
                                        type="number"
                                        min="0"
                                        placeholder="전용 면적"
                                        onChange={(e) => handleChange("detail.floor_area", e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl p-3 pr-10 focus:outline-none focus:border-roomi appearance-none"
                                    />
                                    <span
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                            평
                                        </span>
                                </div>

                                {/* 해당 층수 */}
                                <div className="relative w-1/3">
                                    <input
                                        value={roomFormData.detail.floor === 0 ? "" : roomFormData.detail.floor}
                                        type="number"
                                        min="0"
                                        placeholder="해당 층수"
                                        onChange={(e) => handleChange("detail.floor", e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl p-3 pr-10 focus:outline-none focus:border-roomi appearance-none"
                                    />
                                    <span
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                            층
                                        </span>
                                </div>
                            </div>
                            {/*엘베 주차*/}
                            <div className="flex gap-4">
                                <label htmlFor="hasElevator"
                                       className={`flex_center flex-col gap-2 border rounded-xl w-32 h-24 text-gray-500 cursor-pointer transition
                                           ${roomFormData.has_elevator ? "border-roomi text-roomi" : "border-gray-300 hover:bg-gray-50"}`}
                                >
                                    <span><FontAwesomeIcon icon={faElevator} className="text-xl"/></span>
                                    <span className="text-sm font-bold">엘리베이터</span>
                                </label>
                                <input
                                    id="hasElevator"
                                    type="checkbox"
                                    checked={roomFormData.has_elevator}
                                    onChange={(e) =>
                                        setRoomFormData((prev) => ({
                                            ...prev,
                                            has_elevator: e.target.checked,
                                        }))
                                    }
                                    className="hidden"
                                />

                                {/* 주차 가능 */}
                                <label htmlFor="hasParking"
                                       className={`flex_center flex-col gap-2 border rounded-xl w-32 h-24 text-gray-500 cursor-pointer transition
                                           ${roomFormData.has_parking ? "border-roomi text-roomi" : "border-gray-300 hover:bg-gray-50"}`}
                                >
                                    <span><FontAwesomeIcon icon={faP} className="text-xl"/></span>
                                    <span className="text-sm font-bold">주차 가능</span>
                                </label>
                                <input
                                    id="hasParking"
                                    type="checkbox"
                                    checked={roomFormData.has_parking}
                                    onChange={(e) =>
                                        setRoomFormData((prev) => ({
                                            ...prev,
                                            has_parking: e.target.checked,
                                        }))
                                    }
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                )}
                {currentStep === 5 && (
                    /* 공간 구조 */
                    <div>
                        {/*구조*/}
                        <div className="mb-4">
                            <select
                                value={roomFormData.detail.room_structure}
                                onChange={(e) => handleChange("detail.room_structure", e.target.value)}
                                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-roomi text-gray-700"
                            >
                                <option value="">구조를 선택해주세요</option>
                                {roomStructures.map((structure) => (
                                    <option key={structure} value={structure}>
                                        {structure}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4">
                            {/* 전용 면적 */}
                            <div className="relative w-1/3">
                                <input
                                    value={roomFormData.detail.room_count === 0 ? "" : roomFormData.detail.room_count}
                                    type="number"
                                    min="0"
                                    placeholder="방 개수"
                                    onChange={(e) => handleChange("detail.room_count", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-3 pr-10 focus:outline-none focus:border-roomi appearance-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                        개
                                </span>
                            </div>

                            {/* 화장실 개수 */}
                            <div className="relative w-1/3">
                                <input
                                    value={roomFormData.detail.bathroom_count === 0 ? "" : roomFormData.detail.bathroom_count}
                                    type="number"
                                    min="0"
                                    placeholder="화장실 개수"
                                    onChange={(e) => handleChange("detail.bathroom_count", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-3 pr-10 focus:outline-none focus:border-roomi appearance-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                        개
                                    </span>
                            </div>

                            {/* 최대 수용 인원 */}
                            <div className="relative w-1/3">
                                <input
                                    value={roomFormData.detail.max_guests === 0 ? "" : roomFormData.detail.max_guests}
                                    type="number"
                                    min="0"
                                    placeholder="최대 수용 인원"
                                    onChange={(e) => handleChange("detail.max_guests", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-3 pr-10 focus:outline-none focus:border-roomi appearance-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                        명
                                    </span>
                            </div>
                        </div>
                    </div>
                )}
                {currentStep === 6 && (
                    /* 주요 시설 */
                    <div>
                        {/*안내*/}
                        <div className="p-4 rounded-xl bg-roomi-000">
                            <div className="flex items-center text-roomi m-2">
                                <div className="w-5 h-5 flex_center border border-roomi rounded-full">
                                    <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                </div>
                                <div className="ml-4 font-bold">숙박업소 시설 정보</div>
                            </div>
                            <div className="text-gray-500 text-sm">
                                <div className="p-1 px-2">
                                    <strong> · </strong>제공하는 시설을 선택해 주시기 바랍니다. 게스트가 기대하는
                                    기본 시설은 모두 포함하는 것이 좋습니다.
                                </div>
                            </div>
                        </div>
                        {/*필수 시설*/}
                        <div>
                            {renderFacilities('basic')}
                        </div>
                        {/*추가 시설*/}
                        <div>
                            {renderFacilities('additional')}
                        </div>
                        {/*서비스 정보*/}
                        <div className="border border-gray-300 rounded-xl p-4 mt-4">
                            <div className="font-bold">서비스 정보</div>
                            <div className="mt-2">
                                <label htmlFor="checkin_service" className="text-sm font-bold">입실 안내</label>
                                <textarea
                                    value={roomFormData.detail.checkin_service}
                                    onChange={(e) => handleChange("detail.checkin_service", e.target.value)}
                                    name="checkin_service"
                                    id="checkin_service"
                                    cols={30}
                                    rows={5}
                                    className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-roomi resize-none"></textarea>
                            </div>
                            <div className="mt-2">
                                <label htmlFor="breakfast_service" className="text-sm font-bold">식사 정보</label>
                                <textarea
                                    value={roomFormData.detail.breakfast_service}
                                    onChange={(e) => handleChange("detail.breakfast_service", e.target.value)}
                                    name="breakfast_service"
                                    id="breakfast_service"
                                    cols={30}
                                    rows={5}
                                    className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-roomi resize-none"></textarea>
                            </div>
                        </div>
                    </div>
                )}
                {currentStep === 7 && (
                    /* 사진 등록 */
                    <div>
                        {/*안내*/}
                        <div className="p-4 rounded-xl bg-roomi-000">
                            <div className="flex items-center text-roomi m-2">
                                <div className="w-5 h-5 flex_center border border-roomi rounded-full">
                                    <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                </div>
                                <div className="ml-4 font-bold">사진 관리 팁</div>
                            </div>
                            <div className="text-gray-500 text-sm">
                                <div className="p-1 px-2">
                                    <strong> · </strong>첫번째 사진이 대표 사진으로 설정됩니다.
                                </div>
                                <div className="p-1 px-2">
                                    <strong> · </strong>사진은 최소 5장 이상 등록해주시기 바랍니다.
                                </div>
                                <div className="p-1 px-2">
                                    <strong> · </strong>수정 된 사진은 저장 후 반영됩니다.
                                </div>
                            </div>
                        </div>
                        {/*사진 등록*/}
                        <div>
                            <div className="border border-gray-300 rounded-xl p-4 mt-4">
                                <div className="flex justify-between font-bold">
                                    <div className="flex_center">사진 등록</div>
                                    <div>{selectedImages.length}/50</div>
                                </div>
                                <div className="flex_center mt-2">
                                    <button
                                        type="button"
                                        onClick={handleInputFileSet}
                                        className="md:w-1/3 w-full rounded-xl bg-roomi text-white text-sm p-4 flex_center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faImages}/>
                                        사진 추가하기
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*" // 이미지 파일만 선택 가능
                                        multiple // 다중 선택 허용
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                {/* 선택한 이미지 미리보기 영역 */}
                                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 mt-4">
                                    {selectedImages.map((imageItem, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={imageItem.previewUrl}
                                                alt={`preview-${index}`}
                                                className={`md:w-64 md:h-44 object-cover rounded-xl ${
                                                    index === 0 ? "border border-roomi" : ""
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-1 right-1 bg-gray-500 text-white text-xxs rounded-full w-5 h-5 flex_center"
                                            >
                                                <FontAwesomeIcon icon={faX}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {currentStep === 8 && (
                    /* 공간 소개 */
                    <div>
                        {/*공간 소개*/}
                        <div className="border border-gray-300 rounded-xl p-4">
                            <div>
                                <div className="font-bold">공간 소개</div>
                                <div className="mt-2">
                                        <textarea
                                            value={roomFormData.detail.description}
                                            onChange={(e) => handleChange('detail.description', e.target.value)}
                                            name="description"
                                            id="description"
                                            cols={30}
                                            rows={5}
                                            className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-roomi resize-none"></textarea>
                                </div>
                            </div>
                            {/*추천 키워드*/}
                            <div className="mt-4">
                                <div className="font-bold">추천 키워드</div>
                                <div className="text-xs text-gray-500 mt-2">
                                    검색에 활용할 태그를 입력해 주시기 바랍니다. 아래 키워드를 참고하시기 바랍니다.
                                </div>
                                {/*태그 예시*/}
                                <div className="flex items-center flex-wrap gap-2.5 mt-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>
                                        채광이 좋아요
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>
                                        교통이 편리해요
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>
                                        조용해요
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>
                                        신축건물이에요
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>
                                        주차가 가능해요
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faHashtag} className="text-gray-400"/>
                                        보안이 좋아요
                                    </div>
                                </div>
                                {/* 태그 입력 영역 */}
                                <div className="flex justify-between gap-2 mt-4">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        placeholder="태그 입력"
                                        onChange={(e) => setTagInput(e.target.value)}
                                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-roomi"
                                    />
                                    <button type="button" onClick={handleAddTag}
                                            className="px-6 text-white bg-roomi rounded-xl p-3">
                                        추가
                                    </button>
                                </div>
                                {/* 태그 목록 표시 영역 */}
                                <div className="flex flex-wrap mt-6 gap-2">
                                    {roomFormData.detail.tags?.map((tag, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center p-2 px-3 rounded-xl text-sm text-roomi border border-roomi"
                                        >
                                            <span className="mr-2">{tag}</span>
                                            <button type="button" onClick={() => handleRemoveTag(index)}>
                                                <FontAwesomeIcon icon={faX}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {currentStep === 9 && (
                    /* 이용 안내 */
                    <div>
                        <div className="border border-gray-300 rounded-xl p-4">
                            {/*이용 규칙*/}
                            <div>
                                <div className="font-bold">이용 규칙</div>
                                <div className="mt-2">
                                        <textarea
                                            value={roomFormData.detail.house_rules}
                                            onChange={(e) => handleChange('detail.house_rules', e.target.value)}
                                            name="house_rules"
                                            id="house_rules"
                                            cols={30}
                                            rows={5}
                                            className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-roomi resize-none"></textarea>
                                </div>
                            </div>
                            {/*금지 사항*/}
                            <div className="mt-4">
                                <div className="font-bold">금지 사항 선택</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                                    {prohibitionsList.map((item) => (
                                        <label
                                            key={item}
                                            className={`flex_center gap-2 border rounded-xl p-3 cursor-pointer transition-all
                                                    ${roomFormData.detail.prohibitions.includes(item)
                                                ? "bg-roomi-000 border-roomi text-roomi font-bold"
                                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }
                                                `}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={roomFormData.detail.prohibitions.includes(item)}
                                                onChange={(e) =>
                                                    setRoomFormData((prev) => {
                                                        const updatedProhibitions = e.target.checked
                                                            ? [...(prev.detail.prohibitions || []), item]
                                                            : (prev.detail.prohibitions || []).filter((prohibition) => prohibition !== item);

                                                        return {
                                                            ...prev,
                                                            detail: {
                                                                ...prev.detail,
                                                                prohibitions: updatedProhibitions,
                                                            },
                                                        };
                                                    })
                                                }
                                                className="hidden"
                                            />
                                            <span className="md:text-sm text-xs">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {/*교통 안내*/}
                            <div className="mt-4">
                                <div className="font-bold">교통 안내</div>
                                <div className="mt-2">
                                        <textarea
                                            value={roomFormData.detail.transportation_info}
                                            onChange={(e) => handleChange('detail.transportation_info', e.target.value)}
                                            name="transportation_info"
                                            id="transportation_info"
                                            cols={30}
                                            rows={5}
                                            className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-roomi resize-none"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {currentStep === 10 && (
                    /* 체크인/체크아웃 */
                    <div>
                        <div className="border border-gray-300 rounded-xl p-4">
                            {/*안내*/}
                            <div className="p-4 rounded-xl bg-roomi-000">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">안내사항</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>입실/퇴실 시간은 게스트에게 중요한 정보입니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>청소 및 정리 시간을 고려하여 설정해주시기 바랍니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>시간이 변경되는 경우에는 게스트와 협의해주시기 바랍니다.
                                    </div>
                                </div>
                            </div>
                            {/*입/퇴실 시간*/}
                            <div className="mt-4">
                                {/*입실 시간*/}
                                <div className="flex flex-col md:flex-row md:gap-8">
                                    <div className="font-bold md:flex_center">입실 시간</div>
                                    <div className="md:w-1/3 mt-4 md:mt-0 flex_center rounded-xl">
                                        <select
                                            id="check_in_time"
                                            value={roomFormData.detail.check_in_time}
                                            onChange={(e) => handleChange('detail.check_in_time', e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-roomi"
                                        >
                                            <option value="">선택하세요</option>
                                            {timeOptions.map((time) => (
                                                <option key={`in-${time}`} value={time}>
                                                    {time}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/*퇴실 시간*/}
                                <div className="mt-4 flex flex-col md:flex-row md:gap-8">
                                    <div className="font-bold md:flex_center">퇴실 시간</div>
                                    <div className="md:w-1/3 mt-4 md:mt-0 flex_center rounded-xl">
                                        <select
                                            id="check_out_time"
                                            value={roomFormData.detail.check_out_time}
                                            onChange={(e) => handleChange('detail.check_out_time', e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-roomi"
                                        >
                                            <option value="">선택하세요</option>
                                            {timeOptions.map((time) => (
                                                <option key={`out-${time}`} value={time}>
                                                    {time}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {currentStep === 11 && (
                    /* 요금 설정 */
                    <div>
                        {/*안내*/}
                        <div className="p-4 rounded-xl bg-roomi-000">
                            <div className="flex items-center text-roomi m-2">
                                <div className="w-5 h-5 flex_center border border-roomi rounded-full">
                                    <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                </div>
                                <div className="ml-4 font-bold">요금 설정 팁</div>
                            </div>
                            <div className="text-gray-500 text-sm">
                                <div className="p-1 px-2">
                                    <strong> · </strong>주변 시세를 참고하여 설정하면 좋습니다.
                                </div>
                                <div className="p-1 px-2">
                                    <strong> · </strong>관리 비용은 주 또는 월 단위로 청구됩니다.
                                </div>
                            </div>
                        </div>
                        {/*기본 요금 설정*/}
                        <div className="mt-4">
                            <div className="font-bold">
                                <div className="font-bold">기본 요금 설정</div>
                                <div className="flex gap-4 mt-2">
                                    <label htmlFor="week_enabled"
                                           className={`flex_center gap-2 border rounded-xl p-3 px-4 text-gray-500 cursor-pointer transition
                                               ${roomFormData.week_enabled ? "border-roomi text-roomi bg-roomi-light" : "border-gray-300 hover:bg-gray-50"}`}
                                    >
                                        {roomFormData.week_enabled &&
                                            <FontAwesomeIcon icon={faCheck} className="text-lg"/>}
                                        <span className="text-sm">주</span>
                                    </label>
                                    <input
                                        id="week_enabled"
                                        name="week_enabled"
                                        type="checkbox"
                                        checked={roomFormData.week_enabled}
                                        onChange={(e) =>
                                            setRoomFormData((prev) => ({
                                                ...prev,
                                                week_enabled: e.target.checked,
                                            }))
                                        }
                                        className="hidden"
                                    />
                                    <label htmlFor="month_enabled"
                                           className={`flex_center gap-2 border rounded-xl p-3 px-4 text-gray-500 cursor-pointer transition
                                               ${roomFormData.month_enabled ? "border-roomi text-roomi bg-roomi-light" : "border-gray-300 hover:bg-gray-50"}`}
                                    >
                                        {roomFormData.month_enabled &&
                                            <FontAwesomeIcon icon={faCheck} className="text-lg"/>}
                                        <span className="text-sm">월</span>
                                    </label>
                                    <input
                                        id="month_enabled"
                                        type="checkbox"
                                        checked={roomFormData.month_enabled}
                                        onChange={(e) =>
                                            setRoomFormData((prev) => ({
                                                ...prev,
                                                month_enabled: e.target.checked,
                                            }))
                                        }
                                        className="hidden"
                                    />
                                </div>
                            </div>
                            {roomFormData.week_enabled && (
                                <div className="mt-4">
                                    <div className="font-bold">주 단위 요금</div>
                                    <div className="mt-2">
                                        {renderSetPriceInput(false, 'week_price', '기본 요금')}
                                        {renderSetPriceInput(false, 'deposit_week', '보증금')}
                                        {renderSetPriceInput(false, 'maintenance_fee_week', '관리비')}
                                    </div>
                                </div>
                            )}
                            {roomFormData.month_enabled && (
                                <div className="mt-4">
                                    <div className="font-bold">월 단위 요금</div>
                                    <div className="mt-2">
                                        {renderSetPriceInput(true, 'month_price', '기본 요금')}
                                        {renderSetPriceInput(true, 'deposit_month', '보증금')}
                                        {renderSetPriceInput(true, 'maintenance_fee_month', '관리비')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {currentStep === 12 && (
                    /* 할인 설정 */
                    <div>
                        {/*안내*/}
                        <div className="p-4 rounded-xl bg-roomi-000">
                            <div className="flex items-center text-roomi m-2">
                                <div className="w-5 h-5 flex_center border border-roomi rounded-full">
                                    <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                </div>
                                <div className="ml-4 font-bold">할인/할증 설정 팁</div>
                            </div>
                            <div className="text-gray-500 text-sm">
                                <div className="p-1 px-2">
                                    <strong> · </strong>장기 이용 할인은 게스트의 장기 예약을 유도 할 수 있어요.
                                </div>
                                <div className="p-1 px-2">
                                    <strong> · </strong>성수기 할증은 수요가 많은 기간에 적용됩니다.
                                </div>
                                <div className="p-1 px-2">
                                    <strong> · </strong>적절한 할인률 설정으로 예약률을 높일 수 있어요.
                                </div>
                            </div>
                        </div>
                        {/*할인*/}
                        <div className="mt-4">
                            {roomFormData.week_enabled && (
                                <div className="mt-4">
                                    <div className="font-bold">주 단위 장기 숙박 할인</div>
                                    <div className="text-gray-500 text-sm">2주 이상 예약 시 할인률을 설정해주세요.</div>
                                    <div className="mt-2 flex gap-8">
                                        {renderDiscountsSet("weekly", 2)}
                                        {renderDiscountsSet("weekly", 4)}
                                        {renderDiscountsSet("weekly", 12)}
                                    </div>
                                </div>
                            )}
                            {roomFormData.month_enabled && (
                                <div className="mt-4">
                                    <div className="font-bold">월 단위 장기 이용 할인</div>
                                    <div className="text-gray-500 text-sm">월 단위 예약 시 할인률을 설정해주세요.</div>
                                    <div className="mt-2 flex gap-8">
                                        {renderDiscountsSet("monthly", 1)}
                                        {renderDiscountsSet("monthly", 3)}
                                        {renderDiscountsSet("monthly", 6)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {currentStep === 13 && (
                    /* 예약 규정 */
                    <div>
                        <div className="">
                            <div className="font-bold">예약 방식</div>
                            <div className="md:flex mt-4 gap-4">
                                {/* 즉시 예약 */}
                                <div className="md:w-1/2">
                                    <label
                                        htmlFor="auto_true"
                                        className={`block p-4 border rounded-xl cursor-pointer transition mb-4 md:mb-0 
                                            ${roomFormData.is_auto_accepted ?
                                            "bg-roomi-000 border-roomi" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                    >
                                        <div className="flex">
                                            <div
                                                className={`flex_center p-2 text-gray-300
                                                ${roomFormData.is_auto_accepted && "text-roomi"}`}
                                            >
                                                {roomFormData.is_auto_accepted ? (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                                ) : (
                                                    <FontAwesomeIcon icon={faCircle} className="w-6 h-6"/>
                                                )}
                                            </div>
                                            <div className="w-full ml-4">
                                                <div
                                                    className={`font-bold 
                                                    ${roomFormData.is_auto_accepted && "text-roomi"}`}
                                                >
                                                    즉시 예약
                                                </div>
                                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                    게스트가 바로 예약 할 수 있습니다.
                                                </div>
                                            </div>
                                        </div>
                                        <input type="radio" name="is_auto_accepted" id="auto_true"
                                               checked={roomFormData.is_auto_accepted}
                                               onChange={() => handleChange("is_auto_accepted", true)}
                                               className="hidden"
                                        />
                                    </label>
                                </div>
                                {/* 승인 필요 */}
                                <div className="md:w-1/2">
                                    <label
                                        htmlFor="auto_false"
                                        className={`block p-4 border rounded-xl cursor-pointer transition 
                                            ${!roomFormData.is_auto_accepted ?
                                            "bg-roomi-000 border-roomi" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                    >
                                        <div className="flex">
                                            <div
                                                className={`flex_center p-2 text-gray-300
                                                ${!roomFormData.is_auto_accepted && "text-roomi"}`}
                                            >
                                                {!roomFormData.is_auto_accepted ? (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                                ) : (
                                                    <FontAwesomeIcon icon={faCircle} className="w-6 h-6"/>
                                                )}
                                            </div>
                                            <div className="w-full ml-4">
                                                <div
                                                    className={`font-bold 
                                                    ${!roomFormData.is_auto_accepted && "text-roomi"}`}
                                                >
                                                    승인 필요
                                                </div>
                                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                    호스트가 예약을 승인 해야 합니다.
                                                </div>
                                            </div>
                                        </div>
                                        <input type="radio" name="is_auto_accepted" id="auto_false"
                                               checked={!roomFormData.is_auto_accepted}
                                               onChange={() => handleChange("is_auto_accepted", false)}
                                               className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="font-bold">환불 규정</div>
                            <div className="mt-4">
                                {/* 유연한 */}
                                <div className="mb-2">
                                    <label
                                        htmlFor="policy_easy"
                                        className={`block p-4 border rounded-xl cursor-pointer transition mb-4 md:mb-0 
                                            ${(roomFormData.refund_policy.startsWith('유연한') ||
                                            roomFormData.refund_policy === "3") ?
                                            "bg-roomi-000 border-roomi" : "border-gray-300 text-gray-700 hover:bg-gray-50"}
                                        `}
                                    >
                                        <div className="flex">
                                            <div
                                                className={`flex_center p-2 text-gray-300
                                                    ${(roomFormData.refund_policy.startsWith('유연한') ||
                                                    roomFormData.refund_policy === "3") && "text-roomi"}`}
                                            >
                                                {(roomFormData.refund_policy.startsWith('유연한') ||
                                                    roomFormData.refund_policy === "3") ? (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                                ) : (
                                                    <FontAwesomeIcon icon={faCircle} className="w-6 h-6"/>
                                                )}
                                            </div>
                                            <div className="w-full ml-4">
                                                <div
                                                    className={`font-bold 
                                                        ${(roomFormData.refund_policy.startsWith('유연한') ||
                                                        roomFormData.refund_policy === "3") && "text-roomi"}`}
                                                >
                                                    유연한 환불 정책
                                                </div>
                                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                    체크인 24시간 전까지 무료 취소
                                                </div>
                                            </div>
                                        </div>
                                        <input type="radio" name="refund_policy" id="policy_easy"
                                               checked={(roomFormData.refund_policy.startsWith('유연한') ||
                                                   roomFormData.refund_policy === "3")}
                                               onChange={() => handleChange("refund_policy", '3')}
                                               className="hidden"
                                        />
                                        <div className="flex text-gray-500 md:text-sm text-xs mt-2">
                                            <div
                                                className={`w-full ml-4 p-3 
                                                    ${(roomFormData.refund_policy.startsWith('유연한') ||
                                                    roomFormData.refund_policy === "3") && "bg-gray-50 rounded-xl"}`}
                                            >
                                                <div className="my-2">
                                                    • 체크인 24시간 전까지: 100% 환불
                                                </div>
                                                <div className="my-2">
                                                    • 체크인 24시간 전 ~ 당일: 50% 환불
                                                </div>
                                                <div className="my-2">
                                                    • 체크인 이후: 환불 불가
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                {/* 일반 */}
                                <div className="mb-2">
                                    <label htmlFor="policy_basic"
                                           className={`block p-4 border rounded-xl cursor-pointer transition mb-4 md:mb-0 
                                               ${(roomFormData.refund_policy.startsWith('일반') ||
                                               roomFormData.refund_policy === "4") ?
                                               "bg-roomi-000 border-roomi" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                    >
                                        <div className="flex">
                                            <div
                                                className={`flex_center p-2 text-gray-300
                                                    ${(roomFormData.refund_policy.startsWith('일반') ||
                                                    roomFormData.refund_policy === "4") && "text-roomi"}`}
                                            >
                                                {(roomFormData.refund_policy.startsWith('일반') ||
                                                    roomFormData.refund_policy === "4") ? (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                                ) : (
                                                    <FontAwesomeIcon icon={faCircle} className="w-6 h-6"/>
                                                )}
                                            </div>
                                            <div className="w-full ml-4">
                                                <div
                                                    className={`font-bold 
                                                        ${(roomFormData.refund_policy.startsWith('일반') ||
                                                        roomFormData.refund_policy === "4") && "text-roomi"}`}
                                                >
                                                    일반 환불 정책
                                                </div>
                                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                    체크인 3일 전까지 무료 취소
                                                </div>
                                            </div>
                                        </div>
                                        <input type="radio" name="refund_policy" id="policy_basic"
                                               checked={(roomFormData.refund_policy.startsWith('일반') ||
                                                   roomFormData.refund_policy === "4")}
                                               onChange={() => handleChange("refund_policy", '4')}
                                               className="hidden"
                                        />
                                        <div className="flex text-gray-500 md:text-sm text-xs mt-2">
                                            <div
                                                className={`w-full ml-4 p-3 
                                                    ${(roomFormData.refund_policy.startsWith('일반') ||
                                                    roomFormData.refund_policy === "4") && "bg-gray-50 rounded-xl"}`}
                                            >
                                                <div className="my-2">
                                                    • 체크인 3일 전까지: 100% 환불
                                                </div>
                                                <div className="my-2">
                                                    • 체크인 3일 전 ~ 당일: 50% 환불
                                                </div>
                                                <div className="my-2">
                                                    • 체크인 이후: 환불 불가
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                {/* 엄격한 */}
                                <div className="">
                                    <label htmlFor="policy_strict"
                                           className={`block p-4 border rounded-xl cursor-pointer transition mb-4 md:mb-0 
                                               ${(roomFormData.refund_policy.startsWith('엄격한') ||
                                               roomFormData.refund_policy === "5") ?
                                               "bg-roomi-000 border-roomi" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                    >
                                        <div className="flex">
                                            <div
                                                className={`flex_center p-2 text-gray-300
                                    ${(roomFormData.refund_policy.startsWith('엄격한') ||
                                                    roomFormData.refund_policy === "5") && "text-roomi"}`}
                                            >
                                                {(roomFormData.refund_policy.startsWith('엄격한') ||
                                                    roomFormData.refund_policy === "5") ? (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                                ) : (
                                                    <FontAwesomeIcon icon={faCircle} className="w-6 h-6"/>
                                                )}
                                            </div>
                                            <div className="w-full ml-4">
                                                <div
                                                    className={`font-bold 
                                    ${(roomFormData.refund_policy.startsWith('엄격한') ||
                                                        roomFormData.refund_policy === "5") && "text-roomi"}`}
                                                >
                                                    엄격한 환불 정책
                                                </div>
                                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                    체크인 7일 전까지 50% 환불
                                                </div>
                                            </div>
                                        </div>
                                        <input type="radio" name="refund_policy" id="policy_strict"
                                               checked={(roomFormData.refund_policy.startsWith('엄격한') ||
                                                   roomFormData.refund_policy === "5")}
                                               onChange={() => handleChange("refund_policy", '5')}
                                               className="hidden"
                                        />
                                        <div className="flex text-gray-500 md:text-sm text-xs mt-2">
                                            <div
                                                className={`w-full ml-4 p-3 
                                    ${(roomFormData.refund_policy.startsWith('엄격한') ||
                                                    roomFormData.refund_policy === "5") && "bg-gray-50 rounded-xl"}`}
                                            >
                                                <div className="my-2">
                                                    • 체크인 7일 전까지: 50% 환불
                                                </div>
                                                <div className="my-2">
                                                    • 체크인 7일 전 ~ 당일: 환불 불가
                                                </div>
                                                <div className="my-2">
                                                    • 체크인 이후: 환불 불가
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {currentStep === 14 && (
                    <>
                        {roomFormData.room_type === 'LODGE' ? (
                            /* 사업자 신고증 */
                            <div>
                                {/*안내*/}
                                <div className="p-4 rounded-xl bg-roomi-000">
                                    <div className="flex items-center text-roomi m-2">
                                        <div className="w-5 h-5 flex_center border border-roomi rounded-full">
                                            <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                        </div>
                                        <div className="ml-4 font-bold">안내사항</div>
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                        <div className="p-1 px-2">
                                            <strong> · </strong>관할 기관에서 발급한 공식 서류만 인정됩니다.
                                        </div>
                                        <div className="p-1 px-2">
                                            <strong> · </strong>서류 정보가 명확하게 보이도록 업로드해주시기 바랍니다.
                                        </div>
                                        <div className="p-1 px-2">
                                            <strong> · </strong>서류의 정보와 입력하신 정보가 일치해야 합니다.
                                        </div>
                                        <div className="p-1 px-2">
                                            <strong> · </strong>인증 심사는 영업일 기준 1~3일이 소요됩니다.
                                        </div>
                                    </div>
                                </div>
                                {/*사업자 정보*/}
                                <div className="mt-4">
                                    <div className="font-bold">사업자 정보</div>
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={roomFormData.business_representative}
                                            onChange={(e) => handleChange("business_representative", e.target.value)}
                                            placeholder="대표자명"
                                            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-roomi"
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={roomFormData.business_number}
                                            onChange={(e) => handleChange("business_number", e.target.value)}
                                            placeholder="사업자 등록번호"
                                            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-roomi"
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={roomFormData.business_name}
                                            onChange={(e) => handleChange("business_name", e.target.value)}
                                            placeholder="상호명"
                                            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-roomi"
                                        />
                                    </div>
                                    {/*사업장 주소*/}
                                    <div className="mt-2 relative">
                                        <input
                                            type="text"
                                            value={roomFormData.business_address}
                                            readOnly
                                            onClick={() => setDaumAddressModal(true)}
                                            placeholder="주소"
                                            className="w-full border border-gray-300 rounded-xl p-3 pr-10 cursor-pointer focus:outline-none focus:border-roomi"
                                        />
                                        <div className="absolute right-3.5 top-3 text-roomi pointer-events-none">
                                            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4"/>
                                        </div>
                                        <Modal
                                            isOpen={daumAddressModal}
                                            onRequestClose={() => setDaumAddressModal(false)}
                                            className="bg-white p-6 rounded-xl border border-gray-300 mx-auto"
                                            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                                        >
                                            <DaumPostcode
                                                style={{width: 400, height: 600}}
                                                onComplete={handleBusinessAddress}
                                            />
                                        </Modal>
                                        <input
                                            type="text"
                                            value={roomFormData.business_additionalAddress}
                                            onChange={(e) => handleChange("business_additionalAddress", e.target.value)}
                                            placeholder="상세 주소"
                                            className="w-full border border-gray-300 rounded-xl p-3 mt-2 focus:outline-none focus:border-roomi"
                                        />
                                    </div>
                                    {/*사업장 종류*/}
                                    <div className="mt-2">
                                        <select
                                            value={roomFormData.business_licenseType}
                                            onChange={(e) => handleChange("business_licenseType", e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-roomi text-gray-700"
                                        >
                                            <option value="">사업장 종류를 선택해주세요</option>
                                            {businessLicenseType.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/*사업자 등록증*/}
                                <div className="mt-4">
                                    <div className="font-bold">사업자 등록증</div>
                                    <div className="text-gray-600 text-sm mt-1">
                                        정확한 서류를 업로드하고 사업자 정보를 입력해야 인증을 받을 수 있습니다.
                                    </div>
                                    {renderBusinessUploadSection(
                                        "사업자 등록증",
                                        "사업자 등록증을 업로드 해주세요.",
                                        "business_licenseFile"
                                    )}

                                    {renderBusinessUploadSection(
                                        "신분증 사본",
                                        "사업자 등록증에 기재 된 대표자 명의의 신분증 사본을 업로드 해주세요.",
                                        "business_identificationFile"
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* 미리보기 */
                            <div className="flex_center py-10">
                                <button
                                    type="button"
                                    className="md:w-1/3 w-full bg-roomi rounded-xl text-lg text-white p-4"
                                    onClick={() => setRoomPreview(true)}
                                >
                                    미리보기
                                </button>
                            </div>
                        )}
                    </>
                )}
                {currentStep === 15 && (
                    /* 미리보기 */
                    <div className="flex_center py-10">
                        <button
                            type="button"
                            className="md:w-1/3 w-full bg-roomi rounded-xl text-lg text-white p-4"
                            onClick={() => setRoomPreview(true)}
                        >
                            미리보기
                        </button>
                    </div>
                )}
            </div>

            {/* 바텀 네비게이터 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border border-gray-200 p-4 z-50">
                <div className="flex justify-between items-center max-w-screen-lg mx-auto">
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            className="flex items-center px-6 py-3 text-roomi font-medium"
                            onClick={handlePrev}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            이전
                        </button>
                    ) : (
                        <div />
                    )}

                    {/*<div className="text-sm text-gray-500">*/}
                    {/*    {currentStep} / {totalSteps}*/}
                    {/*</div>*/}

                    {currentStep === totalSteps ? (
                        <button
                            type="button"
                            className="px-6 py-3 bg-roomi text-white rounded-xl font-medium disabled:opacity-50"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {mode === "insert" ? "등록" : "저장"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="px-6 py-3 bg-roomi text-white rounded-xl font-medium disabled:opacity-50"
                            onClick={handleNext}
                            disabled={loading}
                        >
                            다음
                        </button>
                    )}
                </div>
            </div>
            {/* 미리보기 모달 */}
            {roomPreview && (
                <RoomPreviewModal visible={roomPreview} onClose={() => setRoomPreview(false)} room={roomFormData}/>
            )}

            {/* 로딩 오버레이 */}
            {loading && (
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
                        {mode === "insert" ? (
                            <div className="mt-2">등록중...</div>
                        ) : (
                            <div className="mt-2">수정중...</div>
                        )}
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={() => navigate("/host")}
                title={mode === "insert" ? "방 등록을 종료하시겠습니까?" : "방 수정을 종료하시겠습니까?"}
                confirmText="나가기"
                cancelText="취소"
                icon="question"
                confirmButtonStyle="danger"
            />

            {imageAlertOpen && (
                <CommonAlert
                    isOpen={imageAlertOpen}
                    onRequestClose={() => setImageAlertOpen(false)}
                    content="최대 50장까지만 업로드가 가능합니다."
                />
            )}
            {uploadAlertOpen && (
                <CommonAlert
                    isOpen={uploadAlertOpen}
                    onRequestClose={() => setUploadAlertOpen(false)}
                    content="이미지 파일만 업로드 가능합니다."
                />
            )}
            {tagAlertOpen && (
                <CommonAlert
                    isOpen={tagAlertOpen}
                    onRequestClose={() => setTagAlertOpen(false)}
                    content="이미 추가된 태그입니다."
                />
            )}
        </form>
    );
};

export default MyRoomForm;
