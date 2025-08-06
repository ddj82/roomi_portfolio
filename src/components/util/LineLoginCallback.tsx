import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {validateUser} from "../../api/api";
import {SocialLogin} from "./authUtils";
import {useAuthStore} from "../stores/AuthStore";
import {useIsHostStore} from "../stores/IsHostStore";
import {useSignUpChannelStore} from "../stores/SignUpChannelStore";
import {useChatStore} from "../stores/ChatStore";
import {response} from "express";

export default function LineLoginCallback() {
    const navigate = useNavigate();
    const { setAuthToken } = useAuthStore();
    const { setIsHost } = useIsHostStore();
    const connect = useChatStore((state) => state.connect);
    const { setSignUpChannel } = useSignUpChannelStore();
    useEffect(() => {
        const token = new URL(window.location.href).searchParams.get("token");

        if (!token) {
            navigate('/');
        } else {
            getLineUserInfo(token);
        }
    }, []);

    const getLineUserInfo = async (token: string) => {
        try {
            const res = await axios.post(
                "https://roomi.co.kr/api/users/token/login",
                {}, // POST Body 없으면 빈 객체
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = res.data.data;

            console.log("✅ 서버에서 사용자 정보 가져옴:", data);

            // 로그인 처리
            if (data.name) {
                // 기존 사용자
                let authToken = res.headers['authorization'] || ''; // 응답에서 토큰 추출
                console.log('토큰:', authToken);

                if (authToken) {
                    localStorage.setItem('authToken', authToken); // 토큰 저장
                    setAuthToken(authToken); // 전역 상태 업데이트
                } else {
                    throw new Error('토큰을 찾을 수 없습니다.');
                }

                localStorage.setItem('userId', data.id);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userName', data.name);
                localStorage.setItem('userIsHost', data.isHost);

                if (data.profile_image === null) {
                    localStorage.setItem('userProfileImg', '/assets/images/profile.png');
                } else {
                    localStorage.setItem('userProfileImg', data.profile_image);
                }

                localStorage.setItem('userCurrency', data.currency);

                // 동의 정보 저장
                localStorage.setItem('accept_SMS', data.accept_SMS ? '1' : '0');
                localStorage.setItem('accept_alert', data.accept_alert ? '1' : '0');
                localStorage.setItem('accept_email', data.accept_email ? '1' : '0');

                const hostStatus = localStorage.getItem("userIsHost") === "true";
                console.log("hostStatus값 :", hostStatus);
                setIsHost(hostStatus);

                // 웹소켓 연결
                if (authToken) {
                    authToken = authToken.replace(/^Bearer\s/, "");
                    connect(authToken);
                }

                navigate("/");
            }
            // else {
            //     // 이메일/이름이 없는 신규 사용자 → 회원가입 페이지로 이동
            //     navigate('/join/social', {
            //         state: {
            //             socialEmail: email || '',
            //             socialName: name || '',
            //             socialProfileImage: profileImage || '',
            //             socialChannel: channel,
            //             socialChannelUid: channelUid,
            //         },
            //     });
            // }
        } catch (err) {
            console.error("LINE 사용자 정보 요청 실패:", err);
            navigate("/");
        }
    };

    const getAccessToken = async (code: string) => {
        try {
            const res = await axios.post(
                'https://api.line.me/oauth2/v2.1/token',
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: 'https://roomi.co.kr/sign-up/line', // 리디렉트 URI
                    client_id: '2006686179',
                    client_secret: 'd6fbb28d95e39c6a74bed6b28c22165a',
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const accessToken = res.data.access_token;
            await getLineProfile(accessToken);
        } catch (err) {
            console.error("LINE 토큰 요청 실패:", err);
        }
    };

    const getLineProfile = async (accessToken: string) => {
        try {
            const res = await axios.get("https://api.line.me/v2/profile", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const { userId, displayName, pictureUrl } = res.data;

            console.log("✅ LINE 사용자 정보:", res.data);

            const socialChannel = 'line';
            const socialChannelUid = userId;
            const socialName = displayName;
            const socialProfileImage = pictureUrl || '';
            const socialEmail = ''; // LINE은 email을 별도 동의 받아야 하므로 기본값

            const statusCode = await validateUser(socialChannelUid, socialChannel);
            if (statusCode === 409) {
                navigate('/join/social', {
                    state: {
                        socialEmail,
                        socialName,
                        socialProfileImage,
                        socialChannel,
                        socialChannelUid,
                    },
                });
            } else if (statusCode === 200) {
                await SocialLogin(socialChannelUid, socialChannel, setAuthToken, setIsHost, connect);
                navigate("/");
            } else {
                console.error("예상치 못한 상태 코드:", statusCode);
                navigate("/");
            }
        } catch (err) {
            console.error("LINE 사용자 정보 가져오기 실패:", err);
            navigate("/");
        }
    };

    return (
        <div className="text-center">
            <div>LINE 로그인 처리 중입니다...</div>
        </div>
    );
}