

import React, { useState, useEffect, useRef } from 'react';
import { ScheduleEntry } from '../types';
import WheelTimePicker from './WheelTimePicker';
import { XIcon } from './icons';

interface TimeEditorPopoverProps {
  editingTime: { entry: ScheduleEntry; target: HTMLElement };
  onClose: () => void;
  onSave: (entryId: string, newTimes: { startTime: Date; endTime: Date }) => void;
}

const TimeEditorPopover: React.FC<TimeEditorPopoverProps> = ({ editingTime, onClose, onSave }) => {
  const { entry, target } = editingTime;
  const popoverRef = useRef<HTMLDivElement>(null);
  const [activeEditor, setActiveEditor] = useState<'start' | 'end'>('start');
  const [tempStartTime, setTempStartTime] = useState(() => new Date(entry.startTime));
  const [tempEndTime, setTempEndTime] = useState(() => new Date(entry.endTime));
  const [position, setPosition] = useState({ top: 0, left: 0, opacity: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!target || !popoverRef.current) return;

    const targetRect = target.getBoundingClientRect();
    const container = target.closest('.schedule-grid-container');
    const popoverRect = popoverRef.current.getBoundingClientRect();
    
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    let top = targetRect.bottom - containerRect.top + 8;
    let left = targetRect.left - containerRect.left;

    // Adjust if it goes off right edge
    if (left + popoverRect.width > containerRect.width) {
      left = targetRect.right - containerRect.left - popoverRect.width;
    }
    // Adjust if it goes off bottom edge
    if (top + popoverRect.height > window.innerHeight - containerRect.top) {
        top = targetRect.top - containerRect.top - popoverRect.height - 8;
    }
    // Adjust if it goes off left edge
    if (left < 0) {
        left = 8;
    }


    setPosition({ top, left, opacity: 1 });
  }, [target]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = () => {
    if (tempEndTime <= tempStartTime) {
        setError('O horário de término deve ser após o início.');
        return;
    }
    setError('');
    onSave(entry.id, { startTime: tempStartTime, endTime: tempEndTime });
  };
  
  const pickerValue = activeEditor === 'start' ? tempStartTime : tempEndTime;
  const pickerOnChange = (date: Date) => {
      if (activeEditor === 'start') {
          setTempStartTime(date);
      } else {
          setTempEndTime(date);
      }
      setError('');
  }

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />
      <div
        ref={popoverRef}
        className="absolute z-40 bg-white dark:bg-army-olive w-72 rounded-2xl shadow-2xl p-4 transition-all duration-200"
        style={{ ...position }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popover-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="popover-title" className="font-bold text-lg text-gray-900 dark:text-white">Editar Horário</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-army-olive-light" aria-label="Fechar">
            <XIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="bg-gray-100 dark:bg-charcoal-black p-2 rounded-lg flex gap-2 mb-4">
            <button 
                onClick={() => setActiveEditor('start')}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${activeEditor === 'start' ? 'bg-lime-green text-charcoal-black' : 'hover:bg-gray-200 dark:hover:bg-army-olive-light text-gray-800 dark:text-gray-200'}`}>
                Início
            </button>
            <button
                onClick={() => setActiveEditor('end')}
                className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${activeEditor === 'end' ? 'bg-lime-green text-charcoal-black' : 'hover:bg-gray-200 dark:hover:bg-army-olive-light text-gray-800 dark:text-gray-200'}`}>
                Término
            </button>
        </div>

        <WheelTimePicker value={pickerValue} onChange={pickerOnChange} />
        
        {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}

        <div className="mt-4 flex justify-end gap-3">
             <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors duration-200">
                Cancelar
            </button>
            <button type="button" onClick={handleSave} className="bg-lime-green text-charcoal-black font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-transform duration-200 active:scale-95">
                Salvar
            </button>
        </div>
      </div>
    </>
  );
};

export default TimeEditorPopover;