// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  LTVAnalysis, 
  ChurnPrediction, 
  PricingAnalysis, 
  FinancialHealth, 
  CapacityUtilization,
  SalesFunnel,
  GympassAnalysis
} from './pages';
import { Sidebar, TopNav, DataUpload } from './components';
import { 
  HomeIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  ChartPieIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [biResults, setBiResults] = useState(null);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Handle data upload
  const handleDataUpload = (results) => {
    setBiResults(results);
    setDataLoaded(true);
  };
  
  return (
    <Router>
      <div className="flex h-screen bg-[#9A9873]">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Main content */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <TopNav isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#9A9873] p-6">
            {!dataLoaded ? (
              <DataUpload onDataUpload={handleDataUpload} />
            ) : (
              <Routes>
                <Route path="/" element={<Home biResults={biResults} />} />
                <Route path="/ltv" element={<LTVAnalysis biResults={biResults} />} />
                <Route path="/churn" element={<ChurnPrediction biResults={biResults} />} />
                <Route path="/pricing" element={<PricingAnalysis biResults={biResults} />} />
                <Route path="/financial" element={<FinancialHealth biResults={biResults} />} />
                <Route path="/capacity" element={<CapacityUtilization biResults={biResults} />} />
                <Route path="/funnel" element={<SalesFunnel biResults={biResults} />} />
                <Route path="/gympass" element={<GympassAnalysis biResults={biResults} />} />
              </Routes>
            )}
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;