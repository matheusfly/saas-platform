import React from 'react';

interface EmptyChartStateProps {
  message?: string;
  icon?: React.ReactNode;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({ message, icon }) => {
  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-text-muted opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-surface-card rounded-lg text-center p-4">
      {icon || defaultIcon}
      <p className="mt-4 text-base font-medium text-text-muted">
        {message || 'Dados insuficientes para exibir este gráfico.'}
      </p>
      <p className="mt-1 text-sm text-text-muted opacity-80">
        Tente ajustar os filtros ou aguarde a inserção de novos dados.
      </p>
    </div>
  );
};

export default EmptyChartState;
