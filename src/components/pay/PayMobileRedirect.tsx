import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {useLocation, useNavigate} from "react-router-dom";
import {confirmPayment, getVirtualAccountInfo, verifyPayment} from "../../api/api";
import {
    PaymentFailedResponse,
    PaymentSuccessResponse,
    SuccessVirtualAccountResponse
} from "../../types/PaymentResponse";
import SuccessVirtualAccountPage from "./SuccessVirtualAccountPage";
import SuccessPage from "./SuccessPage";
import FailPage from "./FailPage";

export default function PayMobileRedirect() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const paymentId = searchParams.get('paymentId');

    const [selectedPayment, setSelectedPayment] = useState("CARD");

    // 결제 성공 상태
    const [paymentSuccessResponse, setPaymentSuccessResponse] = useState<PaymentSuccessResponse | null>(null);
    const [virtualAccountSuccessResponse, setVirtualAccountSuccessResponse] = useState<SuccessVirtualAccountResponse | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    // 결제 실패 상태
    const [paymentFailedResponse, setPaymentFailedResponse] = useState<PaymentFailedResponse | null>(null);

    useEffect(() => {
        redirectVerifyPayment();
    }, []);

    const redirectVerifyPayment = async () => {
        if (paymentId) {
            // 결제 후 검증
            const verifyPaymentResponse = await verifyPayment(paymentId);
            const verifyPaymentResponseJson = await verifyPaymentResponse.json();
            console.log('결제 후 검증 verifyPaymentResponse', verifyPaymentResponse);
            console.log('결제 후 검증 verifyPaymentResponseJson', verifyPaymentResponseJson)

            if (verifyPaymentResponseJson.method) {
                console.log('메소드 타입 있음 ㅋ',verifyPaymentResponseJson.method.type);
                console.log('메소드 타입 있음 ㅋ 검증 status', verifyPaymentResponseJson.status);

                if (verifyPaymentResponseJson.method.type === "PaymentMethodVirtualAccount") {
                    setSelectedPayment("VIRTUAL_ACCOUNT");
                    /* 가상계좌 발급 성공 */
                    try {
                        const completeResponse = await getVirtualAccountInfo(paymentId);
                        const paymentComplete = await completeResponse.json();
                        console.log('발급 된 가상계좌 조회 json',paymentComplete);

                        if (!completeResponse.ok) {
                            console.log('발급 된 가상계좌 조회 중 오류');
                            alert('발급 된 가상계좌 조회 중 오류가 발생했습니다.');
                            return;
                        }

                        if (verifyPaymentResponseJson.status === "VIRTUAL_ACCOUNT_ISSUED") {
                            setVirtualAccountSuccessResponse(paymentComplete);
                            setPaymentSuccess(true);
                        } else {
                            setPaymentFailedResponse(verifyPaymentResponseJson);
                        }
                    } catch (e) {
                        console.error('발급 된 가상계좌 조회 중 오류', e);
                    }
                } else if (verifyPaymentResponseJson.method.type === "PaymentMethodCard") {
                    /* 결제 성공 */
                    setPaymentSuccessResponse(verifyPaymentResponseJson);
                    try {
                        // const completeResponse = await confirmPayment(paymentId, bookData.reservation.id.toString());
                        // const paymentComplete = await completeResponse.json();
                        //
                        // if (!paymentComplete.success) {
                        //     console.log('결제 상태 업데이트 중 오류');
                        //     alert('결제 상태 업데이트 중 오류가 발생했습니다.');
                        //     return;
                        // }
                        setPaymentSuccess(true);
                    } catch (e) {
                        console.error('결제 상태 업데이트 중 오류', e);
                    }
                }
            } else {
                // 메소드 타입이 없으면 결제 실패
                console.log('여기는 결제 실패일때 임 FAILED');
                console.log('여기는 결제 실패일때 임 검증 status', verifyPaymentResponseJson.status);
                setPaymentFailedResponse(verifyPaymentResponseJson);
            }

        }
    };

    return (
        <div>
            {(paymentSuccess) ? (
                /* 결제 성공 모달 */
                <>
                    {selectedPayment === "VIRTUAL_ACCOUNT" ? (
                        /* 가상계좌 발급 성공 */
                        <SuccessVirtualAccountPage res={virtualAccountSuccessResponse!} modalClose={() => navigate('/myPage')}/>
                    ) : (
                        /* 카드결제 성공 */
                        <SuccessPage res={paymentSuccessResponse!}/>
                    )}
                </>
            ) : (
                /* 결제 실패 모달 */
                <FailPage res={paymentFailedResponse!} modalClose={() => navigate('/myPage')}/>
            )}
        </div>
    );
};
