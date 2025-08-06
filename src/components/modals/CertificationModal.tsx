import React, {useEffect, useState} from 'react';
import Modal from "react-modal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faIdCard, faPassport } from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from "react-i18next";

// 아임포트 타입 정의
declare global {
    interface Window {
        IMP?: any;
    }
}

export default function CertificationModal({visible, onClose, isKorean, onCertificationComplete}: Readonly<{
    visible: boolean,
    onClose: () => void,
    isKorean: boolean,
    onCertificationComplete: (isSuccess: boolean, imp_uid: string) => void;
}>) {
    const [isMetaMapLoaded, setIsMetaMapLoaded] = useState(false);
    const [metaMapLoading, setMetaMapLoading] = useState(false);
    const {t} = useTranslation();
    // 아임포트 스크립트 로드
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.iamport.kr/js/iamport.payment-1.2.0.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // 컴포넌트 언마운트 시 스크립트 제거
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // MetaMap 스크립트 로드
    useEffect(() => {
        // 이미 로딩된 상태라면 재로딩하지 않음
        if (window.MetamapVerification) {
            setIsMetaMapLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://web-button.getmati.com/button.js'; // 공식 문서 기준 :contentReference[oaicite:1]{index=1}
        script.async = true;

        script.onload = () => {
            console.log('✅ MetaMap Web SDK (button.js) 로드 성공');
            // 로딩 직후 바로 확인해도 window.MetamapVerification이 등록되어 있지 않을 수 있으니, 약간 지연 후 체크
            setTimeout(() => {
                if (window.MetamapVerification) {
                    setIsMetaMapLoaded(true);
                } else {
                    console.error('❌ window.MetamapVerification이 정의되지 않았습니다.');
                }
            }, 100);
        };

        script.onerror = () => {
            console.error('❌ MetaMap Web SDK 로드 실패 (button.js)');
            setIsMetaMapLoaded(false);
        };

        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    // 아임포트 통합 인증 처리
    const handleKoreanCertification = () => {
        if (!window.IMP) {
            alert('아임포트 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const userCode = 'imp01154410'; // 실제 가맹점 코드로 변경
        const merchantUid = `roomi_cert_${Date.now()}`;

        window.IMP.init(userCode);

        window.IMP.certification({
            // imp_uid: userCode,
            channelKey : "channel-key-4515c7c8-6e49-428d-9628-3ba4a277220e",
            merchant_uid: merchantUid,
            company: 'Roomi',
            min_age: 18,
            // carrier: '',  // 사용자 선택
            // name: '',     // 사용자 입력
            // phone: '',    // 사용자 입력
            m_redirect_url: window.location.origin + '/certification/redirect', // 모바일 리다이렉트 URL
        }, (rsp: any) => {
            console.log('📱 본인인증 결과:', rsp);

            if (rsp.success) {
                // 인증 성공 처리
                alert('본인인증이 완료되었습니다.');
                onCertificationComplete(true, rsp.imp_uid);
                onClose();
            } else {
                // 인증 실패 처리
                onCertificationComplete(false, '');
            }
        });
    };

    // MetaMap 인증 처리 (외국인용)
    const handleForeignCertification = () => {
        if (!isMetaMapLoaded || !window.MetamapVerification) {
            alert('MetaMap 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        try {
            // SDK 초기화 및 실행: new MetamapVerification({...}).start() 형태로 호출 :contentReference[oaicite:2]{index=2}
            const verification = new window.MetamapVerification({
                clientId: '682ff9b5bb952e17fa82be46', // 실제 ClientID로 변경
                flowId: '682ff9b5bb952eccc382be45', // 실제 FlowID로 변경
                metadata: {
                    userId: localStorage.getItem('authToken')?.replace(/^Bearer\s/, ''),
                },
            });

            // 이벤트 리스너 등록: 반드시 start() 호출 전에 걸어야 합니다.
            //  - metamap:userStartedSdk  : SDK가 시작될 때
            //  - metamap:userFinishedSdk : 인증이 끝나서 성공/실패 판단이 났을 때
            //  - metamap:exitedSdk       : 중도에 사용자가 팝업을 닫았을 때
            //  - metamap:screen          : 특정 화면(예: 여권 스캔, 얼굴 인식)에 진입했을 때
            verification.on('metamap:userStartedSdk', ({ detail }) => {
                console.log('SDK 시작 이벤트:', detail);
                setMetaMapLoading(true);
            });

            verification.on('metamap:userFinishedSdk', ({ detail }) => {
                console.log('인증 완료 이벤트:', detail);
                const id = detail.verificationId || detail.identityId || '';
                setMetaMapLoading(false);
                alert('여권 인증이 완료되었습니다.');
                onCertificationComplete(true, id);
                onClose();
            });

            verification.on('metamap:exitedSdk', ({ detail }) => {
                console.log('인증 중도 종료(사용자 닫음):', detail);
                setMetaMapLoading(false);
                onCertificationComplete(false, '');
                onClose();
            });

            verification.on('metamap:error', ({ detail }) => {
                console.error('인증 에러 이벤트:', detail);
                setMetaMapLoading(false);
                alert('여권 인증 중 오류가 발생했습니다.');
                onCertificationComplete(false, '');
                onClose();
            });

            // **꼭** start() 혹은 open() 메서드를 호출해야 팝업이 뜹니다.
            setMetaMapLoading(true);
            verification.start(); // 혹은 verification.open();
        } catch (error) {
            console.error('MetaMap 초기화 에러:', error);
            alert('MetaMap 초기화에 실패했습니다. 페이지를 새로고침 후 다시 시도해주세요.');
            setMetaMapLoading(false);
        }
    };


    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            contentLabel="Modal"
            className="authModal auth-modal-container"
            overlayClassName="authModal overlay"
        >
            {isKorean ? (
                <div className="p-2">
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4">
                            <div>
                                <div className="md:w-16 md:h-16 rounded-lg flex_center bg-roomi-000">
                                    <FontAwesomeIcon icon={faIdCard} className="text-roomi text-xxxl"/>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="text-xl font-bold">
                                    {t('본인 인증')}
                                </div>
                                <div>
                                    {t('통합 인증으로 본인 확인')}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>• {t('공인인증서 필요')}</div>
                            <div>• {t('대한민국 국적 전용')}</div>
                            <div>• {t('약 1-2분 소요')}</div>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={handleKoreanCertification}
                                className="flex_center bg-roomi text-white text-lg rounded-lg p-4 w-full"
                            >
                                {t('통합 인증하기')}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-2">
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4">
                            <div>
                                <div className="md:w-16 md:h-16 rounded-lg flex_center bg-roomi-000">
                                    <FontAwesomeIcon icon={faPassport} className="text-roomi text-xxxl"/>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="text-xl font-bold">
                                    {t('여권 인증')}
                                </div>
                                <div>
                                    {t('여권과 얼굴 인증으로 빠른 확인')}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>• {t('여권 촬영')}</div>
                            <div>• {t('얼굴 인증')}</div>
                            <div>• {t('약 2-3분 소요')}</div>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={handleForeignCertification}
                                className={`flex_center text-lg rounded-lg p-4 w-full
                                ${metaMapLoading ? 'bg-gray-300 text-black' : 'bg-roomi text-white'}`}
                            >
                                {metaMapLoading ? t('진행중...') : t('MetaMap 인증하기')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
