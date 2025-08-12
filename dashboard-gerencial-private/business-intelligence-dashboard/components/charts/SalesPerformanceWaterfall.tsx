import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, LabelList } from 'recharts';

interface WaterfallData {
  name: string;
  value: number;
  fill: string;
  isTotal?: boolean;
}

interface SalesPerformanceWaterfallProps {
  data: WaterfallData[];
}

const SalesPerformanceWaterfall: React.FC<SalesPerformanceWaterfallProps> = ({ data }) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg">{data.name}</p>
          <p className="text-text-on-dark mt-2">
            Valor: <span className="font-semibold">R$ {Math.abs(data.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </p>
          {data.isTotal && (
            <p className="text-text-on-dark text-sm mt-2">
              Total acumulado
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate cumulative values for waterfall effect
  const processData = () => {
    let cumulative = 0;
    return data.map((item, index) => {
      const result = {
        ...item,
        start: cumulative,
        end: cumulative + item.value,
        isLast: index === data.length - 1
      };
      cumulative = result.end;
      return result;
    });
  };

  const processedData = processData();

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barCategoryGap="10%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          <XAxis 
            dataKey="name" 
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
          <ReferenceLine y={0} stroke="#000" />
          
          {/* Waterfall bars */}
          <Bar 
            dataKey="value" 
            name="Valor" 
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
          >
            <LabelList 
              dataKey="value" 
              position="top" 
              formatter={(value: number) => `R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} 
              style={{ fill: '#1E1E1E', fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
          
          {/* Connecting lines for waterfall effect */}
          {processedData.slice(0, -1).map((entry, index) => (
            <ReferenceLine 
              key={`line-${index}`}
              y={entry.end} 
              stroke="#888" 
              strokeDasharray="3 3"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      
      {/* Summary Metrics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
          <h4 className="font-semibold text-sm opacity-90">Receita Total</h4>
          <p className="text-2xl font-bold mt-1">
            R$ {processedData[processedData.length - 1].end.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs opacity-90 mt-1">+12.5% vs período anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
          <h4 className="font-semibold text-sm opacity-90">Ticket Médio</h4>
          <p className="text-2xl font-bold mt-1">
            R$ {(processedData[processedData.length - 1].end / processedData.filter(d => d.value > 0).length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs opacity-90 mt-1">+3.2% vs período anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
          <h4 className="font-semibold text-sm opacity-90">Conversão</h4>
          <p className="text-2xl font-bold mt-1">
            {(processedData.filter(d => d.value > 0).length / processedData.length * 100).toFixed(1)}%
          </p>
          <p className="text-xs opacity-90 mt-1">Taxa de sucesso</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg">
          <h4 className="font-semibold text-sm opacity-90">Melhor Período</h4>
          <p className="text-xl font-bold mt-1">
            {processedData.reduce((max, item) => item.value > max.value ? item : max, processedData[0]).name}
          </p>
          <p className="text-xs opacity-90 mt-1">
            R$ {processedData.reduce((max, item) => item.value > max.value ? item : max, processedData[0]).value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesPerformanceWaterfall;