import React from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';
import D3HorizontalFunnelChart from './charts/D3HorizontalFunnelChart';

interface ConversionsPageProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    chartData: AllData;
}

const ConversionsPage: React.FC<ConversionsPageProps> = ({ filters, onFilterChange, chartData }) => {
  const { stageEntry } = chartData;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-text-main">Conversões por Estágio</h2>
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Funil de Conversão por Estágio (Entradas)" chartClassName="h-[450px]">
            <D3HorizontalFunnelChart data={stageEntry} />
        </ChartCard>
      </div>
       {/* Future charts for this page can be added here */}
    </div>
  );
};

export default ConversionsPage;
