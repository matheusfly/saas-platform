import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface ElegantCalendarProps {
    value: Date;
    onChange: (date: Date) => void;
}

const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const ElegantCalendar: React.FC<ElegantCalendarProps> = ({ value, onChange }) => {
    const [viewDate, setViewDate] = useState(new Date(value.getFullYear(), value.getMonth(), 1));

    useEffect(() => {
        // Ensure the viewDate reflects external changes to the value prop
        setViewDate(new Date(value.getFullYear(), value.getMonth(), 1));
    }, [value]);

    const handlePrevMonth = () => {
        setViewDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(newDate);
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`blank-${i}`} />);
        const days = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isSelected = value.getDate() === day && value.getMonth() === month && value.getFullYear() === year;
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

            return (
                <div key={day} className="flex justify-center items-center">
                    <button
                        type="button"
                        onClick={() => handleDayClick(day)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-200 ease-in-out
                          ${isSelected
                            ? 'bg-lime-green text-charcoal-black font-bold scale-110 shadow-lg'
                            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-army-olive-light'
                          }
                          ${!isSelected && isToday ? 'border-2 border-lime-green/50' : ''}
                        `}
                    >
                        {day}
                    </button>
                </div>
            );
        });

        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <button type="button" onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <div className="font-bold text-lg text-gray-800 dark:text-gray-200">{months[month]} {year}</div>
                    <button type="button" onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors"><ChevronRightIcon className="w-5 h-5"/></button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-500 dark:text-sage mb-2">
                    {daysOfWeek.map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {blanks}
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-charcoal-black rounded-lg">
            {renderCalendar()}
        </div>
    );
};

export default ElegantCalendar;