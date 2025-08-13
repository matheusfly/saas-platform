import React from 'react';
import { ResponsiveContainer, Tooltip, XAxis, YAxis, ZAxis, Funnel, FunnelChart, LabelList, Cell } from 'recharts';

interface FunnelStage {
  stage: string;
  value: number;
  percentage: number;
  color: string;
}

interface EnhancedSalesFunnelProps {
  data: FunnelStage[];
}

const EnhancedSalesFunnel: React.FC<EnhancedSalesFunnelProps> = ({ data }) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-surface-header border border-brand-border rounded-md shadow-lg">
          <p className="font-bold text-text-on-dark">{data.stage}</p>
          <p className="text-text-on-dark">Leads: {data.value.toLocaleString()}</p>
          <p className="text-text-on-dark">Taxa: {data.percentage.toFixed(1)}%</p>
          <p className="text-text-on-dark">Drop-off: {data.dropOff?.toLocaleString() || 'N/A'}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate drop-off between stages
  const funnelData = data.map((stage, index) => {
    if (index === 0) {
      return { ...stage, dropOff: 0 };
    }
    const previousValue = data[index - 1].value;
    const dropOff = previousValue - stage.value;
    return { ...stage, dropOff };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart layout="vertical" margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
        <Tooltip content={<CustomTooltip />} />
        <Funnel
          dataKey="value"
          nameKey="stage"
          data={funnelData}
          isAnimationActive
        >
          {funnelData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            fill="#000"
            stroke="none"
            fontSize={14}
            formatter={(value: number) => value.toLocaleString()}
          />
          <LabelList
            dataKey="stage"
            position="left"
            fill="#000"
            stroke="none"
            fontSize={14}
            offset={10}
          />
          <LabelList
            dataKey="percentage"
            position="inside"
            fill="#fff"
            stroke="none"
            fontSize={12}
            formatter={(value: number) => `${value.toFixed(1)}%`}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
};

export default EnhancedSalesFunnel;