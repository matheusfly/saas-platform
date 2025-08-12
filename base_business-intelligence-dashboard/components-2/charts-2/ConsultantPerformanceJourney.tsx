import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

interface ConsultantJourneyData {
  date: string;
  consultant: string;
  productivity: number;
  tasks: number;
  efficiency: number;
  growth: number;
}

interface ConsultantPerformanceJourneyProps {
  data: ConsultantJourneyData[];
  consultantName: string;
}

const ConsultantPerformanceJourney: React.FC<ConsultantPerformanceJourneyProps> = ({ 
  data, 
  consultantName 
}) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-text-on-dark">Produtividade: <span className="font-semibold">{payload[0].value.toFixed(1)}%</span></p>
            <p className="text-text-on-dark">Tarefas: <span className="font-semibold">{payload[1].value}</span></p>
            <p className="text-text-on-dark">Eficiência: <span className="font-semibold">{payload[2].value.toFixed(1)}%</span></p>
            <p className="text-text-on-dark">Crescimento: <span className="font-semibold">{payload[3].value > 0 ? '+' : ''}{payload[3].value.toFixed(1)}%</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get milestone points
  const milestones = data.filter(d => d.growth > 10 || d.growth < -10);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#1E1E1E', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#1E1E1E', fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#1E1E1E', fontSize: 12 }}
            domain={[0, Math.max(...data.map(d => d.tasks)) * 1.2]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => <span className="text-text-main text-sm">{value}</span>}
          />
          <ReferenceLine y={0} stroke="#000" />
          
          {/* Productivity area */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="productivity"
            name="Produtividade"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          
          {/* Tasks area */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="tasks"
            name="Tarefas"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          
          {/* Efficiency line */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="efficiency"
            name="Eficiência"
            stroke="#ffc658"
            fill="#ffc658"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          
          {/* Growth line */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="growth"
            name="Crescimento"
            stroke="#ff7300"
            fill="#ff7300"
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Journey Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <h4 className="text-blue-800 font-semibold">Trajetória</h4>
          <p className="text-blue-600 text-sm mt-1">
            {data[data.length - 1].productivity > data[0].productivity ? 'Ascendente' : 'Descendente'}
          </p>
          <p className="text-blue-600 text-xs">
            Variação de {(data[data.length - 1].productivity - data[0].productivity).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <h4 className="text-green-800 font-semibold">Melhor Período</h4>
          <p className="text-green-600 text-sm mt-1">
            {data.reduce((max, item) => item.productivity > max.productivity ? item : max, data[0]).date}
          </p>
          <p className="text-green-600 text-xs">
            {data.reduce((max, item) => item.productivity > max.productivity ? item : max, data[0]).productivity.toFixed(1)}% de produtividade
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <h4 className="text-purple-800 font-semibold">Milestone</h4>
          <p className="text-purple-600 text-sm mt-1">
            {milestones.length > 0 ? milestones[milestones.length - 1].date : 'Nenhum'}
          </p>
          <p className="text-purple-600 text-xs">
            {milestones.length > 0 ? `${milestones[milestones.length - 1].growth > 0 ? '+' : ''}${milestones[milestones.length - 1].growth.toFixed(1)}% de crescimento` : 'Sem marcos significativos'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsultantPerformanceJourney;