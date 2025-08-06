import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, Check, X, CheckCircle, AlertTriangle, LogOut } from 'lucide-react';
import {ReservationHistory} from "../../types/rooms";
import dayjs from "dayjs";
import {requestPartialRefundFee} from "../../api/api";
import CommonAlert from "../util/CommonAlert";

interface ContractDetailProps {
    reservation: ReservationHistory;
    onClose: () => void;
    onAccept?: (id: number) => void;
    onReject?: (id: number) => void;
    onCancel?: (id: number) => void;
    onComplete?: (id: number) => void;
    onDelete?: (id: number) => void;
    onRefund?: (id: number) => void;
}
const ContractDetail = ({ reservation, onClose, onAccept, onReject, onCancel, onComplete, onDelete, onRefund }: ContractDetailProps) => {
    // Accordion expansion states
    const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true);
    const [isPricingExpanded, setIsPricingExpanded] = useState(false);
    const [isGuestInfoExpanded, setIsGuestInfoExpanded] = useState(false);
    const [isPoliciesExpanded, setIsPoliciesExpanded] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [errorAlertOpen, setErrorAlertOpen] = useState(false);

    // Refund input states
    const [refundAmount, setRefundAmount] = useState("");
    const [refundReason, setRefundReason] = useState("");

    // Check if the reservation is in progress
    const isReservationInProgress = () => {
        if (!reservation) return false;

        const now = new Date();
        const status = reservation.status?.toUpperCase();
        const checkInDate = reservation.check_in_date ? new Date(reservation.check_in_date) : null;
        const checkOutDate = reservation.check_out_date ? new Date(reservation.check_out_date) : null;

        if (status !== 'CONFIRMED' && status !== 'IN_USE' || !checkInDate || !checkOutDate) {
            return false;
        }

        return now > checkInDate && now < checkOutDate;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    const formatDateRange = (startDate: string, endDate:string) => {
        if (!startDate || !endDate) return '';

        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    };

    const formatPrice = (price: number) => {
        if (!price) return '0';
        return Number(price).toLocaleString();
    };

    const getStatusBadge = () => {
        if (!reservation) return null;

        const status = reservation.status?.toUpperCase() || '';
        const paymentStatus = reservation.payment_status?.toUpperCase() || '';

        const badges = [];

        // Checkout request badge
        if (reservation.is_checkout_requested && !(status === 'COMPLETED' || status === 'CHECKED_OUT')) {
            badges.push(
                <div
                    key="checkout"
                    className="inline-block px-3 py-1 text-sm font-semibold bg-red-100 text-red-800 border border-red-300 rounded-full mr-2"
                >
                    퇴실 요청
                </div>
            );
        }

        // Refund in progress badge
        if ((status === 'COMPLETED' || status === 'CHECKED_OUT') && paymentStatus === 'PENDING') {
            badges.push(
                <div
                    key="refund"
                    className="inline-block px-3 py-1 text-sm font-semibold bg-orange-100 text-orange-800 border border-orange-300 rounded-full mr-2"
                >
                    환불 진행중
                </div>
            );
        }

        // In progress badge
        if (isReservationInProgress() || status === 'IN_USE') {
            badges.push(
                <div
                    key="inProgress"
                    className="inline-block px-3 py-1 text-sm font-semibold bg-green-100 text-green-500 border border-green-300 rounded-full mr-2"
                >
                    이용중
                </div>
            );
        }

        return badges.length > 0 ? <div className="mt-4 flex flex-wrap">{badges}</div> : null;
    };

    const getStatusText = (status:string) => {
        status = status?.toUpperCase() || '';
        if (status === 'REJECTED') return '거절됨'
        if (status === 'CONFIRMED') {
            return reservation.payment_status?.toUpperCase() === 'UNPAID' ? '결제대기' :
                reservation.payment_status?.toUpperCase() === 'PAID' ? '결제완료' : '이용중';
        }
        if (status === 'CANCELLED') return '예약취소';
        if (status === 'PENDING') return '예약대기';
        if (status === 'COMPLETED') return '이용완료';
        if (status === 'IN_USE') return '이용중';
        if (status === 'CHECKED_OUT') return '퇴실완료';
        return '결제 대기';
    };

    const getPaymentStatusText = (status:string) => {
        status = status?.toUpperCase() || '';
        switch (status) {
            case 'PAID': return '결제완료';
            case 'UNPAID': return '미결제';
            case 'REFUNDED': return '환불완료';
            case 'PENDING': return '환불 처리중';
            case 'FAILED' : return '결제실패'
            default: return '알 수 없음';
        }
    };

    const renderActionButtons = () => {
        if (!reservation) return null;

        const status = reservation.status?.toUpperCase() || '';
        const paymentStatus = reservation.payment_status?.toUpperCase() || '';

        // Special case for COMPLETED + PENDING - show deposit deduction button
        if ((status === 'COMPLETED' || status === 'CHECKED_OUT') && paymentStatus === 'PENDING') {
            return (
                <button
                    onClick={() => onRefund && onRefund(reservation.id)}
                    className="w-full py-3 px-4 flex items-center justify-center text-white bg-orange-600 rounded-lg"
                >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    보증금 차감 설정
                </button>
            );
        }

        // Pending reservation: Accept/Reject buttons
        if (status === 'PENDING') {
            return (
                <div className="flex gap-4">
                    <button
                        onClick={() => onAccept && onAccept(reservation.id)}
                        className="flex-1 py-3 px-4 flex items-center justify-center text-white bg-roomi rounded-lg"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        예약 수락
                    </button>
                    <button
                        onClick={() => onReject && onReject(reservation.id)}
                        className="flex-1 py-3 px-4 flex items-center justify-center text-white bg-gray-700 rounded-lg"
                    >
                        <X className="w-4 h-4 mr-2" />
                        예약 거절
                    </button>
                </div>
            );
        }

        // Confirmed/IN_USE and paid
        if ((status === 'CONFIRMED' || status === 'IN_USE') && paymentStatus === 'PAID') {
            if (isReservationInProgress() || status === 'IN_USE') {
                return (<div></div>);
                //     <div className="flex gap-4">
                //         <button
                //             onClick={() => {/* Handle message */}}
                //             className="flex-1 py-3 px-4 flex items-center justify-center text-gray-700 border border-gray-300 rounded-lg"
                //         >
                //             <MessageSquare className="w-4 h-4 mr-2" />
                //             메시지 보내기
                //         </button>
                //         {/*<button*/}
                //         {/*    onClick={() => onComplete && onComplete(reservation.id)}*/}
                //         {/*    className="flex-1 py-3 px-4 flex items-center justify-center text-white bg-blue-600 rounded-lg"*/}
                //         {/*>*/}
                //         {/*    <CheckCircle className="w-4 h-4 mr-2" />*/}
                //         {/*    퇴실 확인*/}
                //         {/*</button>*/}
                //     </div>
                // );
            }
             else {
                // Confirmed but not in progress yet
                return (
                    <div className="flex gap-4">
                        <button
                            onClick={() => {/* Handle message */
                            }}
                            className="flex-1 py-3 px-4 flex items-center justify-center text-gray-700 border border-gray-300 rounded-lg"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            메시지 보내기
                        </button>
                        <button
                            onClick={() => onReject && onReject(reservation.id)}
                            className="flex-1 py-3 px-4 flex items-center justify-center text-white bg-roomi rounded-lg"
                        >
                            <X className="w-4 h-4 mr-2" />
                            예약 거절
                        </button>

                    </div>

                );
            }
        }else if (status === 'CONFIRMED' && paymentStatus === 'UNPAID') {
            return (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => onReject && onReject(reservation.id)}
                        className="w-1/2 max-w-xs flex items-center justify-center py-3 px-4 text-white bg-roomi rounded-lg"
                    >
                        <X className="w-4 h-4 mr-2" />
                        예약 거절
                    </button>
                </div>
            );
        }

        // Completed, Checked Out, or Cancelled: Delete button
        if (status === 'COMPLETED' || status === 'CHECKED_OUT' || status === 'CANCELLED') {
            return (
                <button
                    onClick={() => onDelete && onDelete(reservation.id)}
                    className="w-full py-3 px-4 flex items-center justify-center text-gray-700 border border-gray-300 rounded-lg"
                >
                    <X className="w-4 h-4 mr-2" />
                    예약 삭제
                </button>
            );
        }

        return null;
    };

    const handleCheckoutModal = () => {
        const alreadyRequested = reservation.request_fee_refund_amount > 0;
        setIsAlreadyRequested(alreadyRequested);
        setShowModal(true);
    };

    // Render checkout request info if applicable
    const renderCheckoutRequestInfo = () => {
        if (!reservation || !reservation.is_checkout_requested ||
            !(isReservationInProgress() || reservation.status?.toUpperCase() === 'IN_USE')) {
            return null;
        }

        return (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-4">
                    <LogOut className="w-5 h-5 text-red-700 mr-2" />
                    <h3 className="text-lg font-semibold text-red-900">퇴실 요청 정보</h3>
                </div>

                <div className="flex items-center mb-4">
                    <span className="text-sm text-gray-700 mr-2">요청 시간:</span>
                    <span className="text-sm">{formatDate(reservation.checkout_requested_at.toString())}</span>
                </div>

                <button
                    onClick={handleCheckoutModal}
                    className="w-full py-2 px-4 bg-red-600 text-white rounded"
                >
                    퇴실 요청 상세보기
                </button>
            </div>
        );
    };

    const [showModal, setShowModal] = useState(false);
    const [isAlreadyRequested, setIsAlreadyRequested] = useState(false);
    const [requestedAmount, setRequestedAmount] = useState(0);


    function nl2br(str: string) {
        const result = [];
        const lines = str.split('\n');
        for (let i = 0; i < lines.length; i++) {
            result.push(lines[i]);
            if (i < lines.length - 1) {
                result.push(<br key={i} />);
            }
        }
        return result;
    }

    if (!reservation) return null;

    return (
        <>
            <div className="bg-white rounded-lg overflow-hidden max-w-2xl w-full mx-auto">
                {/* Header */}
                <div className="p-2">
                    {/* Room Image and Info */}
                    <div className="mt-2">
                        {reservation.room?.detail_urls?.[0] ? (
                            <img
                                src={reservation.room.detail_urls[0]}
                                alt="Room image"
                                className="w-full h-full object-cover rounded-xl mb-2"
                                style={{ imageRendering: 'auto' }}
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-sm mb-2">
                                이미지 없음
                            </div>
                        )}

                        <h3 className="mt-2 text-lg font-semibold">
                            {reservation.room?.title || "방 정보 없음"}
                        </h3>
                        <p className="text-gray-600 mt-1 mb-3">{reservation.room?.address || "주소 정보 없음"} , {reservation.room?.address_detail || ""}</p>

                        {/* Status Badges */}
                        {/*{getStatusBadge()}*/}
                    </div>
                </div>

                {/* All Info Sections */}
                <div className="px-1 pb-2 space-y-4">
                    {/* Basic Info */}
                    <div className="rounded-lg p-2">
                        <h4 className="font-semibold mb-2">기본 예약 정보</h4>
                        <table className="w-full">
                            <tbody>
                            <tr className="">
                                <td className="py-2 font-light text-gray-600">예약 번호</td>
                                <td className="py-2 font-light text-right">{reservation.order_id || "-"}</td>
                            </tr>
                            <tr className="">
                                <td className="py-2 font-light text-gray-600">예약 날짜</td>
                                <td className="py-2 font-light text-right">{formatDate(reservation.created_at.toString())}</td>
                            </tr>
                            <tr className="">
                                <td className="py-2 font-light text-gray-600">입실</td>
                                <td className="py-2 font-light text-right">{formatDate(reservation.check_in_date.toString())}</td>
                            </tr>
                            <tr className="">
                                <td className="py-2 font-light text-gray-600">퇴실</td>
                                <td className="py-2 font-light text-right">{formatDate(reservation.check_out_date.toString())}</td>
                            </tr>
                            <tr className="">
                                <td className="py-2 font-light text-gray-600">게스트 수</td>
                                <td className="py-2 font-light text-right">{reservation.guest_count || 1}명</td>
                            </tr>
                            <tr className="">
                                <td className="py-2 font-light text-gray-600">예약 상태</td>
                                <td className="py-2 font-light text-right">{getStatusText(reservation.status)}</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-light text-gray-600 border-b border-gray-300">결제 상태</td>
                                <td className="py-2 font-light text-right border-b border-gray-300 ">{getPaymentStatusText(reservation.payment_status)}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Pricing Info */}
                    <div className="rounded-lg p-2">
                        <h4 className="font-semibold mb-2">요금 정보</h4>
                        <table className="w-full">
                            <tbody>
                            <tr className="">
                                <td className="py-2 font-light text-gray-600">이용 기간</td>
                                <td className="py-2 font-light text-right">{formatDateRange(reservation.check_in_date.toString(), reservation.check_out_date.toString())}</td>
                            </tr>
                            <tr className="">
                                <td className="py-2 font-light text-gray-600">기본 요금</td>
                                <td className="py-2 font-light text-right">{reservation.symbol}{formatPrice(reservation.price)}</td>
                            </tr>
                            <tr className="">
                                <td className="py-2 font-light text-gray-600">관리비</td>
                                <td className="py-2 font-light text-right">{reservation.symbol}{formatPrice(reservation.maintenance_fee)}</td>
                            </tr>
                            <tr className="">
                                <td className="py-2 font-light text-gray-600">보증금</td>
                                <td className="py-2 font-light text-right">{reservation.symbol}{formatPrice(reservation.deposit)}</td>
                            </tr>
                            <tr className="">
                                <td className="py-3 text-gray-800">총 요금</td>
                                <td className="py-3 text-right font-semibold">{reservation.symbol}{formatPrice(reservation.price + reservation.deposit + reservation.maintenance_fee)}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Guest Info */}
                    <div className="bg-gray-50 rounded-lg p-2 ">
                        <h4 className="font-semibold mb-2">게스트 정보</h4>
                        <div className="flex items-start">
                            <div className="flex-1">
                                <h5 className=" flex items-center mt-2 text-sm text-gray-600">예약자 : {reservation.guest?.name || "게스트 정보"}</h5>

                                {reservation.guest?.email && (
                                    <div className="flex items-center mt-1 text-sm text-gray-600">
                                        <span className="mr-2">이메일:</span>
                                        <span>{reservation.guest.email}</span>
                                    </div>
                                )}

                                {reservation.guest?.phone && (
                                    <div className="flex items-center mt-1 text-sm text-gray-600">
                                        <span className="mr-2">전화번호:</span>
                                        <span>{reservation.guest.phone}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => {/* Handle message */}}
                                className="px-3 py-2 border border-roomi-0 text-roomi rounded-lg flex items-center"
                            >
                                <MessageSquare className="w-4 h-4 mr-1"/>
                                메시지
                            </button>
                        </div>
                    </div>

                    {/* Policies */}
                    <div className="bg-gray-50 rounded-lg p-2">
                        <h4 className="font-semibold mb-2">이용 규칙 및 환불 정책</h4>
                        <div className="px-2 space-y-2">
                            <div>
                                <h5 className="text-sm font-semibold mb-2">입실/퇴실</h5>
                                <p className="text-sm text-gray-700">
                                    입실: {reservation.room?.check_in_time || '15:00'},
                                    퇴실: {reservation.room?.check_out_time || '11:00'}
                                </p>
                            </div>

                            <div>
                                <h5 className="text-sm font-semibold mb-2">환불 정책</h5>
                                <div className="text-sm text-gray-700 whitespace-pre-line">
                                    {reservation.room?.refund_policy
                                        ? reservation.room.refund_policy.replace(/\\n/g, '\n').split('\n').map((line, index) => (
                                            <div key={index}>{line}</div>
                                        ))
                                        : '유연한 환불 정책\n• 체크인 24시간 전까지 무료 취소\n• 체크인 24시간 전까지: 100% 환불\n• 체크인 24시간 전 ~ 당일: 50% 환불\n• 체크인 이후: 환불 불가'.split('\n').map((line, index) => (
                                            <div key={index}>{line}</div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checkout Request Info */}
                <div className="px-2">
                    {renderCheckoutRequestInfo()}
                </div>

                {/* Action Buttons */}
                <div className="p-2">
                    {renderActionButtons()}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                        {isAlreadyRequested ? (
                            // ✅ 모달 ①: 퇴실 요청 정보 확인용
                            <>
                                <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center">
                                    <LogOut className="w-5 h-5 mr-2" />
                                    퇴실 요청 정보
                                </h3>
                                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm space-y-2">
                                    <div>요청 시간: {dayjs(reservation.checkout_requested_at).format('YYYY-MM-DD HH:mm')}</div>
                                    <div>요청 금액: {reservation.symbol}{reservation.request_fee_refund_amount.toLocaleString()}</div>
                                    {reservation.request_fee_refund_reason && (
                                        <div>사유: {reservation.request_fee_refund_reason}</div>
                                    )}
                                    <div>
                                        게스트 승인 여부:{" "}
                                        {reservation.guest_accepted_fee
                                            ? <span className="text-green-700 font-semibold">승인 완료</span>
                                            : <span className="text-yellow-700 font-semibold">승인 대기 중</span>}
                                    </div>
                                </div>
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
                                    >
                                        닫기
                                    </button>
                                </div>
                            </>
                        ) : (
                            // ✅ 모달 ②: 퇴실 요청 입력용
                            <>
                                <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center">
                                    <LogOut className="w-5 h-5 mr-2" />
                                    퇴실 요청 보내기
                                </h3>

                                <label className="block text-sm mb-1 text-gray-700">차감할 금액 (₩)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded px-3 py-2 mb-4"
                                    placeholder="예: 30000"
                                    value={requestedAmount}
                                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                                />

                                <label className="block text-sm mb-1 text-gray-700">차감 사유 (선택)</label>
                                <textarea
                                    className="w-full border rounded px-3 py-2"
                                    rows={3}
                                    placeholder="예: 청소비, 파손 등"
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                ></textarea>

                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (requestedAmount <= 0) {
                                                setAlertOpen(true);
                                                return;
                                            }

                                            try {
                                                await requestPartialRefundFee(reservation.id, requestedAmount, refundReason);
                                                setShowModal(false);
                                                window.location.reload(); // ✅ 요청 완료 후 새로고침
                                            } catch (e) {
                                                console.error(e);
                                                setErrorAlertOpen(true);
                                                // alert('요청 중 오류가 발생했습니다.');
                                            }
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        요청 보내기
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            {alertOpen && (
                <CommonAlert
                    isOpen={alertOpen}
                    onRequestClose={() => setAlertOpen(false)}
                    content="차감 금액을 입력해주세요."
                />
            )}
            {errorAlertOpen && (
                <CommonAlert
                    isOpen={errorAlertOpen}
                    onRequestClose={() => setErrorAlertOpen(false)}
                    content="요청 중 오류가 발생했습니다."
                />
            )}
        </>
    );
};

export default ContractDetail;