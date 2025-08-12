import React from 'react';

const SettingsPage: React.FC = () => {
    const handleExport = () => {
        alert('Funcionalidade de exportação de relatório a ser implementada.');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-text-main">Configurações e Ações</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-card p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-text-main mb-4">Exportar Relatório</h3>
                    <p className="text-text-muted mb-6">Gere um backup completo dos dados atuais em formato CSV. O download iniciará automaticamente.</p>
                    <button 
                        onClick={handleExport}
                        className="px-6 py-2 bg-accent-primary text-text-on-accent font-bold rounded-md hover:bg-accent-primary-hover transition-colors disabled:bg-gray-500"
                    >
                        Exportar Dados
                    </button>
                </div>

                <div className="bg-surface-card p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-text-main mb-4">Atualizar Conexão de Dados</h3>
                    <p className="text-text-muted mb-6">Force uma nova sincronização com a fonte de dados primária para obter as informações mais recentes.</p>
                    <button 
                        onClick={() => alert('Sincronização de dados iniciada.')}
                        className="px-6 py-2 bg-accent-secondary text-text-on-dark font-bold rounded-md hover:opacity-90 transition-colors"
                    >
                        Sincronizar Agora
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
