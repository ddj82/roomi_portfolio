import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// GitHub Pages용 설정
if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    // 프로덕션 환경에서 MSW 로그 숨기기
    worker.start({
        onUnhandledRequest: 'bypass',
        quiet: false, // 디버깅을 위해 일단 false
    });
}