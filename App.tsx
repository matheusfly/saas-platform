

import React, { useState, useMemo, useCallback } from 'react';
import { Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import { useData } from './contexts/DataContext';
import ErrorDisplay from './components/common/ErrorDisplay';

const SettingsPage = () => (
  <div className="bg-ui-surface p-8 rounded-2xl shadow-lg border border-border">
    <h1 className="text-3xl font-bold text-text-default mb-4">Configurações</h1>
    <p className="text-text-secondary">Esta é uma página de exemplo para as configurações. Mais opções serão adicionadas em breve.</p>
    <div className="mt-6 space-y-4">
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Notificações por E-mail</label>
            <div className="mt-1 flex items-center">
                <input id="email-notifications" name="email-notifications" type="checkbox" className="h-4 w-4 text-success border-border rounded focus:ring-success" defaultChecked />
                <label htmlFor="email-notifications" className="ml-2 block text-sm text-text-default">Ativar</label>
            </div>
        </div>
         <div>
            <label htmlFor="language" className="block text-sm font-medium text-text-secondary">Idioma</label>
            <select id="language" name="language" className="mt-1 block w-full pl-3 pr-10 py-2 bg-ui-sidebar-surface text-text-default border border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                <option>Português (Brasil)</option>
                <option disabled>Inglês (Em Breve)</option>
            </select>
        </div>
    </div>
  </div>
);


function App() {
  const { allCustomers, loading, error, fetchCustomers } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const searchedCustomers = useMemo(() => {
    if (!searchTerm) return allCustomers;
    return allCustomers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCustomers, searchTerm]);

  return (
    <div className="flex bg-ui-background min-h-screen font-sans">
      <Sidebar onSearchChange={handleSearch} searchTerm={searchTerm} />
      <main className="flex-1 p-6 lg:p-10 ml-64">
          <Routes>
            <Route path="/" element={
                <DashboardPage 
                    searchedCustomers={searchedCustomers} 
                    loading={loading}
                    error={error}
                    onRetry={fetchCustomers}
                />
            } />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
      </main>
    </div>
  );
}

export default App;