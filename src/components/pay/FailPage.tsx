import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";
import {PaymentFailedResponse} from "../../types/PaymentResponse";


const FailPage = ({res, modalClose}: { res: PaymentFailedResponse; modalClose: () => void; }) => {
    const [message, setMessage] = useState<string>();

    // res 가 바뀔 때마다 이펙트가 재실행됩니다.
    useEffect(() => {
        if (res && res.failure) {
            setMessage(res.failure.pgMessage);
        }
    }, [res]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 text-center font-sans">
            <div className="border border-gray-300 rounded-lg p-8 mt-5 bg-gray-100 relative">
                <div className="absolute top-2 right-2.5">
                    <button type="button" onClick={modalClose}>
                        <FontAwesomeIcon icon={faX} />
                    </button>
                </div>
                <div className="w-16 h-16 mx-auto mb-5 bg-red-500 rounded-full flex_center">
                    <FontAwesomeIcon icon={faX} className="text-white text-xxxl"/>
                </div>
                <h1 className="text-xl font-semibold mb-4">결제 처리 중 오류가 발생했습니다</h1>
                <div
                    id="payment-details"
                    className="text-left mx-auto bg-white p-4 rounded-md border border-gray-200 max-w-md text-sm text-gray-800"
                >
                    {message ? (
                        <p className="flex">
                            <span>{message}</span>
                        </p>
                    ) : (
                        <p>오류 정보를 불러오는 중...</p>
                    )}
                </div>
                <p className="mt-6 text-sm text-gray-600 italic">
                    문제가 지속되면 다른 결제 수단을 시도하거나 고객센터에 문의해주세요.
                </p>
            </div>
        </div>
    );
};

export default FailPage;
