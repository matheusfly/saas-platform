import React from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';
import UserPerformanceRadarChart from './charts/UserPerformanceRadarChart';
import WeeklyActivityHeatmap from './charts/WeeklyActivityHeatmap';
import SalesCycleBoxPlot from './charts/SalesCycleBoxPlot';

interface ProductivityPageProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    chartData: AllData;
}

const ProductivityPage: React.FC<ProductivityPageProps> = ({ filters, onFilterChange, chartData }) => {
  const { userPerformance, weeklyActivity, salesCycleBoxPlot } = chartData;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-text-main">Análise de Produtividade</h2>
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Radar de Performance por Usuário" chartClassName="h-96">
            <UserPerformanceRadarChart data={userPerformance} />
        </ChartCard>
        <ChartCard title="Heatmap de Atividades Semanais" chartClassName="h-96">
            <WeeklyActivityHeatmap data={weeklyActivity} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Ciclo de Venda por Usuário (Dias)" chartClassName="h-[450px]">
            <SalesCycleBoxPlot data={salesCycleBoxPlot} />
        </ChartCard>
      </div>
    </div>
  );
};

export default ProductivityPage;
