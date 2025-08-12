import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

interface SalesCycleData {
  consultant: string;
  avgCycleDays: number;
  minCycleDays: number;
  maxCycleDays: number;
  dealsClosed: number;
}

interface SalesCycleAnalysisProps {
  data: SalesCycleData[];
}

const SalesCycleAnalysis: React.FC<SalesCycleAnalysisProps> = ({ data }) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-surface-header border border-brand-border rounded-md shadow-lg">
          <p className="font-bold text-text-on-dark">{label}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color }}>
              {pld.dataKey === 'dealsClosed' 
                ? `${pld.name}: ${pld.value}` 
                : `${pld.name}: ${pld.value} dias`}
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
        barGap={2}
        barCategoryGap="15%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="consultant" 
          tick={{ fill: '#1E1E1E' }}
        />
        <YAxis 
          yAxisId="left"
          tick={{ fill: '#1E1E1E' }}
          tickFormatter={(value) => `${value} dias`}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tick={{ fill: '#1E1E1E' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <ReferenceLine y={0} stroke="#000" />
        
        <Bar 
          yAxisId="left"
          dataKey="avgCycleDays" 
          name="Ciclo Médio" 
          fill="#8884d8" 
          radius={[4, 4, 0, 0]}
        />
        
        <Bar 
          yAxisId="left"
          dataKey="minCycleDays" 
          name="Ciclo Mínimo" 
          fill="#82ca9d" 
          radius={[4, 4, 0, 0]}
        />
        
        <Bar 
          yAxisId="left"
          dataKey="maxCycleDays" 
          name="Ciclo Máximo" 
          fill="#ffc658" 
          radius={[4, 4, 0, 0]}
        />
        
        <Bar 
          yAxisId="right"
          dataKey="dealsClosed" 
          name="Negócios Fechados" 
          fill="#ff7300" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalesCycleAnalysis;