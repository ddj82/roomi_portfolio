import React, {useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";
import {PaymentSuccessResponse} from "../../types/PaymentResponse";


const SuccessPage = ({res}: { res: PaymentSuccessResponse; }) => {
    const navigate = useNavigate();

    useEffect(() => {
        redirectToApp();
    }, []);

    const redirectToApp = () => {
        const detailsElement = document.getElementById("payment-details");
        if (detailsElement && res) {
            detailsElement.innerHTML = `
                ${res.id ?
                `<p class="flex justify-between"><strong>주문번호:</strong><span>${res.id}</span></p>` : ""}
                ${res.amount.total ?
                `<p class="flex justify-between"><strong>결제금액:</strong><span>${parseInt(String(res.amount.total)).toLocaleString()}원</span></p>` : ""}
                ${res.orderName ?
                `<p class="flex justify-between"><strong>상품명:</strong><span>${res.orderName}</span></p>` : ""}
                ${res.method.type ?
                `<p class="flex justify-between"><strong>결제방법:</strong><span>${getPaymentMethodName(res.method.type)}</span></p>` : ""}
                ${res.status ?
                `<p class="flex justify-between"><strong>상태:</strong><span>${getStatusName(res.status)}</span></p>` : ""}
                ${res.updatedAt ?
                `<p class="flex justify-between"><strong>승인시간:</strong><span>${formatDate(new Date(res.updatedAt))}</span></p>` : ""}
              `;
        }
    };

    const getPaymentMethodName = (method: string): string => {
        const map: Record<string, string> = {
            CARD: "카드",
            PaymentMethodCard: "카드",
            VIRTUAL_ACCOUNT: "가상계좌",
            MOBILE: "휴대폰 소액결제",
            TRANSFER: "실시간 계좌이체",
            EASY_PAY: "간편결제",
            GIFT_CERTIFICATE: "상품권",
        };
        return map[method] || method;
    };

    const getStatusName = (status: string): string => {
        const map: Record<string, string> = {
            PAID: "결제완료",
            FAILED: "결제실패",
        };
        return map[status] || status;
    };

    const formatDate = (date: Date): string =>
        `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;

    const padZero = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 text-center font-sans">
            <div className="border border-gray-300 rounded-lg p-8 mt-5 bg-gray-100 relative">
                <div className="w-16 h-16 mx-auto mb-5 bg-green-500 rounded-full flex_center">
                    <FontAwesomeIcon icon={faCheck} className="text-white text-xxxl"/>
                </div>
                <h1 className="text-xl font-semibold mb-4">결제가 성공적으로 완료되었습니다</h1>
                <div id="payment-details"
                     className="text-left mx-auto bg-white p-4 rounded-md border border-gray-200 max-w-md text-sm text-gray-800">
                    <p>결제 정보를 불러오는 중...</p>
                </div>
                <p className="mt-6 text-sm text-gray-600 italic">
                    자동으로 열리지 않는 경우 아래 버튼을 클릭하세요.
                </p>
                <button
                    id="openAppButton"
                    className="mt-5 bg-roomi hover:bg-roomi-3 text-white py-2 px-6 rounded text-sm"
                    onClick={() => navigate('/myPage')}
                >
                    마이페이지로 이동
                </button>
            </div>
        </div>
    );
};

export default SuccessPage;
