import React from 'react';
import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import App from './App'
import './App.css';

// 반드시 Modal.setAppElement을 호출하여 aria-hidden을 설정합니다.
Modal.setAppElement('#root'); // 루트 DOM 요소를 설정

// MSW 설정
async function enableMocking() {
    // 개발 환경 또는 배포 환경에서 MSW 시작
    if (process.env.NODE_ENV === 'development' ||
        (process.env.NODE_ENV === 'production' &&
            (window.location.hostname.includes('github.io') ||
                window.location.hostname === 'ddjpf.kro.kr'))) {

        const { worker } = await import('./mocks/browser')
        return worker.start({
            onUnhandledRequest: 'bypass',
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