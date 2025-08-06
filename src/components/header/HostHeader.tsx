import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {useHostTabNavigation} from "../stores/HostTabStore";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendar, faComments, faDollarSign, faFileLines, faHouseChimney} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";

const tabIcons: Record<string, JSX.Element> = {
    my_room: <FontAwesomeIcon icon={faHouseChimney} />,
    contract_management: <FontAwesomeIcon icon={faFileLines} />,
    room_status: <FontAwesomeIcon icon={faCalendar} />,
    message: <FontAwesomeIcon icon={faComments} />,
    settlement: <FontAwesomeIcon icon={faDollarSign} />,
};

const HostHeader: React.FC = () => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab } = useHostTabNavigation();
    const tabs = ["my_room", "contract_management", "room_status", "message", "settlement"] as const;
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Add event listener for window resize
        window.addEventListener("resize", handleResize);

        // Cleanup function: Remove event listener when component unmounts
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (isMobile) {
                const currentScrollY = window.scrollY;

                // Show header when scrolling down, hide when scrolling up
                // We set a threshold of 50px to prevent the header from hiding on small scrolls
                if (currentScrollY > lastScrollY && isVisible && currentScrollY > 50) {
                    setIsVisible(false);
                } else if (currentScrollY < lastScrollY && !isVisible) {
                    setIsVisible(true);
                }

                setLastScrollY(currentScrollY);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isMobile, lastScrollY, isVisible]);

    const handleSetSelectedMenu = (selectMenu: string) => {
        navigate(`/host/teb/${selectMenu}`);
    };

    // Desktop Header Navigation
    const DesktopNavigation = () => (
        <div
            className="flex_center flex-wrap text-sm font-medium bg-transparent"
            style={{marginTop: '-58px'}}  // 또는 -58px, -59px 등 1px씩 조정
            role="tablist"
        >
            {tabs.map((tab) => (
                <div key={tab} role="presentation" className="lg:mx-4 text-base">
                    <button
                        className={`
                            inline-block p-4 relative
                            ${activeTab === tab ? "text-roomi border-b-2 border-b-roomi" : "hover:text-roomi"
                        }`}
                        onClick={() => {
                            setActiveTab(tab);
                            handleSetSelectedMenu(tab);
                        }}
                        type="button"
                        role="tab"
                        aria-controls={tab}
                        aria-selected={activeTab === tab}
                    >
                        {t(tab)}
                    </button>
                </div>
            ))}
        </div>
    );

    // Mobile Bottom Navigation - Now standalone with scroll behavior
    const MobileNavigation = () => (
        <div
            className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 transition-transform duration-300 ${
                isVisible ? 'transform translate-y-0' : 'transform translate-y-full'
            }`}
        >
            {tabs.map((tab) => (
                <button
                    key={tab}
                    className={`flex flex-col items-center justify-center w-1/5 p-2 ${
                        activeTab === tab ? "text-roomi" : "text-gray-500"
                    }`}
                    onClick={() => {
                        setActiveTab(tab);
                    }}
                    type="button"
                    role="tab"
                    aria-controls={tab}
                    aria-selected={activeTab === tab}
                >
                    <div className="text-xl mb-1">{tabIcons[tab]}</div>
                    <span className="text-xs">{t(tab)}</span>
                </button>
            ))}
        </div>
    );

    return (
        <>
            {isMobile ? <div /> : <DesktopNavigation />}
            {/* Add padding at the bottom of your content when in mobile to prevent content from being hidden behind the bottom nav */}
            {isMobile && <div className={`${isVisible ? 'block' : 'hidden'}`}></div>}
        </>
    );
};

export default HostHeader;