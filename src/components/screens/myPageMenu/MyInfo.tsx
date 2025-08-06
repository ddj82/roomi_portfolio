import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useIsHostStore} from '../../stores/IsHostStore';
import {User} from '../../../types/user';
import dayjs from 'dayjs';
import CertificationModal from "../../modals/CertificationModal";
import {uploadIdentification} from "../../../api/api";

interface MyInfoEditProps {
    user: User;
}

export default function MyInfo({user}: MyInfoEditProps) {
    const {t} = useTranslation();
    const {isHost} = useIsHostStore();
    // 본인인증, 여권인증 모달
    const [certificationModal, setCertificationModal] = useState(false);
    const [userIsKorean, setUserIsKorean] = useState(true);

    // 인증 완료 콜백 함수
    const handleCertificationComplete = async (isSuccess: boolean, impUid: string) => {
        setCertificationModal(false); // 모달 닫기

        if (isSuccess) {
            console.log("인증 성공! (마이페이지)");
            const res = await handleUploadIdentification(impUid);
            if (!res) alert('인증 처리 중 문제가 발생하였습니다. 다시 시도해주세요.');
            window.location.reload();
        } else {
            console.log("인증 실패 새로고침");
            alert('본인인증에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 인증 완료 처리 api 호출 함수
    const handleUploadIdentification = async (impUid: string) => {
        try {
            const response = await uploadIdentification(impUid);
            const responseJson = await response.json();
            return responseJson.success;
        } catch (e) {
            console.error('인증 완료 처리 실패', e);
            return false;
        }
    };

    useEffect(() => {
        if (localStorage.getItem('isKorean')) {
            if (localStorage.getItem('isKorean') === 'true') {
                setUserIsKorean(true);
            } else {
                setUserIsKorean(false)
            }
        }
    }, []);

    return (
        <div>
            {/*인증 모달 컴포넌트 (조건부 렌더링)*/}
            {certificationModal && (
                <CertificationModal
                    visible={certificationModal}
                    onClose={() => setCertificationModal(false)}
                    isKorean={userIsKorean}
                    onCertificationComplete={handleCertificationComplete}
                />
            )}

            <div className="space-y-6">
                {/* 프로필 카드 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <div className="flex flex-col items-center text-center">
                            <img
                                src={user.profile_image ?? '/assets/images/profile.png'}
                                alt="프로필 이미지"
                                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-gray-200 mb-4"
                            />
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">{user.name}</h2>
                            <p className="text-sm text-gray-500 mb-3">{user.email}</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-roomi text-white">
                            {userIsKorean ? t('내국인') : t('외국인')} {t('사용자')}
                        </span>
                        </div>
                    </div>
                </div>

                {/* 본인인증 섹션 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        {user.identity_verified ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900">{t('본인 인증완료')}</h3>
                                    {/*<p className="text-sm text-gray-500">*/}
                                    {/*    {userIsKorean ? t('내국인') : t('외국인')} 본인인증 완료*/}
                                    {/*</p>*/}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-orange-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-gray-900">{t('인증 미완료')}</h3>
                                        <p className="text-sm text-gray-500">
                                            {t('본인인증을 완료해 주세요.')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCertificationModal(true)}
                                    className="px-4 py-2 bg-roomi text-white rounded-lg hover:bg-roomi-1 transition-colors font-medium text-sm"
                                >
                                    {t('인증하기')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 정보 섹션들 */}
                <div className="space-y-6">
                    {/* 기본 정보 섹션 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">{t('기본 정보')}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">{t('이름')}</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                                        <span className="text-gray-900">{user.name}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">{t('전화번호')}</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                                        <span className="text-gray-900">{user.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('이메일')}</label>
                                <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                                    <span className="text-gray-900">{user.email}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('생년월일')}</label>
                                <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                                    <span className="text-gray-900">{dayjs.utc(user.birth).format('YYYY-MM-DD')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 정산 정보 섹션 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">{t('정산 정보')}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">{t('예금주')}</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                                        <span className="text-gray-900">{user.bank_holder || '미입력'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">{t('은행명')}</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                                        <span className="text-gray-900">{user.bank || '미입력'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('계좌번호')}</label>
                                <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                                    <span className="text-gray-900">{user.account || '미입력'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}