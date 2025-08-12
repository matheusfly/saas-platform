

import React, { useState } from 'react';
import ChartCard from './ChartCard';
import FilterControls from './FilterControls';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Area, ReferenceLine, Label } from 'recharts';
import { FilterState, type RevenueExpenseData } from '../types';
import type { AllData } from '../services/dataService';

interface PredictiveAnalyticsPageProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    chartData: AllData;
}

const generateForecastData = (historicalData: RevenueExpenseData[]) => {
  const forecastOnly = [];
  let lastRevenue = historicalData.length > 0 ? historicalData[historicalData.length - 1].revenue : 5000;
  let lastExpenses = historicalData.length > 0 ? historicalData[historicalData.length - 1].expenses : 2500;
  
  const today = new Date();
  
  for (let i = 1; i <= 12; i++) {
    const forecastDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const dateStr = `${forecastDate.toLocaleString('default', { month: 'short' })}/${String(forecastDate.getFullYear()).slice(2)}`;

    lastRevenue *= (1 + (Math.random() * 0.05 + 0.01)); // 1% to 6% growth
    lastExpenses *= (1 + (Math.random() * 0.04 + 0.01)); // 1% to 5% growth

    const newForecast = {
      date: dateStr,
      revenue: lastRevenue,
      expenses: lastExpenses,
      net: lastRevenue - lastExpenses,
    };

    forecastOnly.push(newForecast);
  }

  const combinedData = [
    ...historicalData.map(d => ({...d, forecastRevenue: null, forecastExpenses: null, forecastNet: null})),
    ...forecastOnly.map(d => ({ date: d.date, revenue: null, expenses: null, net: null, forecastRevenue: d.revenue, forecastExpenses: d.expenses, forecastNet: d.net }))
  ];

  return {
      combinedData,
      forecastOnly,
      historicalData
  };
};

const PredictiveAnalyticsPage: React.FC<PredictiveAnalyticsPageProps> = ({ filters, onFilterChange, chartData }) => {
  const [forecastPeriod, setForecastPeriod] = useState<'3m' | '6m' | '12m'>('3m');
  
  const { combinedData, forecastOnly, historicalData } = generateForecastData(chartData.revenueExpense);
  
  const projectedRevenue = forecastOnly.slice(0, 3).reduce((sum, item) => sum + item.revenue, 0);
  const projectedProfit = forecastOnly.slice(0, 3).reduce((sum, item) => sum + item.net, 0);
  
  let projectedGrowth = 0;
  if (historicalData.length > 0 && forecastOnly.length > 2) {
      const lastHistoricalRevenue = historicalData[historicalData.length - 1].revenue;
      const projectedEndRevenue = forecastOnly[2].revenue; 
      if(lastHistoricalRevenue > 0) {
          projectedGrowth = ((projectedEndRevenue - lastHistoricalRevenue) / lastHistoricalRevenue) * 100;
      }
  }

  const funnelForecastData = chartData.funnel.map(stageData => ({
      stage: stageData.stage,
      current: stageData.value,
      projected: Math.round(stageData.value * (1 + (Math.random() * 0.10 + 0.05))) // project 5-15% growth
  }));

  const ltvForecastData = [
      { month: 'Atual', ltv: chartData.kpis.averageLtv },
      { month: '+3M', ltv: chartData.kpis.averageLtv * 1.05 },
      { month: '+6M', ltv: chartData.kpis.averageLtv * 1.08 },
      { month: '+12M', ltv: chartData.kpis.averageLtv * 1.12 },
  ];
  
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
      
      <FilterControls filters={filters} onFilterChange={onFilterChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Receita Projetada</h3>
          <p className="text-3xl font-bold mt-2">
            R$ {projectedRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs opacity-90 mt-1">Nos próximos 3 meses</p>
        </div>
        
        <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Lucro Projetado</h3>
          <p className="text-3xl font-bold mt-2">
            R$ {projectedProfit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs opacity-90 mt-1">Nos próximos 3 meses</p>
        </div>
        
        <div className="bg-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-sm opacity-90">Crescimento Projetado</h3>
          <p className="text-3xl font-bold mt-2">
            {projectedGrowth.toFixed(1)}%
          </p>
          <p className="text-xs opacity-90 mt-1">Nos próximos 3 meses</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Projeção de Receita e Despesas" chartClassName="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={combinedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
              <XAxis dataKey="date" stroke="#858360" tick={{ fill: '#1E1E1E' }} />
              <YAxis stroke="#858360" tickFormatter={currencyFormatter} tick={{ fill: '#1E1E1E' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => <span className="text-text-main text-sm">{value}</span>} />
              
              <Bar dataKey="revenue" name="Receita Histórica" fill="#B0D236" barSize={20} />
              <Bar dataKey="expenses" name="Despesa Histórica" fill="#D9534F" barSize={20} />
              <Line type="monotone" dataKey="forecastRevenue" name="Receita Projetada" stroke="#858360" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="forecastExpenses" name="Despesa Projetada" stroke="#c45d5a" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              
              <ReferenceLine x={historicalData.length - 0.5} stroke="#1E1E1E" strokeDasharray="3 3">
                  <Label value="Projeção" position="insideTop" fill="#1E1E1E" />
              </ReferenceLine>
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Projeção de Conversão do Funil" chartClassName="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelForecastData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
              <XAxis dataKey="stage" stroke="#858360" tick={{ fill: '#1E1E1E' }} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#858360" tick={{ fill: '#1E1E1E' }} />
              <Tooltip 
                formatter={(value) => [`${Number(value).toLocaleString('pt-BR')}`, '']}
                labelFormatter={(value) => `Estágio: ${value}`}
              />
              <Legend formatter={(value) => <span className="text-text-main text-sm">{value === 'current' ? 'Atual' : 'Projetado'}</span>} />
              <Bar dataKey="current" name="Atual" fill="#858360" />
              <Bar dataKey="projected" name="Projetado" fill="#B0D236" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title="Projeção de Valor do Cliente (LTV)" chartClassName="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ltvForecastData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
              <XAxis dataKey="month" stroke="#858360" tick={{ fill: '#1E1E1E' }} />
              <YAxis stroke="#858360" tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} tick={{ fill: '#1E1E1E' }} />
              <Tooltip formatter={(value) => [`R$${Number(value).toLocaleString('pt-BR')}`, 'LTV']} />
              <Area type="monotone" dataKey="ltv" fill="#6F6C4B" fillOpacity={0.2} stroke="none" />
              <Line type="monotone" dataKey="ltv" name="LTV Projetado" stroke="#6F6C4B" strokeWidth={3} dot={{ r: 6, fill: '#6F6C4B' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      
      <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-brand-border">
        <h3 className="text-lg font-semibold text-text-main mb-4">Avaliação de Riscos e Oportunidades</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="text-red-800 font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              Riscos Identificados
            </h4>
            <ul className="mt-2 space-y-2 text-red-600 text-sm">
              <li>Aumento projetado das despesas operacionais.</li>
              <li>Taxa de churn pode aumentar nos próximos meses.</li>
              <li>Saturação no mercado (probabilidade: 35%).</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-green-800 font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Oportunidades Identificadas
            </h4>
            <ul className="mt-2 space-y-2 text-green-600 text-sm">
              <li>{`Expansão de receita projetada em ${projectedGrowth.toFixed(1)}% nos próximos 3 meses.`}</li>
              <li>Nova segmentação de mercado pode aumentar leads.</li>
              <li>Otimização de funil pode melhorar conversão.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalyticsPage;