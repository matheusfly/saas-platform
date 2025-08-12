import React from 'react';

interface EnhancedKpiCardProps {
  title: string;
  value: string;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
}

const EnhancedKpiCard: React.FC<EnhancedKpiCardProps> = ({ 
  title, 
  value, 
  description, 
  trend,
  trendValue,
  icon
}) => {
  return (
    <div className="bg-surface-card p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-text-muted text-sm font-medium uppercase tracking-wider">{title}</h4>
          <p className="text-3xl font-bold text-text-main my-2">{value}</p>
          <p className="text-xs text-text-muted opacity-80">{description}</p>
        </div>
        {icon && (
          <div className="p-2 rounded-full bg-accent-primary/10 text-accent-primary">
            {icon}
          </div>
        )}
      </div>
      
      {trend && trendValue && (
        <div className="flex items-center mt-3">
          {trend === 'up' ? (
            <span className="flex items-center text-green-500 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              {trendValue}
            </span>
          ) : trend === 'down' ? (
            <span className="flex items-center text-red-500 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {trendValue}
            </span>
          ) : (
            <span className="flex items-center text-blue-500 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {trendValue}
            </span>
          )}
          <span className="text-text-muted text-xs ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedKpiCard;