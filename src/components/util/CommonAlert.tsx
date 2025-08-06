import React, {useEffect} from 'react';
import Modal from "react-modal";
import {useTranslation} from "react-i18next";

interface  CommonAlertProps {
    isOpen: boolean;
    onRequestClose: () => void;
    content: string;
    confirm?: boolean;
    confirmResponse?: (result: boolean) => void;
    zIndex?: number;
}

const CommonAlert = ({
                         isOpen,
                         onRequestClose,
                         content,
                         confirm,
                         confirmResponse,
                         zIndex = 10001,
}: CommonAlertProps) => {
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
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc={false}
            overlayElement={(props, content) => (
                <div
                    {...props}
                    onClick={e => e.stopPropagation()}   // ← overlay 클릭 시 전파 차단
                    className={props.className + " pointer-events-auto"} // 필수: overlay가 클릭 이벤트를 받아야 합니다
                    style={props.style}
                >
                    {content}
                </div>
            )}
            style={{
                overlay: {
                    zIndex: zIndex,
                },
            }}
            overlayClassName={`fixed inset-0 bg-black/40 flex_center`}
            className={`shadow-lg outline-none modal-animation-ease-in relative w-full h-[100dvh]`}
        >
            <div
                id="alert-main"
                className="
                    bg-white rounded-lg p-4 absolute transform
                    md:m-0 md:w-1/3 md:top-0 md:-translate-y-0
                    w-[90%] top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2
                "
            >
                <div id="alert-content" className="mb-2">
                    {t(content)}
                </div>
                <div id="alert-footer" >
                    {confirm ? (
                        /* confirm 창 */
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    confirmResponse?.(true);
                                    onRequestClose();
                                }}
                                className="rounded-lg p-2 px-4 bg-roomi w-fit text-white"
                            >
                                {t('확인')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    confirmResponse?.(false);
                                    onRequestClose();
                                }}
                                className="rounded-lg p-2 px-4 bg-gray-300 w-fit"
                            >
                                {t('취소')}
                            </button>
                        </div>
                    ) : (
                        /* alert 창 */
                        <div id="alert-footer" className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    onRequestClose();
                                }}
                                className="rounded-lg p-2 px-4 bg-roomi w-fit text-white"
                            >
                                {t('확인')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default CommonAlert;
