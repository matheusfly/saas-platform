import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

interface FunnelComparisonData {
  stage: string;
  'Período Atual': number;
  'Período Anterior': number;
  'Variação %': number;
}

interface InteractiveFunnelComparisonProps {
  data: FunnelComparisonData[];
}

const InteractiveFunnelComparison: React.FC<InteractiveFunnelComparisonProps> = ({ data }) => {
  const [activeBar, setActiveBar] = useState<string | null>(null);

  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((pld: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span className="text-text-on-dark">{pld.dataKey}:</span>
                <span className="font-semibold" style={{ color: pld.color }}>
                  {pld.dataKey === 'Variação %' 
                    ? `${pld.value > 0 ? '+' : ''}${pld.value.toFixed(1)}%` 
                    : pld.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Color for variation bar based on positive/negative
  const getVariationColor = (value: number) => {
    if (value > 0) return '#82ca9d'; // Green for positive
    if (value < 0) return '#ff6b6b'; // Red for negative
    return '#999'; // Gray for neutral
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barGap={0}
          barCategoryGap="15%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          <XAxis 
            dataKey="stage" 
            tick={{ fill: '#1E1E1E', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#1E1E1E', fontSize: 12 }}
            tickFormatter={(value) => value.toLocaleString()}
            width={60}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#1E1E1E', fontSize: 12 }}
            tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}%`}
            domain={[-100, 100]}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => (
              <span className="text-text-main text-sm">{value}</span>
            )}
          />
          <ReferenceLine y={0} stroke="#000" />
          
          {/* Current period bars */}
          <Bar 
            yAxisId="left"
            dataKey="Período Atual" 
            name="Período Atual" 
            fill="#8884d8" 
            radius={[4, 4, 0, 0]}
            onMouseEnter={() => setActiveBar('current')}
            onMouseLeave={() => setActiveBar(null)}
          />
          
          {/* Previous period bars */}
          <Bar 
            yAxisId="left"
            dataKey="Período Anterior" 
            name="Período Anterior" 
            fill="#82ca9d" 
            radius={[4, 4, 0, 0]}
            opacity={0.7}
            onMouseEnter={() => setActiveBar('previous')}
            onMouseLeave={() => setActiveBar(null)}
          />
          
          {/* Variation bars */}
          <Bar 
            yAxisId="right"
            dataKey="Variação %" 
            name="Variação %" 
            fill="#ff7300"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Key insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-blue-800 font-semibold">Melhor Estágio</h4>
          <p className="text-blue-600 text-sm mt-1">
            {data.reduce((max, item) => item['Variação %'] > max['Variação %'] ? item : max, data[0]).stage}
          </p>
          <p className="text-blue-600 text-xs">
            +{data.reduce((max, item) => item['Variação %'] > max['Variação %'] ? item : max, data[0])['Variação %'].toFixed(1)}% de melhoria
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="text-green-800 font-semibold">Conversão Geral</h4>
          <p className="text-green-600 text-sm mt-1">
            {(data[data.length - 1]['Período Atual'] / data[0]['Período Atual'] * 100).toFixed(1)}%
          </p>
          <p className="text-green-600 text-xs">
            Taxa de conversão final
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="text-purple-800 font-semibold">Total de Leads</h4>
          <p className="text-purple-600 text-sm mt-1">
            {data[0]['Período Atual'].toLocaleString()}
          </p>
          <p className="text-purple-600 text-xs">
            {data[0]['Variação %'] > 0 ? '+' : ''}{data[0]['Variação %'].toFixed(1)}% vs período anterior
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveFunnelComparison;