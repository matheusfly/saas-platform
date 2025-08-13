import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ConsultantPerformanceData {
  user: string;
  revenue: number;
  transactionCount: number;
  clientCount: number;
  avgClientValue: number;
  trialConversionRate: number;
}

interface ConsultantPerformanceRankingProps {
  data: ConsultantPerformanceData[];
}

const ConsultantPerformanceRanking: React.FC<ConsultantPerformanceRankingProps> = ({ data }) => {
  // Sort data by revenue
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);

  // Get bar color based on rank
  const getBarColor = (index: number) => {
    if (index === 0) return '#FFD700'; // Gold
    if (index === 1) return '#C0C0C0'; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return '#607885'; // Default
  };

  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg mb-2">{data.user}</p>
          <div className="space-y-1">
            <p className="text-text-on-dark">
              Receita: <span className="font-semibold">R$ {data.revenue.toLocaleString('pt-BR')}</span>
            </p>
            <p className="text-text-on-dark">
              Transações: <span className="font-semibold">{data.transactionCount}</span>
            </p>
            <p className="text-text-on-dark">
              Clientes: <span className="font-semibold">{data.clientCount}</span>
            </p>
            <p className="text-text-on-dark">
              Valor Médio: <span className="font-semibold">R$ {data.avgClientValue.toFixed(2)}</span>
            </p>
            <p className="text-text-on-dark">
              Taxa de Conversão: <span className="font-semibold">{data.trialConversionRate.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        barCategoryGap="15%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis 
          dataKey="user" 
          tick={{ fill: '#1E1E1E', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tick={{ fill: '#1E1E1E', fontSize: 12 }}
          tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value) => <span className="text-text-main text-sm">{value}</span>}
        />
        <Bar 
          dataKey="revenue" 
          name="Receita" 
          fill="#8884d8" 
          radius={[4, 4, 0, 0]}
        >
          {sortedData.map((entry, index) => (
            <Bar 
              key={`cell-${index}`} 
              dataKey="revenue" 
              fill={getBarColor(index)} 
              radius={[4, 4, 0, 0]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ConsultantPerformanceRanking;