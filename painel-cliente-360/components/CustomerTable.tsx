

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Customer, CustomerStatus, Chat, ChatMessage } from '../types';
import { createCustomerChatSession } from '../services/geminiService';
import { IconPaperAirplane, IconChat } from '../constants';
import Modal from './common/Modal';
import Spinner from './common/Spinner';
import { SkeletonDivTable } from './common/SkeletonLoader';
import { FixedSizeList as List } from 'react-window';

interface CustomerTableProps {
    customers: Customer[];
    loading: boolean;
}

const getStatusChip = (status: CustomerStatus) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    switch (status) {
        case CustomerStatus.Active: return `${baseClasses} bg-status-green-bg text-status-green-text`;
        case CustomerStatus.AtRisk: return `${baseClasses} bg-status-yellow-bg text-status-yellow-text`;
        case CustomerStatus.Churned: return `${baseClasses} bg-status-red-bg text-status-red-text`;
        case CustomerStatus.New: return `${baseClasses} bg-status-blue-bg text-status-blue-text`;
    }
};

const Row = React.memo(({ index, style, data }: { index: number, style: React.CSSProperties, data: { customers: Customer[], handleOpenChat: (c: Customer) => void } }) => {
    const customer = data.customers[index];
    return (
        <div style={style} className="flex items-center border-b border-border hover:bg-ui-sidebar-surface">
            <div className="p-4 flex items-center w-[35%]">
                <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full mr-4 object-cover flex-shrink-0" />
                <div className="truncate">
                    <div className="font-bold text-text-default truncate">{customer.name}</div>
                    <div className="text-sm text-text-secondary truncate">{customer.email}</div>
                </div>
            </div>
            <div className="p-4 w-[15%]"><span className={getStatusChip(customer.status)}>{customer.status}</span></div>
            <div className="p-4 w-[20%] font-medium text-text-default">R${customer.totalSpend.toLocaleString('pt-BR')}</div>
            <div className="p-4 w-[15%] text-text-secondary">{customer.lastSeen}</div>
            <div className="p-4 w-[15%] flex justify-center">
                <button
                    onClick={() => data.handleOpenChat(customer)}
                    className="bg-success text-gray-900 p-2 rounded-full hover:bg-primary-hover transition-colors"
                    aria-label={`Conversar com IA sobre ${customer.name}`}
                >
                    <IconChat />
                </button>
            </div>
        </div>
    );
});


