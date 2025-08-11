import React, { useState, useEffect } from 'react';

interface SimpleTimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
}

const SimpleTimePicker: React.FC<SimpleTimePickerProps> = ({ value, onChange }) => {
    const format = (n: number) => String(n).padStart(2, '0');

    const [hourStr, setHourStr] = useState(() => format(value.getHours()));
    const [minuteStr, setMinuteStr] = useState(() => format(value.getMinutes()));

    useEffect(() => {
        setHourStr(format(value.getHours()));
        setMinuteStr(format(value.getMinutes()));
    }, [value]);

    const handleValueChange = (type: 'hour' | 'minute', valStr: string) => {
        const setter = type === 'hour' ? setHourStr : setMinuteStr;
        setter(valStr);

        const val = parseInt(valStr, 10);
        const isValid = !isNaN(val) && val >= 0 && (type === 'hour' ? val <= 23 : val <= 59);

        if (isValid) {
            const newDate = new Date(value);
            if (type === 'hour') {
                newDate.setHours(val);
            } else {
                newDate.setMinutes(val);
            }
            onChange(newDate);
        }
    };

    const handleBlur = (type: 'hour' | 'minute') => {
        const str = type === 'hour' ? hourStr : minuteStr;
        const val = parseInt(str, 10);
        const isValid = !isNaN(val) && val >= 0 && (type === 'hour' ? val <= 23 : val <= 59);

        if (isValid) {
            if (type === 'hour') {
                setHourStr(format(val));
            } else {
                setMinuteStr(format(val));
            }
        } else {
            if (type === 'hour') {
                setHourStr(format(value.getHours()));
            } else {
                setMinuteStr(format(value.getMinutes()));
            }
        }
    };

    const baseInputClasses = "w-24 text-center text-4xl font-mono p-2 rounded-lg bg-gray-200 dark:bg-charcoal-black border-2 border-transparent focus:border-lime-green focus:outline-none focus:ring-0 transition-colors duration-200 text-gray-800 dark:text-gray-200";

    return (
        <div className="flex items-center justify-center gap-2 py-4">
            <input
                id="hour-input"
                type="number"
                value={hourStr}
                onChange={(e) => handleValueChange('hour', e.target.value)}
                onBlur={() => handleBlur('hour')}
                aria-label="Hora"
                className={baseInputClasses}
            />
            <span className="text-4xl font-mono text-gray-500 dark:text-sage -mt-1">:</span>
            <input
                id="minute-input"
                type="number"
                value={minuteStr}
                onChange={(e) => handleValueChange('minute', e.target.value)}
                onBlur={() => handleBlur('minute')}
                aria-label="Minuto"
                className={baseInputClasses}
            />
        </div>
    );
};

export default SimpleTimePicker;