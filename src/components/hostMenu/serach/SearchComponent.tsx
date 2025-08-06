import React, { useState, useRef, useEffect, RefObject } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const SearchComponent = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [roomCondition, setRoomCondition] = useState('비활성화'); // 기본값 설정
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const conditions = [
        { value: '', label: '전체' },
        { value: '활성화', label: '활성화' },
        { value: '비활성화', label: '비활성화' },
        { value: '승인대기', label: '승인대기' },
        { value: '승인거절', label: '승인거절' }
    ];

    // 선택된 조건의 라벨 찾기
    const displayValue = roomCondition ?
        conditions.find(item => item.value === roomCondition)?.label || '비활성화' :
        '비활성화';

    const handleInsertBtn = () => {
        // 방 등록 로직
        console.log('Register new room');
    };

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="mx-auto my-5 flex flex-col gap-4 w-full px-4">
            {/* 검색 섹션 */}
            <div className="w-full flex flex-col gap-3">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                        type="search"
                        className="w-full py-3 pl-10 pr-3 text-base border border-gray-200 rounded-lg
              shadow-sm focus:outline-none"
                        placeholder="제목 또는 주소 입력"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* 커스텀 드롭다운 */}
                <div className="relative w-full" ref={dropdownRef}>
                    <button
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-3 text-base
              bg-white border border-blue-300 rounded-lg cursor-pointer"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span className="text-gray-700">{displayValue}</span>
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    </button>

                    {/* 드롭다운 메뉴 */}
                    {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                            {conditions.map((condition) => (
                                <div
                                    key={condition.value || 'empty'}
                                    className={`px-4 py-3 cursor-pointer hover:bg-blue-50 
                    ${roomCondition === condition.value ? 'bg-blue-100' : ''}`}
                                    onClick={() => {
                                        setRoomCondition(condition.value);
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    {condition.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 버튼 */}
            <div className="w-full">
                <button
                    type="button"
                    className="w-full py-3 px-4 text-base font-medium text-white bg-blue-600 rounded-lg
            focus:outline-none flex items-center justify-center"
                    onClick={handleInsertBtn}
                >
                    <span className="mr-1">+</span> 방 등록하기
                </button>
            </div>
        </div>
    );
};

export default SearchComponent;