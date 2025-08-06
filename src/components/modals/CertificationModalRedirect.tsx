import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {useLocation, useNavigate} from "react-router-dom";
import {uploadIdentification} from "../../api/api";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faX} from "@fortawesome/free-solid-svg-icons";

export default function CertificationModalRedirect() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const success = searchParams.get('success');
    const merchantUid = searchParams.get('imp_uid');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleGoMyInfo = () => {
        navigate('/myPage/내%20정보');
        window.location.reload();
    };

    useEffect(() => {
        handleCertificationComplete();
    }, []);

    // 인증 완료 콜백 함수
    const handleCertificationComplete = async () => {

        if (success === 'true' && merchantUid) {
            console.log("인증 성공! (모바일 리다이렉트)");
            const res = await handleUploadIdentification(merchantUid);
            if (!res) alert('인증 처리 중 문제가 발생하였습니다. 다시 시도해주세요.');
            setIsSuccess(true);
        } else {
            console.log("인증 실패 (모바일 리다이렉트)");
            setIsSuccess(false);
            alert('본인인증에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 인증 완료 처리 api 호출 함수
    const handleUploadIdentification = async (impUid: string) => {
        try {
            const response = await uploadIdentification(impUid);
            const responseJson = await response.json();
            return responseJson.success;
        } catch (e) {
            console.error('인증 완료 처리 실패', e);
            setIsSuccess(false);
            return false;
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 text-center font-sans">
            <div className="border border-gray-300 rounded-lg p-8 mt-5 bg-gray-100 relative">
                {isSuccess ? (
                    <>
                        <div className="w-16 h-16 mx-auto mb-5 bg-green-500 rounded-full flex_center">
                            <FontAwesomeIcon icon={faCheck} className="text-white text-xxxl"/>
                        </div>
                        <h1 className="text-xl font-semibold mb-4">통합 인증이 정상적으로 완료되었습니다</h1>
                        <div id="payment-details"
                             className="text-left mx-auto bg-white p-4 rounded-md border border-gray-200 max-w-md text-sm text-gray-800">
                            <p className="italic">인증이 완료 되었습니다.</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 mx-auto mb-5 bg-red-500 rounded-full flex_center">
                            <FontAwesomeIcon icon={faX} className="text-white text-xxxl"/>
                        </div>
                        <h1 className="text-xl font-semibold mb-4">통합 인증 처리 중 오류가 발생했습니다</h1>
                        <div id="payment-details"
                             className="text-left mx-auto bg-white p-4 rounded-md border border-gray-200 max-w-md text-sm text-gray-800">
                            <p className="italic">문제가 지속되면 고객센터에 문의해주세요.</p>
                        </div>
                    </>
                )}
                <button
                    id="openAppButton"
                    className="mt-5 bg-roomi hover:bg-roomi-3 text-white py-2 px-6 rounded text-sm"
                    onClick={handleGoMyInfo}
                >
                    마이페이지로 이동
                </button>
            </div>
        </div>
    );
};
