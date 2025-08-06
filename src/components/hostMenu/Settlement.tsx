import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Search, ChevronDown } from 'lucide-react';

// 기간 필터 타입 정의
type PeriodFilterType = 'all' | 'month' | 'quarter' | 'year';

// 기간 옵션 타입 정의
interface PeriodOption {
    value: PeriodFilterType;
    label: string;
}

const Settlement: React.FC = () => {
    const { t } = useTranslation();

    // 필요한 상태 관리
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [periodFilter, setPeriodFilter] = useState<PeriodFilterType>('all');
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    // 필터링 옵션
    const periods: PeriodOption[] = [
        { value: 'all', label: '전체 기간' },
        { value: 'month', label: '이번 달' },
        { value: 'quarter', label: '최근 3개월' },
        { value: 'year', label: '최근 1년' }
    ];

    // 현재 선택된 필터 표시 텍스트
    const displayPeriod = periods.find(p => p.value === periodFilter)?.label || '전체 기간';

    // 드롭다운 참조 (외부 클릭 감지 용)
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 필터 변경 핸들러
    const handlePeriodChange = (value: PeriodFilterType): void => {
        setPeriodFilter(value);
        setIsDropdownOpen(false);
    };

    // 검색어 변경 핸들러
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="w-full h-screen flex flex-col">
            {/* 고정될 상단 부분 */}
            <div className="mx-auto py-5 flex flex-col gap-4 w-full bg-white ">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('settlement')}</h2>

                {/* 검색 및 필터링 영역 */}
                <div className="w-full flex flex-col sm:flex-row gap-3">
                    {/* 기간 필터 드롭다운 */}
                    <div className="relative w-full sm:w-1/6" ref={dropdownRef}>
                        <button
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-3 text-base
                                bg-white border border-gray-200 rounded-lg cursor-pointer"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-haspopup="true"
                            aria-expanded={isDropdownOpen}
                        >
                            <span className="text-gray-700">{displayPeriod}</span>
                            <ChevronDown className="w-5 h-5 text-gray-500"/>
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {isDropdownOpen && (
                            <div
                                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                                role="menu"
                            >
                                {periods.map((period) => (
                                    <div
                                        key={period.value}
                                        className={`px-4 py-3 cursor-pointer hover:bg-roomi-000 
                                            ${periodFilter === period.value ? 'bg-roomi-1' : ''}`}
                                        onClick={() => handlePeriodChange(period.value)}
                                        role="menuitem"
                                    >
                                        {period.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 검색창 */}
                    <div className="relative w-full sm:w-2/6">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        </div>
                        <input
                            type="search"
                            className="w-full py-3 pl-10 pr-3 text-base border border-gray-200 rounded-lg
                                shadow-sm focus:outline-none"
                            placeholder={"검색어를 입력하세요"}
                            value={searchQuery}
                            onChange={handleSearchChange}
                            aria-label="검색"
                        />
                    </div>

                    {/* 추가 버튼이나 필터가 필요한 경우 여기에 배치 */}
                    <div className="w-full sm:w-3/6">
                        {/* 여기에 필요한 추가 요소들 */}
                    </div>
                </div>
            </div>

            {/* 스크롤될 컨텐츠 부분 */}
            <div className="flex-1 overflow-y-auto px-4 scrollbar-hidden">
                {/* 여기에 정산 데이터 목록이 표시될 것입니다 */}
                <div className="grid grid-cols-1 gap-4 py-4">
                    {/* 데이터가 없을 때 표시할 내용 */}
                    <div className="text-center py-10" role="status" aria-live="polite">
                        <div className="text-gray-500 text-lg">
                            정산 내역이 없습니다.
                        </div>
                        <div className="text-gray-400 mt-2">
                            정산 내역이 생성되면 이곳에 표시됩니다.
                        </div>
                    </div>

                    {/* 여기에 실제 정산 내역 리스트가 매핑될 것입니다 */}
                </div>
            </div>
        </div>
    );
};

export default Settlement;