import React from 'react';

interface KeyMetricCardProps {
  title: string;
  value: string;
  description: string;
}

const KeyMetricCard: React.FC<KeyMetricCardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-surface-card p-4 rounded-lg shadow-lg text-center">
      <h4 className="text-text-muted text-sm font-medium uppercase tracking-wider">{title}</h4>
      <p className="text-3xl font-bold text-text-main my-2">{value}</p>
      <p className="text-xs text-text-muted opacity-80">{description}</p>
    </div>
  );
};

export default KeyMetricCard;
