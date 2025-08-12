import React from 'react';
import { ResponsiveContainer, Tooltip, Funnel, FunnelChart, LabelList, Cell } from 'recharts';

interface FunnelStage {
  stage: string;
  value: number;
  percentage: number;
  color: string;
  dropOff?: number;
  dropOffPercentage?: number;
}

interface ModernSalesFunnelProps {
  data: FunnelStage[];
  showPercentages?: boolean;
  showDropOff?: boolean;
}

const ModernSalesFunnel: React.FC<ModernSalesFunnelProps> = ({ 
  data, 
  showPercentages = true,
  showDropOff = true
}) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg">{data.stage}</p>
          <div className="mt-2 space-y-1">
            <p className="text-text-on-dark">Leads: <span className="font-semibold">{data.value.toLocaleString()}</span></p>
            <p className="text-text-on-dark">Taxa: <span className="font-semibold">{data.percentage.toFixed(1)}%</span></p>
            {data.dropOff !== undefined && (
              <p className="text-text-on-dark">Perda: <span className="font-semibold">{data.dropOff.toLocaleString()}</span></p>
            )}
            {data.dropOffPercentage !== undefined && (
              <p className="text-text-on-dark">Perda %: <span className="font-semibold">{data.dropOffPercentage.toFixed(1)}%</span></p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate drop-off between stages if not provided
  const funnelData = data.map((stage, index) => {
    if (index === 0) {
      return { ...stage, dropOff: 0, dropOffPercentage: 0 };
    }
    const previousValue = data[index - 1].value;
    const dropOff = previousValue - stage.value;
    const dropOffPercentage = (dropOff / previousValue) * 100;
    return { ...stage, dropOff, dropOffPercentage };
  });

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart layout="vertical" margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <Tooltip content={<CustomTooltip />} />
          <Funnel
            dataKey="value"
            nameKey="stage"
            data={funnelData}
            isAnimationActive
            activeIndex={-1}
          >
            {funnelData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="#fff" 
                strokeWidth={2}
                opacity={0.9}
              />
            ))}
            
            {/* Stage labels on the left */}
            <LabelList
              dataKey="stage"
              position="left"
              fill="#1E1E1E"
              stroke="none"
              fontSize={14}
              offset={10}
              formatter={(value: string) => (
                <tspan fontWeight="600">{value}</tspan>
              )}
            />
            
            {/* Value labels inside */}
            <LabelList
              dataKey="value"
              position="inside"
              fill="#fff"
              stroke="none"
              fontSize={14}
              fontWeight="600"
              formatter={(value: number) => value.toLocaleString()}
            />
            
            {/* Percentage labels inside (if enabled) */}
            {showPercentages && (
              <LabelList
                dataKey="percentage"
                position="insideBottom"
                fill="#fff"
                stroke="none"
                fontSize={12}
                offset={-20}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
            )}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
      
      {/* Drop-off summary below the funnel */}
      {showDropOff && (
        <div className="mt-6 p-4 bg-surface-card rounded-lg border border-brand-border">
          <h4 className="text-text-main font-semibold mb-3">Análise de Perdas</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {funnelData.slice(1).map((stage, index) => (
              <div key={index} className="text-center">
                <p className="text-text-muted text-sm">{stage.stage}</p>
                <p className="text-text-main font-bold text-lg">
                  {stage.dropOff?.toLocaleString()}
                </p>
                <p className="text-text-muted text-xs">
                  {stage.dropOffPercentage?.toFixed(1)}% de perda
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernSalesFunnel;