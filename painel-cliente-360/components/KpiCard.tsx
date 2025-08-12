import React from 'react';
import { KpiData } from '../types';
import { IconTrendingUp, IconTrendingDown } from '../constants';

interface KpiCardProps {
    data: KpiData;
    onClick?: () => void;
    isActive?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ data, onClick, isActive }) => {
    const { title, value, change, changeType, icon } = data;
    const isIncrease = changeType === 'increase';
    const changeColor = isIncrease ? 'text-text-increase' : 'text-text-decrease';
    const changeIcon = isIncrease ? <IconTrendingUp /> : <IconTrendingDown />;
    
    const cursorClass = onClick ? 'cursor-pointer' : 'cursor-default';
    const activeClass = isActive ? 'ring-2 ring-primary shadow-md' : 'shadow-lg';

    return (
        <div 
            onClick={onClick} 
            className={`bg-ui-surface p-6 rounded-2xl ${activeClass} hover:shadow-xl transition-all duration-300 ${cursorClass} transform hover:-translate-y-1 border border-border`}
        >
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <p className="text-sm font-medium text-text-secondary">{title}</p>
                    <p className="text-3xl font-bold text-text-default mt-1">{value}</p>
                </div>
                <div className="bg-primary text-text-on-primary p-3 rounded-full">
                    {icon}
                </div>
            </div>
            <div className={`mt-4 flex items-center text-sm ${changeColor}`}>
                <div className="w-5 h-5">{changeIcon}</div>
                <span className="ml-1 font-semibold">{change}</span>
                <span className="ml-2 text-text-secondary font-normal">vs mês passado</span>
            </div>
        </div>
    );
};

export default KpiCard;