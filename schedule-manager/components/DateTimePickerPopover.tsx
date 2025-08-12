import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XIcon, CalendarIcon, ClockIcon } from './icons';
import WheelTimePicker from './WheelTimePicker';

interface DateTimePickerPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  value: Date;
  onSave: (date: Date) => void;
}

const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const DateTimePickerPopover: React.FC<DateTimePickerPopoverProps> = ({ anchorEl, onClose, value, onSave }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const [tempDate, setTempDate] = useState(() => new Date(value));
  const [viewDate, setViewDate] = useState(() => new Date(value)); // for calendar navigation
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');

  useEffect(() => {
    setTempDate(new Date(value));
    setViewDate(new Date(value));
  }, [value]);

  useEffect(() => {
    if (!anchorEl || !popoverRef.current) return;
    
    const anchorRect = anchorEl.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;

    let top = anchorRect.bottom + 8;
    let left = anchorRect.left;

    if (left + popoverRect.width > vpWidth) {
      left = anchorRect.right - popoverRect.width;
    }
    if (top + popoverRect.height > vpHeight) {
      top = anchorRect.top - popoverRect.height - 8;
    }
    if (left < 0) left = 8;
    if (top < 0) top = 8;
    
    setPosition({ top, left });
  }, [anchorEl]);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handlePrevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  
  const handleDayClick = (day: number) => {
    setTempDate(d => {
      const newDate = new Date(d);
      newDate.setFullYear(viewDate.getFullYear(), viewDate.getMonth(), day);
      return newDate;
    });
  };
  
  const handleSave = () => onSave(tempDate);

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`blank-${i}`} />);
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const isSelected = tempDate.getDate() === day && tempDate.getMonth() === month && tempDate.getFullYear() === year;
      return (
        <div key={day} className="flex justify-center items-center">
          <button
            type="button"
            onClick={() => handleDayClick(day)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
              isSelected ? 'bg-lime-green text-charcoal-black font-bold' : 'hover:bg-gray-200 dark:hover:bg-army-olive-light text-gray-800 dark:text-gray-200'
            }`}
          >
            {day}
          </button>
        </div>
      );
    });

    return (
      <div className="p-1">
        <div className="flex justify-between items-center mb-2">
          <button type="button" onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-army-olive-light"><ChevronLeftIcon className="w-5 h-5"/></button>
          <div className="font-bold text-gray-800 dark:text-gray-200">{months[month]} {year}</div>
          <button type="button" onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-army-olive-light"><ChevronRightIcon className="w-5 h-5"/></button>
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-gray-500 dark:text-sage mb-2">
          {daysOfWeek.map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {blanks}
          {days}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-[59]" onClick={onClose} aria-hidden="true" />
      <div
        ref={popoverRef}
        className="fixed z-[60] bg-white dark:bg-army-olive w-80 rounded-2xl shadow-2xl p-4 transition-all duration-200 opacity-0 animate-fade-in"
        style={{ ...position }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="datetime-picker-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="datetime-picker-title" className="font-bold text-lg text-gray-900 dark:text-white">Selecione Data e Hora</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-army-olive-light" aria-label="Fechar">
            <XIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="bg-gray-100 dark:bg-charcoal-black p-1.5 rounded-lg flex gap-2 mb-4">
            <button
                type="button"
                onClick={() => setActiveTab('date')}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'date' ? 'bg-lime-green text-charcoal-black' : 'hover:bg-gray-200 dark:hover:bg-army-olive-light text-gray-800 dark:text-gray-200'}`}>
                <CalendarIcon className="w-4 h-4" /> Data
            </button>
            <button
                type="button"
                onClick={() => setActiveTab('time')}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'time' ? 'bg-lime-green text-charcoal-black' : 'hover:bg-gray-200 dark:hover:bg-army-olive-light text-gray-800 dark:text-gray-200'}`}>
                <ClockIcon className="w-4 h-4" /> Horário
            </button>
        </div>

        {activeTab === 'date' ? renderCalendar() : <WheelTimePicker value={tempDate} onChange={setTempDate} />}

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

export default DateTimePickerPopover;