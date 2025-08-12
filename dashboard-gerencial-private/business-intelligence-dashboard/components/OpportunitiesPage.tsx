import React from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';
import OpenOppsByStageChart from './charts/OpenOppsByStageChart';
import NewLostWonChart from './charts/NewLostWonChart';
import TimeSinceUpdateChart from './charts/TimeSinceUpdateChart';
import OppsByOriginChart from './charts/OppsByOriginChart';

interface OpportunitiesPageProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    chartData: AllData;
}

const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({ filters, onFilterChange, chartData }) => {
  const { openOppsByStage, leadEvolution, oppsTimeSinceUpdate, oppsByOrigin } = chartData;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-text-main">Oportunidades Gerais</h2>
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Oportunidades em Aberto por Estágio" chartClassName="h-96">
            <OpenOppsByStageChart data={openOppsByStage} />
        </ChartCard>
        <ChartCard title="Novos vs. Ganhos vs. Perdidos" chartClassName="h-96">
            <NewLostWonChart data={leadEvolution} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tempo Sem Atualização (Oportunidades Abertas)" chartClassName="h-96">
            <TimeSinceUpdateChart data={oppsTimeSinceUpdate} />
        </ChartCard>
        <ChartCard title="Valor das Oportunidades por Origem" chartClassName="h-96">
            <OppsByOriginChart data={oppsByOrigin} />
        </ChartCard>
      </div>
    </div>
  );
};

export default OpportunitiesPage;
