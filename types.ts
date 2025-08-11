import type { Chat } from '@google/genai';

export enum CustomerStatus {
    Active = 'Ativo',
    Churned = 'Cancelado',
    AtRisk = 'Em Risco',
    New = 'Novo',
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: CustomerStatus;
  totalSpend: number;
  lastSeen: string;
  joinDate: string;
}

export interface KpiData {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  statusFilter?: CustomerStatus | 'all';
}

export interface GeminiInsight {
  summary: string;
  risk_level: 'Baixo' | 'Médio' | 'Alto';
  suggested_actions: string[];
}

export interface StrategicInsight {
  trends: string[];
  recommendations: string[];
}

export interface DataHistoryItem {
  id: number;
  file: string;
  status: 'Concluído' | 'Falhou' | 'Processando';
  date: string;
  records: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type { Chat };