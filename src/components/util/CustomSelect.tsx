import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface Room {
    id: string | number;
    title: string;
}

interface CustomSelectProps {
    options: Room[];
    value: string | number | null;
    onChange: (value: string | number) => void;
    placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
                                                       options,
                                                       value,
                                                       onChange,
                                                       placeholder = "방을 선택하세요",
                                                   }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // 모달 외 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = options.find(opt => opt.id === value);

    return (
        <div className="relative w-full" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-roomi"
            >
                <span className={selected ? "text-black" : "text-gray-400"}>
                  {selected ? selected.title : placeholder}
                </span>
                <FontAwesomeIcon icon={faChevronDown} />
            </button>

            {open && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {options.map(opt => (
                        <li
                            key={opt.id}
                            onClick={() => {
                                onChange(opt.id);
                                setOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-roomi-100 cursor-pointer flex items-center"
                        >
                            <span className="flex-1">{opt.title}</span>
                            {opt.id === value && (
                                <span className="text-roomi font-bold">✓</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomSelect;
