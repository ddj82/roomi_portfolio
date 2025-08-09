import {GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import {auth} from '../../firebase';
import axios from "axios";

interface SocialAuthResponse {
    success: boolean;
    data?: {
        email: string;
        name?: string;
        socialId: string;
        provider: string;
    };
    error?: any;  // `error`를 `any`로 설정하여 전체 에러 객체를 반환
}

export class SocialAuth {
    private static readonly redirectUri = process.env.REACT_APP_BASE_URL; // 웹에서는 이렇게 기본 URI를 설정해두었습니다.

    static async googleLogin(): Promise<SocialAuthResponse> {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            if (!result.user) {
                throw new Error('No user information returned from Google.');
            }

            const { uid, email, displayName } = result.user;

            return {
                success: true,
                data: {
                    email: email ?? '',
                    name: displayName ?? '',
                    socialId: uid,
                    provider: 'google',
                },
            };
        } catch (error: unknown) {
            console.error('Google login failed:', error);
            return {
                success: false,
                error,
            };
        }
    }

    static async kakaoLogin(): Promise<void> {
        try {
            const REST_API_KEY=process.env.REACT_APP_REST_API_KEY; //REST API KEY
            const REDIRECT_URI = this.redirectUri + '/sign-up'; //Redirect URI
            window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&prompt=login`;

        } catch (error: unknown) {
            console.error("카카오 로그인 팝업 오류:", error);
            return;
        }
    }

    static async kakaoLogout() {
        try {
            const accessToken = localStorage.getItem('kakaoToken'); // 카카오 토큰
            const response = await axios.post(
                'https://kapi.kakao.com/v1/user/logout',
                null, // POST 요청이지만 body 없음
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                }
            );

            return response.statusText === 'OK';
        } catch (error: any) {
            console.error('소셜 로그아웃 실패:', error);
        }
    }
}
