import React, {useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBuildingColumns} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";
import {SuccessVirtualAccountResponse} from "../../types/PaymentResponse";


const SuccessVirtualAccountPage = ({res, modalClose}: { res: SuccessVirtualAccountResponse; modalClose: () => void; }) => {
    const navigate = useNavigate();

    useEffect(() => {
        redirectToApp();
    }, []);

    const redirectToApp = () => {
        const detailsElement = document.getElementById("payment-details");
        if (detailsElement && res) {
            detailsElement.innerHTML = `
                ${res.bank ?
                `<p class="flex justify-between"><strong>은행:</strong><span>${getBankName(res.bank)}</span></p>` : ""}
                ${res.accountNumber ? `
                <p class="flex justify-between">
                    <strong>계좌번호:</strong>
                    <span>
                        ${res.accountNumber}
                        <button
                            onclick="
                                navigator.clipboard.writeText('${res.accountNumber}'); 
                                alert('주소가 클립보드에 복사되었습니다.');
                            "
                            title="주소 복사"
                        >
                            <svg class="h-3 w-3 flex_center" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                <path d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l140.1 0L400 115.9 400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-204.1c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-32-48 0 0 32c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l32 0 0-48-32 0z"/>
                            </svg>
                        </button>
                    </span>
                </p>
                ` : ""}
                ${res.remitteeName ?
                `<p class="flex justify-between"><strong>예금주:</strong><span>${res.remitteeName}</span></p>
                ` : ""}
                ${res.amount.total ?
                `<p class="flex justify-between"><strong>결제금액:</strong><span>${parseInt(String(res.amount.total)).toLocaleString()}원</span></p>` : ""}
                ${res.remitterName ?
                `<p class="flex justify-between mt-2"><strong>입금자명:</strong><span>${res.remitterName}</span></p>` : ""}
                ${res.issuedAt ?
                `<p class="flex justify-between">
                    <strong>입금 기한:</strong>
                    <span class="font-bold text-gray-500">${formatDate(new Date(res.issuedAt))}</span>
                </p>` : ""}
              `;
        }
    };

    const getBankName = (bank: string): string => {
        const map: Record<string, string> = {
            'BANK_OF_KOREA': '한국은행',
            'KDB': '산업은행',
            'IBK': '기업은행',
            'KOOKMIN': '국민은행',
            'SUHYUP': '수협은행',
            'KEXIM': '수출입은행',
            'NONGHYUP': 'NH농협은행',
            'LOCAL_NONGHYUP': '지역농축협',
            'WOORI': '우리은행',
            'STANDARD_CHARTERED': 'SC제일은행',
            'CITI': '한국씨티은행',
            'DAEGU': '아이엠뱅크',
            'BUSAN': '부산은행',
            'KWANGJU': '광주은행',
            'JEJU': '제주은행',
            'JEONBUK': '전북은행',
            'KYONGNAM': '경남은행',
            'KFCC': '새마을금고',
            'SHINHYUP': '신협',
            'SAVINGS_BANK': '저축은행',
            'MORGAN_STANLEY': '모간스탠리은행',
            'HSBC': 'HSBC은행',
            'DEUTSCHE': '도이치은행',
            'JPMC': '제이피모간체이스은행',
            'MIZUHO': '미즈호은행',
            'MUFG': '엠유에프지은행',
            'BANK_OF_AMERICA': 'BOA은행',
            'BNP_PARIBAS': '비엔피파리바은행',
            'ICBC': '중국공상은행',
            'BANK_OF_CHINA': '중국은행',
            'NFCF': '산림조합중앙회',
            'UOB': '대화은행',
            'BOCOM': '교통은행',
            'CCB': '중국건설은행',
            'POST': '우체국',
            'KODIT': '신용보증기금',
            'KIBO': '기술보증기금',
            'HANA': '하나은행',
            'SHINHAN': '신한은행',
            'K_BANK': '케이뱅크',
            'KAKAO': '카카오뱅크',
            'TOSS': '토스뱅크',
            'MISC_FOREIGN': '기타 외국계은행'
        };
        return map[bank] || bank;
    };

    const formatDate = (date: Date): string =>
        `${date.getFullYear()}년 ${padZero(date.getMonth() + 1)}월 ${padZero(date.getDate())}일 ${padZero(date.getHours())}시 ${padZero(date.getMinutes())}분`;

    const padZero = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 text-center font-sans">
            <div className="border border-gray-300 rounded-lg p-8 mt-5 bg-gray-100 relative">
                <div className="w-16 h-16 mx-auto mb-5 bg-roomi rounded-full flex_center">
                    <FontAwesomeIcon icon={faBuildingColumns} className="text-white text-xxxl"/>
                </div>
                <h1 className="text-xl font-semibold mb-2">가상 계좌가 발급 되었습니다</h1>
                <h1 className="text-base font-semibold mb-4">아래 정보를 확인하고 지정된 계좌로 입금해주세요.</h1>
                <div id="payment-details"
                     className="text-left mx-auto bg-white p-4 rounded-md border border-gray-200 max-w-md text-sm text-gray-800">
                    <p>가상 계좌 정보를 불러오는 중...</p>
                </div>
                <p className="mt-6 text-sm text-gray-600 italic">
                    <span className="block">입금 기한 이후 입금 시 결제가 처리 되지 않습니다.</span>
                    <span className="block">정확한 금액을 입금해주세요.</span>
                    <span className="block">입금자명이 다를 경우 확인이 지연 될 수 있습니다.</span>
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

export default SuccessVirtualAccountPage;
