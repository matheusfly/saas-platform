
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Customer } from '../types';
import apiService from '../services/apiService';

interface DataContextType {
    allCustomers: Customer[];
    loading: boolean;
    error: string | null;
    addNewCustomers: (newCustomers: Customer[]) => void;
    fetchCustomers: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiService.customers.getAll();
            setAllCustomers(data);
            setError(null);
        } catch (e) {
            console.error("Failed to fetch customers:", e);
            const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro desconhecido.";
            setError(`Falha ao carregar os dados dos clientes. Detalhes: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const addNewCustomers = useCallback((newCustomers: Customer[]) => {
        setAllCustomers(prevCustomers => {
            const existingIds = new Set(prevCustomers.map(c => c.id));
            const uniqueNewCustomers = newCustomers.filter(c => !existingIds.has(c.id));
            return [...prevCustomers, ...uniqueNewCustomers];
        });
    }, []);
    
    const value = { allCustomers, loading, error, addNewCustomers, fetchCustomers };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
