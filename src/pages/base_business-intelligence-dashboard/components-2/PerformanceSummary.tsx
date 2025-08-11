import React from 'react';

interface PerformanceMetric {
  name: string;
  value: string;
  change: number;
  status: 'good' | 'warning' | 'critical';
}

interface PerformanceSummaryProps {
  metrics: PerformanceMetric[];
}

const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ metrics }) => {
  return (
    <div className="bg-surface-card rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold text-text-main mb-4">Resumo de Performance</h3>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-brand-border last:border-b-0">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                metric.status === 'good' ? 'bg-green-500' : 
                metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-text-main">{metric.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-text-main font-medium mr-2">{metric.value}</span>
              <span className={`text-sm ${
                metric.change > 0 ? 'text-green-500' : 
                metric.change < 0 ? 'text-red-500' : 'text-blue-500'
              }`}>
                {metric.change > 0 ? '↗' : metric.change < 0 ? '↘' : '→'} {Math.abs(metric.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceSummary;