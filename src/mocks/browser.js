import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// 배포 환경에서 MSW 사용 설정
if (typeof window !== 'undefined') {
    const isProduction = process.env.NODE_ENV === 'production';
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isCustomDomain = window.location.hostname === 'ddjpf.kro.kr';

    // 프로덕션 환경 (GitHub Pages 또는 커스텀 도메인)에서 MSW 시작
    if (isProduction && (isGitHubPages || isCustomDomain)) {
        worker.start({
            onUnhandledRequest: 'bypass', // 처리되지 않은 요청은 그냥 통과
            quiet: false, // 디버깅용 로그 출력
            serviceWorker: {
                // 커스텀 도메인의 경우 service worker 경로 설정
                url: isCustomDomain
                    ? '/mockServiceWorker.js'  // 커스텀 도메인
                    : '/roomi_portfolio/mockServiceWorker.js'  // GitHub Pages
            }
        });

        console.log('🔧 MSW started for production environment');
        console.log('🌐 Hostname:', window.location.hostname);
    }
}