import React, {useEffect} from "react";
import Modal from "react-modal"; // react-modal 사용
import { FaSignOutAlt, FaRegHeart, FaCogs, FaRegEnvelope } from "react-icons/fa"; // react-icons 사용
import { useTranslation } from "react-i18next";
import { logout } from "src/api/api";
import { useHostModeStore } from "src/components/stores/HostModeStore";
import { useNavigate } from "react-router-dom"; // 웹에서는 react-router-dom 사용
import 'src/css/UserModal.css';
import { useIsHostStore } from "src/components/stores/IsHostStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {useChatStore} from "../stores/ChatStore";
import {useHostHeaderBtnVisibility} from "../stores/HostHeaderBtnStore";

interface UserModalProps {
    visible: boolean;
    onClose: () => void;
}

export const UserModal = ({ visible, onClose }: UserModalProps) => {
    const { t } = useTranslation();
    const { setHostMode, toggleUserMode, resetUserMode } = useHostModeStore();
    const navigate = useNavigate();
    const { isHost } = useIsHostStore();
    const disconnect = useChatStore((state) => state.disconnect);
    const isVisibleHostScreen = useHostHeaderBtnVisibility();

    const handleLogout = async () => {
        const confirmCancel = window.confirm(t('로그아웃 하시겠습니까?'));
        if (!confirmCancel) return;
        try {
            const response = await logout();
            console.log(response);
            resetUserMode();// hostMode 초기화
            disconnect(); // 소켓 서버 닫기
            onClose();
            window.location.reload();
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    const handleMessage = () => {
        console.log("메시지 메뉴");
        navigate('/chat');
        onClose();
    };

    const handleFavorite = () => {
        console.log("찜 목록 메뉴");
        onClose();
    };

    const handleHostManage = () => {
        console.log("호스트 관리 메뉴");
        setHostMode(true);
        navigate("/host");
        onClose();
    };

    const handleSettings = () => {
        console.log("계정설정메뉴");
        console.log('유저 정보 :', localStorage.getItem('userName'));
        navigate('/myPage');
        onClose();
    };

    const handleUserMode = () => {
        resetUserMode();
        navigate('/');
        onClose();
    };

    const handleUserHostMode = async () => {
        if (isHost) {
            toggleUserMode();
        } else {
            navigate('/hostAgree');
            onClose();
        }
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

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            contentLabel="User Modal"
            className="userModal modal-container"
            overlayClassName="userModal overlay"
        >
            <div className="userModal modal-content">
                <div className="userModal header">
                    <div className="flex_center w-20 h-20 m-4 bg-roomi rounded-full">
                        <FontAwesomeIcon icon={faUser} className="text-white text-3xl" />
                    </div>
                    <div className="text-lg font-bold">{localStorage.getItem('userName')}</div>
                </div>

                <div className="userModal content text-sm md:text-lg">
                    {isHost ? (
                        <>
                            {isVisibleHostScreen ? (
                                <button onClick={handleUserMode} className="userModal menu-item">
                                    <FontAwesomeIcon icon={faUser} className="text-xl md:text-2xl" />
                                    {t("게스트로 전환")}
                                </button>
                            ) : (
                                <button onClick={handleHostManage} className="userModal menu-item">
                                    <FontAwesomeIcon icon={faUser} className="text-xl md:text-2xl"/>
                                    {t("호스트로 전환")}
                                </button>
                            )}
                        </>
                    ) : (
                        <button onClick={handleUserHostMode} className="userModal menu-item">
                            <FontAwesomeIcon icon={faUser} className="text-xl md:text-2xl" />
                            {t("호스트 등록")}
                        </button>
                    )}

                    {!isVisibleHostScreen && (
                        <>
                            <button onClick={handleMessage} className="userModal menu-item">
                                <FaRegEnvelope className="text-xl md:text-2xl"/>
                                {t("message")}
                            </button>
                            <button onClick={handleFavorite} className="userModal menu-item">
                                <FaRegHeart className="text-xl md:text-2xl"/>
                                {t("찜 목록")}
                            </button>
                        </>
                    )}

                    <button onClick={handleSettings} className="userModal menu-item">
                        <FaCogs className="text-xl md:text-2xl"/>
                        {t("계정 설정")}
                    </button>

                    <button onClick={handleLogout} className="userModal menu-item">
                        <FaSignOutAlt className="text-xl md:text-2xl"/>
                        {t("로그아웃")}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