const CustomerTable: React.FC<CustomerTableProps> = ({ customers, loading }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof Customer; direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userMessage, setUserMessage] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const sortedCustomers = useMemo(() => {
        let sortableItems = [...customers];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [customers, sortConfig]);

    const requestSort = (key: keyof Customer) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleOpenChat = useCallback(async (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
        setChatHistory([]);
        setChatError(null);
        setIsStreaming(true);

        try {
            const session = createCustomerChatSession(customer);
            setChatSession(session);

            const stream = await session.sendMessageStream({ message: "Faça uma análise inicial completa deste cliente em português: resumo, nível de risco e duas ações sugeridas." });

            let fullResponse = "";
            setChatHistory([{ role: 'model', text: "" }]);
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setChatHistory([{ role: 'model', text: fullResponse }]);
            }
        } catch (err) {
            console.error("Chat Error:", err);
            setChatError("Não foi possível iniciar o chat. Tente novamente.");
        } finally {
            setIsStreaming(false);
        }
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userMessage.trim() || !chatSession || isStreaming) return;

        const newUserMessage: ChatMessage = { role: 'user', text: userMessage };
        const modelResponse: ChatMessage = { role: 'model', text: "" };
        
        setChatHistory(prev => [...prev, newUserMessage, modelResponse]);
        setUserMessage('');
        setIsStreaming(true);
        setChatError(null);

        try {
            const stream = await chatSession.sendMessageStream({ message: userMessage });
            let fullResponse = "";
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'model', text: fullResponse };
                    return newHistory;
                });
            }
        } catch (err) {
            console.error("Chat Error:", err);
            setChatError("Ocorreu um erro ao obter a resposta. Tente novamente.");
            setChatHistory(prev => prev.slice(0, -1));
        } finally {
            setIsStreaming(false);
        }
    };

    const ROW_HEIGHT = 76;

    return (
        <div className="bg-ui-surface p-6 rounded-2xl shadow-lg border border-border flex flex-col h-[800px]">
            <h2 className="text-xl font-bold text-text-default mb-4">Lista de Clientes</h2>
            
            <div className="flex items-center border-b-2 border-border flex-shrink-0">
                <div className="p-4 text-sm font-semibold text-text-secondary cursor-pointer hover:text-text-default w-[35%]" onClick={() => requestSort('name')}>Nome {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}</div>
                <div className="p-4 text-sm font-semibold text-text-secondary cursor-pointer hover:text-text-default w-[15%]" onClick={() => requestSort('status')}>Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}</div>
                <div className="p-4 text-sm font-semibold text-text-secondary cursor-pointer hover:text-text-default w-[20%]" onClick={() => requestSort('totalSpend')}>Gasto Total {sortConfig?.key === 'totalSpend' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}</div>
                <div className="p-4 text-sm font-semibold text-text-secondary cursor-pointer hover:text-text-default w-[15%]" onClick={() => requestSort('lastSeen')}>Visto por Último {sortConfig?.key === 'lastSeen' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}</div>
                <div className="p-4 text-sm font-semibold text-text-secondary w-[15%]">Ações</div>
            </div>
            
            <div className="flex-grow">
            {loading ? <SkeletonDivTable rows={10} /> : 
                sortedCustomers.length > 0 ? (
                    <List
                        height={650}
                        itemCount={sortedCustomers.length}
                        itemSize={ROW_HEIGHT}
                        width="100%"
                        itemData={{ customers: sortedCustomers, handleOpenChat }}
                    >
                        {Row}
                    </List>
                ) : (
                    <div className="text-center py-10 text-text-secondary h-full flex items-center justify-center">
                        <div>
                           <p className="font-semibold">Nenhum cliente encontrado.</p>
                           <p className="text-sm">Tente ajustar sua busca ou filtros.</p>
                        </div>
                    </div>
                )
            }
            </div>

            <div className="flex justify-between items-center mt-4 border-t border-border pt-4 flex-shrink-0">
                <span className="text-sm text-text-secondary">
                    {loading ? 'Carregando...' : `${sortedCustomers.length.toLocaleString('pt-BR')} resultado(s) encontrado(s)`}
                </span>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {selectedCustomer && (
                     <>
                        <div className="p-6 border-b border-border">
                            <h2 className="text-2xl font-bold text-text-default">Chat de Insights para {selectedCustomer.name}</h2>
                            <p className="text-sm text-text-secondary">Desenvolvido com Gemini</p>
                        </div>
                        <div ref={chatContainerRef} className="flex-grow p-6 space-y-4 overflow-y-auto">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'model' && <img src={selectedCustomer.avatar} className="w-8 h-8 rounded-full" />}
                                    <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-status-blue-bg text-status-blue-text' : 'bg-success text-text-on-primary'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}{(isStreaming && index === chatHistory.length - 1) ? '▍' : ''}</p>
                                    </div>
                                </div>
                            ))}
                            {isStreaming && chatHistory.length > 0 && chatHistory[chatHistory.length -1].role === 'user' && (
                                <div className="flex items-start gap-3">
                                    <img src={selectedCustomer.avatar} className="w-8 h-8 rounded-full" />
                                    <div className="max-w-md p-3 rounded-lg bg-success text-text-on-primary">
                                        <Spinner size="sm" />
                                    </div>
                                </div>
                            )}
                            {chatError && <div className="text-text-error text-center bg-bg-error-surface p-3 rounded-lg">{chatError}</div>}
                        </div>
                        <div className="p-6 border-t border-border">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={userMessage}
                                    onChange={(e) => setUserMessage(e.target.value)}
                                    placeholder={isStreaming ? "Aguarde a resposta..." : "Faça uma pergunta..."}
                                    disabled={isStreaming}
                                    className="w-full bg-ui-sidebar-surface border border-border rounded-lg py-2 px-4 text-text-default placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-success"
                                />
                                <button type="submit" disabled={isStreaming || !userMessage.trim()} className="bg-success text-gray-900 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors">
                                    <IconPaperAirplane />
                                </button>
                            </form>
                        </div>
                     </>
                )}
            </Modal>
        </div>
    );
};

export default CustomerTable;