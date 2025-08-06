import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from "react-i18next";
import {getUserById, updateUserInfo} from "../../../api/api";
import {User} from "../../../types/user";
import dayjs from "dayjs";
import {useIsHostStore} from "../../stores/IsHostStore";
import MyInfo from "./MyInfo";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faImage} from "@fortawesome/free-regular-svg-icons";

export default function MyInfoEdit() {
    const {t} = useTranslation();
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const {isHost} = useIsHostStore();
    const [editMyInfo, setEditMyInfo] = useState(false);
    const [form, setForm] = useState<User | null>(null);
    const [confirmPassword, setConfirmPassword] = useState('');
    // 오류 메시지 상태 추가
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    // 초기 form 상태 저장용
    const initialFormRef = useRef<User | null>(null);
    // 프로필 파일 및 미리보기 관리
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");

    // 사진파일 관련 ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (userId !== null) {
                    const response = await getUserById(Number(userId));
                    const data = await response.json();
                    setUserInfo(data);
                }
            } catch (e) {
                console.error('유저 정보 불러오기 실패:', e);
            }
        };
        fetchUserInfo();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [editMyInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setErrors({}); // 오류 초기화
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev!,
            [name]: value
        }));
    };

    const handleEditMyInfo = () => {
        setEditMyInfo(true);
        if (userInfo) {
            const init = {
                name: userInfo.name,
                email: userInfo.email,
                phone: userInfo.phone ?? '',
                birth: userInfo.birth ? dayjs.utc(userInfo.birth).format('YYYY-MM-DD') : '',
                // password: userInfo.password,
                password: '', // 비밀번호 변경 시 입력 받음
                bank_holder: userInfo.bank_holder ?? '',
                bank: userInfo.bank ?? '',
                account: userInfo.account ?? ''
            } as User;
            setForm(init);
            initialFormRef.current = init;
        }
    };

    // 취소 처리 (변경사항 확인)
    const handleCancel = () => {
        if (!form || !initialFormRef.current) {
            setEditMyInfo(false);
            return;
        }
        // 변경 체크
        const initial = initialFormRef.current;
        const hasChange = selectedFile ||
            Object.entries(form).some(([key, value]) => (initial as any)[key] !== value);
        if (hasChange) {
            const confirmCancel = window.confirm(t('변경사항이 있습니다. 수정을 종료하시겠습니까?'));
            if (!confirmCancel) return;
        }
        // 초기 상태 복원
        setForm(initial);
        setSelectedFile(null);
        setPreview("");
        setEditMyInfo(false);
        setConfirmPassword('');
        setErrors({}); // 오류 초기화
    };

    /*사진 파일 관련*/
    // 숨겨진 파일 input 클릭 트리거
    const handleInputFileSet = () => {
        fileInputRef.current?.click();
    };
    // 파일 선택 시 실행될 함수
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
        // 같은 파일 재업로드 시 이벤트 트리거
        e.target.value = "";
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!form || !initialFormRef.current || !userInfo) return;

        const newErrors: { [key: string]: string } = {}; // 새로운 오류 객체

        // 초기 유저 데이터
        const initial = initialFormRef.current;

        // 변경사항 체크
        const hasChange = selectedFile ||
            Object.entries(form).some(([key, value]) => (initial as any)[key] !== value);

        // 변경사항 없으면 종료
        if (!hasChange) {
            alert(t('수정사항이 없습니다.'));
            setEditMyInfo(false);
            return;
        } else {
            // 변경사항 있으면 유효성 검사
            console.log(form);

            // 전화번호 변경 시
            if (!/^\d{10,11}$/.test(form.phone as string)) {
                newErrors.phone = "올바른 전화번호를 입력하세요.";
            }

            // 비밀번호 변경 시
            if (form.password !== "") {
                if (form.password.length < 8) {
                    newErrors.password = "비밀번호는 최소 8자리 이상이어야 합니다.";
                }
                if (form.password !== confirmPassword) {
                    newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
                }
            }

            // 오류가 있으면 상태 업데이트 후 진행 중지
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }
            // 오류가 없으면 다음 단계로 이동
            setErrors({}); // 오류 초기화
        }

        // 변경된 필드만 담을 객체
        const updatedData: Partial<typeof form> = {}

        Object.entries(form).forEach(([key, value]) => {
            const initialValue = (initial as any)[key]
            if (value !== initialValue) {
                // birth 필드는 ISO 포맷으로 변환
                if (key === 'birth' && typeof value === 'string') {
                    updatedData.birth = dayjs.utc(value).startOf('day').toISOString()
                } else {
                    ;(updatedData as any)[key] = value
                }
            }
        })

        console.log('정보 수정', updatedData);

        try {
            const response = await updateUserInfo(updatedData, selectedFile);
            if (response.ok) {
                alert("정보 수정이 완료되었습니다.");
            } else {
                alert("업데이트에 실패했습니다.");
            }
        } catch (e) {
            console.error('수정 실패', e);
        }
        setEditMyInfo(false);
        window.location.reload();
    };

    return (
        <form onSubmit={handleSubmit}>
            {userInfo ? (
                <>
                    {editMyInfo ? (
                        <div className="space-y-4">
                            {/* 프로필 이미지 */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4">
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            <img
                                                src={preview || userInfo.profile_image || '/assets/images/profile.png'}
                                                alt="프로필 이미지"
                                                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleInputFileSet}
                                                className="absolute right-0 bottom-0 w-7 h-7 bg-roomi text-white rounded-full flex items-center justify-center hover:bg-roomi-1 transition-colors focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:ring-offset-2"
                                            >
                                                <FontAwesomeIcon icon={faImage} className="w-3 h-3"/>
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 기본 정보 섹션 */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-900">{t('기본 정보')}</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">{t('이름')}</label>
                                            <input
                                                name="name"
                                                type="text"
                                                value={form?.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">{t('전화번호')}</label>
                                            <input
                                                name="phone"
                                                type="tel"
                                                value={form?.phone}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent ${
                                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {errors.phone && (
                                                <p className="text-red-500 text-sm">{errors.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">{t('이메일')}</label>
                                        <input
                                            name="email"
                                            type="text"
                                            value={form?.email}
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">{t('생년월일')}</label>
                                        <input
                                            name="birth"
                                            type="date"
                                            value={form?.birth}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 비밀번호 변경 섹션 */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-900">{t('비밀번호 변경')}</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">{t('새 비밀번호')}</label>
                                        <input
                                            name="password"
                                            type="password"
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent ${
                                                errors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder={t('새 비밀번호를 입력하세요')}
                                        />
                                        {errors.password && (
                                            <p className="text-red-500 text-sm">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">{t('비밀번호 확인')}</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent ${
                                                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder={t('비밀번호를 다시 입력하세요')}
                                        />
                                        {errors.confirmPassword && (
                                            <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 호스트 정보 섹션 */}
                            {isHost && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-900">{t('정산 정보')}</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">{t('예금주')}</label>
                                                <input
                                                    name="bank_holder"
                                                    type="text"
                                                    value={form?.bank_holder}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">{t('은행명')}</label>
                                                <select
                                                    name="bank"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent"
                                                    value={form?.bank}
                                                    onChange={handleChange}
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
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">{t('계좌번호')}</label>
                                            <input
                                                name="account"
                                                type="text"
                                                value={form?.account}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-roomi-1 focus:border-transparent"
                                                placeholder={t('- 없이 입력해주세요.')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 버튼 그룹 */}
                            {/* 버튼 그룹 */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 text-sm"
                                >
                                    {t('취소')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 px-4 text-white bg-roomi rounded-lg font-medium hover:bg-roomi-1 transition-colors focus:outline-none focus:ring-2 focus:ring-roomi focus:ring-offset-2 text-sm"
                                >
                                    {t('완료')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <MyInfo user={userInfo}/>
                            {/* 수정 버튼 */}
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={handleEditMyInfo}
                                    className="w-full bg-roomi text-white rounded-lg px-4 py-3 font-medium hover:bg-roomi-1 transition-colors focus:outline-none focus:ring-2 focus:ring-roomi focus:ring-offset-2 text-sm"
                                >
                                    {t('수정')}
                                </button>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-center py-16 text-gray-500">
                        <div className="text-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 mx-auto text-gray-400 mb-3 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <p>{t('유저 정보를 불러오는 중입니다...')}</p>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};