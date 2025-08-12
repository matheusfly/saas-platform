import React from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import EnhancedSalesFunnel from './charts/EnhancedSalesFunnel';
import FunnelConversionAnalysis from './charts/FunnelConversionAnalysis';
import SalesCycleAnalysis from './charts/SalesCycleAnalysis';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';

interface SalesFunnelAnalysisPageProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  chartData: AllData;
}

const SalesFunnelAnalysisPage: React.FC<SalesFunnelAnalysisPageProps> = ({ 
  filters, 
  onFilterChange, 
  chartData 
}) => {
  // Mock data for enhanced sales funnel
  const enhancedFunnelData = [
    { stage: 'Prospect', value: 500, percentage: 100, color: '#8884d8' },
    { stage: 'Qualificação', value: 350, percentage: 70, color: '#82ca9d' },
    { stage: 'Proposta', value: 200, percentage: 40, color: '#ffc658' },
    { stage: 'Negociação', value: 120, percentage: 24, color: '#ff7300' },
    { stage: 'Ganho', value: 80, percentage: 16, color: '#0088fe' },
  ];

  // Mock data for funnel conversion analysis
  const conversionData = [
    { stage: 'Prospect → Qualificação', leads: 500, conversions: 350, conversionRate: 70, dropOff: 150 },
    { stage: 'Qualificação → Proposta', leads: 350, conversions: 200, conversionRate: 57.1, dropOff: 150 },
    { stage: 'Proposta → Negociação', leads: 200, conversions: 120, conversionRate: 60, dropOff: 80 },
    { stage: 'Negociação → Ganho', leads: 120, conversions: 80, conversionRate: 66.7, dropOff: 40 },
  ];

  // Mock data for sales cycle analysis
  const salesCycleData = [
    { consultant: 'Ana Silva', avgCycleDays: 25, minCycleDays: 15, maxCycleDays: 45, dealsClosed: 15 },
    { consultant: 'Bruno Costa', avgCycleDays: 32, minCycleDays: 18, maxCycleDays: 55, dealsClosed: 12 },
    { consultant: 'Carlos Dias', avgCycleDays: 28, minCycleDays: 12, maxCycleDays: 50, dealsClosed: 18 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-main">Análise de Funil de Vendas</h2>
      </div>
      
      {/* Filters */}
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      {/* Enhanced Sales Funnel */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Funil de Vendas Avançado" chartClassName="h-[500px]">
          <EnhancedSalesFunnel data={enhancedFunnelData} />
        </ChartCard>
      </div>
      
      {/* Funnel Conversion Analysis */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Análise de Conversão por Estágio" chartClassName="h-[450px]">
          <FunnelConversionAnalysis data={conversionData} />
        </ChartCard>
      </div>
      
      {/* Sales Cycle Analysis */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Análise de Ciclo de Vendas por Consultor" chartClassName="h-[450px]">
          <SalesCycleAnalysis data={salesCycleData} />
        </ChartCard>
      </div>
      
      {/* Funnel Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-main mb-4">Métricas do Funil</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Taxa de Conversão Geral</p>
              <p className="text-2xl font-bold text-text-main">16%</p>
              <p className="text-green-500 text-sm">↗ 2.1% vs mês anterior</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Leads no Funil</p>
              <p className="text-2xl font-bold text-text-main">500</p>
              <p className="text-green-500 text-sm">↗ 8.7% vs mês anterior</p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-main mb-4">Performance por Estágio</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Melhor Estágio</p>
              <p className="text-2xl font-bold text-text-main">Negociação → Ganho</p>
              <p className="text-green-500 text-sm">66.7% de conversão</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Pior Estágio</p>
              <p className="text-2xl font-bold text-text-main">Prospect → Qualificação</p>
              <p className="text-red-500 text-sm">30% de perda</p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-main mb-4">Eficiência de Vendas</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Ciclo Médio de Vendas</p>
              <p className="text-2xl font-bold text-text-main">28 dias</p>
              <p className="text-red-500 text-sm">↘ 3.4% vs mês anterior</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Negócios Fechados</p>
              <p className="text-2xl font-bold text-text-main">45</p>
              <p className="text-green-500 text-sm">↗ 12.5% vs mês anterior</p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-main mb-4">Oportunidades</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Oportunidades Abertas</p>
              <p className="text-2xl font-bold text-text-main">320</p>
              <p className="text-blue-500 text-sm">→ 0.0% vs mês anterior</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Valor em Oportunidades</p>
              <p className="text-2xl font-bold text-text-main">R$ 128K</p>
              <p className="text-green-500 text-sm">↗ 5.3% vs mês anterior</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesFunnelAnalysisPage;