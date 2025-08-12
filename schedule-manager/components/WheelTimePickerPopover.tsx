import React, { useState, useEffect, useRef } from 'react';
import WheelTimePicker from './WheelTimePicker';

interface WheelTimePickerPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  value: Date;
  onSave: (date: Date) => void;
}

const WheelTimePickerPopover: React.FC<WheelTimePickerPopoverProps> = ({ anchorEl, onClose, value, onSave }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [tempTime, setTempTime] = useState(new Date(value));

  useEffect(() => {
    setTempTime(new Date(value));
  }, [value]);
  
  useEffect(() => {
    if (!anchorEl || !popoverRef.current) return;
    
    const anchorRect = anchorEl.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;

    let top = anchorRect.bottom + 8;
    let left = anchorRect.left + (anchorRect.width / 2) - (popoverRect.width / 2);

    if (left + popoverRect.width > vpWidth - 16) {
      left = vpWidth - 16 - popoverRect.width;
    }
    if (top + popoverRect.height > vpHeight - 16) {
      top = anchorRect.top - popoverRect.height - 8;
    }
    if (left < 16) {
      left = 16;
    }
    setPosition({ top, left });
  }, [anchorEl]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = () => {
    onSave(tempTime);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div
        ref={popoverRef}
        className="fixed z-50 bg-white dark:bg-army-olive w-56 rounded-2xl shadow-2xl p-4 transition-all duration-200 opacity-0 animate-fade-in"
        style={{ ...position }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <WheelTimePicker value={tempTime} onChange={setTempTime} />
        <div className="mt-4 flex justify-end gap-3">
             <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors duration-200">
                Cancelar
            </button>
            <button type="button" onClick={handleSave} className="bg-lime-green text-charcoal-black font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-transform duration-200 active:scale-95">
                Salvar
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

export default WheelTimePickerPopover;