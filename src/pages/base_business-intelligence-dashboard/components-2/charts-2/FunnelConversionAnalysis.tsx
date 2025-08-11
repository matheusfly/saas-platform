import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, LabelList } from 'recharts';

interface ConversionStage {
  stage: string;
  leads: number;
  conversions: number;
  conversionRate: number;
  dropOff: number;
}

interface FunnelConversionAnalysisProps {
  data: ConversionStage[];
}

const FunnelConversionAnalysis: React.FC<FunnelConversionAnalysisProps> = ({ data }) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-surface-header border border-brand-border rounded-md shadow-lg">
          <p className="font-bold text-text-on-dark">{label}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color }}>
              {pld.dataKey === 'conversionRate' 
                ? `${pld.name}: ${pld.value.toFixed(1)}%` 
                : `${pld.name}: ${pld.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        barGap={0}
        barCategoryGap="10%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="stage" 
          tick={{ fill: '#1E1E1E' }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          yAxisId="left"
          tick={{ fill: '#1E1E1E' }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tick={{ fill: '#1E1E1E' }}
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <ReferenceLine y={0} stroke="#000" />
        
        <Bar 
          yAxisId="left"
          dataKey="leads" 
          name="Leads" 
          fill="#8884d8" 
          radius={[4, 4, 0, 0]}
        >
          <LabelList 
            dataKey="leads" 
            position="top" 
            formatter={(value: number) => value.toLocaleString()} 
          />
        </Bar>
        
        <Bar 
          yAxisId="left"
          dataKey="conversions" 
          name="Conversões" 
          fill="#82ca9d" 
          radius={[4, 4, 0, 0]}
        >
          <LabelList 
            dataKey="conversions" 
            position="top" 
            formatter={(value: number) => value.toLocaleString()} 
          />
        </Bar>
        
        <Bar 
          yAxisId="right"
          dataKey="conversionRate" 
          name="Taxa de Conversão" 
          fill="#ffc658" 
          radius={[4, 4, 0, 0]}
        >
          <LabelList 
            dataKey="conversionRate" 
            position="top" 
            formatter={(value: number) => `${value.toFixed(1)}%`} 
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FunnelConversionAnalysis;