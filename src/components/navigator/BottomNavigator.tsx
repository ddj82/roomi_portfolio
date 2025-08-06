import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {useHostTabNavigation} from "../stores/HostTabStore";
import {House, Calendar, ChatText,Article} from "@phosphor-icons/react";

const tabIcons: Record<string, JSX.Element> = {
    my_room: <House size ={24}/>,
    contract_management: <Article size ={24}/>,
    room_status: <Calendar size={24} />,
    message: <ChatText size={24} />,
};

const BottomNavigation: React.FC = () => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab } = useHostTabNavigation();
    const tabs = ["my_room", "contract_management", "room_status", "message"] as const;

    // --- 1) 동적 vh 계산 (옵션)
    const [vh, setVh] = useState(window.innerHeight);
    useEffect(() => {
        const onResize = () => setVh(window.innerHeight);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    useEffect(() => {
        document.documentElement.style.setProperty("--vh", `${vh * 0.01}px`);
    }, [vh]);

    // --- 2) 네비게이터 높이
    const navHeight = 56;
    const safeInset = "env(safe-area-inset-bottom)";
    const safeInsetFallback = "constant(safe-area-inset-bottom)";

    return (
        <div
            className="fixed bottom-0 left-0 w-full bg-white backdrop-blur-sm border-t border-gray-200/50 flex justify-center items-center z-50"
            style={{
                bottom: 0,
                // navHeight + safe-area-inset
                height: `calc(${navHeight}px + ${safeInset})`,
                // iOS 구버전용 fallback
                WebkitPaddingEnd: safeInsetFallback,
                paddingBottom: safeInsetFallback,
                boxShadow: '0 -2px 8px rgba(167, 97, 97, 0.15)',
            }}
        >
            <div className="flex justify-around items-center w-full max-w-md">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`flex flex-col items-center justify-end p-2 min-w-0 transition-colors duration-200 ${
                            activeTab === tab ? "text-roomi" : "text-gray-500"
                        }`}
                        onClick={() => setActiveTab(tab)}
                        type="button"
                        role="tab"
                        aria-controls={tab}
                        aria-selected={activeTab === tab}
                    >
                        <div className="text-lg mt-3 mb-1" style={{fontWeight: 300}}>{tabIcons[tab]}</div>
                        <span className="text-[10px] leading-tight mt-0.5">{t(tab)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNavigation;