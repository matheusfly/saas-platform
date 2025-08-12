import React, { useState } from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import ProductivityStoryTimeline from './charts-2/ProductivityStoryTimeline';
import ConsultantPerformanceJourney from './charts-2/ConsultantPerformanceJourney';
import ActivityFlowChart from './charts-2/ActivityFlowChart';
import ProductivityMilestoneCalendar from './charts-2/ProductivityMilestoneCalendar';
import TeamCollaborationNetwork from './charts-2/TeamCollaborationNetwork';
import { FilterState, NetworkNode, NetworkLink } from '../types';
import type { AllData } from '../services/dataService';

interface ProductivityStorytellingDashboardProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  chartData: AllData;
}

const ProductivityStorytellingDashboard: React.FC<ProductivityStorytellingDashboardProps> = ({ 
  filters, 
  onFilterChange, 
  chartData 
}) => {
  const [activeView, setActiveView] = useState<'timeline' | 'journey' | 'flow' | 'calendar' | 'network'>('timeline');
  const [selectedConsultant, setSelectedConsultant] = useState('all');

  // Mock data for productivity story timeline
  const productivityStoryData = [
    { date: '01/06', productivity: 65, tasksCompleted: 8, hoursWorked: 6, efficiency: 72, benchmark: 70, storyPoint: '', storyHighlight: false },
    { date: '02/06', productivity: 72, tasksCompleted: 10, hoursWorked: 7, efficiency: 78, benchmark: 70, storyPoint: '', storyHighlight: false },
    { date: '03/06', productivity: 85, tasksCompleted: 14, hoursWorked: 8, efficiency: 88, benchmark: 70, storyPoint: 'Recorde de produtividade', storyHighlight: true },
    { date: '04/06', productivity: 78, tasksCompleted: 12, hoursWorked: 7, efficiency: 82, benchmark: 70, storyPoint: '', storyHighlight: false },
    { date: '05/06', productivity: 68, tasksCompleted: 9, hoursWorked: 6, efficiency: 75, benchmark: 70, storyPoint: '', storyHighlight: false },
    { date: '06/06', productivity: 92, tasksCompleted: 18, hoursWorked: 9, efficiency: 95, benchmark: 70, storyPoint: 'Implementação de nova estratégia', storyHighlight: true },
    { date: '07/06', productivity: 88, tasksCompleted: 16, hoursWorked: 8, efficiency: 90, benchmark: 70, storyPoint: '', storyHighlight: false },
    { date: '08/06', productivity: 75, tasksCompleted: 11, hoursWorked: 7, efficiency: 80, benchmark: 70, storyPoint: '', storyHighlight: false },
    { date: '09/06', productivity: 82, tasksCompleted: 13, hoursWorked: 8, efficiency: 85, benchmark: 70, storyPoint: '', storyHighlight: false },
    { date: '10/06', productivity: 95, tasksCompleted: 20, hoursWorked: 9, efficiency: 98, benchmark: 70, storyPoint: 'Melhor dia do mês', storyHighlight: true },
    { date: '11/06', productivity: 80, tasksCompleted: 12, hoursWorked: 7, efficiency: 83, benchmark: 70, storyPoint: '', storyHighlight: false },
    { date: '12/06', productivity: 77, tasksCompleted: 11, hoursWorked: 7, efficiency: 81, benchmark: 70, storyPoint: '', storyHighlight: false },
    { date: '13/06', productivity: 89, tasksCompleted: 17, hoursWorked: 8, efficiency: 92, benchmark: 70, storyPoint: '', storyHighlight: false },
    { date: '14/06', productivity: 91, tasksCompleted: 19, hoursWorked: 9, efficiency: 96, benchmark: 70, storyPoint: 'Treinamento concluído', storyHighlight: true },
  ];

  // Mock data for consultant journey
  const consultantJourneyData = [
    { date: 'Jan', consultant: 'Carlos Dias', productivity: 65, tasks: 45, efficiency: 70, growth: 0 },
    { date: 'Fev', consultant: 'Carlos Dias', productivity: 70, tasks: 52, efficiency: 75, growth: 7.7 },
    { date: 'Mar', consultant: 'Carlos Dias', productivity: 78, tasks: 65, efficiency: 82, growth: 11.4 },
    { date: 'Abr', consultant: 'Carlos Dias', productivity: 85, tasks: 78, efficiency: 88, growth: 9.0 },
    { date: 'Mai', consultant: 'Carlos Dias', productivity: 82, tasks: 72, efficiency: 85, growth: -3.5 },
    { date: 'Jun', consultant: 'Carlos Dias', productivity: 91, tasks: 89, efficiency: 94, growth: 11.0 },
  ];

  // Mock data for activity flow chart
  const flowData = [
    { stage: 'Novos Leads', value: 1000, percentage: 100 },
    { stage: 'Leads Qualificados', value: 700, percentage: 70 },
    { stage: 'Propostas Enviadas', value: 500, percentage: 50 },
    { stage: 'Em Negociação', value: 300, percentage: 30 },
    { stage: 'Contratos Fechados', value: 250, percentage: 25 },
  ];

  // Mock data for productivity calendar
  const calendarData = [
    { date: '2024-06-01', day: 1, productivity: 65, milestone: null, isWeekend: false },
    { date: '2024-06-02', day: 2, productivity: 0, milestone: null, isWeekend: true },
    { date: '2024-06-03', day: 3, productivity: 72, milestone: null, isWeekend: false },
    { date: '2024-06-04', day: 4, productivity: 85, milestone: 'Recorde de produtividade', isWeekend: false },
    { date: '2024-06-05', day: 5, productivity: 78, milestone: null, isWeekend: false },
    { date: '2024-06-06', day: 6, productivity: 68, milestone: null, isWeekend: false },
    { date: '2024-06-07', day: 7, productivity: 0, milestone: null, isWeekend: true },
    { date: '2024-06-08', day: 8, productivity: 92, milestone: 'Implementação de nova estratégia', isWeekend: false },
    { date: '2024-06-09', day: 9, productivity: 88, milestone: null, isWeekend: false },
    { date: '2024-06-10', day: 10, productivity: 75, milestone: null, isWeekend: false },
    { date: '2024-06-11', day: 11, productivity: 82, milestone: null, isWeekend: false },
    { date: '2024-06-12', day: 12, productivity: 95, milestone: 'Melhor dia do mês', isWeekend: false },
    { date: '2024-06-13', day: 13, productivity: 80, milestone: null, isWeekend: false },
    { date: '2024-06-14', day: 14, productivity: 77, milestone: null, isWeekend: false },
  ];

  // Mock data for team collaboration network
  const networkNodes: NetworkNode[] = [
    { id: 'carlos', name: 'Carlos Dias', group: 'sales', size: 15, productivity: 91 },
    { id: 'ana', name: 'Ana Silva', group: 'sales', size: 12, productivity: 85 },
    { id: 'bruno', name: 'Bruno Costa', group: 'marketing', size: 10, productivity: 78 },
    { id: 'diana', name: 'Diana Lima', group: 'support', size: 8, productivity: 82 },
    { id: 'eduardo', name: 'Eduardo Rocha', group: 'management', size: 14, productivity: 88 },
    { id: 'fernanda', name: 'Fernanda Alves', group: 'sales', size: 9, productivity: 75 },
  ];

  const networkLinks: NetworkLink[] = [
    { source: 'carlos', target: 'ana', value: 5, type: 'collaboration' },
    { source: 'carlos', target: 'eduardo', value: 3, type: 'coordination' },
    { source: 'ana', target: 'bruno', value: 4, type: 'collaboration' },
    { source: 'bruno', target: 'diana', value: 6, type: 'collaboration' },
    { source: 'eduardo', target: 'carlos', value: 2, type: 'mentorship' },
    { source: 'eduardo', target: 'ana', value: 2, type: 'mentorship' },
    { source: 'diana', target: 'carlos', value: 3, type: 'coordination' },
    { source: 'fernanda', target: 'carlos', value: 4, type: 'collaboration' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-text-main">Narrativa de Produtividade</h2>
        
        {/* View Controls */}
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'timeline' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveView('timeline')}
          >
            Linha do Tempo
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'journey' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveView('journey')}
          >
            Jornada do Consultor
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'flow' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveView('flow')}
          >
            Fluxo de Atividades
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'calendar' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveView('calendar')}
          >
            Calendário
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'network' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveView('network')}
          >
            Rede de Colaboração
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      {/* Consultant Selector for Journey View */}
      {activeView === 'journey' && (
        <div className="bg-surface-card p-4 rounded-lg border border-brand-border">
          <label className="block text-text-main text-sm font-medium mb-2">
            Selecionar Consultor:
          </label>
          <select 
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent-primary focus:border-accent-primary"
            value={selectedConsultant}
            onChange={(e) => setSelectedConsultant(e.target.value)}
          >
            <option value="all">Todos os Consultores</option>
            <option value="carlos">Carlos Dias</option>
            <option value="ana">Ana Silva</option>
            <option value="bruno">Bruno Costa</option>
            <option value="diana">Diana Lima</option>
            <option value="eduardo">Eduardo Rocha</option>
            <option value="fernanda">Fernanda Alves</option>
          </select>
        </div>
      )}
      
      {/* Main Chart Area */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard 
          title={
            activeView === 'timeline' ? 'Linha do Tempo de Produtividade' :
            activeView === 'journey' ? 'Jornada de Desempenho do Consultor' :
            activeView === 'flow' ? 'Fluxo de Atividades' :
            activeView === 'calendar' ? 'Calendário de Marcos Alcançados' :
            'Rede de Colaboração da Equipe'
          } 
          chartClassName="h-[600px]"
        >
          {activeView === 'timeline' && (
            <ProductivityStoryTimeline data={productivityStoryData} />
          )}
          {activeView === 'journey' && (
            <ConsultantPerformanceJourney 
              data={consultantJourneyData} 
              consultantName="Carlos Dias" 
            />
          )}
          {activeView === 'flow' && (
            <ActivityFlowChart 
              data={flowData} 
            />
          )}
          {activeView === 'calendar' && (
            <ProductivityMilestoneCalendar data={calendarData} />
          )}
          {activeView === 'network' && (
            <TeamCollaborationNetwork 
              nodes={networkNodes} 
              links={networkLinks} 
            />
          )}
        </ChartCard>
      </div>
      
      {/* Story Insights */}
      <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-brand-border">
        <h3 className="text-lg font-semibold text-text-main mb-4">Insights da Narrativa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <h4 className="text-blue-800 font-semibold">Padrão de Crescimento</h4>
            <p className="text-blue-600 text-sm mt-1">Produtividade aumentou 40% no último mês</p>
            <p className="text-blue-600 text-xs">Impulsionada por estratégias implementadas em junho</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <h4 className="text-green-800 font-semibold">Colaboração Efetiva</h4>
            <p className="text-green-600 text-sm mt-1">85% dos marcos foram alcançados em equipe</p>
            <p className="text-green-600 text-xs">Trabalho colaborativo gera melhores resultados</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <h4 className="text-purple-800 font-semibold">Oportunidade de Melhoria</h4>
            <p className="text-purple-600 text-sm mt-1">Segundas-feiras mostram produtividade 15% menor</p>
            <p className="text-purple-600 text-xs">Planejar atividades estratégicas para outras datas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityStorytellingDashboard;