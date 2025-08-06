// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyBDa9AIB7cECnTSHfyCLR2bR6M9saqo1Eg",
    authDomain: "roomi-47ff8.firebaseapp.com",
    projectId: "roomi-47ff8",
    storageBucket: "roomi-47ff8.firebasestorage.app",
    messagingSenderId: "370374815502",
    appId: "1:370374815502:web:785339f10f846479f7715f",
};

// Firebase 초기화
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

// 내보내기
export { app, auth };
