import React, {useEffect, useState} from 'react';
import Modal from "react-modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBan,
    faBath,
    faCalendarAlt,
    faCalendarWeek,
    faCircleDot, faCircleXmark, faCommentDots,
    faDoorOpen,
    faElevator,
    faExclamationCircle,
    faHome,
    faHouseUser,
    faInfoCircle,
    faLocationDot,
    faMapLocationDot,
    faMapPin, faMoneyBillTransfer,
    faMoneyBillWave,
    faPlusCircle,
    faSquareParking,
    faSwimmingPool,
    faUserCheck, faUserCircle,
    faUtensils,
    faX
} from "@fortawesome/free-solid-svg-icons";
import {ImageItem, RoomFormData} from "../../../types/rooms";
import ImgCarousel from "../../util/ImgCarousel";
import {faBell, faCopy} from "@fortawesome/free-regular-svg-icons";
import {facilityIcons} from "../../../types/facilityIcons";
import {useTranslation} from "react-i18next";
import '../../../css/RoomPreviewModal.css';
import CommonModal from "../../util/CommonModal";

export default function RoomPreviewModal({visible, onClose, room}: Readonly<{
    visible: boolean,
    onClose: () => void,
    room: RoomFormData
}>) {
    const {t} = useTranslation();
    const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);

    useEffect(() => {
        if (room.detail_urls && room.detail_urls.length > 0) {
            const existingImages = room.detail_urls.map((file) => ({
                file,
                previewUrl: URL.createObjectURL(file),
            }));
            setSelectedImages(existingImages);
        }
    }, [room.detail_urls]);

    return (
        <CommonModal 
            isOpen={visible}
            onRequestClose={onClose}
            title="미리보기"
            contentClassName="!w-full !m-0"
        >
            <div className="min-h-screen">
                {/* 숙소 미리보기 */}
                <div>
                    <div className="md:w-3/5 w-full mx-auto md:px-0">
                        {/* 이미지 갤러리 영역 */}
                        <div className="relative mb-10">
                            {room.detail_urls && room.detail_urls.length > 0 ? (
                                <ImgCarousel
                                    images={selectedImages.map(item => item.previewUrl)}
                                    customClass="md:rounded-lg h-64 md:h-[30rem] object-cover"
                                />
                            ) : (
                                <img
                                    src="/default-image.jpg"
                                    alt="thumbnail"
                                    className="w-full md:h-[30rem] h-64 object-cover rounded-lg"
                                />
                            )}
                        </div>

                        <div className="px-4 md:px-1 space-y-8">

                            {/* 제목 */}
                            <h1 className="text-3xl font-bold mb-4 text-gray-800">{room.title}</h1>

                            {/* 가격 및 관리비 설명 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-roomi mr-2"/>
                                    {t("가격")}
                                </h2>

                                {/* Main pricing grid */}
                                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 shadow-sm">
                                    <div className="text-gray-700 grid md:grid-cols-2 gap-6">
                                        {/* 월 단위 */}
                                        {typeof room.month_price === 'number' && room.month_price > 0 && (
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-medium text-gray-800 mb-2 pb-1 border-b border-gray-200 flex items-center">
                                                    <FontAwesomeIcon icon={faCalendarAlt}
                                                                     className="text-roomi mr-2 text-sm"/>
                                                    월 단위
                                                </h3>
                                                <div
                                                    className="flex justify-between items-center py-2 rounded-md px-2 transition-all">
                                                    <span className="text-gray-600">{t("월 가격")}</span>
                                                    <span className="font-medium text-roomi">
                                                        {room.month_price.toLocaleString()}
                                                    </span>
                                                </div>
                                                {typeof room.maintenance_fee_month === 'number' && room.maintenance_fee_month > 0 && (
                                                    <div
                                                        className="flex justify-between items-center py-2 rounded-md px-2 transition-all">
                                                        <span className="text-gray-600">{t("service_charge")}</span>
                                                        <span className="font-medium">
                                                          {room.maintenance_fee_month.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* 주 단위 */}
                                        {typeof room.week_price === 'number' && room.week_price > 0 && (
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-medium text-gray-800 mb-2 pb-1 border-b border-gray-200 flex items-center">
                                                    <FontAwesomeIcon icon={faCalendarWeek}
                                                                     className="text-roomi mr-2 text-sm"/>
                                                    주 단위
                                                </h3>
                                                <div
                                                    className="flex justify-between items-center py-2 rounded-md px-2 transition-all">
                                                    <span className="text-gray-600">{t("주 가격")}</span>
                                                    <span className="font-medium text-roomi">
                                                       {room.week_price.toLocaleString()}
                                                    </span>
                                                </div>
                                                {typeof room.maintenance_fee_week === 'number' && room.maintenance_fee_week > 0 && (
                                                    <div
                                                        className="flex justify-between items-center py-2 rounded-md px-2 transition-all">
                                                        <span className="text-gray-600">{t("service_charge")}</span>
                                                        <span className="font-medium">
                                                            {room.maintenance_fee_week.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Maintenance details */}
                                <div className="mt-6 ml-1">
                                    <h3 className="text-gray-800 font-medium mb-3 flex items-center">
                                        <FontAwesomeIcon icon={faInfoCircle} className="text-roomi mr-2"/>
                                        {t('서비스 비용 포함 내역')}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line pl-1">
                                        {t('종합 시설 관리 서비스 비용 (인터넷, 운영비 포함)\n청소 서비스, 보안 서비스, 시설 유지 관리 서비스 이용료 포함\n공용 공간 편의 서비스, 24시간 안전 관리 서비스 포함 실내 환경 관리(냉난방), 엘리베이터 유지 서비스, 주차 편의 서비스 이용료, 공용 시설 이용 서비스, 인터넷 연결 서비스, 종합 생활 편의 서비스 비용 포함')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <FontAwesomeIcon icon={faHome} className="text-roomi mr-2"/>
                                    {t("공간 안내")}
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap ml-1">{room.detail.description}</p>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <FontAwesomeIcon icon={faHouseUser} className="text-roomi mr-2"/>
                                    {t("room_info")}
                                </h2>

                                {/* 핵심 정보 (방, 화장실, 주차, 엘리베이터) - 상단 그리드 */}
                                <div className="grid grid-cols-4 gap-2 mt-4 mb-6 border-b border-gray-100 pb-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2">
                                            <FontAwesomeIcon icon={faDoorOpen}
                                                             className="text-xl sm:text-2xl text-gray-700"/>
                                        </div>
                                        <p className="font-medium text-sm sm:text-base">{t("방")} {room.detail.room_count ?? 0}{t("개")}</p>
                                    </div>

                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2">
                                            <FontAwesomeIcon icon={faBath}
                                                             className="text-xl sm:text-2xl text-gray-700"/>
                                        </div>
                                        <p className="font-medium text-sm sm:text-base">{t("화장실")} {room.detail.bathroom_count ?? 0}{t("개")}</p>
                                    </div>

                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2">
                                            <FontAwesomeIcon icon={faSquareParking}
                                                             className="text-xl sm:text-2xl text-gray-700"/>
                                        </div>
                                        <p className="font-medium text-sm sm:text-base">{room.has_parking ? "주차가능" : "주차불가"}</p>
                                    </div>

                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2">
                                            <FontAwesomeIcon icon={faElevator}
                                                             className="text-xl sm:text-2xl text-gray-700"/>
                                        </div>
                                        <p className="font-medium text-sm sm:text-base">{room.has_elevator ? "있음" : "없음"}</p>
                                    </div>
                                </div>

                                {/* 상세 정보 - 모바일에서는 1열, 데스크톱에서는 2열 그리드 레이아웃 */}
                                <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-4 sm:space-y-0">
                                    {/* 첫 번째 항목 그룹 */}
                                    <div className="space-y-3">
                                        <div
                                            className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 text-sm sm:text-base">{t("전용 면적")}</span>
                                            <span
                                                className="font-medium text-sm sm:text-base">{`${room.detail.floor_area ?? 0}m²`}</span>
                                        </div>

                                        <div
                                            className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 text-sm sm:text-base">{t("건물 유형")}</span>
                                            <span
                                                className="font-medium text-sm sm:text-base">{room.building_type || "-"}</span>
                                        </div>


                                        <div
                                            className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 text-sm sm:text-base">{t("최대이용인원")}</span>
                                            <span
                                                className="font-medium text-sm sm:text-base">{`${room.detail.max_guests ?? 0}${t('guest_unit')}`}</span>
                                        </div>
                                    </div>

                                    {/* 두 번째 항목 그룹 */}
                                    <div className="space-y-3">
                                        <div
                                            className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 text-sm sm:text-base">{t("숙소유형")}</span>
                                            <span className="font-medium text-sm sm:text-base">
                                                {room.room_type === "LEASE" ? "주/월 단위 단기임대 공간" : "사업자 신고 완료 공간"}
                                            </span>
                                        </div>

                                        <div
                                            className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 text-sm sm:text-base">{t("층수")}</span>
                                            <span
                                                className="font-medium text-sm sm:text-base">{`${room.detail.floor ?? 0}층`}</span>
                                        </div>


                                        <div
                                            className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600 text-sm sm:text-base">{t("입실/퇴실")}</span>
                                            <span
                                                className="font-medium text-sm sm:text-base">{`${room.detail.check_in_time ?? "0"} / ${room.detail.check_out_time ?? "0"}`}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 제공 서비스 */}
                            {(room.detail.breakfast_service || room.detail.checkin_service) && (
                                <div className="space-y-4 pb-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                        <FontAwesomeIcon icon={faBell} className="text-roomi mr-2"/>
                                        {t("제공 서비스")}
                                    </h2>

                                    <div className="bg-white rounded-lg p-4">
                                        <div className="space-y-3">
                                            {room.detail.breakfast_service && (
                                                <div
                                                    className="flex items-center p-2 hover:bg-white transition-colors rounded-md">
                                                    <div
                                                        className="w-10 h-10 rounded-full bg-roomi-000 flex_center mr-4 flex-shrink-0">
                                                        <FontAwesomeIcon icon={faUtensils}
                                                                         className="text-roomi text-lg"/>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-800 mb-0.5">{t("조식 서비스")}</h3>
                                                        <p className="text-sm text-gray-600">{room.detail.breakfast_service}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {room.detail.checkin_service && (
                                                <div
                                                    className="flex items-center p-2 hover:bg-white transition-colors rounded-md">
                                                    <div
                                                        className="w-10 h-10 rounded-full bg-roomi-000 flex_center mr-4 flex-shrink-0">
                                                        <FontAwesomeIcon icon={faUserCheck}
                                                                         className="text-roomi text-lg"/>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-800 mb-0.5">{t("체크인 서비스")}</h3>
                                                        <p className="text-sm text-gray-600">{room.detail.checkin_service}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 추가 서비스가 있다면 이곳에 추가 */}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 편의시설 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <FontAwesomeIcon icon={faSwimmingPool} className="text-roomi mr-2"/>
                                    {t("기본 옵션")}
                                </h2>

                                <div className="grid grid-cols-4 gap-3 md:gap-6 mt-2">
                                    {room.detail.facilities &&
                                        Object.entries(room.detail.facilities)
                                            .filter(([_, value]) => value)
                                            .map(([key, value], index) => (
                                                <div key={index} className="flex flex-col items-center text-center">
                                                    <div
                                                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-1 md:mb-2 opacity-80">
                                                        <FontAwesomeIcon icon={facilityIcons[key]}
                                                                         className="text-lg md:text-2xl"/>
                                                    </div>
                                                    <p className="text-xs md:text-sm text-gray-800">{value}</p>
                                                </div>
                                            ))}
                                </div>
                            </div>

                            {/* 추가 시설 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <FontAwesomeIcon icon={faPlusCircle} className="text-roomi mr-2"/>
                                    {t("추가시설")}
                                </h2>

                                <div className="grid grid-cols-4 gap-3 md:gap-6 mt-2">
                                    {room.detail.additional_facilities &&
                                        Object.entries(room.detail.additional_facilities)
                                            .filter(([_, value]) => value)
                                            .map(([key, value], index) => (
                                                <div key={index} className="flex flex-col items-center text-center">
                                                    <div
                                                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-1 md:mb-2 opacity-80">
                                                        <FontAwesomeIcon icon={facilityIcons[key]}
                                                                         className="text-lg md:text-2xl"/>
                                                    </div>
                                                    <p className="text-xs md:text-sm text-gray-800">{value}</p>
                                                </div>
                                            ))}
                                </div>
                            </div>

                            {/* 위치 정보 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <FontAwesomeIcon icon={faLocationDot} className="text-roomi mr-2"/>
                                    {t("위치정보")}
                                </h2>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex items-start">
                                        <div className="flex_center mr-3 mt-1 w-4 h-4">
                                            <FontAwesomeIcon icon={faMapLocationDot} className="text-gray-600 text-lg"/>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-800 mb-1">{t("교통 안내")}</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">{room.detail.transportation_info}</p>
                                        </div>
                                    </div>

                                    {room.address && (
                                        <div className="flex items-start mt-3">
                                            <div className="flex_center mr-3 mt-1 w-4 h-4">
                                                <FontAwesomeIcon icon={faMapPin} className="text-gray-600 text-lg"/>
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-sm font-medium text-gray-800 mb-1">{t("주소")}</h3>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-600">{room.address}</p>
                                                    <button
                                                        className="ml-2 p-1.5 text-gray-500 hover:text-roomi hover:bg-gray-100 rounded-full transition-colors"
                                                        title={t("주소 복사")}
                                                        disabled
                                                    >
                                                        <FontAwesomeIcon icon={faCopy} className="text-sm"/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/*<div*/}
                                {/*    className="h-60 md:h-80 rounded-lg overflow-hidden shadow-sm border border-gray-100">*/}
                                {/*    <NaverMapRoom room={room}/>*/}
                                {/*</div>*/}
                            </div>

                            {/* 유의사항 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="text-roomi mr-2"/>
                                    {t("유의사항")}
                                </h2>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    {room.detail.house_rules && room.detail.house_rules.length > 0 && (
                                        <ul className="space-y-2.5 text-gray-700">
                                            {room.detail.house_rules.split(/\\n|\n/).map((rule, index) => (
                                                <li key={index} className="flex items-baseline">
                                                    <span className="text-sm">{rule.trim()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* 금지사항 섹션 - 데이터가 있을 때만 표시 */}
                                    {room.detail.prohibitions && room.detail.prohibitions.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <h3 className="text-base font-medium text-gray-800 mb-3 flex items-center">
                                                <FontAwesomeIcon icon={faBan} className="text-red-500 mr-2 text-sm"/>
                                                {t("금지사항")}
                                            </h3>
                                            <ul className="space-y-2.5 text-gray-700">
                                                {room.detail.prohibitions.map((item, index) => (
                                                    <li key={index} className="flex items-baseline">
                                                        <FontAwesomeIcon
                                                            icon={faCircleXmark}
                                                            className="text-red-400 mr-3 text-sm flex-shrink-0"
                                                        />
                                                        <span className="text-sm text-gray-700">{t(item)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* 호스트 정보 */}
                            <div className="space-y-4 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <FontAwesomeIcon icon={faUserCircle} className="text-roomi mr-2"/>
                                    {t("호스트 정보")}
                                </h2>

                                <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="mr-4">
                                                <img
                                                    src={'/assets/images/profile.png'}
                                                    alt="프로필사진"
                                                    className="rounded-full w-16 h-16 object-cover border-2 border-white shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800 text-lg">{localStorage.getItem('userName')}</div>
                                                <div className="text-gray-500 text-sm">호스트</div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="px-5 py-2.5 rounded-lg bg-roomi text-white text-sm font-medium hover:bg-roomi-1 transition-colors shadow-sm flex items-center"
                                            disabled
                                        >
                                            <FontAwesomeIcon icon={faCommentDots} className="mr-2"/>
                                            채팅하기
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 환불정책 */}
                            <div className="space-y-4 pb-6">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <FontAwesomeIcon icon={faMoneyBillTransfer} className="text-roomi mr-2"/>
                                    {t("환불정책")}
                                </h2>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-2.5">
                                        {room?.refund_policy
                                            ? room.refund_policy.replace(/\\n/g, '\n').split('\n').map((line, index) => (
                                                <div key={index} className="flex items-baseline">
                                                    {line.startsWith('•') ? (
                                                        <>
                                                            <FontAwesomeIcon icon={faCircleDot}
                                                                             className="text-roomi mr-3 text-sm flex-shrink-0"/>
                                                            <span
                                                                className="text-sm text-gray-700">{line.substring(1).trim()}</span>
                                                        </>
                                                    ) : (
                                                        <span
                                                            className={`text-sm ${index === 0 ? "font-medium text-gray-800" : "text-gray-700"}`}>
                                                                {line}
                                                            </span>
                                                    )}
                                                </div>
                                            ))
                                            : '유연한 환불 정책\n• 체크인 24시간 전까지 무료 취소\n• 체크인 24시간 전까지: 100% 환불\n• 체크인 24시간 전 ~ 당일: 50% 환불\n• 체크인 이후: 환불 불가'.split('\n').map((line, index) => (
                                                <div key={index} className="flex items-baseline">
                                                    {line.startsWith('•') ? (
                                                        <>
                                                            <FontAwesomeIcon icon={faCircleDot}
                                                                             className="text-roomi mr-3 text-sm flex-shrink-0"/>
                                                            <span
                                                                className="text-sm text-gray-700">{line.substring(1).trim()}</span>
                                                        </>
                                                    ) : (
                                                        <span
                                                            className={`text-sm ${index === 0 ? "font-medium text-gray-800" : "text-gray-700"}`}>
                                                                {line}
                                                            </span>
                                                    )}
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CommonModal>
    );
};
