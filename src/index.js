import React from 'react';
import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import App from './App'
import './App.css';

// 반드시 Modal.setAppElement을 호출하여 aria-hidden을 설정합니다.
Modal.setAppElement('#root'); // 루트 DOM 요소를 설정

// MSW 설정 (개발 환경에서만)
async function enableMocking() {
    if (process.env.NODE_ENV !== 'development') {
        return
    }

    const { worker } = await import('./mocks/browser')

    // 서비스 워커 시작
    return worker.start({
        onUnhandledRequest: 'warn', // 처리되지 않은 요청에 대한 경고
    })
}

// MSW 시작 후 React 앱 렌더링
enableMocking().then(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
});