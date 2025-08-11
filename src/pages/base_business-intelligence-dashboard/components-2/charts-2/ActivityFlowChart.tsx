import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ActivityFlowData {
  stage: string;
  value: number;
  percentage: number;
}

interface ActivityFlowChartProps {
  data: ActivityFlowData[];
}

const ActivityFlowChart: React.FC<ActivityFlowChartProps> = ({ data }) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg">{label}</p>
          <p className="text-text-on-dark mt-2">
            Atividades: <span className="font-semibold">{payload[0].value}</span>
          </p>
          <p className="text-text-on-dark">
            Percentual: <span className="font-semibold">{payload[0].payload.percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
            tick={{ fill: '#1E1E1E', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => <span className="text-text-main text-sm">{value}</span>}
          />
          <Bar 
            dataKey="value" 
            name="Atividades" 
            fill="#8884d8" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Flow Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <h4 className="text-green-800 font-semibold">Entrada Total</h4>
          <p className="text-green-600 text-xl font-bold mt-1">
            {data[0]?.value || 0}
          </p>
          <p className="text-green-600 text-xs">Atividades iniciadas</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <h4 className="text-blue-800 font-semibold">Processamento</h4>
          <p className="text-blue-600 text-xl font-bold mt-1">
            {data.slice(1, -1).reduce((sum, item) => sum + item.value, 0)}
          </p>
          <p className="text-blue-600 text-xs">Atividades em andamento</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <h4 className="text-orange-800 font-semibold">Conclusão</h4>
          <p className="text-orange-600 text-xl font-bold mt-1">
            {data[data.length - 1]?.value || 0}
          </p>
          <p className="text-orange-600 text-xs">Atividades concluídas</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityFlowChart;