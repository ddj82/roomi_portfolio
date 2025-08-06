import Modal from "react-modal";
import React, {useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {useTranslation} from "react-i18next";

interface CommonModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    title?: string;
    children: React.ReactNode;
    widthClassName?: string;
    heightClassName?: string;
    zIndex?: number;
    customClassName?: string;
    contentClassName?: string;
}

const CommonModal = ({
                         isOpen,
                         onRequestClose,
                         title,
                         children,
                         widthClassName = "w-full",
                         heightClassName = "h-[100dvh]",
                         zIndex = 10000,
                         customClassName,
                         contentClassName,
}: CommonModalProps) => {
    const {t} = useTranslation();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            style={{
                overlay: {
                    zIndex: zIndex,
                },
            }}
            overlayClassName={`fixed inset-0 bg-black/10 flex_center`}
            className={`
                bg-white/95 shadow-lg outline-none modal-animation-forwards overflow-y-auto 
                ${customClassName} ${widthClassName} ${heightClassName}
            `}
        >
            <div className="sticky top-0 bg-transparent flex items-center justify-between p-4 md:py-6 bg-white mb-2 z-[10000]">
                <div className="w-8"/>
                {(title && title !== '') && (
                    <div className="w-full flex_center text-lg md:text-xl font-semibold">{t(title)}</div>
                )}
                <button
                    className="p-2 rounded-full"
                    onClick={onRequestClose}
                >
                    <FontAwesomeIcon icon={faTimes} className="text-gray-800 text-lg"/>
                </button>
            </div>
            <div className={`px-4 md:m-auto md:w-1/2 ${contentClassName}`}>{children}</div>
        </Modal>
    );
};

export default CommonModal;
