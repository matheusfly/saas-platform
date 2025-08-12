import React from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import ProductivityHeatmap from './charts/ProductivityHeatmap';
import ActivityTypeDistribution from './charts/ActivityTypeDistribution';
import ConsultantPerformanceRadar from './charts/ConsultantPerformanceRadar';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';

interface ProductivityAnalysisPageProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  chartData: AllData;
}

const ProductivityAnalysisPage: React.FC<ProductivityAnalysisPageProps> = ({ 
  filters, 
  onFilterChange, 
  chartData 
}) => {
  // Mock data for productivity heatmap
  const productivityData = [
    { day: 'Seg', hour: 8, value: 75 },
    { day: 'Seg', hour: 9, value: 82 },
    { day: 'Seg', hour: 10, value: 88 },
    { day: 'Seg', hour: 11, value: 78 },
    { day: 'Seg', hour: 12, value: 65 },
    { day: 'Seg', hour: 13, value: 60 },
    { day: 'Seg', hour: 14, value: 70 },
    { day: 'Seg', hour: 15, value: 85 },
    { day: 'Seg', hour: 16, value: 90 },
    { day: 'Seg', hour: 17, value: 75 },
    { day: 'Seg', hour: 18, value: 60 },
    
    { day: 'Ter', hour: 8, value: 80 },
    { day: 'Ter', hour: 9, value: 85 },
    { day: 'Ter', hour: 10, value: 90 },
    { day: 'Ter', hour: 11, value: 82 },
    { day: 'Ter', hour: 12, value: 70 },
    { day: 'Ter', hour: 13, value: 65 },
    { day: 'Ter', hour: 14, value: 75 },
    { day: 'Ter', hour: 15, value: 88 },
    { day: 'Ter', hour: 16, value: 92 },
    { day: 'Ter', hour: 17, value: 80 },
    { day: 'Ter', hour: 18, value: 65 },
    
    { day: 'Qua', hour: 8, value: 70 },
    { day: 'Qua', hour: 9, value: 78 },
    { day: 'Qua', hour: 10, value: 85 },
    { day: 'Qua', hour: 11, value: 75 },
    { day: 'Qua', hour: 12, value: 60 },
    { day: 'Qua', hour: 13, value: 55 },
    { day: 'Qua', hour: 14, value: 65 },
    { day: 'Qua', hour: 15, value: 80 },
    { day: 'Qua', hour: 16, value: 85 },
    { day: 'Qua', hour: 17, value: 70 },
    { day: 'Qua', hour: 18, value: 55 },
    
    { day: 'Qui', hour: 8, value: 78 },
    { day: 'Qui', hour: 9, value: 85 },
    { day: 'Qui', hour: 10, value: 92 },
    { day: 'Qui', hour: 11, value: 80 },
    { day: 'Qui', hour: 12, value: 68 },
    { day: 'Qui', hour: 13, value: 62 },
    { day: 'Qui', hour: 14, value: 72 },
    { day: 'Qui', hour: 15, value: 87 },
    { day: 'Qui', hour: 16, value: 90 },
    { day: 'Qui', hour: 17, value: 78 },
    { day: 'Qui', hour: 18, value: 63 },
    
    { day: 'Sex', hour: 8, value: 82 },
    { day: 'Sex', hour: 9, value: 88 },
    { day: 'Sex', hour: 10, value: 90 },
    { day: 'Sex', hour: 11, value: 85 },
    { day: 'Sex', hour: 12, value: 72 },
    { day: 'Sex', hour: 13, value: 68 },
    { day: 'Sex', hour: 14, value: 75 },
    { day: 'Sex', hour: 15, value: 85 },
    { day: 'Sex', hour: 16, value: 88 },
    { day: 'Sex', hour: 17, value: 80 },
    { day: 'Sex', hour: 18, value: 65 },
    
    { day: 'Sáb', hour: 8, value: 90 },
    { day: 'Sáb', hour: 9, value: 95 },
    { day: 'Sáb', hour: 10, value: 88 },
    { day: 'Sáb', hour: 11, value: 82 },
    { day: 'Sáb', hour: 12, value: 75 },
    { day: 'Sáb', hour: 13, value: 70 },
    { day: 'Sáb', hour: 14, value: 78 },
    { day: 'Sáb', hour: 15, value: 85 },
    { day: 'Sáb', hour: 16, value: 80 },
    { day: 'Sáb', hour: 17, value: 72 },
    { day: 'Sáb', hour: 18, value: 65 },
  ];

  // Mock data for activity type distribution
  const activityData = [
    { name: 'Email', value: 120, percentage: 30, color: '#8884d8' },
    { name: 'Ligações', value: 95, percentage: 23.75, color: '#82ca9d' },
    { name: 'Reuniões', value: 80, percentage: 20, color: '#ffc658' },
    { name: 'Tarefas', value: 65, percentage: 16.25, color: '#ff7300' },
    { name: 'Visitas', value: 40, percentage: 10, color: '#0088fe' },
  ];

  // Mock data for consultant performance radar
  const consultantMetrics = [
    { subject: 'Leads', 'Ana Silva': 90, 'Bruno Costa': 75, 'Carlos Dias': 85 },
    { subject: 'Atividades', 'Ana Silva': 85, 'Bruno Costa': 90, 'Carlos Dias': 75 },
    { subject: 'Ganhos', 'Ana Silva': 80, 'Bruno Costa': 85, 'Carlos Dias': 90 },
    { subject: 'Perdas', 'Ana Silva': 70, 'Bruno Costa': 75, 'Carlos Dias': 65 },
    { subject: 'Produtividade', 'Ana Silva': 85, 'Bruno Costa': 80, 'Carlos Dias': 88 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-main">Análise de Produtividade</h2>
      </div>
      
      {/* Filters */}
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      {/* Productivity Heatmap */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Mapa de Calor de Produtividade" chartClassName="h-[500px]">
          <ProductivityHeatmap data={productivityData} />
        </ChartCard>
      </div>
      
      {/* Activity Distribution and Consultant Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribuição de Tipos de Atividade" chartClassName="h-[400px]">
          <ActivityTypeDistribution data={activityData} title="Atividades" />
        </ChartCard>
        
        <ChartCard title="Performance de Consultores" chartClassName="h-[400px]">
          <ConsultantPerformanceRadar data={consultantMetrics} />
        </ChartCard>
      </div>
      
      {/* Productivity Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-main mb-4">Métricas de Atividade</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Total de Atividades</p>
              <p className="text-2xl font-bold text-text-main">400</p>
              <p className="text-green-500 text-sm">↗ 12.5% vs mês anterior</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Atividades por Dia</p>
              <p className="text-2xl font-bold text-text-main">13.3</p>
              <p className="text-green-500 text-sm">↗ 3.8% vs mês anterior</p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-main mb-4">Eficiência de Consultores</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Melhor Consultor</p>
              <p className="text-2xl font-bold text-text-main">Carlos Dias</p>
              <p className="text-green-500 text-sm">90% de produtividade</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Média de Produtividade</p>
              <p className="text-2xl font-bold text-text-main">82%</p>
              <p className="text-green-500 text-sm">↗ 4.2% vs mês anterior</p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-main mb-4">Engajamento</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Taxa de Resposta</p>
              <p className="text-2xl font-bold text-text-main">78%</p>
              <p className="text-green-500 text-sm">↗ 5.4% vs mês anterior</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Tempo Médio de Resposta</p>
              <p className="text-2xl font-bold text-text-main">2.3h</p>
              <p className="text-red-500 text-sm">↘ 8.0% vs mês anterior</p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-main mb-4">Resultados</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Negócios Fechados</p>
              <p className="text-2xl font-bold text-text-main">45</p>
              <p className="text-green-500 text-sm">↗ 15.4% vs mês anterior</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Valor Total</p>
              <p className="text-2xl font-bold text-text-main">R$ 128K</p>
              <p className="text-green-500 text-sm">↗ 12.8% vs mês anterior</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityAnalysisPage;