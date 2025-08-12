import React, { useState, useEffect, useRef } from 'react';
import ElegantCalendar from './ElegantCalendar';

interface CalendarPopoverProps {
    anchorEl: HTMLElement | null;
    onClose: () => void;
    value: Date;
    onChange: (date: Date) => void;
}

const CalendarPopover: React.FC<CalendarPopoverProps> = ({ anchorEl, onClose, value, onChange }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (!anchorEl || !popoverRef.current) return;
        
        const anchorRect = anchorEl.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const vpWidth = window.innerWidth;
        const vpHeight = window.innerHeight;

        let top = anchorRect.bottom + 8;
        let left = anchorRect.left;

        // Adjust if it goes off right edge
        if (left + popoverRect.width > vpWidth - 16) {
          left = anchorRect.right - popoverRect.width;
        }
        // Adjust if it goes off bottom edge
        if (top + popoverRect.height > vpHeight - 16) {
          top = anchorRect.top - popoverRect.height - 8;
        }
        // Adjust if it goes off left edge
        if (left < 16) {
            left = 16;
        }
        
        setPosition({ top, left });
    }, [anchorEl]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            onClose();
          }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
          window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);
    
    const handleDateSelect = (date: Date) => {
        onChange(date);
        onClose();
    };
    
    const handleTodayClick = () => {
        onChange(new Date());
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
            <div
                ref={popoverRef}
                className="fixed z-50 bg-white dark:bg-charcoal-black w-[340px] rounded-2xl shadow-2xl transition-all duration-200 opacity-0 animate-fade-in"
                style={{ ...position }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="p-2">
                    <ElegantCalendar value={value} onChange={handleDateSelect} />
                </div>
                 <div className="p-2 border-t border-gray-200 dark:border-khaki-border/60 flex justify-between">
                     <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                        Limpar
                    </button>
                    <button type="button" onClick={handleTodayClick} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                        Hoje
                    </button>
                </div>
                <style>{`
                  @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                  .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                  }
                `}</style>
            </div>
        </>
    );
};

export default CalendarPopover;