import React, { useState, useCallback } from 'react';
import { generateInsights } from '../services/geminiService';
import { AllData } from '../services/dataService';

interface InsightsPanelProps {
  chartData: AllData;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ chartData }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateInsights = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setInsights('');
    try {
      const result = await generateInsights(chartData);
      setInsights(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [chartData]);

  const renderFormattedInsights = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={index} className="text-xl font-bold mt-4 mb-2 text-text-main">{line.replace(/\*\*/g, '')}</h4>;
      }
       if (/^\d+\./.test(line.trim())) {
        return <li key={index} className="ml-5 list-decimal my-2">{line.replace(/^\d+\. /, '')}</li>;
      }
      if (line.startsWith('* ')) {
        return <li key={index} className="ml-5 list-disc">{line.replace(/^\* /, '')}</li>;
      }
      return <p key={index} className="my-2">{line}</p>;
    });
  }

  return (
    <div className="p-4 sm:p-6 rounded-lg shadow-lg bg-surface-card border border-brand-border flex flex-col transition-all duration-300">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        aria-controls="insights-content"
      >
        <h2 className="text-2xl font-bold text-text-main">Análise Inteligente</h2>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-text-muted transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      <div 
        id="insights-content"
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100 mt-4'}`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <p className="text-text-muted">Reveja os tópicos e gere insights sobre os dados.</p>
            </div>
            <button
            onClick={(e) => { e.stopPropagation(); handleGenerateInsights(); }}
            disabled={isLoading}
            className="mt-4 sm:mt-0 px-6 py-2 bg-accent-primary text-text-on-accent font-bold rounded-md hover:bg-accent-primary-hover transition-colors disabled:bg-text-muted disabled:cursor-not-allowed flex items-center shrink-0"
            >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-text-on-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analisando...
                </>
            ) : (
                'Gerar Insights'
            )}
            </button>
        </div>

        {error && <div className="mt-4 p-4 bg-accent-negative/10 text-accent-negative border border-accent-negative rounded-md">{error}</div>}
        
        <div className="mt-6 flex-grow" style={{minHeight: '300px'}}>
            {insights ? (
                <div className="p-4 bg-background-primary/20 rounded-md text-text-main h-full overflow-y-auto">
                    {renderFormattedInsights(insights)}
                </div>
            ) : !isLoading && (
                <div className="h-full flex items-center justify-center text-center text-text-muted">
                    <p>Clique em "Gerar Insights" para ver uma análise de IA dos seus dados.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
