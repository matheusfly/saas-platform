import React from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import RevenueTrendAnalysis from './charts-2/RevenueTrendAnalysis';
import ClientLTVHistogram from './charts-2/ClientLTVHistogram';
import PaymentMethodPerformance from './charts-2/PaymentMethodPerformance';
import SeasonalityAnalysis from './charts-2/SeasonalityAnalysis';
import ChurnRateDashboard from './charts-2/ChurnRateDashboard';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';

interface AdvancedFinancialPageProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  chartData: AllData;
}

const AdvancedFinancialPage: React.FC<AdvancedFinancialPageProps> = ({ 
  filters, 
  onFilterChange, 
  chartData 
}) => {
  // Mock data for revenue trend analysis
  const revenueTrendData = [
    { date: 'Jan/24', revenue: 3238.51, trend: 3100.25, forecast: 3150.00 },
    { date: 'Fev/24', revenue: 3077.98, trend: 3150.75, forecast: 3200.50 },
    { date: 'Mar/24', revenue: 4716.97, trend: 3200.50, forecast: 3250.25 },
    { date: 'Abr/24', revenue: 3449.88, trend: 3250.25, forecast: 3300.00 },
    { date: 'Mai/24', revenue: 3515.34, trend: 3300.00, forecast: 3350.75 },
    { date: 'Jun/24', revenue: 4438.35, trend: 3350.75, forecast: 3400.50 },
    { date: 'Jul/24', revenue: 3607.33, trend: 3400.50, forecast: 3450.25 },
    { date: 'Ago/24', revenue: 3879.92, trend: 3450.25, forecast: 3500.00 },
    { date: 'Set/24', revenue: 4454.70, trend: 3500.00, forecast: 3550.75 },
    { date: 'Out/24', revenue: 2458.42, trend: 3550.75, forecast: 3600.50 },
    { date: 'Nov/24', revenue: 3951.33, trend: 3600.50, forecast: 3650.25 },
    { date: 'Dez/24', revenue: 4345.64, trend: 3650.25, forecast: 3700.00 },
  ];

  // Mock data for LTV histogram
  const ltvHistogramData = [
    { range: 'R$ 0-500', count: 45 },
    { range: 'R$ 500-1000', count: 62 },
    { range: 'R$ 1000-1500', count: 38 },
    { range: 'R$ 1500-2000', count: 22 },
    { range: 'R$ 2000+', count: 9 },
  ];

  // Mock data for payment method performance
  const paymentMethodData = [
    { name: 'Dinheiro', value: 15036.08, percentage: 32.7 },
    { name: 'PIX', value: 14612.99, percentage: 31.8 },
    { name: 'Cartão', value: 12000.00, percentage: 26.1 },
    { name: 'Boleto', value: 4300.00, percentage: 9.4 },
  ];

  // Mock data for seasonality analysis
  const dailySeasonalityData = [
    { period: 'Segunda', revenue: 1250.50 },
    { period: 'Terça', revenue: 1320.75 },
    { period: 'Quarta', revenue: 1450.25 },
    { period: 'Quinta', revenue: 1380.00 },
    { period: 'Sexta', revenue: 1520.75 },
    { period: 'Sábado', revenue: 1180.25 },
    { period: 'Domingo', revenue: 950.00 },
  ];

  const monthlySeasonalityData = [
    { period: 'Janeiro', revenue: 3238.51 },
    { period: 'Fevereiro', revenue: 3077.98 },
    { period: 'Março', revenue: 4716.97 },
    { period: 'Abril', revenue: 3449.88 },
    { period: 'Maio', revenue: 3515.34 },
    { period: 'Junho', revenue: 4438.35 },
    { period: 'Julho', revenue: 3607.33 },
    { period: 'Agosto', revenue: 3879.92 },
    { period: 'Setembro', revenue: 4454.70 },
    { period: 'Outubro', revenue: 2458.42 },
    { period: 'Novembro', revenue: 3951.33 },
    { period: 'Dezembro', revenue: 4345.64 },
  ];

  // Mock data for churn rate dashboard
  const churnRateData = [
    { date: 'Jan/24', churnRate: 4.2, churnCount: 8 },
    { date: 'Fev/24', churnRate: 3.8, churnCount: 7 },
    { date: 'Mar/24', churnRate: 5.1, churnCount: 9 },
    { date: 'Abr/24', churnRate: 4.5, churnCount: 8 },
    { date: 'Mai/24', churnRate: 3.9, churnCount: 7 },
    { date: 'Jun/24', churnRate: 4.8, churnCount: 9 },
    { date: 'Jul/24', churnRate: 4.1, churnCount: 8 },
    { date: 'Ago/24', churnRate: 3.7, churnCount: 7 },
    { date: 'Set/24', churnRate: 4.3, churnCount: 8 },
    { date: 'Out/24', churnRate: 5.2, churnCount: 10 },
    { date: 'Nov/24', churnRate: 4.6, churnCount: 9 },
    { date: 'Dez/24', churnRate: 3.9, churnCount: 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-main">Análise Financeira Avançada</h2>
      </div>
      
      {/* Filters */}
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      {/* Revenue Trend Analysis */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Análise de Tendência de Receita com Previsão" chartClassName="h-[450px]">
          <RevenueTrendAnalysis data={revenueTrendData} />
        </ChartCard>
      </div>
      
      {/* LTV Analysis and Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribuição de Valor de Vida do Cliente" chartClassName="h-[400px]">
          <ClientLTVHistogram data={ltvHistogramData} />
        </ChartCard>
        
        <ChartCard title="Desempenho por Método de Pagamento" chartClassName="h-[400px]">
          <PaymentMethodPerformance data={paymentMethodData} />
        </ChartCard>
      </div>
      
      {/* Seasonality Analysis */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Análise de Sazonalidade" chartClassName="h-[500px]">
          <SeasonalityAnalysis 
            dailyData={dailySeasonalityData} 
            monthlyData={monthlySeasonalityData} 
          />
        </ChartCard>
      </div>
      
      {/* Churn Rate Dashboard */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Análise de Taxa de Churn" chartClassName="h-[400px]">
          <ChurnRateDashboard data={churnRateData} />
        </ChartCard>
      </div>
      
      {/* Financial Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-main mb-4">Métricas de Receita</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Receita Total</p>
              <p className="text-2xl font-bold text-text-main">R$ 45.9K</p>
              <p className="text-green-500 text-sm">↗ 12.5% vs mês anterior</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Ticket Médio</p>
              <p className="text-2xl font-bold text-text-main">R$ 114.81</p>
              <p className="text-green-500 text-sm">↗ 2.1% vs mês anterior</p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-main mb-4">Métricas de Cliente</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Vida Média do Cliente</p>
              <p className="text-2xl font-bold text-text-main">107 dias</p>
              <p className="text-green-500 text-sm">↗ 5.7% vs mês anterior</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Valor Vida do Cliente</p>
              <p className="text-2xl font-bold text-text-main">R$ 933</p>
              <p className="text-green-500 text-sm">↗ 7.3% vs mês anterior</p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-main mb-4">Métricas de Retenção</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Taxa de Retenção</p>
              <p className="text-2xl font-bold text-text-main">92.6%</p>
              <p className="text-green-500 text-sm">↗ 3.2% vs mês anterior</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Taxa de Churn</p>
              <p className="text-2xl font-bold text-text-main">5.2%</p>
              <p className="text-red-500 text-sm">↘ 1.8% vs mês anterior</p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-text-main mb-4">Métricas de Qualidade</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Score de Dados</p>
              <p className="text-2xl font-bold text-text-main">92%</p>
              <p className="text-blue-500 text-sm">→ 0.0% vs mês anterior</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-text-main">49.5%</p>
              <p className="text-red-500 text-sm">↘ 1.3% vs mês anterior</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFinancialPage;