import React, { useEffect, useState } from 'react';
import { useAuthStore } from 'src/components/stores/AuthStore';
import { SocialAuth } from "src/components/util/SocialAuth";
import 'src/css/AuthModal.css';
import { useIsHostStore } from "src/components/stores/IsHostStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {useChatStore} from "../../stores/ChatStore";
import {handleLogin, SocialLogin} from "../../util/authUtils";
import {validateUser} from "../../../api/api";
import {useSignUpChannelStore} from "../../stores/SignUpChannelStore";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuthToken } = useAuthStore();
  const { setIsHost } = useIsHostStore();
  const { setSignUpChannel } = useSignUpChannelStore();
  const connect = useChatStore((state) => state.connect);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      //window.Kakao.init('b78ae2925790c4c5606a66f8d79dd7b0'); // ✅ 올바른 JavaScript 키
      console.log('✅ Kakao SDK initialized');
    }
    setEmail("admin");
    setPassword("admin");
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await handleLogin(email, password, setAuthToken, setIsHost, connect);
      navigate("/host/signup");
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  const handleSocialLogin = async (channel: string) => {
    let loginResult, statusCode, socialEmail, socialName, socialChannelUid, socialChannel;
    switch (channel) {
      case 'Google':
        loginResult = await SocialAuth.googleLogin();
        const googleData = loginResult.data;
        if (googleData) {
          try {
            statusCode = await validateUser(googleData.socialId, googleData.provider);
            socialEmail = googleData.email;
            socialName = googleData.name;
            socialChannelUid = googleData.socialId;
            socialChannel = googleData.provider;

            if (statusCode === 409) {
              navigate('/join/social', {
                state: {
                  socialEmail,
                  socialName,
                  socialChannel,
                  socialChannelUid,
                },
              });
            } else if (statusCode === 200) {
              await SocialLogin(socialChannelUid, socialChannel, setAuthToken, setIsHost, connect);
              navigate("/host/signup");
            }
          } catch (e) {
            console.error(e);
          }
        }
        break;
      case 'Kakao': {
        if (!window.Kakao) return;
        // loginResult = await SocialAuth.kakaoLogin();
        await SocialAuth.kakaoLogin();
        // console.log("카카오 loginResult:", loginResult);

        // const kakaoData = loginResult?.data ?? loginResult;
        // if (kakaoData) {
        //   try {
        //     // statusCode = await validateUser(kakaoData.socialId, kakaoData.provider);
        //     // socialEmail = kakaoData.email;
        //     // socialName = kakaoData.name;
        //     // socialChannelUid = kakaoData.socialId;
        //     // socialChannel = kakaoData.provider;
        //
        //     if (statusCode === 409) {
        //       navigate('/join/social', {
        //         state: {
        //           socialEmail,
        //           socialName,
        //           socialChannel,
        //           socialChannelUid,
        //         },
        //       });
        //     } else if (statusCode === 200) {
        //       //await SocialLogin(socialChannelUid, socialChannel, setAuthToken, setIsHost, connect);
        //       window.location.reload();
        //     }
        //   } catch (e) {
        //     console.error("카카오 로그인 처리 오류:", e);
        //   }
        //
        // }
        //onClose();
        break;
      }
      case 'Line':
        try {
          loginResult = await SocialAuth.lineLogin();
        } catch (error) {
          console.error('LINE 로그인 에러:', error);
          alert('로그인 시도 중 문제가 발생했습니다. 다시 시도해주세요.');
        }
        break;
      default:
        return;
    }
  };

  const handleJoin = () => {
    navigate('/join');
  };

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const platforms = ['Kakao', 'Google', 'Line'];
  const visiblePlatforms = isIOS
    ? platforms.filter(p => ['Kakao', 'Google', 'Line', 'Apple'].includes(p))
    : platforms;

  return (
    <div className="authModal overlay fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
      <div className="authModal modal-content w-full max-w-sm px-5 py-6 rounded-lg bg-white shadow-lg">
        <div className="text-lg font-bold mb-4">{t('로그인').toUpperCase()}</div>
        <form onSubmit={handleSubmit} className="authModal input-container">
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
          <div className="authModal button-container">
            <button type="submit" className="authModal submit-button">
              {t('로그인')}
            </button>
          </div>
        </form>

        <div className="authModal social-login-container">
          <h4>{t('소셜로그인')}</h4>
          <div className="authModal social-buttons">
            {visiblePlatforms.map((channel) => (
              <button
                key={channel}
                className="authModal social-button"
                onClick={() => handleSocialLogin(channel)}
              >
                <img src={`/assets/images/${channel.toLowerCase()}.png`} alt={channel} className="authModal social-icon" />
                {`Sign in with ${channel}`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex_center mt-4">
          <div className="text-sm">{t('계정이없으신가요')}</div>
          <button onClick={handleJoin}>
            <span className="text-sm text-roomi ml-1">{t('시작하기').toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
