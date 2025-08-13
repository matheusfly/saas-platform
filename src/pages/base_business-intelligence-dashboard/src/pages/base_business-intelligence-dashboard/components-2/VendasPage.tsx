import React from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';
import SalesRankingChart from './charts/SalesRankingChart';
import RevenueByOriginChart from './charts/RevenueByOriginChart';
import ActivitiesByTypeChart from './charts/ActivitiesByTypeChart';

interface VendasPageProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    chartData: AllData;
}

const VendasPage: React.FC<VendasPageProps> = ({ filters, onFilterChange, chartData }) => {
  const { salesRanking, revenueByOrigin, activitiesByType } = chartData;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-text-main">Análise de Vendas</h2>
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Ranking de Vendas por Usuário" chartClassName="h-96">
            <SalesRankingChart data={salesRanking} />
        </ChartCard>
         <ChartCard title="Distribuição de Atividades por Tipo" chartClassName="h-96">
            <ActivitiesByTypeChart data={activitiesByType} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Receita Real por Origem" chartClassName="h-[450px]">
            <RevenueByOriginChart data={revenueByOrigin} />
        </ChartCard>
      </div>
    </div>
  );
};

export default VendasPage;
