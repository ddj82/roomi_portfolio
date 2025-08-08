import React from 'react';
import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import App from './App'
import './App.css';

// 반드시 Modal.setAppElement을 호출하여 aria-hidden을 설정합니다.
Modal.setAppElement('#root'); // 루트 DOM 요소를 설정

// MSW 설정 (개발 환경에서만)
async function enableMocking() {
    // GitHub Pages에서도 MSW 작동하도록 수정
    if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('github.io')) {
        const { worker } = await import('./mocks/browser')

        // 서비스 워커 시작 - GitHub Pages용 옵션 추가
        return worker.start({
            onUnhandledRequest: 'bypass', // 처리되지 않은 요청은 그냥 통과
            serviceWorker: {
                // GitHub Pages의 경우 public path 설정
                url: process.env.NODE_ENV === 'production'
                    ? '/roomi_portfolio/mockServiceWorker.js'
                    : '/mockServiceWorker.js'
            }
        })
    }
}

// MSW 시작 후 React 앱 렌더링
enableMocking().then(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
}).catch((error) => {
    console.warn('MSW 시작 실패, MSW 없이 앱 시작:', error);
    // MSW 실패해도 앱은 시작
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
});