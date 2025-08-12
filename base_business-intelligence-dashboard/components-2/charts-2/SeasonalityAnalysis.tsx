import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SeasonalityData {
  period: string;
  revenue: number;
}

interface SeasonalityAnalysisProps {
  dailyData: SeasonalityData[];
  monthlyData: SeasonalityData[];
}

const SeasonalityAnalysis: React.FC<SeasonalityAnalysisProps> = ({ dailyData, monthlyData }) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
          <p className="label text-text-on-dark font-bold">{`${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.fill }}>
              {`Receita: R$ ${pld.value.toLocaleString('pt-BR')}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 mb-4">
        <h4 className="text-center text-text-main font-medium mb-2">Padrões Diários</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dailyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              tick={{ fill: '#1E1E1E' }}
            />
            <YAxis 
              tick={{ fill: '#1E1E1E' }}
              tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="revenue" 
              name="Receita Média" 
              fill="#8884d8" 
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex-1 mt-4">
        <h4 className="text-center text-text-main font-medium mb-2">Padrões Mensais</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              tick={{ fill: '#1E1E1E' }}
            />
            <YAxis 
              tick={{ fill: '#1E1E1E' }}
              tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="revenue" 
              name="Receita Média" 
              fill="#82ca9d" 
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SeasonalityAnalysis;