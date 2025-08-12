import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PaymentMethodData {
  name: string;
  value: number;
  percentage: number;
}

interface PaymentMethodPerformanceProps {
  data: PaymentMethodData[];
}

const PaymentMethodPerformance: React.FC<PaymentMethodPerformanceProps> = ({ data }) => {
  // Colors for payment methods
  const COLORS = ['#B0D236', '#FFD166', '#FF9A76', '#0088FE', '#EF476F'];

  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
          <p className="label text-text-on-dark font-bold">{`${data.name}`}</p>
          <p className="text-text-on-dark">{`Valor: R$ ${data.value.toLocaleString('pt-BR')}`}</p>
          <p className="text-text-on-dark">{`Percentual: ${data.percentage.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PaymentMethodPerformance;