import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { FunnelData } from '../../types';

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
                <p className="label text-text-on-dark font-bold">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.fill }}>
                        {`Valor: ${pld.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface AdvancedFunnelChartProps {
  data: FunnelData[];
}

const AdvancedFunnelChart: React.FC<AdvancedFunnelChartProps> = ({ data }) => {
  // Calculate conversion rates
  const funnelData = data.map((item, index) => {
    const conversionRate = index === 0 ? 100 : (item.value / data[index - 1].value) * 100;
    const dropOff = index === 0 ? 0 : data[index - 1].value - item.value;
    const dropOffRate = index === 0 ? 0 : (dropOff / data[index - 1].value) * 100;
    
    return {
      ...item,
      conversionRate,
      dropOff,
      dropOffRate
    };
  });

  // Color scale for funnel stages
  const colorScale = (index: number) => {
    const colors = ['#B0D236', '#858360', '#6F6C4B', '#556B2F', '#353B37'];
    return colors[index % colors.length];
  };

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={funnelData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="stage" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#1E1E1E' }}
            tickFormatter={(value) => {
              const item = funnelData.find(d => d.stage === value);
              return item ? `${value} (${item.value})` : value;
            }}
            width={150}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(176, 210, 54, 0.2)' }}/>
          <Bar dataKey="value" barSize={40}>
            {funnelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorScale(index)} />
            ))}
            <LabelList 
              dataKey="label" 
              position="right" 
              style={{ fill: '#1E1E1E' }}
              formatter={(value: string, entry: any) => {
                const item = funnelData.find(d => d.label === value);
                return item ? `${value}\n${item.conversionRate.toFixed(1)}%` : value;
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Conversion Rate Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {funnelData.slice(1).map((stage, index) => (
          <div key={index} className="bg-surface-card p-4 rounded-lg border border-brand-border">
            <h4 className="text-text-main font-semibold text-sm">{stage.stage}</h4>
            <div className="mt-2">
              <p className="text-text-main text-xl font-bold">{stage.conversionRate.toFixed(1)}%</p>
              <p className="text-text-muted text-xs">Taxa de conversão</p>
            </div>
            <div className="mt-2">
              <p className="text-red-500 text-lg font-bold">{stage.dropOff}</p>
              <p className="text-text-muted text-xs">Perda de leads</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvancedFunnelChart;