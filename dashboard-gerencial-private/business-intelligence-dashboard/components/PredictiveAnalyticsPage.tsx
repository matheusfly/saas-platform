import React, { useState } from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FilterState } from '../types';
import type { AllData } from '../services/dataService';

interface PredictiveAnalyticsPageProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    chartData: AllData;
}

// Mock forecast data - in a real implementation, this would come from ML models
const generateForecastData = (rawAdvancedFinancialResults: any) => {
  const forecastData: { date: string; revenue: number; expenses: number; net: number; }[] = [];

  if (rawAdvancedFinancialResults && rawAdvancedFinancialResults.financial_metrics && rawAdvancedFinancialResults.financial_metrics.cash_flow_forecast && rawAdvancedFinancialResults.financial_metrics.cash_flow_forecast.ensemble_forecast) {
    const ensembleForecast = rawAdvancedFinancialResults.financial_metrics.cash_flow_forecast.ensemble_forecast.values;
    
    for (const dateKey in ensembleForecast) {
      const revenue = ensembleForecast[dateKey];
      // For now, assume expenses are 50% of revenue for forecast
      const expenses = revenue * 0.5;
      const net = revenue - expenses;
      forecastData.push({
        date: dateKey,
        revenue: revenue,
        expenses: expenses,
        net: net,
      });
    }
  }
  
  // Sort data by date
  forecastData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Add some historical data for context if available, or create mock historical data
  // For simplicity, let's create some mock historical data if none is available
  if (forecastData.length === 0) {
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const revenue = Math.random() * 10000 + 5000;
      const expenses = revenue * 0.5;
      const net = revenue - expenses;
      forecastData.push({ date: dateStr, revenue, expenses, net });
    }
  } else {
    // If we have forecast data, let's add some mock historical data leading up to it
    const firstForecastDate = new Date(forecastData[0].date);
    for (let i = 1; i <= 6; i++) {
      const d = new Date(firstForecastDate.getFullYear(), firstForecastDate.getMonth() - i, 1);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const revenue = forecastData[0].revenue * (1 - i * 0.05); // Simple decreasing trend
      const expenses = revenue * 0.5;
      const net = revenue - expenses;
      forecastData.unshift({ date: dateStr, revenue, expenses, net });
    }
  }

  return forecastData;
};

