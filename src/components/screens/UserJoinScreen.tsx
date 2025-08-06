import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faCheck} from "@fortawesome/free-solid-svg-icons";
import {useTranslation} from "react-i18next";
import {createUser, getValidationCode, sendVerificationEmail} from "../../api/api";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {User} from "../../types/user";
import {useSignUpChannelStore} from "../stores/SignUpChannelStore";
dayjs.extend(duration);

const UserJoinScreen = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3; // 전체 단계 수
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        gender: "",
        birth: "",
        phone: "",
        is_korean: true,
        checkboxes: [false, false, false],
    });
    const {signUpChannel} = useSignUpChannelStore()
    const handleBack = () => setShowModal(true);
    const confirmBack = () => navigate('/');
    const requiredChecked = formData.checkboxes[0] && formData.checkboxes[1];
    const checkboxList = [
        { label: t("개인정보처리방침동의"), required: true },
        { label: t("약관동의동의"), required: true },
        { label: t("마케팅수신동의동의"), required: false },
    ];
    const [remainingTime, setRemainingTime] = useState(0); // 남은 시간 (초)
    const [isRunning, setIsRunning] = useState(false); // 타이머 실행 여부
    const [sendSeccess, setSendSeccess] = useState(false); // 메일 전송 성공 여부
    const [inputAuthCode, setInputAuthCode] = useState(''); // 입력받은 인증코드
    const [isResendDisabled, setIsResendDisabled] = useState(false); // 재발송 버튼 비활성화 상태 추가
    const [isVerified, setIsVerified] = useState(false); // ✅ 인증 성공 여부 추가
    // 오류 메시지 상태 추가
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // 타이머 시작, 재발송 버튼 비활성화, 30초 후 재발송 활성화
    const startTimer = () => {
        setRemainingTime(300); // 5분(300초)
        setIsRunning(true);
        setIsResendDisabled(true);
        setTimeout(() => setIsResendDisabled(false), 30000);
    };

    useEffect(() => { // 타이머 카운트 다운
        if (!isRunning || remainingTime <= 0) return;
        const timer = setInterval(() => {
            setRemainingTime((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, remainingTime]);

    useEffect(() => { // 타이머가 끝나면 상태 초기화
        if (remainingTime <= 0 && isRunning) {
            setSendSeccess(false);
            setInputAuthCode("");
            setIsRunning(false);
        }
    }, [remainingTime, isRunning]);

    // 인증 메일 전송
    const handleSendEmail = async () => {
        const newErrors: { [key: string]: string } = {}; // 새로운 오류 객체

        if (!formData.email.trim()) {
            newErrors.email = "이메일을 입력하세요.";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "올바른 이메일 형식을 입력하세요.";
        } else {
            setErrors({}); // 메일 오류 객체 삭제
            const code = String(Math.floor(100000 + Math.random() * 900000));
            try {
                const response = await sendVerificationEmail(formData.email, code);
                const data = await response.json();
                console.log("발송 값 :", data);

                if (data.success) {
                    setSendSeccess(true);
                    startTimer();
                } else {
                    console.error("API 호출 중 에러 발생");
                }
            } catch (e) {
                console.error("API 호출 중 에러 발생:", e);
            }
        }

        // 오류가 있으면 상태 업데이트 후 진행 중지
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        }
    };

    // 인증 번호 확인
    const handleVerification = async () => {
        try {
            const response = await getValidationCode(formData.email);
            const data = await response.json()
            const authCode = data.code;
            if (authCode === inputAuthCode) {
                alert('인증 성공');
                setIsVerified(true); // ✅ 인증 성공 처리
                setIsRunning(false); // 타이머 정지
                setSendSeccess(false); // 인증 완료 후 재발송 버튼 숨김
                setErrors({}); // 오류 객체 삭제
            } else {
                alert('인증 실패');
            }
        } catch (e) {
            console.error('API 호출 중 에러 발생:', e);
        }
    };

    const handleNext = () => {
        const newErrors: { [key: string]: string } = {}; // 새로운 오류 객체

        if (currentStep === 1) {
            // 이메일 유효성 검사
            if (!formData.email.trim()) {
                newErrors.email = "이메일을 입력하세요.";
            } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
                newErrors.email = "올바른 이메일 형식을 입력하세요.";
            } else if (!isVerified) {
                newErrors.email = "이메일 인증을 해주세요.";
            }

            // 비밀번호 유효성 검사
            if (!formData.password.trim()) {
                newErrors.password = "비밀번호를 입력하세요.";
            } else if (formData.password.length < 8) {
                newErrors.password = "비밀번호는 최소 8자리 이상이어야 합니다.";
            }

            // 전화번호 유효성 검사
            if (!formData.phone.trim()) {
                newErrors.phone = "전화번호를 입력하세요.";
            } else if (!/^\d{10,11}$/.test(formData.phone)) {
                newErrors.phone = "올바른 전화번호를 입력하세요.";
            }
        } else if (currentStep === 2) {
            // 이름 유효성 검사
            if (!formData.name.trim()) {
                newErrors.name = "이름을 입력하세요.";
            }

            // 생년월일 유효성 검사
            if (!formData.birth.trim()) {
                newErrors.birth = "생년월일을 입력하세요.";
            }

            // 성별 유효성 검사
            if (!formData.gender) {
                newErrors.gender = "성별을 선택하세요.";
            }
        }

        // 오류가 있으면 상태 업데이트 후 진행 중지
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 오류가 없으면 다음 단계로 이동
        setErrors({}); // 오류 초기화
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };


    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (index: number) => {
        const newCheckboxes = [...formData.checkboxes];
        newCheckboxes[index] = !newCheckboxes[index];
        setFormData(prev => ({ ...prev, checkboxes: newCheckboxes }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const userSingUp: User = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            channel: signUpChannel,
            sex: formData.gender,
            birth: formData.birth,
            phone: formData.phone,
            is_korean: formData.is_korean,
        };
        try {
            const response = await createUser(userSingUp);
            console.log('리스폰스 :', response);
            if (response.ok) {
                console.log('회원가입 성공');
                alert('축하합니다! 회원가입이 완료 되었습니다!');
                confirmBack();
            }
        } catch (error) {
            console.error('회원 가입 실패:', error);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <div className="mb-6 p-5 bg-white shadow-lg rounded-2xl border border-gray-100 flex">
                <div className="flex_center">
                    {/* 뒤로 가기 버튼 */}
                    <button className="rounded-lg p-2 w-10 h-10 sm:p-4 sm:w-14 sm:h-14" onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </button>
                </div>
                <div className="mx-4 flex_center">
                    <div className="text-xl font-bold">Roomi에 오신것을 환영합니다!</div>
                </div>
            </div>

            {/* 단계 진행 바 */}
            <div className="w-full mb-4">
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mx-1 shadow-inner">
                    <div className="absolute h-2 bg-roomi rounded-full transition-all duration-300"
                         style={{width: `${(currentStep / totalSteps) * 100}%`}}>
                    </div>
                </div>
                <div className="text-sm text-gray-600 mt-1 ml-2">
                    {currentStep} / {totalSteps}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* 페이지 컨텐츠 */}
                <div className="mb-6 p-5 bg-white shadow-lg rounded-2xl border border-gray-100">
                    {currentStep === 1 && (
                        <div>
                            <label htmlFor="email">{t("이메일")}</label>
                            <div className="flex flex-col md:flex-row gap-2">
                              <div className="flex-1">
                                <input
                                  id="email"
                                  type="email"
                                  placeholder={t("이메일")}
                                  value={formData.email}
                                  onChange={(e) => handleChange("email", e.target.value)}
                                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-roomi"
                                  disabled={isVerified}
                                />
                              </div>
                              <div className="w-full md:w-auto">
                                {!sendSeccess ? (
                                  <button
                                    type="button"
                                    className="w-full md:w-auto px-4 py-2.5 bg-roomi text-white font-medium rounded-xl shadow-md hover:bg-roomi-dark transition-all duration-200"
                                    onClick={handleSendEmail}
                                    disabled={isVerified}
                                  >
                                    인증번호 발송
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className={`w-full md:w-auto px-4 py-2.5 border border-roomi text-roomi font-medium rounded-xl shadow-md transition-all duration-200
                                      ${isResendDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={handleSendEmail}
                                    disabled={isResendDisabled || isVerified}
                                  >
                                    재발송
                                  </button>
                                )}
                              </div>
                            </div>
                            {errors.email && <p className="font-bold text-red-500 text-sm">{errors.email}</p>}
                            <div>
                                {sendSeccess && (
                                    <div>
                                        <div className="flex flex-col md:flex-row md:items-center mt-2">
                                            <input
                                                id="code"
                                                type="text"
                                                placeholder="인증번호 입력"
                                                className="border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-roomi"
                                                value={inputAuthCode}
                                                onChange={(e) => setInputAuthCode(e.target.value)}
                                            />
                                            <div>
                                                <button
                                                    type="button"
                                                    className="px-6 py-3 border border-roomi text-roomi text-sm font-medium rounded-xl shadow-md transition-all duration-200 md:ml-2 mt-1 md:mt-0"
                                                    onClick={handleVerification}
                                                >
                                                    확인
                                                </button>
                                                <span className="text-red-500 p-2 font-bold text-base">
                                                    {dayjs.duration(remainingTime, "seconds").format("mm:ss")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <label htmlFor="password" className="mt-4 block">{t("비밀번호")}</label>
                            <input
                                id="password"
                                type="password"
                                placeholder={t("비밀번호")}
                                value={formData.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-roomi"
                            />
                            {errors.password && <p className="font-bold text-red-500 text-sm">{errors.password}</p>}

                            <label htmlFor="phone" className="mt-4 block">{t("전화번호")}</label>
                            <input
                                id="phone"
                                type="tel"
                                placeholder={t("전화번호")}
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-roomi"
                            />
                            {errors.phone && <p className="font-bold text-red-500 text-sm">{errors.phone}</p>}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <label htmlFor="name">{t("이름")}</label>
                            <input
                                id="name"
                                type="text"
                                placeholder={t("이름")}
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-roomi"
                            />
                            {errors.name && <p className="font-bold text-red-500 text-sm">{errors.name}</p>}

                            <label htmlFor="birth" className="mt-4 block">{t("생년월일")}</label>
                            <input
                                id="birth"
                                type="date"
                                value={formData.birth}
                                onChange={(e) => handleChange("birth", e.target.value)}
                                onFocus={(e) => e.target.showPicker?.()}
                                min="1900-01-01"
                                max={new Date().toISOString().split("T")[0]}
                                className="border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-roomi"
                            />
                            {errors.birth && <p className="font-bold text-red-500 text-sm">{errors.birth}</p>}

                            <div className="my-2 flex items-center gap-4">
                                <div>
                                    <label htmlFor="radioMALE" className="flex items-center mb-2 w-fit">
                                        <input
                                            id="radioMALE"
                                            type="radio"
                                            name="gender"
                                            value="MALE"
                                            checked={formData.gender === "MALE"}
                                            onChange={(e) => handleChange("gender", e.target.value)}
                                            className="accent-roomi focus:outline-none appearance-none"
                                        />
                                        <div className={`w-5 h-5 mr-2 flex_center border border-gray-300 rounded-md 
                                            ${formData.gender === 'MALE' && 'bg-roomi border-none'}`}>
                                            {formData.gender === 'MALE' && (
                                                <FontAwesomeIcon icon={faCheck} className="text-xs text-white"/>
                                            )}
                                        </div>
                                        {t("남")}
                                    </label>
                                </div>
                                <div>
                                    <label htmlFor="radioFEMALE" className="flex items-center mb-2 w-fit">
                                        <input
                                            id="radioFEMALE"
                                            type="radio"
                                            name="gender"
                                            value="FEMALE"
                                            checked={formData.gender === "FEMALE"}
                                            onChange={(e) => handleChange("gender", e.target.value)}
                                            className="accent-roomi focus:outline-none appearance-none"
                                        />
                                        <div className={`w-5 h-5 mr-2 flex_center border border-gray-300 rounded-md 
                                            ${formData.gender === 'FEMALE' && 'bg-roomi border-none'}`}>
                                            {formData.gender === 'FEMALE' && (
                                                <FontAwesomeIcon icon={faCheck} className="text-xs text-white"/>
                                            )}
                                        </div>
                                        {t("여")}
                                    </label>
                                </div>
                                <div>
                                    <label htmlFor="radioOTHER" className="flex items-center mb-2 w-fit">
                                        <input
                                            id="radioOTHER"
                                            type="radio"
                                            name="gender"
                                            value="OTHER"
                                            checked={formData.gender === "OTHER"}
                                            onChange={(e) => handleChange("gender", e.target.value)}
                                            className="accent-roomi focus:outline-none appearance-none"
                                        />
                                        <div className={`w-5 h-5 mr-2 flex_center border border-gray-300 rounded-md 
                                            ${formData.gender === 'OTHER' && 'bg-roomi border-none'}`}>
                                            {formData.gender === 'OTHER' && (
                                                <FontAwesomeIcon icon={faCheck} className="text-xs text-white"/>
                                            )}
                                        </div>
                                        {t("선택없음")}
                                    </label>
                                </div>
                            </div>
                            {errors.gender && <p className="font-bold text-red-500 text-sm">{errors.gender}</p>}
                            <div className="my-2 flex items-center gap-4">
                                <div>
                                    <label htmlFor="is_korean_t" className="flex items-center mb-2 w-fit">
                                        <input
                                            id="is_korean_t"
                                            type="radio"
                                            name="is_korean"
                                            checked={formData.is_korean}
                                            onChange={(e) => handleChange("is_korean", true)}
                                            className="accent-roomi focus:outline-none appearance-none"
                                        />
                                        <div className={`w-5 h-5 mr-2 flex_center border border-gray-300 rounded-md 
                                            ${formData.is_korean && 'bg-roomi border-none'}`}>
                                            {formData.is_korean && (
                                                <FontAwesomeIcon icon={faCheck} className="text-xs text-white"/>
                                            )}
                                        </div>
                                        {t("내국인")}
                                    </label>
                                </div>
                                <div>
                                    <label htmlFor="is_korean_f" className="flex items-center mb-2 w-fit">
                                        <input
                                            id="is_korean_f"
                                            type="radio"
                                            name="is_korean"
                                            checked={!formData.is_korean}
                                            onChange={(e) => handleChange("is_korean", false)}
                                            className="accent-roomi focus:outline-none appearance-none"
                                        />
                                        <div className={`w-5 h-5 mr-2 flex_center border border-gray-300 rounded-md 
                                            ${!formData.is_korean && 'bg-roomi border-none'}`}>
                                            {!formData.is_korean && (
                                                <FontAwesomeIcon icon={faCheck} className="text-xs text-white"/>
                                            )}
                                        </div>
                                        {t("외국인")}
                                    </label>
                                </div>
                            </div>
                            {errors.is_korean && <p className="font-bold text-red-500 text-sm">{errors.is_korean}</p>}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            {checkboxList.map((item, index) => (
                                <div key={index} className="flex items-center justify-between w-full mb-2">
                                    <label className="flex items-center">
                                        <div className={`w-5 h-5 mr-2 flex_center border border-gray-300 rounded-md 
                                  ${formData.checkboxes[index] && 'bg-roomi border-none'}`}>
                                            {formData.checkboxes[index] && (
                                                <FontAwesomeIcon icon={faCheck} className="text-xs text-white"/>
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formData.checkboxes[index]}
                                            onChange={() => handleCheckboxChange(index)}
                                            className="focus:outline-none appearance-none"
                                        />
                                        {`${t(item.label)} (${t(item.required ? '필수' : '선택')})`}
                                    </label>
                                    <a
                                        href={
                                            item.label.includes('개인정보') ? 'https://roomi.co.kr/api/policies/privacy-policy' :
                                                item.label.includes('약관') ? 'https://roomi.co.kr/api/policies/terms-of-use' :
                                                    item.label.includes('마케팅') ? 'https://roomi.co.kr/api/policies/marketing-policy' :
                                                        '#'
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-roomi text-sm underline ml-2"
                                    >
                                        상세보기
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 이전/다음 버튼 */}
                <div className="flex justify-between">
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            className="px-6 py-3 text-roomi font-medium rounded-xl shadow-md hover:bg-gray-100 transition-all duration-200"
                            onClick={handlePrev}
                        >
                            이전
                        </button>
                    ) : (
                        <div></div>
                    )}
                    {currentStep === 3 ? (
                        <button
                            type="submit"
                            className={`px-6 py-3 font-medium rounded-xl shadow-md text-white transition-all duration-200 ${requiredChecked ? "bg-roomi hover:bg-roomi-dark" : "bg-gray-300 cursor-not-allowed"}`}
                            disabled={!requiredChecked}
                        >
                            등록
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="px-6 py-3 bg-roomi text-white font-medium rounded-xl shadow-md hover:bg-roomi-dark transition-all duration-200"
                            onClick={handleNext}
                        >
                            다음
                        </button>
                    )}
                </div>
            </form>

            {/* 모달 */}
            {showModal && (
                <div className="fixed inset-0 flex_center bg-black bg-opacity-40 z-[9999]">
                    <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl">
                        <div className="mb-4">
                            회원가입을 종료하시겠습니까?
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-6 py-3 bg-gray-400 text-white font-medium rounded-xl shadow-md hover:bg-gray-500 transition-all duration-200"
                                onClick={() => setShowModal(false)}
                            >
                                {t("취소")}
                            </button>
                            <button
                                type="button"
                                className="px-6 py-3 bg-roomi text-white font-medium rounded-xl shadow-md hover:bg-roomi-dark transition-all duration-200"
                                onClick={confirmBack}
                            >
                                예
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserJoinScreen;
