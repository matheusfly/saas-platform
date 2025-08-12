

import React, { useState, useMemo, useCallback } from 'react';
import KpiCard from './KpiCard';
import CustomerTable from './CustomerTable';
import DataManagement from './DataManagement';
import CustomerStatusChart from './CustomerStatusChart';
import RecentSignups from './RecentSignups';
import StrategicInsights from './StrategicInsights';
import { Customer, CustomerStatus, KpiData } from '../types';
import { useData } from '../contexts/DataContext';
import { IconUsers, IconDollar, IconNewUser, IconTrendingDown } from '../constants';
import ErrorDisplay from './common/ErrorDisplay';
import { SkeletonKpiCard, SkeletonChart } from './common/SkeletonLoader';

type Tab = 'dashboard' | 'dataManagement';

interface DashboardPageProps {
    searchedCustomers: Customer[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ searchedCustomers, loading, error, onRetry }) => {
    const { allCustomers, addNewCustomers: onAddNewCustomers } = useData();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');

    const dynamicKpiData = useMemo((): KpiData[] => {
        if (!allCustomers || allCustomers.length === 0) return [];
        const totalCustomers = allCustomers.length;
        const totalRevenue = allCustomers.reduce((sum, c) => sum + c.totalSpend, 0);
        const newSignups = allCustomers.filter(c => c.status === CustomerStatus.New).length;
        const churned = allCustomers.filter(c => c.status === CustomerStatus.Churned).length;
        const churnRate = totalCustomers > 0 ? ((churned / totalCustomers) * 100).toFixed(1) : '0.0';
        
        return [
            { title: 'Total de Clientes', value: totalCustomers.toLocaleString('pt-BR'), change: '+12.5%', changeType: 'increase', icon: <IconUsers />, statusFilter: 'all' },
            { title: 'Receita', value: `R$${totalRevenue.toLocaleString('pt-BR')}`, change: '+8.2%', changeType: 'increase', icon: <IconDollar /> },
            { title: 'Novos Cadastros', value: newSignups.toLocaleString('pt-BR'), change: '+21.3%', changeType: 'increase', icon: <IconNewUser />, statusFilter: CustomerStatus.New },
            { title: 'Taxa de Churn', value: `${churnRate.replace('.',',')}%`, change: '-0.5%', changeType: 'decrease', icon: <IconTrendingDown />, statusFilter: CustomerStatus.Churned },
        ];
    }, [allCustomers]);

    const handleStatusFilterChange = useCallback((status: CustomerStatus | 'all') => {
        setStatusFilter(prev => prev === status ? 'all' : status); // Toggle filter
    }, []);
    
    const statusFilteredCustomers = useMemo(() => {
        if (statusFilter === 'all') {
            return searchedCustomers;
        }
        return searchedCustomers.filter(c => c.status === statusFilter);
    }, [searchedCustomers, statusFilter]);
    
    const renderDashboardTab = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonKpiCard key={i} />)
                ) : (
                    dynamicKpiData.map((kpi, index) => (
                        <KpiCard
                            key={index}
                            data={kpi}
                            onClick={kpi.statusFilter ? () => handleStatusFilterChange(kpi.statusFilter!) : undefined}
                            isActive={kpi.statusFilter === statusFilter}
                        />
                    ))
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    {loading ? <SkeletonChart /> : (
                        <CustomerStatusChart 
                            customers={allCustomers}
                            onStatusClick={(status) => setStatusFilter(status)}
                            activeStatus={statusFilter}
                        />
                    )}
                    {loading ? <SkeletonChart /> : <RecentSignups customers={allCustomers} />}
                    <StrategicInsights customers={allCustomers} />
                </div>
                <div className="lg:col-span-2">
                    <CustomerTable customers={statusFilteredCustomers} loading={loading} />
                </div>
            </div>
        </>
    );

    const renderTabContent = () => {
        if (error && !loading) {
            return <div className="mt-10"><ErrorDisplay message={error} onRetry={onRetry} /></div>;
        }

        switch (activeTab) {
            case 'dashboard':
                return renderDashboardTab();
            case 'dataManagement':
                return <DataManagement onAddNewCustomers={onAddNewCustomers} allCustomers={allCustomers} />;
            default:
                return null;
        }
    };
    
    const getTabClass = (tabName: Tab) => {
        return `px-1 py-3 font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary border-b-2 ${
            activeTab === tabName
            ? 'text-success border-success'
            : 'text-text-secondary hover:text-text-default border-transparent'
        }`;
    }

    return (
        <div>
            <header className="bg-ui-sidebar text-text-on-primary p-6 rounded-2xl mb-8 shadow-lg">
                <div className="flex items-center">
                    <div className="bg-success text-gray-900 p-3 rounded-lg">
                        <i className="fas fa-bullseye text-2xl"></i>
                    </div>
                    <div className="ml-4">
                        <h1 className="text-3xl lg:text-4xl font-bold">Painel de Inteligência</h1>
                        <p className="text-lg opacity-90">Análise de clientes para gestão estratégica</p>
                    </div>
                </div>
            </header>
            
            <div className="border-b border-border mb-6">
                <nav className="flex space-x-8">
                    <button onClick={() => setActiveTab('dashboard')} className={getTabClass('dashboard')}>
                        Visão Geral dos Clientes
                    </button>
                    <button onClick={() => setActiveTab('dataManagement')} className={getTabClass('dataManagement')}>
                        Gerenciamento de Dados
                    </button>
                </nav>
            </div>
            
            {renderTabContent()}
        </div>
    );
};

export default DashboardPage;