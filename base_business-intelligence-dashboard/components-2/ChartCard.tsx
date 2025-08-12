import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  chartClassName?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, chartClassName = 'h-80' }) => {
  return (
    <div 
      className="p-4 rounded-lg shadow-lg h-full flex flex-col bg-surface-card"
    >
      <h3 className="text-lg font-semibold text-text-main mb-4">{title}</h3>
      <div className={`flex-grow w-full ${chartClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
