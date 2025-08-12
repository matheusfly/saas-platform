import React, { useState } from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import DynamicProductivityDashboard from './charts/DynamicProductivityDashboard';
import AdvancedActivityHeatmap from './charts/AdvancedActivityHeatmap';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';

interface EnhancedProductivityPageProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  chartData: AllData;
}

const EnhancedProductivityPage: React.FC<EnhancedProductivityPageProps> = ({ 
  filters, 
  onFilterChange, 
  chartData 
}) => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'heatmap'>('dashboard');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  // Mock data for productivity dashboard
  const productivityData = [
    { date: 'Seg', productivity: 75, tasksCompleted: 12, hoursWorked: 8 },
    { date: 'Ter', productivity: 82, tasksCompleted: 15, hoursWorked: 8 },
    { date: 'Qua', productivity: 68, tasksCompleted: 10, hoursWorked: 7 },
    { date: 'Qui', productivity: 88, tasksCompleted: 18, hoursWorked: 9 },
    { date: 'Sex', productivity: 79, tasksCompleted: 14, hoursWorked: 8 },
    { date: 'Sáb', productivity: 92, tasksCompleted: 20, hoursWorked: 6 },
    { date: 'Dom', productivity: 45, tasksCompleted: 5, hoursWorked: 4 },
  ];

  // Mock data for activity distribution
  const activityData = [
    { name: 'Email', value: 45, color: '#8884d8' },
    { name: 'Ligações', value: 32, color: '#82ca9d' },
    { name: 'Reuniões', value: 28, color: '#ffc658' },
    { name: 'Tarefas', value: 55, color: '#ff7300' },
    { name: 'Visitas', value: 18, color: '#0088fe' },
  ];

  // Mock data for consultant performance
  const consultantData = [
    { name: 'Ana Silva', productivity: 85, tasks: 120, efficiency: 92 },
    { name: 'Bruno Costa', productivity: 78, tasks: 95, efficiency: 85 },
    { name: 'Carlos Dias', productivity: 92, tasks: 140, efficiency: 95 },
    { name: 'Diana Lima', productivity: 88, tasks: 110, efficiency: 89 },
    { name: 'Eduardo Rocha', productivity: 75, tasks: 85, efficiency: 80 },
  ];

  // Mock data for activity heatmap
  const heatmapData = [
    { day: 'Seg', hour: 8, value: 75, activities: 12 },
    { day: 'Seg', hour: 9, value: 82, activities: 15 },
    { day: 'Seg', hour: 10, value: 88, activities: 18 },
    { day: 'Seg', hour: 11, value: 78, activities: 14 },
    { day: 'Seg', hour: 12, value: 65, activities: 10 },
    { day: 'Seg', hour: 13, value: 60, activities: 8 },
    { day: 'Seg', hour: 14, value: 70, activities: 11 },
    { day: 'Seg', hour: 15, value: 85, activities: 16 },
    { day: 'Seg', hour: 16, value: 90, activities: 19 },
    { day: 'Seg', hour: 17, value: 75, activities: 13 },
    { day: 'Seg', hour: 18, value: 60, activities: 9 },
    
    { day: 'Ter', hour: 8, value: 80, activities: 14 },
    { day: 'Ter', hour: 9, value: 85, activities: 17 },
    { day: 'Ter', hour: 10, value: 90, activities: 20 },
    { day: 'Ter', hour: 11, value: 82, activities: 16 },
    { day: 'Ter', hour: 12, value: 70, activities: 12 },
    { day: 'Ter', hour: 13, value: 65, activities: 10 },
    { day: 'Ter', hour: 14, value: 75, activities: 13 },
    { day: 'Ter', hour: 15, value: 88, activities: 18 },
    { day: 'Ter', hour: 16, value: 92, activities: 21 },
    { day: 'Ter', hour: 17, value: 80, activities: 15 },
    { day: 'Ter', hour: 18, value: 65, activities: 11 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-text-main">Análise de Produtividade Avançada</h2>
        
        {/* View Controls */}
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'dashboard' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setViewMode('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'heatmap' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setViewMode('heatmap')}
          >
            Mapa de Calor
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      {/* Main Chart Area */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard 
          title={
            viewMode === 'dashboard' ? 'Painel de Produtividade' : 'Mapa de Calor de Atividades'
          } 
          chartClassName="h-[700px]"
        >
          {viewMode === 'dashboard' ? (
            <DynamicProductivityDashboard 
              productivityData={productivityData}
              activityData={activityData}
              consultantData={consultantData}
            />
          ) : (
            <AdvancedActivityHeatmap 
              data={heatmapData}
            />
          )}
        </ChartCard>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Produtividade Média</h3>
          <p className="text-3xl font-bold mt-2">78.1%</p>
          <p className="text-xs opacity-90 mt-1">↗ 3.2% vs período anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Tarefas Concluídas</h3>
          <p className="text-3xl font-bold mt-2">680</p>
          <p className="text-xs opacity-90 mt-1">↗ 12.5% vs período anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Horas Trabalhadas</h3>
          <p className="text-3xl font-bold mt-2">245</p>
          <p className="text-xs opacity-90 mt-1">↗ 5.7% vs período anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Melhor Consultor</h3>
          <p className="text-xl font-bold mt-2">Carlos Dias</p>
          <p className="text-xs opacity-90 mt-1">92% de produtividade</p>
        </div>
      </div>
      
      {/* Team Performance */}
      <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-brand-border">
        <h3 className="text-lg font-semibold text-text-main mb-4">Performance da Equipe</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produtividade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarefas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eficiência</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consultantData.map((consultant, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{consultant.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${consultant.productivity}%` }}
                        ></div>
                      </div>
                      {consultant.productivity}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{consultant.tasks}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{consultant.efficiency}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {consultant.productivity >= 90 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Excelente
                      </span>
                    ) : consultant.productivity >= 80 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Bom
                      </span>
                    ) : consultant.productivity >= 70 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Médio
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Atenção
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductivityPage;