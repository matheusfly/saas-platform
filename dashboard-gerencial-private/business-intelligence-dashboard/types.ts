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


export type DateRange = '1m' | '3m' | '6m' | 'all';

export interface FilterState {
  dateRange: DateRange;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// --- New Analytics Types ---

export interface RfmData {
  customerId: number;
  customerName: string;
  recency: number; // days since last purchase
  frequency: number; // number of purchases
  monetary: number; // total amount spent
  rfmScore: number; // 1-5 score
  segment: string; // customer segment based on RFM
}

export interface ChurnRiskData {
  customerId: number;
  customerName: string;
  daysSinceLastActivity: number;
  recentActivityCount: number;
  riskScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface WinLossAnalysisData {
  userId: number;
  userName: string;
  won: number;
  lost: number;
  total: number;
  winRate: number; // percentage
  performance: 'Low' | 'Medium' | 'High';
}

export interface DealSizeDistributionData {
  min: number;
  max: number;
  average: number;
  median: number;
  distribution: number[]; // percentage distribution across 10 buckets
}

export interface RevenueForecastData {
  date: string;
  actual: number | null;
  forecast: number | null;
  lowerBound: number | null;
  upperBound: number | null;
}

export interface ExpenseBreakdownData {
  category: string;
  amount: number;
  percentage: number;
  trend: number; // percentage change from previous period
}

export interface ProductPerformanceData {
  productId: number;
  productName: string;
  revenue: number;
  quantity: number;
  profit: number;
  margin: number; // percentage
  growth: number; // percentage change from previous period
}

export interface ProductAffinityData {
  productA: string;
  productB: string;
  support: number; // percentage of transactions containing both products
  confidence: number; // probability that product B is purchased when product A is purchased
  lift: number; // how much more likely B is purchased when A is purchased
}

export interface ActivityEffectivenessData {
  activityType: string;
  count: number;
  conversionRate: number; // percentage of activities leading to next stage
  avgDaysToConvert: number;
  valueGenerated: number; // total value from converted opportunities
}

export interface ResponseTimeImpactData {
  responseTime: string; // e.g., '<1h', '1-4h', '4-24h', '>24h'
  count: number;
  conversionRate: number;
  avgDealSize: number;
  avgCycleTime: number; // days
}