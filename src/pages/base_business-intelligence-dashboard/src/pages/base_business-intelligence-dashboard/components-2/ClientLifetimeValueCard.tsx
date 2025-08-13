import React from 'react';

interface ClientLifetimeValueCardProps {
  title: string;
  value: number;
  unit?: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const ClientLifetimeValueCard: React.FC<ClientLifetimeValueCardProps> = ({ title, value, unit = '', description, trend }) => {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
  const trendIcon = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '';

  return (
    <div className="p-4 rounded-lg shadow-lg bg-surface-card flex flex-col justify-between h-full">
      <h3 className="text-lg font-semibold text-text-main mb-2">{title}</h3>
      <div className="flex items-baseline mb-2">
        <span className="text-3xl font-bold text-brand-primary">{value.toLocaleString('pt-BR')}</span>
        {unit && <span className="text-xl text-text-muted ml-1">{unit}</span>}
        {trend && <span className={`ml-2 text-lg font-semibold ${trendColor}`}>{trendIcon}</span>}
      </div>
      {description && <p className="text-sm text-text-muted">{description}</p>}
    </div>
  );
};

export default ClientLifetimeValueCard;
