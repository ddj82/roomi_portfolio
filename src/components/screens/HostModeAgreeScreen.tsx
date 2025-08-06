import React, {useEffect, useState} from 'react';
import {be_host, termsOfUse} from "src/api/api";
import {useIsHostStore} from "src/components/stores/IsHostStore";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faInfo} from "@fortawesome/free-solid-svg-icons";
import {faBuilding, faCheckCircle, faCircle} from "@fortawesome/free-regular-svg-icons";
import {useTranslation} from "react-i18next";
import {useHostModeStore} from "../stores/HostModeStore";

const HostModeAgreeScreen = () => {
    const {t} = useTranslation();
    const [isChecked, setIsChecked] = useState(false);
    const [termsContent, setTermsContent] = useState(""); // 약관 내용을 저장하는 상태
    const navigate = useNavigate();
    const { setIsHost } = useIsHostStore();
    const {hostMode, setHostMode} = useHostModeStore();
    const [hostModeAgreeForm, setHostModeAgreeForm] = useState({
        host_type: "",
        bank: "",
        bank_holder: "",
        account: "",
    });
    const [showModal, setShowModal] = useState(false); // 나가기 모달
    const [currentStep, setCurrentStep] = useState(1); // 현재 진행 단계
    const totalSteps = 3; // 전체 단계 수
    const [loading, setLoading] = useState(false);
    // 오류 메시지 상태 추가
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // 다음버튼
    const handleNext = () => {
        const newErrors: { [key: string]: string } = {}; // 새로운 오류 객체
        if (currentStep === 1) {
            if (hostModeAgreeForm.host_type === "") {
                newErrors.host_type = "호스트 유형을 선택해주세요.";
            }
        } else if (currentStep === 2) {
            if (hostModeAgreeForm.bank === "") {
                newErrors.bank = "은행을 선택해주세요.";
            }

            if (hostModeAgreeForm.bank_holder === "") {
                newErrors.bank_holder = "예금주명을 입력해주세요.";
            } else if (!/^[가-힣]+$/.test(hostModeAgreeForm.bank_holder)) {
                newErrors.bank_holder = "예금주명은 한글만 입력 가능합니다.";
            }

            if (hostModeAgreeForm.account === "") {
                newErrors.account = "계좌번호를 입력해주세요.";
            } else if (!/^\d+$/.test(hostModeAgreeForm.account)) {
                newErrors.account = "계좌번호는 숫자만 입력 가능합니다.";
            }
        }

        // 오류가 있으면 상태 업데이트 후 진행 중지
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 오류가 없으면 다음 단계로 이동
        setErrors({}); // 오류 초기화
        if (currentStep < totalSteps) setCurrentStep((p) => p + 1);
    };

    // 이전버튼
    const handlePrev = () => {
        setIsChecked(false);
        if (currentStep > 1) setCurrentStep((p) => p - 1);
    };

    // 입력요소 컨트롤러
    const handleChange = (field: string, value: string) => {
        setHostModeAgreeForm(prev => ({ ...prev, [field]: value }));
    };

    // 체크박스 상태 변경 핸들러
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
    };

    useEffect(() => {
        const handleTermsOfUse = async () => {
            try {
                const response = await termsOfUse();
                const htmlContent = await response.text(); // 응답에서 HTML 텍스트 추출
                setTermsContent(htmlContent); // 상태에 HTML 텍스트 저장
            } catch (error) {
                console.log('동의 실패', error);
            }
        };
        handleTermsOfUse();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('ㅎㅇ', hostModeAgreeForm);

        try {
            const response = await be_host(hostModeAgreeForm);
            if (response) {
                setIsHost(true);
                setHostMode(true);
                alert('호스트 등록이 완료되었습니다.');
                navigate('/host');
            } else {
                alert('호스트 등록에 실패하였습니다.');
            }
        } catch (error) {
            console.error("호스트등록 실패:", error);
        }
    };

    const renderStepTitle = (currentStep: number) => {
        let stepTitle;
        let stepContent;
        switch (currentStep) {
            case 1: {
                stepTitle = '호스트 유형';
                stepContent = '호스트 유형을 선택해주세요.';
                break;
            }
            case 2: {
                stepTitle = '호스트 정보';
                stepContent = '호스트 정보를 입력해주세요.';
                break;
            }
            case 3: {
                stepTitle = '약관 동의';
                stepContent = '서비스 이용 약관에 동의 해주세요.';
                break;
            }
        }

        return (
            <>
                <div className="text-xl font-bold">{stepTitle}</div>
                <div className="text-gray-600">{stepContent}</div>
            </>
        );
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="p-6">
                {/* 상단 헤더 */}
                <div className="mb-6 p-4 border rounded-md flex">
                    <button
                        type="button"
                        className="rounded-md p-2 w-10 h-10"
                        onClick={() => setShowModal(true)}
                    >
                        <FontAwesomeIcon icon={faArrowLeft}/>
                    </button>
                    <div className="mx-4 flex-1">{renderStepTitle(currentStep)}</div>
                </div>

                {/* 진행 바 */}
                <div className="w-full mb-4">
                    <div className="relative h-2 bg-gray-200 rounded-full">
                        <div
                            className="absolute h-2 bg-roomi rounded-full transition-all duration-300"
                            style={{width: `${(currentStep / totalSteps) * 100}%`}}
                        />
                    </div>
                    <div className="text-sm text-gray-600 mt-1 ml-2">
                        {currentStep} / {totalSteps}
                    </div>
                </div>

                {/* 페이지 컨텐츠 */}
                <div className="mb-6 p-4 border rounded-md">
                    {currentStep === 1 && (
                        /*호스트 유형*/
                        <div>
                            {/*안내*/}
                            <div className="p-4 rounded-lg bg-roomi-000">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">호스트 등록을 시작합니다</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>호스트가 되시면 숙소를 등록하고 관리할 수 있습니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>아래에서 호스트 유형을 선택해주세요.
                                    </div>
                                </div>
                            </div>
                            <div className="font-bold mt-4">호스트 유형</div>
                            <div className="md:flex mt-4">
                                {/* 개인 호스트 (단기임대) */}
                                <div className="md:w-1/2">
                                    <label htmlFor="individual"
                                           className={`flex flex-col h-full p-4 border-2 rounded-lg cursor-pointer transition 
                                                       ${hostModeAgreeForm.host_type === "individual" ?
                                               "bg-roomi-000 border-roomi" : "border text-gray-700 hover:bg-gray-100"}`}
                                    >
                                        <div className="flex">
                                            <div
                                                className={`flex_center p-2 text-gray-300
                                                            ${hostModeAgreeForm.host_type === "individual" && "text-roomi"}`}
                                            >
                                                {hostModeAgreeForm.host_type === "individual" ? (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                                ) : (
                                                    <FontAwesomeIcon icon={faCircle} className="w-6 h-6"/>
                                                )}
                                            </div>
                                            <div className="w-full ml-4">
                                                <div
                                                    className={`font-bold 
                                                            ${hostModeAgreeForm.host_type === "individual" && "text-roomi"}`}
                                                >
                                                    개인 호스트 (단기임대)
                                                </div>
                                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                    개인 소득공제용 현금영수증 발급이 가능합니다.
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="radio" name="host_type" id="individual" value="individual"
                                            checked={hostModeAgreeForm.host_type === "individual"}
                                            onChange={(e) => handleChange("host_type", e.target.value)}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                {/* 사업자 호스트 */}
                                <div className="md:w-1/2">
                                    <label htmlFor="business"
                                           className={`flex flex-col h-full p-4 border-2 rounded-lg cursor-pointer transition 
                                                       ${hostModeAgreeForm.host_type === "business" ?
                                               "bg-roomi-000 border-roomi" : "border text-gray-700 hover:bg-gray-100"}`}
                                    >
                                        <div className="flex">
                                            <div
                                                className={`flex_center p-2 text-gray-300
                                                            ${hostModeAgreeForm.host_type === "business" && "text-roomi"}`}
                                            >
                                                {hostModeAgreeForm.host_type === "business" ? (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6"/>
                                                ) : (
                                                    <FontAwesomeIcon icon={faCircle} className="w-6 h-6"/>
                                                )}
                                            </div>
                                            <div className="w-full ml-4">
                                                <div
                                                    className={`font-bold 
                                                            ${hostModeAgreeForm.host_type === "business" && "text-roomi"}`}
                                                >
                                                    사업자 호스트
                                                </div>
                                                <div className="text-gray-500 md:text-sm text-xs mt-1">
                                                    사업자 정보가 필요합니다.
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="radio" name="host_type" id="business" value="business"
                                            checked={hostModeAgreeForm.host_type === "business"}
                                            onChange={(e) => handleChange("host_type", e.target.value)}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                            {errors.host_type && <p className="font-bold text-red-500 text-sm">{errors.host_type}</p>}
                        </div>
                    )}
                    {currentStep === 2 && (
                        /*호스트 정보*/
                        <div>
                            {/*안내*/}
                            <div className="p-4 rounded-lg bg-roomi-000">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">정산 계좌 정보</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>예약금 정산을 위한 계좌 정보를 입력해 주세요.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>계좌 정보는 예약금 정산을 위해 사용됩니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>본인 명의의 계좌만 등록 가능합니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>계좌 정보는 마이페이지에서 수정할 수 있습니다.
                                    </div>
                                </div>
                            </div>
                            <div className="font-bold mt-4">정산 계좌 정보</div>
                            <div className="pt-4 space-y-4">
                                <div className="flex">
                                    <span className="w-1/4 flex items-center text-sm text-gray-500">{t('은행명')}</span>
                                    <div className="w-full">
                                        <select
                                            name="bank"
                                            value={hostModeAgreeForm.bank}
                                            className="w-full mt-1 pr-4 pl-2 py-2 border rounded text-sm bg-white"
                                            onChange={(e) => handleChange("bank", e.target.value)}
                                        >
                                            <option value="" disabled>{t('은행 선택')}</option>
                                            <option value="국민은행">국민은행</option>
                                            <option value="우리은행">우리은행</option>
                                            <option value="농협">농협</option>
                                            <option value="하나은행">하나은행</option>
                                            <option value="신한은행">신한은행</option>
                                            <option value="기업은행">기업은행</option>
                                            <option value="카카오뱅크">카카오뱅크</option>
                                            <option value="토스뱅크">토스뱅크</option>
                                        </select>
                                        {errors.bank &&
                                            <p className="font-bold text-red-500 text-sm">{errors.bank}</p>}
                                    </div>
                                </div>

                                <div className="flex">
                                    <span className="w-1/4 flex items-center text-sm text-gray-500">{t('예금주')}</span>
                                    <div className="w-full">
                                        <input
                                            name="bank_holder"
                                            type="text"
                                            value={hostModeAgreeForm.bank_holder}
                                            onChange={(e) => handleChange("bank_holder", e.target.value)}
                                            className="w-full mt-1 pr-4 pl-2 py-2 border rounded"
                                            placeholder={t('예금주')}
                                        />
                                        {errors.bank_holder &&
                                            <p className="font-bold text-red-500 text-sm">{errors.bank_holder}</p>}
                                    </div>
                                </div>

                                <div className="flex">
                                    <span className="w-1/4 flex items-center text-sm text-gray-500">{t('계좌번호')}</span>
                                    <div className="w-full">
                                        <input
                                            name="account"
                                            type="text"
                                            value={hostModeAgreeForm.account}
                                            onChange={(e) => handleChange("account", e.target.value)}
                                            className="w-full mt-1 pr-4 pl-2 py-2 border rounded"
                                            placeholder={t('- 없이 입력해주세요.')}
                                        />
                                        {errors.account &&
                                            <p className="font-bold text-red-500 text-sm">{errors.account}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 3 && (
                        /*약관 동의*/
                        <div>
                            {/*안내*/}
                            <div className="p-4 rounded-lg bg-roomi-000">
                                <div className="flex items-center text-roomi m-2">
                                    <div className="w-5 h-5 flex_center border-2 border-roomi rounded-full">
                                        <FontAwesomeIcon icon={faInfo} className="w-3 h-3"/>
                                    </div>
                                    <div className="ml-4 font-bold">안내사항</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <div className="p-1 px-2">
                                        <strong> · </strong>호스트 등록 시 이용약관에 동의하는 것으로 간주됩니다.
                                    </div>
                                    <div className="p-1 px-2">
                                        <strong> · </strong>등록 완료 후 호스트 페이지로 이동합니다.
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 space-y-4">
                                {/*약관 내용*/}
                                <div>
                                    <div
                                        dangerouslySetInnerHTML={{__html: termsContent}}
                                        style={{
                                            // border: "1px solid #ddd",
                                            padding: "10px",
                                            marginBottom: "20px",
                                            height: "400px", // 고정 높이 설정
                                            overflowY: "scroll", // 세로 스크롤 처리
                                        }}
                                    ></div>
                                </div>
                                <div className="no-select">
                                    <button
                                        type="button"
                                        onClick={() => setIsChecked(prev => !prev)}
                                    >
                                        <div className="flex gap-2">
                                            <div className={`flex_center text-gray-300 ${isChecked && "text-roomi"}`}>
                                                {isChecked ? (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5"/>
                                                ) : (
                                                    <FontAwesomeIcon icon={faCircle} className="w-5 h-5"/>
                                                )}
                                            </div>
                                            <div className="flex_center">
                                                호스트로서 위의 사항들을 준수할 것을 동의합니다.
                                            </div>
                                        </div>
                                    </button>
                                    <input
                                        id="checkboxText"
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={handleCheckboxChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 이전/다음/저장 버튼 */}
                <div className="flex justify-between">
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            className="px-4 py-2 text-roomi"
                            onClick={handlePrev}
                        >
                            이전
                        </button>
                    ) : (
                        <div/>
                    )}
                    {currentStep === totalSteps ? (
                        <button
                            type="submit"
                            className={`px-6 py-2 rounded-md text-white 
                                ${isChecked ? "bg-roomi hover:bg-roomi-dark" : "bg-gray-300 cursor-not-allowed"}
                            `}
                            disabled={!isChecked || loading}
                        >
                            등록
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="px-4 py-2 bg-roomi text-white rounded-md"
                            onClick={handleNext}
                            disabled={loading}
                        >
                            다음
                        </button>
                    )}
                </div>

                {/* 로딩 오버레이 */}
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                        <div role="status" className="m-10 flex flex-col items-center">
                            <svg
                                aria-hidden="true"
                                className="inline w-8 h-8 text-gray-300 animate-spin fill-roomi"
                                viewBox="0 0 100 101"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                />
                            </svg>
                            <div className="mt-2">등록중...</div>
                        </div>
                    </div>
                )}

                {/* 종료 모달 */}
                {showModal && (
                    <div className="fixed inset-0 flex_center bg-gray-600 bg-opacity-50">
                        <div className="bg-white p-6 rounded-md shadow-md">
                            <div className="mb-4">호스트 등록을 종료하시겠습니까?</div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 rounded-md"
                                    onClick={() => setShowModal(false)}
                                >
                                    취소
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                                    onClick={() => navigate("/myPage")}
                                >
                                    나가기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default HostModeAgreeScreen;
