import React from 'react';
import FilterControls from './FilterControls';
import KeyMetricCard from './KeyMetricCard';
import ChartCard from './ChartCard';
import CashFlowChart from './charts/CashFlowChart';
import RecurrenceChart from './charts/RecurrenceChart';
import RevenueExpenseChart from './charts/RevenueExpenseChart';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';

interface FinancialPageProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    chartData: AllData;
}

const FinancialPage: React.FC<FinancialPageProps> = ({ filters, onFilterChange, chartData }) => {
  const { kpis, cashFlow, recurrence, revenueExpense } = chartData;

  return (
    <div className="space-y-6">
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      {/* Financial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <KeyMetricCard title="Receita Total" value={`R$ ${kpis.totalRevenue.toLocaleString('pt-BR')}`} description="Entradas no período" />
        <KeyMetricCard title="Despesas Totais" value={`R$ ${kpis.totalExpenses.toLocaleString('pt-BR')}`} description="Saídas no período" />
        <KeyMetricCard title="Resultado Líquido" value={`R$ ${kpis.netRevenue.toLocaleString('pt-BR')}`} description="Receita - Despesas" />
        <KeyMetricCard title="Sucesso de Pagamentos" value={`${kpis.paymentSuccessRate.toFixed(1)}%`} description="Taxa de pagamentos bem-sucedidos" />
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Receitas vs. Despesas" chartClassName="h-96">
            <RevenueExpenseChart data={revenueExpense} />
        </ChartCard>
      </div>

      {/* Cash Flow and Recurrence Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Fluxo de Caixa Mensal (Entradas)">
            <CashFlowChart data={cashFlow} />
          </ChartCard>
          <ChartCard title="Recorrência de Pagamentos">
            <RecurrenceChart data={recurrence} />
          </ChartCard>
      </div>
    </div>
  );
};

export default FinancialPage;
