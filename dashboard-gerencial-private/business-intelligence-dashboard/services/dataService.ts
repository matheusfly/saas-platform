// Import data from processedData
import {
  FatoOportunidades,
  FatoFinanceiro,
  FatoAtividades,
  FatoMovimentacoes,
  DimUsuario,
  DimPessoa,
  DimEstagio,
  DimOrigem
} from './processedData';

// Define core types and interfaces
interface DateRange {
  start: Date;
  end: Date;
}

type DateRangeString = '1m' | '3m' | '6m' | 'all';
type DateRangeInput = DateRange | DateRangeString;

interface FilterState {
  dateRange: DateRangeInput;
}

// Main data type for the dashboard
export type AllData = {
  dateRange: DateRangeInput;
  revenueExpense: RevenueExpenseData[];
  openOppsByStage: OpenOppsByStageData[];
  oppsTimeSinceUpdate: OppsTimeSinceUpdateData[];
  oppsByOrigin: OppsByOriginData[];
  stageEntry: StageEntryData[];
  funnelDropOff: FunnelDropOffData[];
  cohort: CohortData[];
  userPerformance: UserPerformanceData[];
  weeklyActivity: WeeklyActivityData[];
  salesCycleBoxPlot: SalesCycleBoxPlotData[];
  activitiesByType: ActivitiesByTypeData[];
  salesRanking: SalesRankingData[];
  revenueByOrigin: RevenueByOriginData[];
  rfmData: RfmData[];
  churnRisk: ChurnRiskData[];
  productPerformance: ProductPerformanceData[];
  activityEffectiveness: ActivityEffectivenessData[];
  responseTimeImpact: ResponseTimeImpactData;
  dealSizeDistribution: DealSizeDistributionData[];
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    netRevenue: number;
    newClientCount: number;
    averageLtv: number;
    conversionRate: number;
    paymentSuccessRate: number;
    averageTicket: number;
    cac: number;
    roi: number;
    monthlyChurnRate: number;
    dataQualityScore: number;
    totalOpportunities: number;
    openOpportunities: number;
    wonOpportunities: number;
    lostOpportunities: number;
  };
  rawData: {
    opportunities: any[];
    financials: any[];
    activities: any[];
  };
  lastUpdated: string;
};

// Core data interfaces
type Trend = 'up' | 'down' | 'stable';

interface FunnelData {
  stage: string;
  value: number;
  label: string;
  percentage: number;
  avgDealSize?: number;
  count?: number;
  avgDaysToConvert?: number;
}

interface LeadEvolutionData {
  date: string;
  leads: number;
  converted: number;
  conversionRate: number;
}

interface CashFlowData {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

interface CheckInData {
  frequency: number;
  valuePaid: number;
}

interface RecurrenceData {
  rate: number;
  trend: number;
}

interface RevenueExpenseData {
  revenue: number;
  expenses: number;
  profit: number;
  net?: number; // Alias for profit
  date: string | Date;
}

interface OpenOppsByStageData {
  stage: string;
  count: number;
  value: number;
}

interface OppsTimeSinceUpdateData {
  days: number;
  count: number;
  value: number;
}

interface OppsByOriginData {
  origin: string;
  count: number;
  value: number;
}

interface StageEntryData {
  stage: string;
  count: number;
  avgDays: number;
}

interface FunnelDropOffData {
  fromStage: string;
  toStage: string;
  count: number;
  percentage: number;
}

interface CohortData {
  cohort: string;
  period: string;
  value: number;
  percentage: number;
  count: number;
  lastUpdated: string;
}

interface UserPerformanceData {
  userId: number;
  userName: string;
  dealsWon: number;
  dealsLost: number;
  revenue: number;
  avgDealSize: number;
  subject?: string; // For backward compatibility
  opportunities?: number;
  totalValue?: number;
  totalWonValue?: number;
}

interface WeeklyActivityData {
  week: string;
  activities: number;
  meetings: number;
  calls: number;
  emails: number;
  day?: string; // For backward compatibility
}

interface SalesCycleBoxPlotData {
  stage: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  user?: string; // For backward compatibility
}

interface ActivitiesByTypeData {
  type: string;
  count: number;
  conversionRate: number;
  name?: string; // For backward compatibility
}

interface SalesRankingData {
  userId: number;
  userName: string;
  revenue: number;
  deals: number;
  avgDealSize: number;
}

interface RevenueByOriginData {
  origin: string;
  revenue: number;
  percentage: number;
}

interface RfmData {
  recency: number;
  frequency: number;
  monetary: number;
  score: string;
  customerCount: number;
  customerId?: number; // For backward compatibility
}

interface ChurnRiskData {
  customerId: number;
  customerName: string;
  riskScore: number;
  lastActivity: string;
  daysInactive: number;
  daysSinceLastActivity?: number; // Alias for daysInactive
}

interface WinLossAnalysisData {
  reason: string;
  count: number;
  percentage: number;
}

interface DealSizeDistributionData {
  range: string;
  count: number;
  percentage: number;
  totalValue: number;
  min: number;
  max: number;
  average: number;
  total: number;
  userId?: number;
  userName?: string;
  opportunities?: number;
  won?: number;
  lost?: number;
  avgDealSize?: number;
  winRate?: number;
  type?: string;
  customerId?: number;
  customerName?: string;
}

type RevenueForecastData = {
  date: Date;
  month: string;
  forecastedRevenue: number;
  confidenceRange: [number, number];
};

type ExpenseBreakdownData = {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
};

interface ProductPerformanceData {
  productId: number;
  product: string;
  revenue: number;
  quantity: number;
  profitMargin: number;
  growth?: number; // Added as optional for backward compatibility
}

type ProductAffinityData = {
  productA: string;
  productB: string;
  confidence: number;
  support: number;
  lift: number;
};

type ActivityEffectivenessData = {
  activityType: string;
  conversionRate: number;
  avgDealSize: number;
  count: number;
  avgDaysToConvert: number;
};

interface ResponseTimeImpactData {
  responseTimeBrackets: Array<{
    range: string;
    count: number;
    conversionRate: number;
  }>;
  averageResponseTime: number;
  conversionRateByHour: Array<{
    hour: number;
    conversionRate: number;
  }>;
  responseTimeByStage: Array<{
    stage: string;
    avgResponseTime: number;
    count: number;
  }>;
  avgCycleTime: number;
}

// --- Helper Functions ---
const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

// Helper function to parse date range
const parseDateRange = (range: DateRangeInput): DateRange => {
  const end = new Date();
  const start = new Date();
  
  if (typeof range === 'string') {
    switch (range) {
      case '1m': start.setMonth(end.getMonth() - 1); break;
      case '3m': start.setMonth(end.getMonth() - 3); break;
      case '6m': start.setMonth(end.getMonth() - 6); break;
      case 'all': start.setFullYear(2000); break; // Arbitrary old date
    }
    return { start, end };
  }
  return range;
};

// Helper function to get month year label
const getMonthYearLabel = (date: Date): string => {
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  return `${month} '${year}`;
};

// Helper function to get months for a date range
const getMonthsForRange = (range: DateRangeInput): string[] => {
  const { start, end } = parseDateRange(range);
  const months: string[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    months.push(getMonthYearLabel(current));
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
};

// Helper function to generate revenue/expense data
const getRevenueExpenseData = (start: Date, end: Date): RevenueExpenseData[] => {
  const months = getMonthsForRange({ start, end });
  const monthlyData: { [key: string]: { revenue: number; expenses: number } } = {};
  
  // Process financial data for each month in range
  FatoFinanceiro.forEach(item => {
    const date = new Date(item.data);
    const monthKey = getMonthYearLabel(date);
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, expenses: 0 };
    }
    
    if (item.tipo === 'entrada') {
      monthlyData[monthKey].revenue += item.valor || 0;
    } else {
      monthlyData[monthKey].expenses += item.valor || 0;
    }
  });
  
  return months.map(month => ({
    date: month,
    revenue: monthlyData[month]?.revenue || 0,
    expenses: monthlyData[month]?.expenses || 0,
    profit: (monthlyData[month]?.revenue || 0) - (monthlyData[month]?.expenses || 0)
  }));
};

// Stub implementations for data functions
export const getFunnelDropOffData = (start: Date, end: Date): FunnelDropOffData[] => [];
export const getCohortData = (start: Date, end: Date): CohortData[] => [];
export const getOpenOppsByStageData = (start: Date, end: Date): OpenOppsByStageData[] => [];
export const getOppsTimeSinceUpdateData = (start: Date, end: Date): OppsTimeSinceUpdateData[] => [];
export const getOppsByOriginData = (start: Date, end: Date): OppsByOriginData[] => [];
export const getStageEntryData = (start: Date, end: Date): StageEntryData[] => [];
export const getUserPerformanceData = (start: Date, end: Date): UserPerformanceData[] => [];
export const getSalesCycleBoxPlotData = (start: Date, end: Date): SalesCycleBoxPlotData[] => [];
export const getActivitiesByTypeData = (start: Date, end: Date): ActivitiesByTypeData[] => [];
export const getSalesRankingData = (start: Date, end: Date): SalesRankingData[] => [];
export const getRevenueByOriginData = (start: Date, end: Date): RevenueByOriginData[] => [];
export const getRfmData = (start: Date, end: Date): RfmData[] => [];
export const getChurnRiskData = (start: Date, end: Date): ChurnRiskData[] => [];
export const getProductPerformanceData = (start: Date, end: Date): ProductPerformanceData[] => [];
export const getActivityEffectivenessData = (start: Date, end: Date): ActivityEffectivenessData[] => [];
export const getWeeklyActivityData = (start: Date, end: Date): WeeklyActivityData[] => [];

export const getResponseTimeImpactData = (start: Date, end: Date): ResponseTimeImpactData => ({
  responseTimeBrackets: [
    { range: '0-1h', count: 120, conversionRate: 45 },
    { range: '1-4h', count: 85, conversionRate: 32 },
    { range: '4-24h', count: 45, conversionRate: 18 },
    { range: '24h+', count: 22, conversionRate: 5 }
  ],
  averageResponseTime: 3.2,
  conversionRateByHour: Array(24).fill(0).map((_, i) => ({
    hour: i,
    conversionRate: Math.floor(Math.random() * 30) + 10
  })),
  responseTimeByStage: (DimEstagio || []).map(stage => ({
    stage: stage.estagio_nome,
    avgResponseTime: Math.floor(Math.random() * 12) + 1,
    count: Math.floor(Math.random() * 50) + 10
  })),
  avgCycleTime: 12.8
});

export const getDealSizeDistributionData = (start: Date, end: Date): DealSizeDistributionData[] => {
  const sizeRanges = [
    { min: 0, max: 1000, label: '0-1K' },
    { min: 1001, max: 5000, label: '1K-5K' },
    { min: 5001, max: 10000, label: '5K-10K' },
    { min: 10001, max: 50000, label: '10K-50K' },
    { min: 50001, max: 100000, label: '50K-100K' },
    { min: 100001, max: 500000, label: '100K-500K' },
    { min: 500001, max: 1000000, label: '500K-1M' },
    { min: 1000001, max: 5000000, label: '1M-5M' },
    { min: 5000001, max: 10000000, label: '5M-10M' },
    { min: 10000001, max: 100000000, label: '10M+' }
  ];

  return sizeRanges.map(range => ({
    range: range.label,
    count: 0,
    percentage: 0,
    totalValue: 0,
    min: range.min,
    max: range.max,
    average: 0,
    total: 0,
    won: 0,
    lost: 0,
    winRate: 0,
    avgDealSize: 0
  }));
};

export const getAllData = (dateRange: DateRangeInput = '3m'): AllData => {
  const { start, end } = parseDateRange(dateRange);
  const customers = DimPessoa || [];
  
  // ... (rest of the code remains the same)

  // Calculate metrics
  const totalOpportunities = FatoOportunidades.length;
  const openOpportunities = FatoOportunidades.filter(opp => !opp.data_encerramento).length;
  const wonOpportunities = FatoOportunidades.filter(opp => opp.stage_id === 5).length;
  const lostOpportunities = FatoOportunidades.filter(opp => opp.stage_id === 6).length;
  
  // Calculate average LTV
  const totalLtv = customers.reduce((sum, customer) => sum + ((customer as any).ltv || 0), 0);
  const averageLtv = customers.length > 0 ? totalLtv / customers.length : 0;
  
  // Calculate metrics
  const totalRevenue = FatoFinanceiro.reduce((sum, item) => sum + (item.valor || 0), 0);
  const totalExpenses = FatoFinanceiro.reduce((sum, item) => sum + (item.tipo === 'saida' ? (item.valor || 0) : 0), 0);
  const netRevenue = totalRevenue - totalExpenses;

  // Generate revenue/expense data
  const revenueExpenseData: RevenueExpenseData[] = getRevenueExpenseData(start, end);

  // Get deal size distribution data
  const dealSizeData = getDealSizeDistributionData(start, end);
  
  // Get all data with proper typing
  const openOppsByStage = getOpenOppsByStageData(start, end);
  const oppsTimeSinceUpdate = getOppsTimeSinceUpdateData(start, end);
  const oppsByOrigin = getOppsByOriginData(start, end);
  const stageEntry = getStageEntryData(start, end);
  const funnelDropOff = getFunnelDropOffData(start, end);
  const cohort = getCohortData(start, end);
  const userPerformance = getUserPerformanceData(start, end);
  const weeklyActivity = getWeeklyActivityData(start, end);
  const salesCycleBoxPlot = getSalesCycleBoxPlotData(start, end);
  const activitiesByType = getActivitiesByTypeData(start, end);
  const salesRanking = getSalesRankingData(start, end);
  const revenueByOrigin = getRevenueByOriginData(start, end);
  const rfmData = getRfmData(start, end);
  const churnRisk = getChurnRiskData(start, end);
  const productPerformance = getProductPerformanceData(start, end);
  const activityEffectiveness = getActivityEffectivenessData(start, end);
  const responseTimeImpact = getResponseTimeImpactData(start, end);

  return {
    dateRange,
    revenueExpense: revenueExpenseData,
    openOppsByStage,
    oppsTimeSinceUpdate,
    oppsByOrigin,
    stageEntry,
    funnelDropOff,
    cohort,
    userPerformance,
    weeklyActivity,
    salesCycleBoxPlot,
    activitiesByType,
    salesRanking,
    revenueByOrigin,
    rfmData,
    churnRisk,
    productPerformance,
    activityEffectiveness,
    responseTimeImpact,
    dealSizeDistribution: dealSizeData,
    metrics: {
      totalRevenue,
      totalExpenses,
      netRevenue,
      newClientCount: customers.filter((c: any) => {
        const created = new Date((c as any).data_criacao || 0);
        const now = new Date();
        const diffMonths = (now.getFullYear() - created.getFullYear()) * 12 + now.getMonth() - created.getMonth();
        return diffMonths <= 3; // New clients in last 3 months
      }).length,
      averageLtv: parseFloat(averageLtv.toFixed(2)),
      conversionRate: totalOpportunities > 0 ? (wonOpportunities / totalOpportunities) * 100 : 0,
      paymentSuccessRate: 95, // Placeholder
      averageTicket: totalOpportunities > 0 ? totalRevenue / totalOpportunities : 0,
      cac: 500, // Placeholder
      roi: netRevenue > 0 ? (netRevenue / totalExpenses) * 100 : 0,
      monthlyChurnRate: 2.5, // Placeholder
      dataQualityScore: 98, // Placeholder
      totalOpportunities,
      openOpportunities,
      wonOpportunities,
      lostOpportunities
    },
    rawData: {
      opportunities: FatoOportunidades,
      financials: FatoFinanceiro,
      activities: FatoAtividades
    },
    lastUpdated: new Date().toISOString()
  };
};

// All functions are exported at their declaration
// This ensures clean and maintainable code