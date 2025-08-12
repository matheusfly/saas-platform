

import React, { useState, useEffect } from 'react';
import { Teacher, WorkLog } from '../types';
import CalendarPopover from './CalendarPopover';
import WheelTimePickerPopover from './WheelTimePickerPopover';
import { CalendarIcon, ClockIcon } from './icons';

interface WorkLogFormProps {
  teacher: Teacher;
  logToUpdate: WorkLog | null;
  onSave: (data: { teacherId: string, checkIn: Date, checkOut: Date }, logId?: string) => void;
  onCancel: () => void;
}

const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric'});
};

const formatDisplayTime = (date: Date): string => {
  return date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
};


const WorkLogForm: React.FC<WorkLogFormProps> = ({ teacher, logToUpdate, onSave, onCancel }) => {
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(new Date());
  const [error, setError] = useState('');

  const [activePopover, setActivePopover] = useState<'date' | 'checkin' | 'checkout' | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (logToUpdate) {
        setCheckIn(new Date(logToUpdate.checkIn));
        const initialCheckout = logToUpdate.checkOut 
            ? new Date(logToUpdate.checkOut)
            : new Date(logToUpdate.checkIn.getTime() + 60 * 60 * 1000);
        setCheckOut(initialCheckout);
    } else {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        setCheckIn(now);
        setCheckOut(oneHourLater);
    }
    setError('');
  }, [logToUpdate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkOut <= checkIn) {
      setError('O horário de Check-out deve ser após o de Check-in.');
      return;
    }
    setError('');
    
    onSave({
      teacherId: teacher.id,
      checkIn: checkIn,
      checkOut: checkOut,
    }, logToUpdate?.id);
  };
  
  const handleOpenPopover = (popover: 'date' | 'checkin' | 'checkout', e: React.MouseEvent<HTMLButtonElement>) => {
      setPopoverAnchor(e.currentTarget);
      setActivePopover(popover);
  };
  
  const handleDateChange = (newDate: Date) => {
      const newCheckIn = new Date(checkIn);
      const newCheckOut = new Date(checkOut);
      
      newCheckIn.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      newCheckOut.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());

      setCheckIn(newCheckIn);
      setCheckOut(newCheckOut);
      setActivePopover(null);
  };
  
  const handleTimeChange = (newTime: Date) => {
      if (activePopover === 'checkin') {
          const newCheckin = new Date(newTime);
          newCheckin.setFullYear(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
          setCheckIn(newCheckin);
      } else if (activePopover === 'checkout') {
          const newCheckout = new Date(newTime);
          newCheckout.setFullYear(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
          setCheckOut(newCheckout);
      }
      setActivePopover(null);
  };

  const baseButtonClasses = "w-full p-3 rounded-lg bg-gray-100 dark:bg-charcoal-black border-2 border-transparent hover:border-lime-green focus:border-lime-green focus:ring-0 transition-colors duration-200 text-gray-800 dark:text-gray-200 flex items-center justify-between";

  return (
    <>
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-6">
        <div>
          <label htmlFor="logDate" className="block text-sm font-medium text-gray-500 dark:text-sage mb-1">
            Data do Registro
          </label>
          <button 
            type="button" 
            id="logDate"
            onClick={(e) => handleOpenPopover('date', e)}
            className={`${baseButtonClasses}`}
          >
            <span className="font-semibold">{formatDisplayDate(checkIn)}</span>
            <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-sage" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-500 dark:text-sage mb-1">
                Horário de Check-in
              </label>
              <button 
                type="button" 
                id="checkInTime"
                onClick={(e) => handleOpenPopover('checkin', e)}
                className={`${baseButtonClasses}`}
              >
                  <span className="font-mono text-lg">{formatDisplayTime(checkIn)}</span>
                  <ClockIcon className="h-5 w-5 text-gray-500 dark:text-sage" />
              </button>
            </div>
            <div>
              <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-500 dark:text-sage mb-1">
                Horário de Check-out
              </label>
              <button
                type="button"
                id="checkOutTime"
                onClick={(e) => handleOpenPopover('checkout', e)}
                className={`${baseButtonClasses}`}
              >
                  <span className="font-mono text-lg">{formatDisplayTime(checkOut)}</span>
                  <ClockIcon className="h-5 w-5 text-gray-500 dark:text-sage" />
              </button>
            </div>
        </div>
        
        {error && <p className="text-red-500 text-xs mt-1 text-center font-semibold">{error}</p>}
      </div>
      <div className="mt-8 flex items-center justify-end">
         <div className="flex gap-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors duration-200">
                Cancelar
            </button>
            <button type="submit" className="bg-lime-green text-charcoal-black font-bold px-6 py-2 rounded-lg hover:brightness-110 transition-transform duration-200 active:scale-95">
                Salvar Registro
            </button>
         </div>
      </div>
    </form>

    {activePopover === 'date' && (
        <CalendarPopover
            anchorEl={popoverAnchor}
            value={checkIn}
            onChange={handleDateChange}
            onClose={() => setActivePopover(null)}
        />
    )}

    {(activePopover === 'checkin' || activePopover === 'checkout') && (
        <WheelTimePickerPopover
            anchorEl={popoverAnchor}
            value={activePopover === 'checkin' ? checkIn : checkOut}
            onSave={handleTimeChange}
            onClose={() => setActivePopover(null)}
        />
    )}
    </>
  );
};

export default WorkLogForm;