import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { RevenueExpenseData } from '../../types';

interface AdvancedRevenueAnalysisChartProps {
  data: RevenueExpenseData[];
}

const AdvancedRevenueAnalysisChart: React.FC<AdvancedRevenueAnalysisChartProps> = ({ data }) => {
  // Calculate additional metrics
  const enrichedData = data.map(item => ({
    ...item,
    profitMargin: item.revenue > 0 ? (item.net / item.revenue) * 100 : 0,
    growthRate: 0 // Will be calculated in next step
  }));

  // Calculate growth rates
  for (let i = 1; i < enrichedData.length; i++) {
    const previousRevenue = enrichedData[i - 1].revenue;
    const currentRevenue = enrichedData[i].revenue;
    enrichedData[i].growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  }

  const currencyFormatter = (value: number) => {
    if (Math.abs(value) >= 1_000_000) {
      return `R$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `R$${(value / 1000).toFixed(0)}k`;
    }
    return `R$${value}`;
  };

  const percentFormatter = (value: number) => `${value.toFixed(1)}%`;

  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((pld: any, index: number) => (
              <p key={index} style={{ color: pld.color || pld.stroke }}>
                {pld.dataKey === 'profitMargin' || pld.dataKey === 'growthRate'
                  ? `${pld.name}: ${pld.value.toFixed(2)}%`
                  : `${pld.name}: ${pld.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                }
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Revenue and Expenses Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enrichedData} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
              <XAxis dataKey="date" stroke="#858360" />
              <YAxis stroke="#858360" tickFormatter={currencyFormatter}>
                <Label value="Valor (R$)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#858360' }} />
              </YAxis>
              <Tooltip content={<CustomTooltip />}/>
              <Legend wrapperStyle={{ color: '#1E1E1E' }} />
              <Bar dataKey="revenue" name="Receita" fill="#B0D236" />
              <Bar dataKey="expenses" name="Despesa" fill="#D9534F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Profit and Growth Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={enrichedData} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
              <XAxis dataKey="date" stroke="#858360" />
              <YAxis 
                yAxisId="left" 
                stroke="#858360" 
                tickFormatter={currencyFormatter}
              >
                <Label value="Lucro (R$)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#858360' }} />
              </YAxis>
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#6F6C4B" 
                tickFormatter={percentFormatter}
              >
                <Label value="Margem/Crescimento (%)" angle={-90} position="insideRight" style={{ textAnchor: 'middle', fill: '#6F6C4B' }} />
              </YAxis>
              <Tooltip content={<CustomTooltip />}/>
              <Legend wrapperStyle={{ color: '#1E1E1E' }} />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="net" 
                name="Lucro Líquido" 
                stroke="#1E1E1E" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="profitMargin" 
                name="Margem de Lucro" 
                stroke="#858360" 
                strokeWidth={2} 
                strokeDasharray="3 3"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="growthRate" 
                name="Crescimento" 
                stroke="#B0D236" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Key Metrics Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <h4 className="text-green-800 font-semibold">Receita Total</h4>
          <p className="text-green-600 text-2xl font-bold mt-1">
            {currencyFormatter(enrichedData.reduce((sum, item) => sum + item.revenue, 0))}
          </p>
          <p className="text-green-600 text-xs">Somatório do período</p>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <h4 className="text-red-800 font-semibold">Despesas Totais</h4>
          <p className="text-red-600 text-2xl font-bold mt-1">
            {currencyFormatter(enrichedData.reduce((sum, item) => sum + item.expenses, 0))}
          </p>
          <p className="text-red-600 text-xs">Somatório do período</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <h4 className="text-blue-800 font-semibold">Lucro Líquido</h4>
          <p className="text-blue-600 text-2xl font-bold mt-1">
            {currencyFormatter(enrichedData.reduce((sum, item) => sum + item.net, 0))}
          </p>
          <p className="text-blue-600 text-xs">Receita - Despesas</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <h4 className="text-purple-800 font-semibold">Margem Média</h4>
          <p className="text-purple-600 text-2xl font-bold mt-1">
            {percentFormatter((enrichedData.reduce((sum, item) => sum + item.profitMargin, 0) / enrichedData.length) || 0)}
          </p>
          <p className="text-purple-600 text-xs">Média do período</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedRevenueAnalysisChart;