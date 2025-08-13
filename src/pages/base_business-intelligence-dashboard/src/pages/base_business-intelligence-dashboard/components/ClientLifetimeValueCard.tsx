import React from 'react';

const TrendUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);

const TrendDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

interface ClientLifetimeValueCardProps {
  title: string;
  value: number;
  unit?: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const ClientLifetimeValueCard: React.FC<ClientLifetimeValueCardProps> = ({ title, value, unit = '', description, trend }) => {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-text-muted';
  const trendIcon = trend === 'up' ? <TrendUpIcon /> : trend === 'down' ? <TrendDownIcon /> : null;

  return (
    <div className="p-4 rounded-lg shadow-lg bg-surface-card flex flex-col justify-between h-full">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">{title}</h3>
      <div className="flex items-baseline my-2">
        <span className="text-3xl font-bold text-accent-primary">{unit === '%' ? value.toFixed(1) : value.toLocaleString('pt-BR')}</span>
        {unit && <span className="text-xl text-text-muted ml-1">{unit}</span>}
        {trend && trend !== 'neutral' && (
            <span className={`ml-2 flex items-center text-lg font-semibold ${trendColor}`}>
                {trendIcon}
            </span>
        )}
      </div>
      {description && <p className="text-sm text-text-muted">{description}</p>}
    </div>
  );
};

export default ClientLifetimeValueCard;
