import React, { useRef, useLayoutEffect } from 'react';

interface WheelTimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
}

const WheelColumn: React.FC<{
    values: number[];
    currentValue: number;
    onSelect: (value: number) => void;
    label: string;
}> = ({ values, currentValue, onSelect, label }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemHeight = 40; // Corresponds to h-10
    const scrollTimeout = useRef<number | null>(null);

    // Effect to scroll the current value into the center
    useLayoutEffect(() => {
        if (scrollRef.current) {
            const index = values.indexOf(currentValue);
            if (index !== -1) {
                // Use non-smooth scrolling for immediate positioning on load/value change
                scrollRef.current.scrollTop = index * itemHeight;
            }
        }
    }, [currentValue, values, itemHeight]);

    const handleScroll = () => {
        if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
        }

        scrollTimeout.current = window.setTimeout(() => {
            if (scrollRef.current) {
                const scrollTop = scrollRef.current.scrollTop;
                const selectedIndex = Math.round(scrollTop / itemHeight);
                const newValue = values[selectedIndex];
                
                // Snap to the calculated position
                const targetScrollTop = selectedIndex * itemHeight;
                if (scrollRef.current.scrollTop !== targetScrollTop) {
                    scrollRef.current.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                }

                if (newValue !== undefined && newValue !== currentValue) {
                    onSelect(newValue);
                }
            }
        }, 150);
    };
    
    const format = (n: number) => String(n).padStart(2, '0');

    return (
        <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-48 overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
            aria-label={`${label} selector`}
        >
            {/* Top and bottom padding to allow first/last items to be centered */}
            <div style={{ height: `calc(50% - ${itemHeight/2}px)` }} className="snap-center"></div>
            {values.map(val => (
                <div
                    key={val}
                    className="h-10 flex items-center justify-center snap-center text-2xl font-mono text-gray-800 dark:text-gray-300 transition-all duration-150"
                    aria-label={`${val} ${label}`}
                >
                    {format(val)}
                </div>
            ))}
            <div style={{ height: `calc(50% - ${itemHeight/2}px)` }} className="snap-center"></div>
        </div>
    );
};


const WheelTimePicker: React.FC<WheelTimePickerProps> = ({ value, onChange }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleHourChange = (newHour: number) => {
        const newDate = new Date(value);
        const currentHour = newDate.getHours();
        if (newHour !== currentHour) {
            newDate.setHours(newHour);
            onChange(newDate);
        }
    };

    const handleMinuteChange = (newMinute: number) => {
        const newDate = new Date(value);
        const currentMinute = newDate.getMinutes();
        if (newMinute !== currentMinute) {
            newDate.setMinutes(newMinute);
            onChange(newDate);
        }
    };

    return (
        <div className="relative bg-gray-200 dark:bg-charcoal-black rounded-lg p-2 h-48 overflow-hidden">
            <div className="flex justify-center items-center h-full">
                <div className="flex-1">
                    <WheelColumn
                        values={hours}
                        currentValue={value.getHours()}
                        onSelect={handleHourChange}
                        label="hour"
                    />
                </div>
                <div className="text-4xl font-mono text-gray-500 dark:text-sage -mt-1">:</div>
                <div className="flex-1">
                     <WheelColumn
                        values={minutes}
                        currentValue={value.getMinutes()}
                        onSelect={handleMinuteChange}
                        label="minute"
                    />
                </div>
            </div>
            {/* Selector overlay */}
            <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 bg-lime-green/20 dark:bg-lime-green/10 border-y-2 border-lime-green pointer-events-none rounded-lg"></div>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
};

export default WheelTimePicker;