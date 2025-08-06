import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from 'src/locales/en.json';
import ko from 'src/locales/ko.json';
import ja from 'src/locales/ja.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next) // React와 통합
    .init({
        fallbackLng: 'ko', // 기본 언어
        supportedLngs: ['ko', 'en', 'en-US', 'ja'], // 지원하는 언어
        resources: {
            ko: { translation: ko },
            en: { translation: en },
            'en-US': { translation: en },
            ja: { translation: ja },
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false, // React에서는 이스케이프가 필요 없음
        },
    })
    .then(() => {
        console.log(`[i18n] Detected language: ${i18n.language}`); // 감지된 언어 로그
    })
    .catch(error => {
        console.error('[i18n] Initialization error:', error); // 에러 처리
    });

export default i18n;
