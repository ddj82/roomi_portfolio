import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'src/i18n';
import { CheckIcon } from 'lucide-react';

// 지원할 언어 목록
const LANGUAGES = [
    { code: 'ko', label: '한국어', locale: 'ko-KR' },
    { code: 'en', label: 'English', locale: 'en-US' },
    { code: 'ja', label: '日本語', locale: 'ja-JP' },
    { code: 'zh', label: '中文', locale: 'zh-CN' },
];

export default function MainLanguageSelector() {
    const { t } = useTranslation();

    // 컴포넌트 초기화 때도 반드시 로컬스토리지 값을 우선 읽어온다
    const initial = localStorage.getItem('i18nextLng') || i18n.language;
    const [currentLang, setCurrentLang] = useState<string>(initial);
    const [selectedLang, setSelectedLang] = useState<string>('');

    // 만약 i18n.language(감지된 언어)와 로컬스토리지 값이 다르면 한 번 적용
    useEffect(() => {
        const saved = localStorage.getItem('i18nextLng');
        if (saved && saved !== i18n.language) {
            i18n.changeLanguage(saved);
        }
    }, []);

    // 내부 언어 변경 이벤트에 반응
    useEffect(() => {
        const onChange = (lng: string) => setCurrentLang(lng);
        i18n.on('languageChanged', onChange);
        return () => { i18n.off('languageChanged', onChange); };
    }, []);

    const handleChange = () => {
        if (!selectedLang) return;
        // 변경 시점에 로컬스토리지에 저장하고
        localStorage.setItem('i18nextLng', selectedLang);
        // i18n에 적용 → 즉시 UI 반영
        i18n.changeLanguage(selectedLang);
        setCurrentLang(selectedLang);
        setSelectedLang('');
        window.location.reload();
    };

    const current = LANGUAGES.find(l => l.code === currentLang)
        ?? { code: currentLang, label: currentLang, locale: currentLang };
    const others  = LANGUAGES.filter(l => l.code !== currentLang);

    return (
        <div className="space-y-6">
            {/* 현재 언어 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">{t('현재 언어')}</h3>
                </div>
                <div className="p-6">
                    <div
                        className="border border-roomi rounded-lg p-4 flex items-center justify-between bg-roomi-light">
                        <div className="flex flex-col">
                            <span className="text-lg font-medium text-gray-900">{current.label}</span>
                            <span className="text-sm text-gray-600 mt-1">{current.locale}</span>
                        </div>
                        <div className="bg-roomi text-white px-3 py-1 rounded-full text-xs font-medium">
                            {t('현재')}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                        {t('언어설정 가이드')}
                    </p>
                </div>
            </div>

            {/* 언어 선택 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">{t('언어 선택')}</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-3">
                        {others.map(lang => (
                            <div
                                key={lang.code}
                                onClick={() => setSelectedLang(lang.code)}
                                className={`border rounded-lg p-4 cursor-pointer transition-all 
                                    ${selectedLang === lang.code
                                        ? 'border-roomi bg-roomi-light'
                                        : 'border-gray-200 hover:border-roomi-2 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-medium text-gray-900">{lang.label}</span>
                                        <span className="text-sm text-gray-600 mt-1">{lang.locale}</span>
                                    </div>
                                    {selectedLang === lang.code && (
                                        <div
                                            className="w-5 h-5 rounded-full bg-roomi flex items-center justify-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white"
                                                 viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd"
                                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 언어 변경 버튼 */}
            <button
                type="button"
                onClick={handleChange}
                disabled={!selectedLang}
                className={`
                w-full py-3 rounded-lg text-white font-medium transition
                ${selectedLang ? 'bg-roomi hover:bg-roomi-dark' : 'bg-gray-300 cursor-not-allowed'}
            `}
            >
                {t('언어 변경하기')}
            </button>
        </div>
    );
}
