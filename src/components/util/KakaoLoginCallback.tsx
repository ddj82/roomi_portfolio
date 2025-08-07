import React, {useEffect, useState} from 'react';
import axios from "axios";
import {useNavigate} from "react-router-dom";
// 💡 쿼리 스트링 형태로 데이터를 인코딩할 때 필요
import qs from "qs";
import {validateUser} from "../../api/api";
import {useAuthStore} from "../stores/AuthStore";
import {useIsHostStore} from "../stores/IsHostStore";
import {useChatStore} from "../stores/ChatStore";
import {SocialLogin} from "./authUtils";

export default function KakaoLoginCallback() {
    const navigate = useNavigate();
    const { setAuthToken } = useAuthStore();
    const { setIsHost } = useIsHostStore();
    const connect = useChatStore((state) => state.connect);

    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get("code");
        console.log('code', code);
        if (!code) {
            navigate('/');
        } else  {
            getAccessToken(code); // 요청 보내는 함수
        }
    }, []);


    // Access Token 받아오기
    const getAccessToken = async (code: string) => {
        try {
            const REST_API_KEY=process.env.REACT_APP_REST_API_KEY; //REST API KEY
            const BASE_URL = process.env.REACT_APP_BASE_URL;
            const REDIRECT_URI = BASE_URL + '/sign-up'; //Redirect URI

            const response = await axios.post(
                "https://kauth.kakao.com/oauth/token",
                qs.stringify({
                    grant_type: "authorization_code",
                    client_id: REST_API_KEY,
                    redirect_uri: REDIRECT_URI,
                    code: code,
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const accessToken = response.data.access_token;
            localStorage.setItem('kakaoToken', accessToken); // 카카오 토큰 저장
            await getKakaoUser(accessToken);
        } catch (error) {
            console.error("Error:", error);
            navigate('/');
        }
    };

    const getKakaoUser = async (token: string) => {
        try {
            const response = await axios.get(
                "https://kapi.kakao.com/v2/user/me",
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            if (response.statusText === 'OK') {
                await Login(response.data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const Login = async (data: any) => {
        try {
            console.log('카카오 :',data);
            console.log('카카오 유저id:', data.id.toString());

            const socialChannelUid = data.id.toString();
            const socialChannel = 'kakao';
            const statusCode = await validateUser(socialChannelUid, socialChannel);

            console.log("statusCode",statusCode);

            if (statusCode === 409) {
                // 회원가입
                const socialEmail = data.kakao_account.email || '';
                const socialName = data.properties.nickname;
                const socialProfileImage = data.properties.profile_image || '';
                localStorage.setItem("email", socialEmail);
                localStorage.setItem("name", socialName);
                localStorage.setItem("profileImg", socialProfileImage);
                navigate('/join/social', {
                    state : {
                        socialEmail,
                        socialName,
                        socialProfileImage,
                        socialChannel,
                        socialChannelUid,
                    },
                })
            } else if (statusCode === 200) {
                // 소셜 로그인
                await SocialLogin(socialChannelUid, socialChannel, setAuthToken, setIsHost, connect);
                localStorage.setItem('authMode', 'kakao'); // 카카오 로그인 플래그 생성
                localStorage.setItem('mainReload', 'true'); // 로그인 완료, 메인페이지 새로고침 플래그
                navigate('/');
            }

        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="text-center">
            <div role="status" className="m-10">
                <svg aria-hidden="true"
                     className="inline w-8 h-8 text-gray-300 animate-spin fill-roomi"
                     viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"/>
                    <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"/>
                </svg>
            </div>
        </div>
    );
};
