import React from 'react';
import {useHostHeaderBtnVisibility} from "../stores/HostHeaderBtnStore";
import {useFooterVisibility} from "../stores/FooterStore";

const Footer: React.FC = () => {
    const isVisibleHostScreen = useHostHeaderBtnVisibility();
    const isFooterVisible = useFooterVisibility();


    if (isVisibleHostScreen || !isFooterVisible) {
        return <div></div>
    } else {
        return (
            <div className="border-t border-gray-200 py-5 px-4 md:py-6">
                <div className="container mx-auto xl:max-w-[1500px] px-[20px]">
                    <div className="text-xs md:text-sm text-black">
                        <div>※ 본 프로젝트는 (주) 룸메이트 소속으로 2인 팀이 공동 개발한 스타트업 MVP입니다. 현재는 사업 방향 변경에 따라 개발이 중단되었으며, 개인 포트폴리오 용도로 일부 기능을 보존하여 배포하고 있습니다.</div>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500">
                        <div>상호명 : 루미(Roomi) / (주) 룸메이트 | 대표자: 진유진</div>
                        <div>사업자등록번호: 159-81-03462 | 전화: 02-303-1455</div>
                        <div>주소: 서울특별시 마포구 월드컵북로 1길 52, 지층44</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-3 leading-[20px]">
                        루미(Roomi)는 모든 거래에 대한 책임과 배송, 교환, 환불 민원 등의 처리를 (주) 룸메이트에서 진행합니다.
                        <br/>통신판매업 신고번호: 제 2025-서울마포-1699 호
                        <br/>자세한 문의는 e-mail: help@roomi.co.kr, 유선: 02-303-1455 로 가능합니다.
                    </div>
                    <div className="text-xs text-gray-400 mt-3 leading-[20px]">
                        © 2025 ROOMMATES Co. All rights reserved.
                    </div>
                </div>
            </div>
        );
    }
};

export default Footer;
