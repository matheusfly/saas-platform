import React from 'react';
import ClientRetentionHeatmap from './charts/SimpleClientRetentionHeatmap';
import ProductPerformanceRadar from './charts/ProductPerformanceRadar';
import ConsultantPerformanceRanking from './charts/ConsultantPerformanceRanking';
import ClientLifetimeValueCard from './ClientLifetimeValueCard';
import ChartCard from './ChartCard';
import type { AllData } from '../services/dataService';
import { FilterState } from '../types';

interface StrategicInsightsPageProps {
  data: AllData;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
}

const StrategicInsightsPage: React.FC<StrategicInsightsPageProps> = ({ data, filters, onFilterChange }) => {
  // Mock data for ProductPerformanceRadar and ConsultantPerformanceRanking
  // In a real application, this would come from dataService.ts
  const mockProductPerformanceData = [
    { subject: 'Receita', 'Produto A': 90, 'Produto B': 85, 'Produto C': 70 },
    { subject: 'Unidades Vendidas', 'Produto A': 80, 'Produto B': 95, 'Produto C': 75 },
    { subject: 'Preço Médio', 'Produto A': 70, 'Produto B': 60, 'Produto C': 90 },
    { subject: 'Transações', 'Produto A': 85, 'Produto B': 70, 'Produto C': 80 },
    { subject: 'Clientes', 'Produto A': 95, 'Produto B': 80, 'Produto C': 65 },
  ];
  const mockProductKeys = ['Produto A', 'Produto B', 'Produto C'];

  const mockConsultantPerformanceData = [
    { 
      user: 'Ana Silva', 
      revenue: 120000,
      transactionCount: 45,
      clientCount: 38,
      avgClientValue: 3158,
      trialConversionRate: 24.5
    },
    { 
      user: 'Bruno Costa', 
      revenue: 105000,
      transactionCount: 42,
      clientCount: 35,
      avgClientValue: 3000,
      trialConversionRate: 22.3
    },
    { 
      user: 'Carlos Dias', 
      revenue: 98000,
      transactionCount: 38,
      clientCount: 32,
      avgClientValue: 3063,
      trialConversionRate: 26.8
    },
    { 
      user: 'Daniela Lima', 
      revenue: 85000,
      transactionCount: 35,
      clientCount: 28,
      avgClientValue: 3036,
      trialConversionRate: 19.7
    },
    { 
      user: 'Eduardo Pires', 
      revenue: 70000,
      transactionCount: 30,
      clientCount: 25,
      avgClientValue: 2800,
      trialConversionRate: 18.2
    },
  ];

  return (
    <div className="p-6 bg-background-light min-h-screen">
      <h1 className="text-3xl font-bold text-text-main mb-6">Insights Estratégicos</h1>

      {/* Filter Controls */}
      <div className="mb-6">
        <label htmlFor="dateRange" className="block text-sm font-medium text-text-muted mb-1">Período:</label>
        <select
          id="dateRange"
          value={filters.dateRange}
          onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value as FilterState['dateRange'] })}
          className="mt-1 block w-full md:w-1/4 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
        >
          <option value="1m">Último Mês</option>
          <option value="3m">Últimos 3 Meses</option>
          <option value="6m">Últimos 6 Meses</option>
          <option value="all">Todo Período</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ClientLifetimeValueCard 
          title="LTV Médio"
          value={data.kpis.averageLtv}
          unit="R$"
          description="Valor médio de vida do cliente"
          trend="up"
        />
        <ClientLifetimeValueCard 
          title="Novos Clientes"
          value={data.kpis.newClientCount}
          description="Clientes adquiridos no período"
          trend="up"
        />
        <ClientLifetimeValueCard 
          title="Taxa de Conversão"
          value={data.kpis.conversionRate}
          unit="%"
          description="Oportunidades convertidas em vendas"
          trend="up"
        />
        <ClientLifetimeValueCard 
          title="Receita Total"
          value={data.kpis.totalRevenue}
          unit="R$"
          description="Receita bruta gerada no período"
          trend="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Retenção de Clientes por Coorte">
          <ClientRetentionHeatmap data={data.cohort} />
        </ChartCard>
        <ChartCard title="Performance de Produtos (Exemplo)">
          <ProductPerformanceRadar data={mockProductPerformanceData} keys={mockProductKeys} />
        </ChartCard>
        <ChartCard title="Ranking de Performance de Consultores">
          <ConsultantPerformanceRanking data={mockConsultantPerformanceData} />
        </ChartCard>
        {/* Add more strategic charts here */}
      </div>
    </div>
  );
};

export default StrategicInsightsPage;
