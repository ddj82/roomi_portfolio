import React, {useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopy, faSquarePlus} from "@fortawesome/free-regular-svg-icons";
import CommonModal from "../../util/CommonModal";
import {RoomData} from "../../../types/rooms";
import CustomSelect from "../../util/CustomSelect";
import {useNavigate} from "react-router-dom";

interface RoomInsertBtnProps {
    isOpen: boolean,
    onRequestClose: () => void,
    handleInsertBtn: () => void,
    isRoomCopy: boolean,
    roomCopyOpen: () => void,
    roomCopyClose: () => void,
    rooms: RoomData[]
}

const RoomInsertBtn = ({
                           isOpen,
                           onRequestClose,
                           handleInsertBtn,
                           isRoomCopy,
                           roomCopyOpen,
                           roomCopyClose,
                           rooms
                       }: RoomInsertBtnProps) => {

    const [selectedRoomId, setSelectedRoomId] = useState<string | number | null>(null);
    const navigate = useNavigate();

    const handleRoomCopyBtn = () => {
        roomCopyOpen();
        onRequestClose();
    };

    const handleRoomCopy = (selectedRoomId: number | string) => {
        const room = rooms.find((item) => item.id === selectedRoomId);
        roomCopyClose();
        if (room) {
            navigate('/host/insert', { state: { roomToCopy: room } });
        }
    };

    return (
        <>
            {isRoomCopy ? (
                <CommonModal
                    isOpen={isRoomCopy}
                    onRequestClose={roomCopyClose}
                    title="방 복사하기"
                    widthClassName="md:w-[500px] w-[90%]"
                    heightClassName="h-1/2"
                    customClassName="rounded-xl !bg-white"
                    contentClassName="!m-0 !w-full flex flex-col gap-4 h-[76%]"
                >
                    <div className="space-y-4 h-full flex flex-col justify-between">
                        {/* 1) 방 선택 셀렉트박스 */}
                        <div>
                            <CustomSelect
                                options={rooms.map((r, i) => ({id: r.id ?? i, title: r.title}))}
                                value={selectedRoomId}
                                onChange={setSelectedRoomId}
                                placeholder="복사할 방을 선택하세요"
                            />

                            {/* 2) 선택한 방 정보 요약 (선택된 경우에만) */}
                            {selectedRoomId != null && (
                                <div className="p-4 bg-roomi-50 rounded-lg">
                                    <p className="font-semibold">선택된 방:</p>
                                    <p>{rooms.find(r => (r.id ?? rooms.indexOf(r)) === selectedRoomId)?.title}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            {/* 3) 복사 버튼 */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (selectedRoomId != null) {
                                        handleRoomCopy(selectedRoomId);
                                    }
                                }}
                                className="w-full py-2 bg-roomi text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={selectedRoomId == null}
                            >
                                방 복사
                            </button>
                        </div>
                    </div>
                </CommonModal>
            ) : (
                <CommonModal
                    isOpen={isOpen}
                    onRequestClose={onRequestClose}
                    title="방 추가 옵션"
                    widthClassName="md:w-[500px] w-[90%]"
                    heightClassName="h-fit"
                    customClassName="rounded-xl !bg-white"
                    contentClassName="!m-0 !w-full !mb-4 flex flex-col gap-4"
                >
                    <button
                        type="button"
                        onClick={handleInsertBtn}
                        className="w-full"
                    >
                        <div className="flex">
                            <div className="flex_center p-4 rounded-xl bg-roomi-000 text-roomi">
                                <FontAwesomeIcon icon={faSquarePlus} className="w-6 h-6"/>
                                {/*<PlusCircle size="1.5rem" className=""/>*/}
                            </div>
                            <div className="w-full ml-4 flex flex-col items-start justify-center">
                                <div className="font-bold">
                                    방 등록
                                </div>
                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                    새로운 방을 등록합니다.
                                </div>
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="w-full"
                        onClick={handleRoomCopyBtn}
                    >
                        <div className="flex">
                            <div className="flex_center p-4 rounded-xl bg-roomi-000 text-roomi">
                                <FontAwesomeIcon icon={faCopy} className="w-6 h-6"/>
                                {/*<Copy size="1.5rem" className=""/>*/}
                            </div>
                            <div className="w-full ml-4 flex flex-col items-start justify-center">
                                <div className="font-bold">
                                    방 복사
                                </div>
                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                    기존 방을 복사하여 등록합니다.
                                </div>
                            </div>
                        </div>
                    </button>
                </CommonModal>
            )}
        </>
    );
};

export default RoomInsertBtn;
