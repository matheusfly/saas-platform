import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import SettingsPage from './components/SettingsPage';
import FinancialPage from './components/FinancialPage';
import OpportunitiesPage from './components/OpportunitiesPage';
import ConversionsPage from './components/ConversionsPage';
import StrategicPage from './components/StrategicPage';
import ProductivityPage from './components/ProductivityPage';
import VendasPage from './components/VendasPage';
import { FilterState } from './types';
import { fetchDataFromApi } from './services/apiClient';
import type { AllData } from './services/dataService';
import AdvancedAnalyticsPage from './components-2/AdvancedAnalyticsPage';
import PredictiveAnalyticsPage from './components-2/PredictiveAnalyticsPage';

interface AppState {
  status: 'loading' | 'succeeded' | 'failed';
  data: AllData | null;
  error: string | null;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('commercial');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ dateRange: 'all' });
  const [appState, setAppState] = useState<AppState>({
    status: 'loading',
    data: null,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      setAppState(prevState => ({ ...prevState, status: 'loading', error: null }));
      try {
        const newChartData = await fetchDataFromApi(filters);
        setAppState({ status: 'succeeded', data: newChartData, error: null });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setAppState({ status: 'failed', data: null, error: `Não foi possível carregar os dados. (${errorMessage})` });
      }
    };
    fetchData();
  }, [filters]);

  if (appState.status === 'loading') {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background-primary text-text-main">
            <div className="text-center">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-accent-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xl font-semibold">Carregando dados do painel...</p>
            </div>
        </div>
    );
  }

  if (appState.status === 'failed') {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background-primary text-text-main">
            <div className="text-center p-8 bg-surface-card rounded-lg shadow-lg max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-accent-negative mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-text-main mb-2">Erro ao Carregar Dados</h2>
                <p className="text-text-muted">{appState.error}</p>
                <button 
                  onClick={() => setFilters({ ...filters })} // Refreshes by triggering useEffect
                  className="mt-6 px-6 py-2 bg-accent-primary text-text-on-accent font-bold rounded-md hover:bg-accent-primary-hover transition-colors"
                >
                  Tentar Novamente
                </button>
            </div>
        </div>
    );
  }

  if (appState.status === 'succeeded' && appState.data) {
    const chartData = appState.data;
    return (
      <div className="flex min-h-screen bg-background-primary font-sans">
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={setCurrentPage}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header 
            className="p-4 shadow-md sticky top-0 z-20 bg-surface-header"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-text-on-dark">
                  Business Intelligence Dashboard
                </h1>
                <p className="text-text-on-dark opacity-70">Data-driven insights powered by AI</p>
              </div>
            </div>
          </header>
          <main key={currentPage} className="flex-1 p-4 sm:p-6 lg:p-8 fade-in">
            {currentPage === 'commercial' && (
              <Dashboard 
                filters={filters} 
                onFilterChange={setFilters} 
                chartData={chartData}
              />
            )}
            {currentPage === 'vendas' && (
              <VendasPage 
                filters={filters} 
                onFilterChange={setFilters} 
                chartData={chartData}
              />
            )}
            {currentPage === 'opportunities' && (
              <OpportunitiesPage 
                filters={filters} 
                onFilterChange={setFilters} 
                chartData={chartData}
              />
            )}
            {currentPage === 'conversions' && (
              <ConversionsPage 
                filters={filters} 
                onFilterChange={setFilters} 
                chartData={chartData}
              />
            )}
            {currentPage === 'financial' && (
              <FinancialPage 
                filters={filters} 
                onFilterChange={setFilters} 
                chartData={chartData}
              />
            )}
            {currentPage === 'strategic' && (
              <StrategicPage 
                filters={filters} 
                onFilterChange={setFilters} 
                chartData={chartData}
              />
            )}
            {currentPage === 'productivity' && (
              <ProductivityPage 
                filters={filters} 
                onFilterChange={setFilters} 
                chartData={chartData}
              />
            )}
            {currentPage === 'advanced' && (
              <AdvancedAnalyticsPage 
                filters={filters} 
                onFilterChange={setFilters} 
                chartData={chartData}
              />
            )}
            {currentPage === 'predictive' && (
              <PredictiveAnalyticsPage 
                filters={filters} 
                onFilterChange={setFilters} 
                chartData={chartData}
              />
            )}
            {currentPage === 'settings' && <SettingsPage />}
          </main>
          <footer className="text-center p-4 text-text-main opacity-70 text-sm">
            <p>Calistenia & Escalada BI Platform &copy; 2024</p>
          </footer>
        </div>
      </div>
    );
  }

  return null; // Fallback for unexpected states
};

export default App;