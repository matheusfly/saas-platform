import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

interface RevenueTrendData {
  date: string;
  revenue: number;
  trend: number;
  forecast?: number;
}

interface RevenueTrendAnalysisProps {
  data: RevenueTrendData[];
}

const RevenueTrendAnalysis: React.FC<RevenueTrendAnalysisProps> = ({ data }) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
          <p className="label text-text-on-dark font-bold">{`${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color }}>
              {`${pld.dataKey}: R$ ${pld.value.toLocaleString('pt-BR')}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#1E1E1E' }}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis 
          tick={{ fill: '#1E1E1E' }}
          tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Receita Real"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="trend"
          name="Tendência"
          stroke="#82ca9d"
          strokeWidth={2}
          strokeDasharray="3 3"
        />
        {data.some(d => d.forecast !== undefined) && (
          <Line
            type="monotone"
            dataKey="forecast"
            name="Previsão"
            stroke="#ffc658"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        )}
        <ReferenceLine y={0} stroke="#000" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueTrendAnalysis;