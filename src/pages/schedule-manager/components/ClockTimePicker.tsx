import React, { useState, useEffect } from 'react';

interface ClockTimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
}

const ClockNumber: React.FC<{
    num: number;
    rotation: number;
    radius: string;
    isSelected: boolean;
    isInner?: boolean;
    onClick: () => void;
}> = ({ num, rotation, radius, isSelected, isInner, onClick }) => {
    const style: React.CSSProperties = {
        transform: `rotate(${rotation}deg) translate(${radius}) rotate(-${rotation}deg)`,
        marginLeft: '-0.5rem',
        marginTop: '-0.4rem',
    };
    const numToDisplay = isInner && num === 0 ? '00' : num;

    return (
        <div
            className="absolute top-1/2 left-1/2 w-9 h-9 flex items-center justify-center"
            style={style}
        >
            <button
                type="button"
                onClick={onClick}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-200 ${
                    isSelected
                    ? 'bg-lime-green text-charcoal-black font-bold scale-110'
                    : 'hover:bg-gray-200 dark:hover:bg-army-olive-light text-gray-800 dark:text-gray-200'
                }`}
            >
                {numToDisplay}
            </button>
        </div>
    );
};

const ClockTimePicker: React.FC<ClockTimePickerProps> = ({ value, onChange }) => {
    const [view, setView] = useState<'hours' | 'minutes'>('hours');
    
    const [hour, setHour] = useState(() => value.getHours());
    const [minute, setMinute] = useState(() => value.getMinutes());

    useEffect(() => {
        setHour(value.getHours());
        setMinute(value.getMinutes());
    }, [value]);

    const handleTimeChange = (h: number, m: number) => {
        const newDate = new Date(value);
        newDate.setHours(h, m, 0, 0);
        onChange(newDate);
    };

    const handleHourSelect = (selectedHour: number) => {
        setHour(selectedHour);
        handleTimeChange(selectedHour, minute);
        setView('minutes');
    };

    const handleMinuteSelect = (selectedMinute: number) => {
        setMinute(selectedMinute);
        handleTimeChange(hour, selectedMinute);
    };

    const pad = (num: number) => String(num).padStart(2, '0');
    
    const selectedHourIsInner = hour === 0 || hour > 12;
    const handLength = view === 'hours' ? (selectedHourIsInner ? '28%' : '40%') : '40%';
    const handRotation = view === 'hours' ? hour * 30 : minute * 6;

    return (
        <div className="flex flex-col items-center">
            {/* Digital Display */}
            <div className="flex justify-center items-end mb-4 bg-white dark:bg-army-olive-light p-3 rounded-lg w-full">
                <button
                    type="button"
                    onClick={() => setView('hours')}
                    className={`text-5xl font-mono transition-colors ${view === 'hours' ? 'text-lime-green' : 'text-gray-800 dark:text-gray-300'}`}
                >
                    {pad(hour)}
                </button>
                <span className="text-4xl font-mono text-gray-800 dark:text-gray-300 mx-1 pb-1">:</span>
                <button
                    type="button"
                    onClick={() => setView('minutes')}
                    className={`text-5xl font-mono transition-colors ${view === 'minutes' ? 'text-lime-green' : 'text-gray-800 dark:text-gray-300'}`}
                >
                    {pad(minute)}
                </button>
            </div>

            {/* Clock Face */}
            <div className="relative w-64 h-64 mx-auto bg-gray-200 dark:bg-army-olive rounded-full shadow-inner">
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-lime-green rounded-full z-10"></div>
                
                {/* Hand */}
                <div 
                    className="absolute bottom-1/2 left-1/2 w-0.5 bg-lime-green origin-bottom transition-all"
                    style={{
                        height: handLength,
                        transform: `rotate(${handRotation}deg)`
                    }}
                ></div>

                {/* Numbers */}
                {view === 'hours' ? (
                    <>
                        {/* Outer ring (1-12) */}
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) =>
                            <ClockNumber 
                                key={`h-out-${h}`}
                                num={h}
                                rotation={h * 30 - 90}
                                radius="105px"
                                isSelected={h === hour}
                                onClick={() => handleHourSelect(h)}
                            />
                        )}
                        {/* Inner ring (13-23, 00) */}
                        {Array.from({ length: 12 }, (_, i) => (i + 13) % 24).map((h) =>
                             <ClockNumber 
                                key={`h-in-${h}`}
                                num={h}
                                rotation={h * 30 - 90}
                                radius="70px"
                                isSelected={h === hour}
                                isInner
                                onClick={() => handleHourSelect(h)}
                            />
                        )}
                    </>
                ) : (
                    <>
                        {/* Minutes ring (0-55, every 5) */}
                        {Array.from({ length: 12 }, (_, i) => i * 5).map((m) =>
                            <ClockNumber 
                                key={`m-${m}`}
                                num={m}
                                rotation={m * 6 - 90}
                                radius="105px"
                                isSelected={m === minute}
                                onClick={() => handleMinuteSelect(m)}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ClockTimePicker;