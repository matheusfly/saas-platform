import React, { useState, useEffect } from 'react';

interface SliderTimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
}

const SliderTimePicker: React.FC<SliderTimePickerProps> = ({ value, onChange }) => {
    const [hour, setHour] = useState(() => value.getHours());
    const [minute, setMinute] = useState(() => value.getMinutes());

    useEffect(() => {
        setHour(value.getHours());
        setMinute(value.getMinutes());
    }, [value]);

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHour = parseInt(e.target.value, 10);
        setHour(newHour);
        const newDate = new Date(value);
        newDate.setHours(newHour);
        onChange(newDate);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMinute = parseInt(e.target.value, 10);
        setMinute(newMinute);
        const newDate = new Date(value);
        newDate.setMinutes(newMinute);
        onChange(newDate);
    };
    
    const format = (n: number) => String(n).padStart(2, '0');

    const sliderBaseClasses = "w-full h-2 bg-gray-300 dark:bg-army-olive-light rounded-lg appearance-none cursor-pointer range-lg";
    const sliderThumbClasses = "accent-lime-green";

    return (
        <div className="space-y-4 p-4 bg-gray-100 dark:bg-charcoal-black rounded-lg">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-sage">Hora</span>
                <span className="text-lg font-mono font-bold text-gray-800 dark:text-gray-200">{format(hour)}</span>
            </div>
            <input
                type="range"
                min="0"
                max="23"
                value={hour}
                onChange={handleHourChange}
                className={`${sliderBaseClasses} ${sliderThumbClasses}`}
                aria-label="Hour slider"
            />
            
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-medium text-gray-500 dark:text-sage">Minuto</span>
                <span className="text-lg font-mono font-bold text-gray-800 dark:text-gray-200">{format(minute)}</span>
            </div>
            <input
                type="range"
                min="0"
                max="59"
                value={minute}
                onChange={handleMinuteChange}
                className={`${sliderBaseClasses} ${sliderThumbClasses}`}
                aria-label="Minute slider"
            />
        </div>
    );
};

export default SliderTimePicker;