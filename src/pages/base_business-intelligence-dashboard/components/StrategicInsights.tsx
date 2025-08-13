import React, { useState, useEffect, useCallback } from 'react';
import { Customer, StrategicInsight } from '../types';
import { generateStrategicInsights } from '../services/geminiService';
import { IconLightbulb } from '../constants';

const Spinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
);

const StrategicInsights: React.FC<{ customers: Customer[] }> = ({ customers }) => {
    const [insights, setInsights] = useState<StrategicInsight | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = useCallback(async () => {
        if (customers.length === 0) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateStrategicInsights(customers);
            setInsights(result);
        } catch (e) {
            setError('Falha ao carregar insights de IA. Por favor, tente novamente.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [customers]);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);
    
    const handleRefresh = () => {
        fetchInsights();
    }

    return (
        <div className="bg-ui-surface p-6 rounded-2xl shadow-lg border border-border">
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center">
                    <div className="bg-primary text-text-on-primary p-2 rounded-lg mr-3">
                        <IconLightbulb />
                    </div>
                    <h2 className="text-xl font-bold text-text-default">Insights Estratégicos</h2>
                 </div>
                <button 
                    onClick={handleRefresh} 
                    disabled={isLoading}
                    className="text-text-secondary hover:text-text-default disabled:opacity-50 disabled:cursor-wait"
                    aria-label="Atualizar Insights"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.378 1.378A8.962 8.962 0 0112 5c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9" /></svg>
                </button>
            </div>
            
            {isLoading && (
                <div className="flex justify-center items-center h-40">
                    <Spinner />
                </div>
            )}
            
            {error && !isLoading &&(
                <div className="text-center py-4">
                    <p className="text-text-error">{error}</p>
                </div>
            )}

            {insights && !isLoading && !error && (
                <div className="space-y-5">
                    <div>
                        <h3 className="font-semibold text-text-default mb-2">Principais Tendências</h3>
                        <ul className="list-disc list-inside space-y-2 text-text-secondary">
                            {insights.trends.map((trend, i) => <li key={i}>{trend}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold text-text-default mb-2">Recomendações</h3>
                        <ul className="list-disc list-inside space-y-2 text-text-secondary">
                            {insights.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StrategicInsights;