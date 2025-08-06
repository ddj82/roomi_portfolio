import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock, faCommentDots, faComments, faEnvelope, faHeading, faUser} from "@fortawesome/free-solid-svg-icons";
import {faCopy} from "@fortawesome/free-regular-svg-icons";
import {useHostModeStore} from "../../stores/HostModeStore";
import {sendHelpMessage} from "../../../api/api";

export default function HelpCenter() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {hostMode} = useHostModeStore();
    const [sendEmailForm, setSendEmailForm] = useState({
        name: '',
        email: '',
        title: '',
        content: '',
    });
    // 오류 메시지 상태 추가
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleKakaoChannelBtn = () => {
        window.open(`http://pf.kakao.com/_xkEFxjn`, '_blank');
    };

    const handleCopyClipBoard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("클립보드에 링크가 복사되었어요.");
        } catch (err) {
            console.log(err);
        }
    };

    const handleChange = (field: string, value: any) => {
        setSendEmailForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const newErrors: { [key: string]: string } = {}; // 새로운 오류 객체

        if (sendEmailForm.name === "") {
            newErrors.name = "발신자를 입력해주세요.";
        }

        if (sendEmailForm.email === "") {
            newErrors.email = "발신 이메일을 입력해주세요.";
        } else if (!/^\S+@\S+\.\S+$/.test(sendEmailForm.email)) {
            newErrors.email = "올바른 이메일 형식을 입력하세요.";
        }

        if (sendEmailForm.title === "") {
            newErrors.title = "제목을 입력해주세요.";
        }

        if (sendEmailForm.content === "") {
            newErrors.content = "문의 내용을 입력해주세요.";
        }

        // 오류가 있으면 상태 업데이트 후 진행 중지
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 오류가 없으면 다음 단계로 이동
        setErrors({}); // 오류 초기화
        const confirmCancel = window.confirm(t('이메일 전송을 하시겠습니까?'));
        if (confirmCancel) {
            try {
                const response = await sendHelpMessage(sendEmailForm);
                const responseJson = await response.json();
                if (responseJson.success) {
                    alert('이메일이 성공적으로 발송되었습니다.');
                } else {
                    alert('이메일 발송에 실패하였습니다.');
                }
                window.location.reload();
            } catch (err) {
                console.error('메일전송 실패', err);
            }
        } else {
            return;
        }
    };

    return (
        <div className="space-y-6">
            {/* 카카오톡 문의 섹션 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">{t('카카오톡으로 문의하기')}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">
                        {t('빠른 응답이 필요하시면 카카오톡 채널로 문의 해주세요.')}
                    </p>

                    <button
                        type="button"
                        className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 rounded-lg px-6 py-3 font-semibold text-gray-900 flex items-center justify-center gap-2 transition-colors"
                        onClick={handleKakaoChannelBtn}
                    >
                        <FontAwesomeIcon icon={faComments}/>
                        {t('카카오톡 채널 열기')}
                    </button>

                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                        <span className="text-sm text-gray-700 flex-1">http://pf.kakao.com/_xkEFxjn</span>
                        <button
                            type="button"
                            onClick={() => handleCopyClipBoard('http://pf.kakao.com/_xkEFxjn')}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <FontAwesomeIcon icon={faCopy}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* 이메일 문의 섹션 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">{t('이메일로 문의하기')}</h3>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">{t('이름')}</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400"/>
                                    </div>
                                    <input
                                        type="text"
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        name="name"
                                        id="name"
                                        placeholder={t('이름')}
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent"
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">{t('이메일')}</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-gray-400"/>
                                    </div>
                                    <input
                                        type="text"
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        name="email"
                                        id="email"
                                        placeholder={t('이메일')}
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">{t('제목')}</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <FontAwesomeIcon icon={faHeading} className="w-4 h-4 text-gray-400"/>
                                </div>
                                <input
                                    type="text"
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    name="title"
                                    id="title"
                                    placeholder={t('제목')}
                                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent"
                                />
                            </div>
                            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">{t('문의 내용')}</label>
                            <div className="relative">
                                <div className="absolute left-3 top-3 pointer-events-none">
                                    <FontAwesomeIcon icon={faCommentDots} className="w-4 h-4 text-gray-400"/>
                                </div>
                                <textarea
                                    onChange={(e) => handleChange('content', e.target.value)}
                                    name="content"
                                    id="content"
                                    placeholder={t('문의 내용')}
                                    rows={6}
                                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent resize-none"
                                ></textarea>
                            </div>
                            {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-roomi hover:bg-roomi-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:ring-offset-2"
                        >
                            {t('문의하기')}
                        </button>
                    </form>
                </div>
            </div>

            {/* 지원 정보 섹션 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">{t('지원 정보')}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                            <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-gray-600"/>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{t('운영 시간')}</h4>
                            <p className="text-sm text-gray-600">{t('평일')} 09:00 - 18:00 ({t('공휴일 제외')})</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                            <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-gray-600"/>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{t('지원 이메일')}</h4>
                            <p className="text-sm text-gray-600">help@roomi.co.kr</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
