import React from 'react';
import FilterControls from './FilterControls';
import KeyMetricCard from './KeyMetricCard';
import ChartCard from './ChartCard';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';
import FunnelDropOffChart from './charts/FunnelDropOffChart';
import CohortAnalysisChart from './charts/CohortAnalysisChart';

interface StrategicPageProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    chartData: AllData;
}

const StrategicPage: React.FC<StrategicPageProps> = ({ filters, onFilterChange, chartData }) => {
  const { kpis, funnelDropOff, cohort } = chartData;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-text-main">Análise Estratégica</h2>
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      {/* Strategic KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <KeyMetricCard title="LTV" value={`R$ ${kpis.averageLtv.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} description="Valor Médio do Cliente" />
        <KeyMetricCard title="CAC" value={`R$ ${kpis.cac.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} description="Custo de Aquisição por Cliente" />
        <KeyMetricCard title="Ticket Médio" value={`R$ ${kpis.averageTicket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} description="Valor Médio por Venda" />
        <KeyMetricCard title="ROI" value={`${kpis.roi.toFixed(2)}x`} description="Retorno Sobre Investimento" />
      </div>

      {/* Funnel and Cohort Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
            <ChartCard title="Queda de Leads por Estágio" chartClassName="h-[450px]">
                <FunnelDropOffChart data={funnelDropOff} />
            </ChartCard>
        </div>
        <div className="lg:col-span-3">
            <ChartCard title="Análise de Coorte (Retenção Mensal)" chartClassName="h-[450px]">
                <CohortAnalysisChart data={cohort} />
            </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default StrategicPage;
