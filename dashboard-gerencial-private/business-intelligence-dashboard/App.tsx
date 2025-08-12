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
import { getAllData, type AllData } from './services/dataService';
import AdvancedAnalyticsPage from './components/AdvancedAnalyticsPage'; // Import AdvancedAnalyticsPage
import PredictiveAnalyticsPage from './components/PredictiveAnalyticsPage'; // Import PredictiveAnalyticsPage

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('commercial');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ dateRange: 'all' });
  const [chartData, setChartData] = useState<AllData | null>(null); // Initialize with null

  useEffect(() => {
    const fetchData = async () => {
      const newChartData = await getAllData(filters);
      setChartData(newChartData);
    };
    fetchData();
  }, [filters]);

  if (!chartData) {
    return <div>Loading dashboard data...</div>; // Or a loading spinner
  }

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
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
};

export default App;