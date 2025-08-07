import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCN7UBRXun1J48sJrFBAgp3_VDsQDt3JXE",
    authDomain: "djportfolio-b5afb.firebaseapp.com",
    projectId: "djportfolio-b5afb",
    storageBucket: "djportfolio-b5afb.firebasestorage.app",
    messagingSenderId: "531573945445",
    appId: "1:531573945445:web:34dca823347a970312428c"
};

// Firebase 초기화
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

// 내보내기
export { app, auth };
