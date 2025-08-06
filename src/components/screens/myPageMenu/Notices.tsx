import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {getNotices} from "../../../api/api";
import {Notice} from "../../../types/notice";
import dayjs from "dayjs";
import AccordionItem from "../../util/AccodionItem";

export default function Notices() {
    const {t} = useTranslation();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [noticeList, setNoticeList] = useState<Notice[]>([]);

    // 아코디언 토글 핸들러
    const toggleAccordion = (id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    useEffect(() => {
        const getNoticeList = async () => {
            try {
                const response = await getNotices();
                const responseJson = await response.json();
                setNoticeList(responseJson.data);
            } catch (e) {
                console.error('공지사항 API 실패:', e);
            }
        };
        getNoticeList();
    }, []);

    return (
        <div>
            {noticeList && noticeList.length > 0 ? (
                <div className="space-y-4">
                    {noticeList.map((notice) => {
                        const isOpen = expandedId === notice.id;
                        return (
                            <div
                                key={notice.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all"
                            >
                                {/* 제목 버튼 */}
                                <button
                                    onClick={() => toggleAccordion(notice.id)}
                                    className="w-full text-left p-6 bg-white flex flex-col cursor-pointer focus:outline-none hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {notice.is_important && (
                                                    <span className="text-xs text-white bg-red-500 px-2 py-1 rounded-full font-medium">
                                                    {t('중요')}
                                                </span>
                                                )}
                                                <span className="text-xs text-gray-500 font-medium">
                                                {dayjs(notice.created_at).format('YYYY.MM.DD')}
                                            </span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 text-left">{notice.title}</h3>
                                        </div>

                                        <div className="text-gray-400 ml-4">
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
                                    </div>
                                </button>

                                {/* 아코디언 내용 */}
                                <AccordionItem isOpen={isOpen}>
                                    <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
                                        <div className="pt-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                            {notice.content}
                                        </div>

                                        {notice.tags && notice.tags.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                                                {notice.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs text-roomi bg-roomi-light rounded-full px-3 py-1 font-medium"
                                                    >
                                                    #{tag}
                                                </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </AccordionItem>
                            </div>
                        );
                    })}
                </div>
            ) : (
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
                            <p className="text-gray-600 font-medium">{t('공지사항이 없습니다.')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};