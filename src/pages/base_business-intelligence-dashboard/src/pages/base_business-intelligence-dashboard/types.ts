export interface FunnelData {
  stage: string;
  value: number;
  label: string;
}

export interface LeadEvolutionData {
  date: string;
  leads: number;
  conversions: number;
  cancellations: number;
}

export interface CashFlowData {
  date: string;
  dinheiro: number;
  pix: number;
  cartao: number;
  boleto: number;
}

export interface RevenueExpenseData {
    date: string;
    revenue: number;
    expenses: number;
    net: number;
}

export interface LtvData {
  tier: string;
  ltv: number;
}

export interface CheckInData {
  frequency: number;
  valuePaid: number;
}

export interface RecurrenceData {
  month: string;
  success: number;
  failed: number;
}

export interface OpenOppsByStageData {
  stage: string;
  value: number;
}

export interface OppsTimeSinceUpdateData {
  category: string;
  value: number;
}

export interface OppsByOriginData {
  origin: string;
  value: number;
}

export interface StageEntryData {
  stage: string;
  value: number;
}

export interface FunnelDropOffData {
  stage: string;
  dropped: number;
  total: number;
}

export interface CohortData {
  cohort: string;
  size: number;
  values: { month: number; percentage: number }[];
}

export interface UserPerformanceData {
  subject: string;
  [key: string]: number | string; // Allows dynamic user keys
}

export interface WeeklyActivityData {
    day: string;
    hour: number;
    value: number;
}

export interface SalesCycleBoxPlotData {
    user: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers: number[];
}

export interface ActivitiesByTypeData {
  name: string;
  value: number;
}

export interface SalesRankingData {
  user: string;
  revenue: number;
}

export interface RevenueByOriginData {
  origin: string;
  revenue: number;
}

export type DateRange = 'today' | '7d' | '30d' | '90d' | '12m' | 'all' | '1m' | '3m' | '6m';

export interface FilterState {
  dateRange: DateRange;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  group: string;
  size: number;
  productivity: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number;
  type: string;
}
