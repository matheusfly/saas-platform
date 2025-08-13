import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface LTVHistogramData {
  range: string;
  count: number;
}

interface ClientLTVHistogramProps {
  data: LTVHistogramData[];
}

const ClientLTVHistogram: React.FC<ClientLTVHistogramProps> = ({ data }) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
          <p className="label text-text-on-dark font-bold">{`${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.fill }}>
              {`Clientes: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Color scale based on value
  const getColor = (value: number) => {
    if (value >= 30) return '#B0D236'; // High LTV
    if (value >= 20) return '#FFD166'; // Medium LTV
    if (value >= 10) return '#FF9A76'; // Low LTV
    return '#EF476F'; // Very low LTV
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="range" 
          tick={{ fill: '#1E1E1E' }}
        />
        <YAxis 
          tick={{ fill: '#1E1E1E' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="count" 
          name="Número de Clientes" 
          barSize={30}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.count)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ClientLTVHistogram;