import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import { useAuthStore } from 'src/components/stores/AuthStore';
import { SocialAuth } from "src/components/util/SocialAuth";
import 'src/css/AuthModal.css';
import { useIsHostStore } from "src/components/stores/IsHostStore";
import {useChatStore} from "../stores/ChatStore";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {handleLogin, SocialLogin} from "../util/authUtils";
import {validateUser} from "../../api/api";
import CommonModal from "../util/CommonModal";

const AuthModal = ({ visible, onClose, type }: { visible: boolean; onClose: () => void; type: 'login' | 'signup' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const { setAuthToken } = useAuthStore();
    const { setIsHost } = useIsHostStore();
    const connect = useChatStore((state) => state.connect);
    const navigate = useNavigate();
    const {t} = useTranslation();

    useEffect(() => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init('2a9ccad44e98e033cafdac8aa2935584'); // 카카오 JavaScript 키로 초기화
            console.log('✅ Kakao SDK initialized');
        }
        // 모킹 데이터
        setEmail("test");
        setPassword("test");
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await handleLogin(email, password, setAuthToken, setIsHost, connect);
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('로그인 실패(모달):', error);
        }
    };

    const handleSocialLogin = async (channel: string) => {
        console.log(`${channel} 로그인 시도`);

        let loginResult; // loginResult 타입을 명확히 지정
        let statusCode;
        let socialEmail;
        let socialName;
        let socialProfileImage;
        let socialChannelUid;
        let socialChannel;

        switch (channel) {
            case 'Google': {
                loginResult = await SocialAuth.googleLogin();
                console.log('구글 loginResult', loginResult);
                const googleData = loginResult.data;
                if (googleData) {
                    onClose();
                    try {
                        statusCode = await validateUser(googleData.socialId, googleData.provider);
                        console.log('statusCode', statusCode);
                        socialEmail = googleData.email;
                        socialName = googleData.name;
                        socialChannelUid = googleData.socialId;
                        socialChannel = googleData.provider;

                        if (statusCode === 409) {
                            // 회원가입
                            navigate('/join/social', {
                                state : {
                                    socialEmail,
                                    socialName,
                                    socialChannel,
                                    socialChannelUid,
                                },
                            })
                        } else if (statusCode === 200) {
                            // 소셜 로그인
                            await SocialLogin(socialChannelUid, socialChannel, setAuthToken, setIsHost, connect);
                            window.location.reload();
                        }
                    } catch (e) {

                    }
                }
                break;
            }
            case 'Apple': {
                // Implement Apple login logic here
                break;
            }
            case 'Facebook': {
                // Implement Facebook login logic here
                break;
            }
            case 'Kakao': {
                if (!window.Kakao) return;
                await SocialAuth.kakaoLogin();
                onClose();
                break;
            }
            case 'Line': {
                break;
            }
            case 'WeChat': {
                break;
            }
            default:
                console.log('Unknown social platform');
                return;
        }
    };

    const handleJoin = () => {
        navigate('/join');
        onClose();
    };

    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden'; // 스크롤 방지
        } else {
            document.body.style.overflow = 'auto'; // 스크롤 복원
        }
        return () => {
            document.body.style.overflow = 'auto'; // 컴포넌트 언마운트 시 복원
        };
    }, [visible]);

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const platforms = ['Kakao', 'Google', 'Line', 'Facebook', 'Apple', 'WeChat'];

    const visiblePlatforms =  platforms.filter(p => ['Kakao', 'Google'].includes(p)); // Apple 제외

    const getPublicUrl = (path: string) => {
        return `${process.env.PUBLIC_URL ?? ''}${path}`;
    };

    return (
        <CommonModal
            isOpen={visible}
            onRequestClose={onClose}
            title="로그인"
        >
            <div className="authModal modal-content">
                {/*<div className="text-lg font-bold mb-4">{t('로그인').toUpperCase()}</div>*/}
                <form onSubmit={handleSubmit} className="authModal input-container mt-2">
                    <div className="authModal input-container">
                        <input
                            type="text"
                            placeholder={t('이메일')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="authInput mb-2 h-10 pl-2 text-base"
                        />
                        <input
                            type="password"
                            placeholder={t('비밀번호')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="authInput mb-2 h-10 pl-2 text-base"
                        />
                    </div>

                    <div className="authModal button-container">
                        <button type="submit" className="authModal submit-button">
                            {t('로그인')}
                        </button>
                        <button type="button" className="authModal cancel-button" onClick={onClose}>{t('취소')}</button>
                    </div>
                </form>

                {type === 'login' && (
                    <div className="authModal social-login-container">
                        <h4>{t('소셜로그인')}</h4>
                        <div className="authModal social-buttons">
                            {visiblePlatforms.map((channel) => (
                                <button
                                    key={channel}
                                    className="authModal social-button"
                                    onClick={() => handleSocialLogin(channel)}
                                >
                                    <img
                                        src={getPublicUrl(`/assets/images/${channel.toLowerCase()}.png`)}
                                        alt={channel}
                                        className="authModal social-icon"
                                    />
                                    {`Sign in with ${channel}`}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {type === 'login' && (
                    <div className="flex_center">
                        <div className="text-sm">{t('계정이없으신가요')}</div>
                        <button onClick={handleJoin}>
                            <span className="text-sm text-roomi ml-1">{t('시작하기').toUpperCase()}</span>
                        </button>
                    </div>
                )}
            </div>
        </CommonModal>
    );
};

export default AuthModal;
