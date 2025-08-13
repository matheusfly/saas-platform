import React, { useState, useRef } from 'react';
import { Customer, DataHistoryItem } from '../types';
import apiService from '../services/apiService';
import etlService from '../services/etlService';

const DataUpload: React.FC<{ onFileUpload: (file: File) => void }> = ({ onFileUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
        if(event.target) event.target.value = '';
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.classList.add('border-success', 'bg-success/10');
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.classList.remove('border-success', 'bg-success/10');
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.classList.remove('border-success', 'bg-success/10');
        const file = event.dataTransfer.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <div 
            className="border-2 border-dashed border-border rounded-2xl p-8 text-center transition-colors duration-300"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xls,.xlsx" />
            <div className="mx-auto h-12 w-12 text-text-secondary">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75m-7.5 3L3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM10 5.75h6.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5h-10.5a1.5 1.5 0 01-1.5-1.5V10" /></svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-text-default">
                <button onClick={() => fileInputRef.current?.click()} className="font-semibold text-success hover:text-success/80">Envie um arquivo</button> ou arraste e solte
            </h3>
            <p className="mt-1 text-xs text-text-secondary">CSV, XLS até 10MB</p>
        </div>
    );
};

const DataHistory: React.FC<{ history: DataHistoryItem[] }> = ({ history }) => {
    const getStatusChip = (status: DataHistoryItem['status']) => {
        const base = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
        switch(status) {
            case 'Concluído': return `${base} bg-status-green-bg text-status-green-text`;
            case 'Falhou': return `${base} bg-status-red-bg text-status-red-text`;
            case 'Processando': return `${base} bg-status-blue-bg text-status-blue-text animate-pulse`;
        }
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b-2 border-border">
                        <th className="p-4 text-sm font-semibold text-text-secondary">Nome do Arquivo</th>
                        <th className="p-4 text-sm font-semibold text-text-secondary">Status</th>
                        <th className="p-4 text-sm font-semibold text-text-secondary">Data</th>
                        <th className="p-4 text-sm font-semibold text-text-secondary">Registros Processados</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(item => (
                        <tr key={item.id} className="border-b border-border">
                            <td className="p-4 font-medium text-text-default">{item.file}</td>
                            <td className="p-4"><span className={getStatusChip(item.status)}>{item.status}</span></td>
                            <td className="p-4 text-text-secondary">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                            <td className="p-4 text-text-secondary">{item.records}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const initialHistory: DataHistoryItem[] = [
    { id: 1, file: 'clientes_q2_2024.csv', status: 'Concluído', date: '2024-07-10', records: '542 adicionado(s).' },
    { id: 2, file: 'leads_junho_2024.csv', status: 'Concluído', date: '2024-07-01', records: '1024 adicionado(s).' },
    { id: 3, file: 'atualizacoes_vendas.xls', status: 'Falhou', date: '2024-06-28', records: 'Erro de parsing.' },
    { id: 4, file: 'novos_cadastros_q1.csv', status: 'Concluído', date: '2024-04-05', records: '830 adicionado(s).' },
];

interface DataManagementProps {
    onAddNewCustomers: (customers: Customer[]) => void;
    allCustomers: Customer[];
}

const DataManagement: React.FC<DataManagementProps> = ({ onAddNewCustomers, allCustomers }) => {
    const [history, setHistory] = useState<DataHistoryItem[]>(initialHistory);

    const handleFileUpload = (file: File) => {
        const newId = history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1;
        const newEntry: DataHistoryItem = {
            id: newId,
            file: file.name,
            status: 'Processando',
            date: new Date().toISOString().split('T')[0],
            records: 'Iniciando pipeline...',
        };
        setHistory(prev => [newEntry, ...prev]);

        // Simulate processing and run ETL pipeline
        setTimeout(async () => {
            try {
                // 1. Extract
                const newBatch = await apiService.customers.fetchNewBatch();
                
                // 2. Transform, Validate, Load
                const { addedCustomers, summary } = etlService.runPipeline(newBatch, allCustomers);

                // 3. Update application state
                if (addedCustomers.length > 0) {
                    onAddNewCustomers(addedCustomers);
                }

                // 4. Update history with results
                setHistory(prev => prev.map(item => 
                    item.id === newId 
                      ? { ...item, status: 'Concluído', records: summary } 
                      : item
                ));

            } catch (err) {
                console.error(err);
                const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
                setHistory(prev => prev.map(item => 
                    item.id === newId 
                      ? { ...item, status: 'Falhou', records: `Erro: ${errorMessage}` } 
                      : item
                ));
            }
        }, 2500);
    };

    return (
        <div className="space-y-8">
            <div className="bg-ui-surface p-6 rounded-2xl shadow-lg border border-border">
                <h2 className="text-xl font-bold text-text-default mb-4">Upload de Dados de Clientes</h2>
                <DataUpload onFileUpload={handleFileUpload} />
            </div>
            <div className="bg-ui-surface p-6 rounded-2xl shadow-lg border border-border">
                <h2 className="text-xl font-bold text-text-default mb-4">Histórico de Processamento</h2>
                <DataHistory history={history} />
            </div>
        </div>
    );
};

export default DataManagement;