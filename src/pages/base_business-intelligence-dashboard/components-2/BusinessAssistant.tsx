import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from '../types';
import type { AllData } from '../services/dataService';

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex ${isModel ? 'justify-start' : 'justify-end'} mb-4`}>
            <div 
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow ${isModel ? 'bg-primary-bg/50 text-text-main' : 'bg-accent-primary text-text-on-accent'}`}
                style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            >
                {message.content}
            </div>
        </div>
    );
};

const SuggestionButton: React.FC<{ text: string; onClick: (text: string) => void, disabled: boolean }> = ({ text, onClick, disabled }) => (
    <button
        onClick={() => onClick(text)}
        disabled={disabled}
        className="px-3 py-1.5 bg-primary-bg/50 text-text-main rounded-full text-sm hover:bg-brand-border transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
    >
        {text}
    </button>
);

interface BusinessAssistantProps {
  data: AllData;
}

const BusinessAssistant: React.FC<BusinessAssistantProps> = ({ data }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
      { role: 'model', content: 'Olá! Sou seu assistente de negócios. Pergunte-me sobre tendências, LTV, conversões e mais.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatInstance = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const simplifiedData = useMemo(() => {
      const { kpis, ...chartData } = data;
      return {
          keyMetrics: kpis,
          charts: {
            funnel: chartData.funnel.map(d => ({ stage: d.stage, value: d.value })),
            leadEvolution: chartData.leadEvolution,
            cashFlow: chartData.cashFlow,
            customerLTV: chartData.ltv,
            paymentRecurrence: chartData.recurrence,
          }
      }
  }, [data]);

  useEffect(() => {
    if (!process.env.API_KEY) {
        console.error("API key not found.");
        return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatInstance.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are a helpful and sharp business analyst for a fitness company called 'Calistenia & Escalada'. Your goal is to answer questions based on the provided JSON data. Be concise and clear in your answers. Use the data to support your claims. The data represents the current filtered view on the user's dashboard. All your responses must be in Portuguese (Brazil). Here is the data you must use for your analysis: ${JSON.stringify(simplifiedData)}`,
      }
    });
  }, [simplifiedData]);

  useEffect(() => {
    if(!isCollapsed) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isCollapsed]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatInstance.current) {
        throw new Error("Chat not initialized.");
      }
      
      const stream = await chatInstance.current.sendMessageStream({
          message: `Considerando os dados já fornecidos, responda: ${messageText}`
      });
      
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = modelResponse;
            return newMessages;
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = { role: 'model', content: "Desculpe, ocorreu um erro ao processar sua solicitação." };
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1].content === '') {
          newMessages[newMessages.length - 1] = errorMessage;
        } else {
          newMessages.push(errorMessage);
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };
  
  const handleSuggestionClick = (text: string) => {
      sendMessage(text);
  };
  
  const suggestions = ["Qual o LTV médio?", "Compare leads e conversões.", "Resuma o fluxo de caixa."];

  return (
    <div 
      className="p-4 rounded-lg shadow-lg bg-surface-card flex flex-col transition-all duration-300"
    >
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        aria-controls="assistant-content"
      >
        <h3 className="text-lg font-semibold text-text-main">Assistente de Negócio</h3>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-text-muted transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div 
        id="assistant-content"
        className={`flex flex-col flex-grow transition-all duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100 mt-4'}`}
      >
        <p className="text-sm text-text-muted mb-4">Perguntas comuns para analisar tendências</p>
        
        <div className="flex-grow p-2 -m-2 mb-4 overflow-y-auto" style={{minHeight: '300px'}}>
            {messages.map((msg, index) => <MessageBubble key={index} message={msg} />)}
            {isLoading && messages[messages.length-1].role !== 'model' && (
                <div className="flex justify-start mb-4">
                    <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-primary-bg/50 text-text-main shadow">
                    <div className="flex items-center space-x-2">
                        <div className="dot-pulse"></div>
                        <div className="dot-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="dot-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
                {suggestions.map(text => 
                <SuggestionButton key={text} text={text} onClick={handleSuggestionClick} disabled={isLoading} />
                )}
            </div>
        )}

        <form onSubmit={handleFormSubmit} className="pt-2 border-t border-brand-border">
            <div className="flex items-center bg-primary-bg/40 rounded-lg">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre os dados..."
                className="w-full bg-transparent p-3 text-text-main focus:outline-none placeholder:text-text-muted"
                aria-label="Sua mensagem"
                disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="p-3 text-accent-secondary disabled:text-text-muted disabled:cursor-not-allowed transition-colors" aria-label="Enviar mensagem">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
            </div>
        </form>
      </div>
       <style>{`
          .dot-pulse {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #858360;
            animation: dot-pulse-animation 1.2s infinite ease-in-out;
          }
          @keyframes dot-pulse-animation {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1.0);
            }
          }
        `}</style>
    </div>
  );
};

export default BusinessAssistant;
