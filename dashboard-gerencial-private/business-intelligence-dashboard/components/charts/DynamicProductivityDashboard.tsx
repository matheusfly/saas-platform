import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, LineChart, PieChart, Pie, Cell } from 'recharts';

interface ProductivityMetric {
  date: string;
  productivity: number;
  tasksCompleted: number;
  hoursWorked: number;
}

interface ActivityDistribution {
  name: string;
  value: number;
  color: string;
}

interface ConsultantPerformance {
  name: string;
  productivity: number;
  tasks: number;
  efficiency: number;
}

interface DynamicProductivityDashboardProps {
  productivityData: ProductivityMetric[];
  activityData: ActivityDistribution[];
  consultantData: ConsultantPerformance[];
}

const DynamicProductivityDashboard: React.FC<DynamicProductivityDashboardProps> = ({ 
  productivityData, 
  activityData, 
  consultantData 
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'productivity' | 'tasks' | 'hours'>('productivity');

  // Custom tooltip for productivity chart
  const ProductivityTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-text-on-dark">Produtividade: <span className="font-semibold">{payload[0].value.toFixed(1)}%</span></p>
            <p className="text-text-on-dark">Tarefas: <span className="font-semibold">{payload[1].value}</span></p>
            <p className="text-text-on-dark">Horas: <span className="font-semibold">{payload[2].value}h</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for activity distribution
  const ActivityTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg">{data.name}</p>
          <div className="mt-2 space-y-1">
            <p className="text-text-on-dark">Atividades: <span className="font-semibold">{data.value}</span></p>
            <p className="text-text-on-dark">Percentual: <span className="font-semibold">{((data.value / activityData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for consultant performance
  const ConsultantTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg">{data.name}</p>
          <div className="mt-2 space-y-1">
            <p className="text-text-on-dark">Produtividade: <span className="font-semibold">{data.productivity}%</span></p>
            <p className="text-text-on-dark">Tarefas: <span className="font-semibold">{data.tasks}</span></p>
            <p className="text-text-on-dark">Eficiência: <span className="font-semibold">{data.efficiency}%</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get data key based on selected metric
  const getDataKey = () => {
    switch (selectedMetric) {
      case 'productivity': return 'productivity';
      case 'tasks': return 'tasksCompleted';
      case 'hours': return 'hoursWorked';
      default: return 'productivity';
    }
  };

  // Get metric label
  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'productivity': return 'Produtividade (%)';
      case 'tasks': return 'Tarefas Concluídas';
      case 'hours': return 'Horas Trabalhadas';
      default: return 'Produtividade (%)';
    }
  };

  return (
    <div className="h-full w-full space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 'week' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setTimeRange('week')}
          >
            Semana
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 'month' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setTimeRange('month')}
          >
            Mês
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 'quarter' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setTimeRange('quarter')}
          >
            Trimestre
          </button>
        </div>
        
        <div className="flex gap-2">
          <select 
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
          >
            <option value="productivity">Produtividade</option>
            <option value="tasks">Tarefas</option>
            <option value="hours">Horas</option>
          </select>
        </div>
      </div>
      
      {/* Productivity Trend Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendência de Produtividade</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={productivityData}
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
              tick={{ fill: '#1E1E1E', fontSize: 12 }}
              tickFormatter={(value) => selectedMetric === 'productivity' ? `${value}%` : value.toString()}
            />
            <Tooltip content={<ProductivityTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="productivity"
              name="Produtividade"
              stroke="#8884d8"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="tasksCompleted"
              name="Tarefas Concluídas"
              stroke="#82ca9d"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="hoursWorked"
              name="Horas Trabalhadas"
              stroke="#ffc658"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Activity Distribution and Consultant Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Atividades</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ActivityTooltip />} />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                formatter={(value) => <span className="text-text-main text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Consultant Performance */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance por Consultor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={consultantData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barGap={2}
              barCategoryGap="15%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#1E1E1E', fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: '#1E1E1E', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<ConsultantTooltip />} />
              <Legend 
                formatter={(value) => <span className="text-text-main text-sm">{value}</span>}
              />
              <Bar 
                dataKey="productivity" 
                name="Produtividade" 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="efficiency" 
                name="Eficiência" 
                fill="#82ca9d" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
          <h4 className="font-semibold text-sm opacity-90">Produtividade Média</h4>
          <p className="text-2xl font-bold mt-1">
            {(productivityData.reduce((sum, item) => sum + item.productivity, 0) / productivityData.length).toFixed(1)}%
          </p>
          <p className="text-xs opacity-90 mt-1">+2.3% vs período anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
          <h4 className="font-semibold text-sm opacity-90">Tarefas Concluídas</h4>
          <p className="text-2xl font-bold mt-1">
            {productivityData.reduce((sum, item) => sum + item.tasksCompleted, 0)}
          </p>
          <p className="text-xs opacity-90 mt-1">+12.5% vs período anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
          <h4 className="font-semibold text-sm opacity-90">Horas Trabalhadas</h4>
          <p className="text-2xl font-bold mt-1">
            {productivityData.reduce((sum, item) => sum + item.hoursWorked, 0)}
          </p>
          <p className="text-xs opacity-90 mt-1">+5.7% vs período anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg">
          <h4 className="font-semibold text-sm opacity-90">Melhor Consultor</h4>
          <p className="text-xl font-bold mt-1">
            {consultantData.reduce((max, consultant) => 
              consultant.productivity > max.productivity ? consultant : max, consultantData[0]).name}
          </p>
          <p className="text-xs opacity-90 mt-1">
            {consultantData.reduce((max, consultant) => 
              consultant.productivity > max.productivity ? consultant : max, consultantData[0]).productivity.toFixed(1)}% de produtividade
          </p>
        </div>
      </div>
    </div>
  );
};

export default DynamicProductivityDashboard;