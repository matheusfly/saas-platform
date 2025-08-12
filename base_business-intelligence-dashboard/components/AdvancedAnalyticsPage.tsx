import React from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import AdvancedFunnelChart from './charts/AdvancedFunnelChart';
import EnhancedCohortAnalysisChart from './charts/EnhancedCohortAnalysisChart';
import AdvancedRevenueAnalysisChart from './charts/AdvancedRevenueAnalysisChart';
import AdvancedPerformanceRadarChart from './charts/AdvancedPerformanceRadarChart';
import CustomerSegmentationChart from './charts/CustomerSegmentationChart';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';

interface AdvancedAnalyticsPageProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    chartData: AllData;
}

const AdvancedAnalyticsPage: React.FC<AdvancedAnalyticsPageProps> = ({ filters, onFilterChange, chartData }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-text-main">Análise Avançada</h2>
      </div>
      
      {/* Filters */}
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Receita Total</h3>
          <p className="text-3xl font-bold mt-2">
            R$ {chartData.kpis.totalRevenue.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs opacity-90 mt-1">↗ 12.5% vs período anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Taxa de Conversão</h3>
          <p className="text-3xl font-bold mt-2">
            {chartData.kpis.conversionRate.toFixed(1)}%
          </p>
          <p className="text-xs opacity-90 mt-1">↗ 3.2% vs período anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">LTV Médio</h3>
          <p className="text-3xl font-bold mt-2">
            R$ {chartData.kpis.averageLtv.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs opacity-90 mt-1">↗ 5.7% vs período anterior</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Churn Rate</h3>
          <p className="text-3xl font-bold mt-2">
            {chartData.kpis.monthlyChurnRate.toFixed(1)}%
          </p>
          <p className="text-xs opacity-90 mt-1">↘ 1.3% vs período anterior</p>
        </div>
      </div>
      
      {/* Advanced Funnel Analysis */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Análise Avançada do Funil de Vendas" chartClassName="h-[600px]">
          <AdvancedFunnelChart data={chartData.funnel} />
        </ChartCard>
      </div>
      
      {/* Revenue and Profit Analysis */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Análise Avançada de Receita e Lucro" chartClassName="h-[600px]">
          <AdvancedRevenueAnalysisChart data={chartData.revenueExpense} />
        </ChartCard>
      </div>
      
      {/* Cohort Analysis */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Análise Avançada de Coortes" chartClassName="h-[600px]">
          <EnhancedCohortAnalysisChart data={chartData.cohort} />
        </ChartCard>
      </div>
      
      {/* Customer Segmentation */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Segmentação de Clientes por Valor (LTV)" chartClassName="h-[600px]">
          <CustomerSegmentationChart data={chartData.ltv} />
        </ChartCard>
      </div>
      
      {/* Team Performance Radar */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Radar de Performance da Equipe" chartClassName="h-[600px]">
          <AdvancedPerformanceRadarChart data={chartData.userPerformance} />
        </ChartCard>
      </div>
      
      {/* Insights Panel */}
      <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-brand-border">
        <h3 className="text-lg font-semibold text-text-main mb-4">Insights Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-blue-800 font-semibold">Oportunidade de Crescimento</h4>
            <p className="text-blue-600 text-sm mt-1">A taxa de conversão aumentou 3.2% este mês</p>
            <p className="text-blue-600 text-xs">Foco na etapa de qualificação pode aumentar ainda mais</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-green-800 font-semibold">Retenção Melhorada</h4>
            <p className="text-green-600 text-sm mt-1">Churn rate reduzido em 1.3%</p>
            <p className="text-green-600 text-xs">Programas de fidelização estão surtindo efeito</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="text-purple-800 font-semibold">Performance da Equipe</h4>
            <p className="text-purple-600 text-sm mt-1">Carlos Dias lidera o ranking de performance</p>
            <p className="text-purple-600 text-xs">Com 15% acima da média de produtividade</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsPage;
