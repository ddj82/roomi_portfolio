import 'i18n-js';

declare module 'i18n-js' {
    interface I18n {
        locale: string;
        translations: { [key: string]: { [key: string]: string } };
        fallbacks: boolean;
        t(key: string, params?: { [key: string]: string }): string; // 번역 함수
    }
}