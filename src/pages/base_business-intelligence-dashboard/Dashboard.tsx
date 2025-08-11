import React from 'react';
import ChartCard from './ChartCard';
import InsightsPanel from './InsightsPanel';
import FilterControls from './FilterControls';
import BusinessAssistant from './BusinessAssistant';
import KeyMetricCard from './KeyMetricCard';
import ConversionFunnelChart from './charts/ConversionFunnelChart';
import LeadEvolutionChart from './charts/LeadEvolutionChart';
import LtvPermanenceChart from './charts/LtvPermanenceChart';
import CheckInChart from './charts/CheckInChart';
import ClientLifetimeValueCard from './ClientLifetimeValueCard';
import ClientRetentionHeatmap from './charts/SimpleClientRetentionHeatmap';
import type { AllData } from '../services/dataService';
import { FilterState } from '../types';

interface DashboardProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    chartData: AllData;
}

const Dashboard: React.FC<DashboardProps> = ({ filters, onFilterChange, chartData }) => {
  const {
    kpis: {
      averageLtv,
      newClientCount,
      conversionRate,
      totalRevenue,
      averageClientLifespan,
      monthlyChurnRate,
      dataQualityScore,
      roi
    },
    funnel,
    leadEvolution,
    checkIn,
    ltv,
    cohort
  } = chartData;
  
  return (
    <div className="space-y-6">
      {/* Top Row: AI and KPI Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <InsightsPanel chartData={chartData} />
        <BusinessAssistant data={chartData} />
      </div>

      {/* Filters */}
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      {/* Second Row: High-Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ClientLifetimeValueCard 
          title="LTV Médio"
          value={averageLtv}
          unit="R$"
          description="Valor médio de vida do cliente"
          trend="up"
        />
        <ClientLifetimeValueCard 
          title="Novos Clientes"
          value={newClientCount}
          description="Clientes adquiridos no período"
          trend="up"
        />
        <ClientLifetimeValueCard 
          title="Taxa de Conversão"
          value={conversionRate}
          unit="%"
          description="Oportunidades convertidas em vendas"
          trend="up"
        />
        <ClientLifetimeValueCard 
          title="Receita Total"
          value={totalRevenue}
          unit="R$"
          description="Receita bruta gerada no período"
          trend="up"
        />
      </div>
      
      {/* Third Row: Strategic KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ClientLifetimeValueCard 
          title="Vida Média do Cliente"
          value={averageClientLifespan}
          unit="dias"
          description="Tempo médio de permanência dos clientes"
          trend="up"
        />
        <ClientLifetimeValueCard 
          title="Taxa de Churn"
          value={monthlyChurnRate}
          unit="%"
          description="Clientes que cancelaram por mês"
          trend="down"
        />
        <ClientLifetimeValueCard 
          title="Qualidade dos Dados"
          value={dataQualityScore}
          unit="%"
          description="Integridade dos dados do sistema"
          trend="up"
        />
        <ClientLifetimeValueCard 
          title="ROI"
          value={roi}
          unit="x"
          description="Retorno sobre investimento"
          trend="up"
        />
      </div>

      {/* Third Row: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Funil de Conversão" chartClassName="h-[450px]">
            <ConversionFunnelChart data={funnel} />
          </ChartCard>
        </div>
        <div className="lg:row-span-2">
          <ChartCard title="Evolução de Leads" chartClassName="h-full">
            <LeadEvolutionChart data={leadEvolution} />
          </ChartCard>
        </div>
      </div>

      {/* Fourth Row: Additional Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Check-in de Clientes" chartClassName="h-[400px]">
          <CheckInChart data={checkIn} />
        </ChartCard>
        <ChartCard title="LTV x Tempo de Permanência" chartClassName="h-[400px]">
          <LtvPermanenceChart data={ltv} />
        </ChartCard>
      </div>

      {/* Fifth Row: Heatmap */}
      <div className="grid grid-cols-1">
        <ChartCard title="Retenção de Clientes" chartClassName="h-[400px]">
          <ClientRetentionHeatmap data={cohort} />
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
