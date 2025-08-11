import React, { useState, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from './icons';

interface ClickerTimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
}

interface ClickerColumnProps {
    value: number;
    onValueChange: (newValue: number) => void;
    label: string;
    max: number;
}

const ClickerColumn: React.FC<ClickerColumnProps> = ({ value, onValueChange, label, max }) => {
    const format = (n: number) => String(n).padStart(2, '0');
    const [inputValue, setInputValue] = useState(format(value));

    useEffect(() => {
        // Update input only if it's not currently being edited, to avoid disrupting user typing
        if (parseInt(inputValue, 10) !== value) {
           setInputValue(format(value));
        }
    }, [value]);

    const handleIncrement = () => onValueChange((value + 1) % (max + 1));
    const handleDecrement = () => onValueChange((value - 1 + (max + 1)) % (max + 1));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        const num = parseInt(inputValue, 10);
        if (!isNaN(num) && num >= 0 && num <= max) {
            if (num !== value) {
                onValueChange(num);
            }
        } else {
            setInputValue(format(value)); // Revert to last valid value
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    const buttonClasses = "p-2 rounded-lg text-lime-green hover:bg-lime-green/20 active:bg-lime-green/30 transition-colors";
    const inputClasses = "w-28 text-center text-6xl font-mono p-2 rounded-lg bg-gray-100 dark:bg-charcoal-black text-gray-800 dark:text-gray-200 border-2 border-transparent focus:border-lime-green focus:ring-0 focus:outline-none transition-colors duration-200";

    return (
        <div className="flex flex-col items-center gap-2">
            <button type="button" onClick={handleIncrement} aria-label={`Increase ${label}`} className={buttonClasses}>
                <ChevronUpIcon className="h-8 w-8" />
            </button>
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                className={inputClasses}
                aria-label={`${label} value`}
            />
            <button type="button" onClick={handleDecrement} aria-label={`Decrease ${label}`} className={buttonClasses}>
                <ChevronDownIcon className="h-8 w-8" />
            </button>
        </div>
    );
};


const ClickerTimePicker: React.FC<ClickerTimePickerProps> = ({ value, onChange }) => {
    
    const handleHourChange = (newHour: number) => {
        const newDate = new Date(value);
        newDate.setHours(newHour);
        onChange(newDate);
    };

    const handleMinuteChange = (newMinute: number) => {
        const newDate = new Date(value);
        newDate.setMinutes(newMinute);
        onChange(newDate);
    };

    return (
        <div className="flex items-center justify-center gap-4 py-4">
            <ClickerColumn 
                value={value.getHours()}
                onValueChange={handleHourChange}
                label="hour"
                max={23}
            />
            <div className="text-5xl font-mono text-gray-500 dark:text-sage -mt-8">:</div>
            <ClickerColumn 
                value={value.getMinutes()}
                onValueChange={handleMinuteChange}
                label="minute"
                max={59}
            />
        </div>
    );
};

export default ClickerTimePicker;