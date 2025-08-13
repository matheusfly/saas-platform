
import React from 'react';

interface ErrorDisplayProps {
    message: string;
    onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
    return (
        <div className="bg-bg-error-surface text-center p-6 rounded-2xl border border-bg-error shadow-lg" role="alert">
            <div className="flex justify-center items-center mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <h3 className="ml-3 text-xl font-bold text-text-error">Ocorreu um Erro</h3>
            </div>
            <p className="text-text-error mb-6">{message}</p>
            {onRetry && (
                <button 
                    onClick={onRetry}
                    className="bg-bg-error text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors"
                >
                    Tentar Novamente
                </button>
            )}
        </div>
    );
};

export default ErrorDisplay;
