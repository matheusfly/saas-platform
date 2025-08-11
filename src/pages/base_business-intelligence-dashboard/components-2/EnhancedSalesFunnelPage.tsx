import React, { useState } from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import ModernSalesFunnel from './charts-2/ModernSalesFunnel';
import InteractiveFunnelComparison from './charts-2/InteractiveFunnelComparison';
import SalesPerformanceWaterfall from './charts-2/SalesPerformanceWaterfall';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';

interface EnhancedSalesFunnelPageProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  chartData: AllData;
}

const EnhancedSalesFunnelPage: React.FC<EnhancedSalesFunnelPageProps> = ({ 
  filters, 
  onFilterChange, 
  chartData 
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [viewMode, setViewMode] = useState<'funnel' | 'comparison' | 'performance'>('funnel');

  // Mock data for modern sales funnel
  const modernFunnelData = [
    { stage: 'Leads', value: 1200, percentage: 100, color: '#8884d8' },
    { stage: 'Qualificação', value: 850, percentage: 70.8, color: '#82ca9d' },
    { stage: 'Proposta', value: 520, percentage: 43.3, color: '#ffc658' },
    { stage: 'Negociação', value: 310, percentage: 25.8, color: '#ff7300' },
    { stage: 'Fechamento', value: 180, percentage: 15.0, color: '#0088fe' },
  ];

  // Mock data for funnel comparison
  const funnelComparisonData = [
    { stage: 'Leads', 'Período Atual': 1200, 'Período Anterior': 1050, 'Variação %': 14.3 },
    { stage: 'Qualificação', 'Período Atual': 850, 'Período Anterior': 780, 'Variação %': 9.0 },
    { stage: 'Proposta', 'Período Atual': 520, 'Período Anterior': 480, 'Variação %': 8.3 },
    { stage: 'Negociação', 'Período Atual': 310, 'Período Anterior': 290, 'Variação %': 6.9 },
    { stage: 'Fechamento', 'Período Atual': 180, 'Período Anterior': 150, 'Variação %': 20.0 },
  ];

  // Mock data for sales performance waterfall
  const waterfallData = [
    { name: 'Jan', value: 45000, fill: '#8884d8' },
    { name: 'Fev', value: 52000, fill: '#82ca9d' },
    { name: 'Mar', value: 48000, fill: '#ffc658' },
    { name: 'Abr', value: 61000, fill: '#ff7300' },
    { name: 'Mai', value: 55000, fill: '#0088fe' },
    { name: 'Jun', value: 67000, fill: '#8884d8' },
    { name: 'Total', value: 0, fill: '#000', isTotal: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-text-main">Funil de Vendas Avançado</h2>
        
        {/* View Controls */}
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'funnel' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setViewMode('funnel')}
          >
            Funil
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'comparison' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setViewMode('comparison')}
          >
            Comparação
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'performance' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setViewMode('performance')}
          >
            Performance
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      {/* Main Chart Area */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard 
          title={
            viewMode === 'funnel' ? 'Análise do Funil de Vendas' :
            viewMode === 'comparison' ? 'Comparação de Períodos' :
            'Performance de Vendas por Período'
          } 
          chartClassName="h-[600px]"
        >
          {viewMode === 'funnel' && (
            <ModernSalesFunnel 
              data={modernFunnelData} 
              showPercentages={true}
              showDropOff={true}
            />
          )}
          {viewMode === 'comparison' && (
            <InteractiveFunnelComparison data={funnelComparisonData} />
          )}
          {viewMode === 'performance' && (
            <SalesPerformanceWaterfall data={waterfallData} />
          )}
        </ChartCard>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Taxa de Conversão</h3>
          <p className="text-3xl font-bold mt-2">15.0%</p>
          <p className="text-xs opacity-90 mt-1">↗ 2.3% vs mês anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Valor Médio</h3>
          <p className="text-3xl font-bold mt-2">R$ 1,250</p>
          <p className="text-xs opacity-90 mt-1">↗ 5.7% vs mês anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Ciclo Médio</h3>
          <p className="text-3xl font-bold mt-2">28 dias</p>
          <p className="text-xs opacity-90 mt-1">↘ 3.4% vs mês anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Leads no Funil</h3>
          <p className="text-3xl font-bold mt-2">1,200</p>
          <p className="text-xs opacity-90 mt-1">↗ 14.3% vs mês anterior</p>
        </div>
      </div>
      
      {/* Insights Panel */}
      <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-brand-border">
        <h3 className="text-lg font-semibold text-text-main mb-4">Insights Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-blue-800 font-semibold">Melhor Estágio</h4>
            <p className="text-blue-600 text-sm mt-1">Fechamento</p>
            <p className="text-blue-600 text-xs">20.0% de melhoria vs período anterior</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-green-800 font-semibold">Maior Perda</h4>
            <p className="text-green-600 text-sm mt-1">Leads → Qualificação</p>
            <p className="text-green-600 text-xs">29.2% de perda no funil</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="text-purple-800 font-semibold">Oportunidade</h4>
            <p className="text-purple-600 text-sm mt-1">Otimizar qualificação</p>
            <p className="text-purple-600 text-xs">Potencial de +150 leads/mês</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSalesFunnelPage;