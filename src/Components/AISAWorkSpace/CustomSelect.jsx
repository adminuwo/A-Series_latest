import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({ value, onChange, options, placeholder, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = Array.isArray(options)
        ? (typeof options[0] === 'object'
            ? options.find(o => o.value === value || o === value)?.label || value
            : value)
        : value;

    const isPremium = className.includes('premium-select');

    return (
        <div ref={containerRef} className={`relative ${className} ${isOpen ? 'z-50' : 'z-0'}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-left px-8 py-5 text-sm font-black transition-all shadow-sm flex items-center justify-between group outline-none focus:ring-4 focus:ring-[#5865f2]/5 ${isPremium
                    ? 'bg-white/80 border border-white rounded-[24px] text-[#334155]'
                    : 'bg-slate-50 border border-slate-100 rounded-[30px] text-slate-700'}`}
            >
                <span className={!value ? "text-slate-400" : ""}>{selectedLabel || placeholder}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className={`absolute w-full z-[100] bg-white border border-slate-100 mt-3 py-4 shadow-2xl shadow-blue-500/10 overflow-hidden ${isPremium ? 'rounded-[24px]' : 'rounded-[30px]'}`}
                    >
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {options.map((option, idx) => {
                                const val = typeof option === 'object' ? option.value : option;
                                const label = typeof option === 'object' ? option.label : option;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            onChange({ target: { value: val } });
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-8 py-3 text-[11px] font-black uppercase tracking-widest transition-all hover:bg-blue-50/50 ${val === value ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-blue-600 hover:pl-10'}`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSelect;
