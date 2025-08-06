import 'i18n-js';

declare module 'i18n-js' {
    interface i18n {
        locale: string; // 언어 코드
        translations: { [key: string]: { [key: string]: string } }; // 번역 데이터
        fallbacks: boolean; // 기본 언어로 대체
    }
}