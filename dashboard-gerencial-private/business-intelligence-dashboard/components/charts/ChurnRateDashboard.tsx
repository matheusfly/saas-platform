import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

interface ChurnData {
  date: string;
  churnRate: number;
  churnCount: number;
}

interface ChurnRateDashboardProps {
  data: ChurnData[];
}

const ChurnRateDashboard: React.FC<ChurnRateDashboardProps> = ({ data }) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
          <p className="label text-text-on-dark font-bold">{`${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color }}>
              {pld.dataKey === 'churnRate' 
                ? `Taxa: ${pld.value.toFixed(2)}%` 
                : `Clientes: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
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
          yAxisId="left"
          tick={{ fill: '#1E1E1E' }}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tick={{ fill: '#1E1E1E' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <ReferenceLine y={0} stroke="#000" />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="churnRate"
          name="Taxa de Churn"
          stroke="#EF476F"
          fill="#EF476F"
          fillOpacity={0.3}
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="churnCount"
          name="Clientes Churn"
          stroke="#FF9A76"
          fill="#FF9A76"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ChurnRateDashboard;