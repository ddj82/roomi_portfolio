import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {updateCurrency} from "../../../api/api";

// 지원할 통화 목록 (통화 코드, 라벨, 심볼 추가)
const CURRENCIES = [
    { code: 'KRW', label: 'KRW', symbol: '₩', name: '대한민국 원' },
    { code: 'USD', label: 'USD', symbol: '$', name: '미국 달러' },
    { code: 'JPY', label: 'JPY', symbol: '¥', name: '일본 엔' },
];

export default function CurrencySet() {
    const {t} = useTranslation();
    const [currencyCode, setCurrencyCode] = useState('');
    const [userCurrency, setUserCurrency] = useState('');

    useEffect(() => {
        setUserCurrency(localStorage.getItem('userCurrency') ?? "");
        setCurrencyCode(localStorage.getItem('userCurrency') ?? "");
    }, []);

    const handleCurrencyChange = async () => {
        try {
            const response = await updateCurrency(currencyCode);
            if (response.ok) {
                localStorage.setItem('userCurrency', currencyCode);
                window.location.reload();
            }
        } catch (e) {
            console.error('통화 변경 api 실패:', e);
        }
    };

    // 현재 선택된 통화
    const currentCurrency = CURRENCIES.find(currency => currency.code === userCurrency) || CURRENCIES[0];

    return (
        <div className="p-4 md:p-6 max-w-md mx-auto">
            {/* 현재 통화 섹션 */}
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">{t('현재 통화')}</h3>
                <div className="border border-roomi rounded-lg p-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-lg font-medium mr-2">{currentCurrency.label}</span>
                        <span className="text-xl mr-3">{currentCurrency.symbol}</span>
                        <span className="text-sm text-gray-500">{t(currentCurrency.name)}</span>
                    </div>
                    <div className="bg-roomi text-white px-3 py-1 rounded-full text-xs">
                        {t('현재')}
                    </div>
                </div>
                {/*<div className="text-xs text-gray-600 mt-3">*/}
                {/*    {t('통화설정 가이드')}*/}
                {/*</div>*/}
            </div>

            <h3 className="text-lg font-bold mb-4">{t('통화 선택')}</h3>
            <div className="space-y-3 mb-8">
                {CURRENCIES.filter(currency => currency.code !== userCurrency).map((currency) => (
                    <div
                        key={currency.code}
                        onClick={() => setCurrencyCode(currency.code)}
                        className={`border rounded-lg p-5 cursor-pointer transition-all
                        ${currencyCode === currency.code
                            ? 'border-roomi bg-roomi-light'
                            : 'border-gray-200 hover:border-roomi-2'
                        }
                    `}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="text-lg font-medium mr-2">{currency.label}</span>
                                <span className="text-xl mr-3">{currency.symbol}</span>
                                <span className="text-sm text-gray-500">{t(currency.name)}</span>
                            </div>
                            {currencyCode === currency.code && (
                                <div className="w-5 h-5 rounded-full bg-roomi flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 변경 버튼 */}
            <div className="mt-8 mb-4">
                <button
                    type="button"
                    onClick={handleCurrencyChange}
                    className={`w-full py-4 text-white text-base font-medium rounded-lg transition-colors
                        ${currencyCode && currencyCode !== userCurrency
                        ? 'bg-roomi hover:bg-roomi-dark'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    disabled={!currencyCode || currencyCode === userCurrency}
                >
                    {t('저장')}
                </button>
            </div>
        </div>
    );
};