import React from 'react';

interface RoomiToggleProps {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToggleButton = ({ checked, onChange }: RoomiToggleProps) => {
    return (
        <label className="inline-flex items-center cursor-pointer">
            {/* 숨겨진 체크박스 (스크린 리더용) */}
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange}/>
            {/* 토글 스위치 UI */}
            <div className={`
                relative w-11 h-6 bg-gray-200 rounded-full 
                peer peer-checked:after:translate-x-full
                rtl:peer-checked:after:-translate-x-full
                peer-checked:after:border-white
                after:content-[''] after:absolute after:top-0.5 after:start-[2px]
                after:bg-white after:border-gray-300 after:border
                after:rounded-full after:h-5 after:w-5 after:transition-all
                peer-checked:bg-roomi
            `}></div>
            {/* 라벨 텍스트 */}
            {/*<span className="ms-3 text-sm font-medium text-gray-900">{label}</span>*/}
        </label>
    );
};

export default ToggleButton;
