import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import i18n from 'src/i18n';
import {updateLanguage} from "../../../api/api";
import MainLanguageSelector from "../../header/util/MainLanguageSelector";

// 지원할 언어 목록 (언어 코드, 라벨, 로케일 정보 추가)
const LANGUAGES = [
    { code: 'ko', label: '한국어', locale: 'ko-KR' },
    { code: 'en', label: 'English', locale: 'en-US' },
    { code: 'ja', label: '日本語', locale: 'ja-JP' },
    { code: 'zh', label: '中文', locale: 'zh-CN' },
];

export default function LanguageSet({ userLoggedIn }: Readonly<{ userLoggedIn?: boolean; }>) {
    const {t} = useTranslation();
    const [currentLang, setCurrentLang] = useState(i18n.language);
    const [langCode, setLangCode] = useState('');

    const handleChangeLanguage = async (langCode:string) => {
        try {
            const response = await updateLanguage(langCode);
            if (response.ok) {
                i18n.changeLanguage(langCode);
                setCurrentLang(langCode);
                localStorage.setItem('i18nextLng', langCode);
                setLangCode('');
                window.location.reload();
            }
        } catch (e) {
            console.error('언어 변경 api 실패:', e);
        }
    };

    const currentLanguage = LANGUAGES.find((lang) => lang.code === currentLang);
    const otherLanguages = LANGUAGES.filter((lang) => lang.code !== currentLang);

    return (
        <>
            {userLoggedIn ? (
                <div className="space-y-6">
                    {/* 현재 언어 섹션 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">{t('현재 언어')}</h3>
                        </div>
                        <div className="p-6">
                            <div className="border border-roomi rounded-lg p-4 flex items-center justify-between bg-roomi-light">
                                <div className="flex flex-col">
                                    <span className="text-lg font-medium text-gray-900">{currentLanguage?.label}</span>
                                    <span className="text-sm text-gray-600 mt-1">{currentLanguage?.locale}</span>
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

                    {/* 언어 선택 섹션 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">{t('언어 선택')}</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {otherLanguages.map((lang) => (
                                    <div
                                        key={lang.code}
                                        onClick={() => setLangCode(lang.code)}
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                            langCode === lang.code
                                                ? 'border-roomi bg-roomi-light'
                                                : 'border-gray-200 hover:border-roomi-2 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-medium text-gray-900">{lang.label}</span>
                                                <span className="text-sm text-gray-600 mt-1">{lang.locale}</span>
                                            </div>
                                            {langCode === lang.code && (
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
                        </div>
                    </div>

                    {/* 언어 변경 버튼 */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => handleChangeLanguage(langCode)}
                            className={`w-full py-3 px-6 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                langCode
                                    ? 'bg-roomi hover:bg-roomi-1 focus:ring-roomi'
                                    : 'bg-gray-300 cursor-not-allowed focus:ring-gray-300'
                            }`}
                            disabled={!langCode}
                        >
                            {t('언어 변경하기')}
                        </button>
                    </div>
                </div>
            ) : (
                <MainLanguageSelector/>
            )}
        </>
    );
};