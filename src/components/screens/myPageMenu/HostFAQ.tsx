import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import AccordionItem from "../../util/AccodionItem";
import {FAQList, FAQTitle} from "../../../types/faq";

export default function HostFAQ() {
    const {t} = useTranslation();

    const faqTitles: FAQTitle[] = [
        { id: 1, listId: 'faqList1', title: t('세금') },
        { id: 2, listId: 'faqList2', title: t('정산 관련') },
    ];

    const faqList1: FAQList[] = [
        {
            id: 1,
            title: t('Roomi에서 발생한 수익은 어떻게 신고해야 하나요?'),
            content: t('Roomi를 통해 발생한 임대 소득은 호스트 본인이 직접 세금 신고를 진행해야 합니다.\n' +
                '임대 소득은 과세 대상이며, 소득세 납부가 필요할 수 있습니다.\n' +
                '자세한 신고 절차 및 기준은 국세청 홈페이지에서 확인하시거나 세무 전문가와 상담하시길 권장드립니다.')
        },
        {
            id: 2,
            title: t('임대료에 대한 부가세 신고가 필요한가요?'),
            content: t('임대 유형에 따라 부가세 신고 여부가 다릅니다. \n\n' +
                '✅ 부가세 신고가 필요 없는 경우 \n' +
                '• 주거용 임대 (예: 일반 주택, 원룸, 주거용 오피스텔 등) \n\n' +
                '✅ 부가세 신고가 필요한 경우 \n' +
                '• 비주거용 공간 임대 (예: 호텔, 숙박업소, 사무용 오피스텔, 공유 오피스 등) \n\n' +
                '💡 주거용 임대의 경우 부가세 신고 의무가 없지만, 비주거용 임대는 법령에 따라 부가세 신고가 필요할 수 있습니다. \n' +
                '국세청 가이드라인을 확인하고 필요한 신고 절차를 진행해 주세요.')
        },
        {
            id: 3,
            title: t('Roomi에서 전자세금계산서 또는 현금영수증 발행이 가능한가요?'),
            content: t('Roomi에서 발생하는 서비스 이용 수수료에 한하여 현금영수증 및 전자세금계산서 발행이 가능합니다. \n\n' +
                '💡 발행 방법 \n' +
                '1.Roomi 앱 → "마이페이지" 메뉴 → "영수증 발급" 선택 \n' +
                '2.영수증 종류 및 정보를 입력 후 신청')
        },
    ];

    // 다른 FAQ 리스트들...
    const faqList2: FAQList[] = [
        {
            id: 1,
            title: t('Roomi에서 임대료 정산은 언제, 어떻게 진행되나요?'),
            content: t('Roomi는 안전한 정산 시스템을 통해 호스트의 수익을 신속하게 정산해 드립니다.\n\n\n' +
                '✅ 정산 절차\n\n' +
                '1.게스트가 공간을 이용하는 시점부터 정산이 시작됩니다.\n\n' +
                '2.확인된 임대료는 당일 또는 익일까지 호스트의 계좌로 입금됩니다.\n\n' +
                '3.단, 게스트의 입주 확인이 늦어지거나, 입주일이 공휴일인 경우 정산이 며칠 더 소요될 수 있습니다.\n\n\n' +
                '💡 최대 정산 기한: 게스트의 입주 완료 기준 10일 이내')
        },
        {
            id: 2,
            title: t('정산 계좌를 변경할 수 있나요?'),
            content: t('네, 정산 계좌는 언제든지 변경 가능합니다.\n\n' +
                '단, 예금주명과 계좌번호가 일치해야 하며, 반드시 본인 명의 계좌만 등록할 수 있습니다.\n\n\n' +
                '💡 정산 계좌 변경 방법\n\n' +
                '1.Roomi 앱 → "마이페이지" 메뉴 → 내 정보 수정\n\n' +
                '2."정산 정보"에서 변경할 계좌 입력\n\n' +
                '3."수정 완료" 버튼 클릭') },
        {
            id: 3,
            title: t('게스트가 카드 결제로 결제하면 추가 수수료가 부과되나요?'),
            content: t('호스트가 부담해야 할 추가 수수료는 없으며, Roomi의 서비스 이용 수수료만 적용됩니다.\n\n' +
                '게스트가 신용카드, 해외 결제 수단(PayPal, Alipay 등)으로 결제할 경우 발생하는 결제 처리 비용은 Roomi가 부담하며, \n' +
                '호스트 정산 금액에는 영향을 미치지 않습니다.')
        },
    ];

    // listId → 실제 FAQ 배열 매핑
    const listsMap: Record<string, FAQList[]> = {
        faqList1,
        faqList2,
    };

    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [selectedTitle, setSelectedTitle] = useState('faqList1');
    const [list, setList] = useState<FAQList[]>(faqList1);

    // 상단 버튼 클릭 시 FAQ 목록 변경
    const setFAQList = (listId: string) => {
        setSelectedTitle(listId);
        setList(listsMap[listId] || []);
        setExpandedId(null);
    };

    // 아코디언 토글 핸들러
    const toggleAccordion = (id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-900">{t('자주 묻는 질문')}</h2>
                </div>
            </div>

            {/* 카테고리 선택 섹션 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                    <div className="overflow-x-auto pb-2 scrollbar-hidden">
                        <div className="flex flex-nowrap md:grid md:grid-cols-3 gap-3">
                            {faqTitles.map((faq) => (
                                <button
                                    key={faq.id}
                                    type="button"
                                    onClick={() => setFAQList(faq.listId)}
                                    className={`px-5 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                        selectedTitle === faq.listId
                                            ? 'text-white bg-roomi shadow-sm'
                                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                    {faq.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ 질문 목록 */}
            {list.length > 0 ? (
                <div className="space-y-4">
                    {list.map((faqItem) => {
                        const isOpen = expandedId === faqItem.id;
                        return (
                            <div
                                key={faqItem.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all"
                            >
                                {/* 질문 버튼 */}
                                <button
                                    onClick={() => toggleAccordion(faqItem.id)}
                                    className="w-full text-left p-6 bg-white flex items-center justify-between cursor-pointer focus:outline-none hover:bg-gray-50 transition-colors"
                                >
                                    <h3 className="font-semibold text-gray-900 pr-4 text-left">{faqItem.title}</h3>
                                    <div className="text-gray-400 flex-shrink-0">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* 답변 내용 */}
                                <AccordionItem isOpen={isOpen}>
                                    <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
                                        <div className="pt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {faqItem.content}
                                        </div>
                                    </div>
                                </AccordionItem>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* 빈 상태 */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-center py-16 text-gray-500">
                        <div className="text-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 mx-auto text-gray-400 mb-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-600 font-medium">{t('질문 목록이 없습니다.')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};