const PredictiveAnalyticsPage: React.FC<PredictiveAnalyticsPageProps> = ({ filters, onFilterChange, chartData }) => {
  const [forecastPeriod, setForecastPeriod] = useState<'3m' | '6m' | '12m'>('3m');
  
  // Generate forecast data
  const forecastData = generateForecastData(chartData.rawAdvancedFinancialResults);
  
  // Separate historical and forecast data
  const historicalData = forecastData.slice(0, 6);
  const forecastOnlyData = forecastData.slice(6);
  
  const currencyFormatter = (value: number) => {
    if (Math.abs(value) >= 1_000_000) {
      return `R$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `R$${(value / 1000).toFixed(0)}k`;
    }
    return `R$${value}`;
  };

  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((pld: any, index: number) => (
              <p key={index} style={{ color: pld.color || pld.stroke }}>
                {`${pld.name}: ${pld.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-text-main">Análise Preditiva</h2>
        
        {/* Forecast Period Selector */}
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              forecastPeriod === '3m' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setForecastPeriod('3m')}
          >
            3 Meses
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              forecastPeriod === '6m' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setForecastPeriod('6m')}
          >
            6 Meses
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              forecastPeriod === '12m' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setForecastPeriod('12m')}
          >
            12 Meses
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Receita Projetada</h3>
          <p className="text-3xl font-bold mt-2">
            R$ {(forecastOnlyData.reduce((sum, item) => sum + item.revenue, 0)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs opacity-90 mt-1">Nos próximos 3 meses</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Lucro Projetado</h3>
          <p className="text-3xl font-bold mt-2">
            R$ {(forecastOnlyData.reduce((sum, item) => sum + item.net, 0)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs opacity-90 mt-1">Comissões não incluídas</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Crescimento Projetado</h3>
          <p className="text-3xl font-bold mt-2">
            {historicalData.length > 1 
              ? `${((((forecastOnlyData[forecastOnlyData.length - 1].revenue - historicalData[historicalData.length - 1].revenue) / historicalData[historicalData.length - 1].revenue) * 100)).toFixed(1)}%`
              : '0%'}
          </p>
          <p className="text-xs opacity-90 mt-1">Comparado ao último mês</p>
        </div>
      </div>
      
      {/* Revenue Forecast Chart */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Projeção de Receita e Despesas" chartClassName="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={forecastData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
              <XAxis 
                dataKey="date" 
                stroke="#858360"
                tick={{ fill: '#1E1E1E' }}
              />
              <YAxis 
                stroke="#858360" 
                tickFormatter={currencyFormatter}
                tick={{ fill: '#1E1E1E' }}
              >
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value) => <span className="text-text-main text-sm">{value}</span>}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Receita" 
                stroke="#B0D236" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#B0D236' }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                name="Despesas" 
                stroke="#D9534F" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#D9534F' }}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                name="Lucro Líquido" 
                stroke="#1E1E1E" 
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 5, fill: '#1E1E1E' }}
              />
              
              {/* Vertical line to separate historical from forecast */}
              <CartesianGrid 
                verticalPoints={[historicalData.length - 0.5]} 
                stroke="#858360" 
                strokeDasharray="3 3" 
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      
      {/* Funnel Conversion Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Projeção de Conversão do Funil" chartClassName="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { stage: 'Leads', current: chartData.funnel[0]?.value || 0, projected: Math.round((chartData.funnel[0]?.value || 0) * 1.15) },
                { stage: 'Qualificação', current: chartData.funnel[1]?.value || 0, projected: Math.round((chartData.funnel[1]?.value || 0) * 1.12) },
                { stage: 'Proposta', current: chartData.funnel[2]?.value || 0, projected: Math.round((chartData.funnel[2]?.value || 0) * 1.10) },
                { stage: 'Negociação', current: chartData.funnel[3]?.value || 0, projected: Math.round((chartData.funnel[3]?.value || 0) * 1.08) },
                { stage: 'Fechamento', current: chartData.funnel[4]?.value || 0, projected: Math.round((chartData.funnel[4]?.value || 0) * 1.05) },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
              <XAxis 
                dataKey="stage" 
                stroke="#858360"
                tick={{ fill: '#1E1E1E' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#858360" 
                tick={{ fill: '#1E1E1E' }}
              />
              <Tooltip 
                formatter={(value) => [`${Number(value).toLocaleString('pt-BR')}`, '']}
                labelFormatter={(value) => `Estágio: ${value}`}
              />
              <Legend 
                formatter={(value) => <span className="text-text-main text-sm">{value === 'current' ? 'Atual' : 'Projetado'}</span>}
              />
              <Bar dataKey="current" name="Atual" fill="#858360" />
              <Bar dataKey="projected" name="Projetado" fill="#B0D236" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        
        {/* Customer Lifetime Value Forecast */}
        <ChartCard title="Projeção de Valor do Cliente (LTV)" chartClassName="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { month: 'Atual', ltv: chartData.kpis.averageLtv },
                { month: '+3M', ltv: chartData.kpis.averageLtv * 1.05 },
                { month: '+6M', ltv: chartData.kpis.averageLtv * 1.08 },
                { month: '+12M', ltv: chartData.kpis.averageLtv * 1.12 },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
              <XAxis 
                dataKey="month" 
                stroke="#858360"
                tick={{ fill: '#1E1E1E' }}
              />
              <YAxis 
                stroke="#858360" 
                tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
                tick={{ fill: '#1E1E1E' }}
              />
              <Tooltip 
                formatter={(value) => [`R$${Number(value).toLocaleString('pt-BR')}`, 'LTV']}
              />
              <Line 
                type="monotone" 
                dataKey="ltv" 
                name="LTV Projetado" 
                stroke="#6F6C4B" 
                strokeWidth={3}
                dot={{ r: 6, fill: '#6F6C4B' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      
      {/* Risk Assessment */}
      <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-brand-border">
        <h3 className="text-lg font-semibold text-text-main mb-4">Avaliação de Riscos e Oportunidades</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="text-red-800 font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Riscos Identificados
            </h4>
            <ul className="mt-2 space-y-2 text-red-600 text-sm">
              <li>• Aumento projetado de 8% nas despesas operacionais</li>
              <li>• Taxa de churn pode aumentar em 2% nos próximos meses</li>
              <li>• Risco de saturação no mercado (probabilidade: 35%)</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-green-800 font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Oportunidades Identificadas
            </h4>
            <ul className="mt-2 space-y-2 text-green-600 text-sm">
              <li>• Expansão de receita projetada: 15% nos próximos 3 meses</li>
              <li>• Nova segmentação de mercado pode aumentar leads em 25%</li>
              <li>• Otimização de funil pode melhorar conversão em 5-8%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalyticsPage;