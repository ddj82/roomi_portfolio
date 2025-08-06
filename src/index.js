import React from 'react';
import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import App from './App'
import './App.css';

// 반드시 Modal.setAppElement을 호출하여 aria-hidden을 설정합니다.
Modal.setAppElement('#root'); // 루트 DOM 요소를 설정

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
