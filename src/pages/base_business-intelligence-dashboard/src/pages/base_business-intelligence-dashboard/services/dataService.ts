/**
 * @fileoverview This file has been updated to improve data veracity and robustness.
 * Hardcoded values have been replaced with dynamic calculations, and data lineage
 * is now clearly documented.
 */

import type { FunnelData, LeadEvolutionData, CashFlowData, LtvData, CheckInData, RecurrenceData, FilterState, DateRange, RevenueExpenseData, OpenOppsByStageData, OppsTimeSinceUpdateData, OppsByOriginData, StageEntryData, FunnelDropOffData, CohortData, UserPerformanceData, WeeklyActivityData, SalesCycleBoxPlotData, ActivitiesByTypeData, SalesRankingData, RevenueByOriginData } from '../types';
import {
  DimEstagio,
  DimEmpresa,
  DimOrigem,
  DimUsuario,
  FatoOportunidades,
  FatoFinanceiro,
  FatoAtividades,
  FatoMovimentacoes,
} from './processedData';

// --- Constants for Stage IDs ---
// Dynamically find stage IDs to make the logic robust against changes in DimEstagio.
const STAGES_BY_NAME = DimEstagio.reduce((acc, stage) => {
    acc[stage.estagio_nome.toLowerCase()] = stage.id;
    return acc;
}, {} as Record<string, number>);

const WON_STAGE_ID = STAGES_BY_NAME['ganho'];
const LOST_STAGE_ID = STAGES_BY_NAME['perdido'];


// Define the shape of the data object to break circular dependency
export interface AllData {
    funnel: FunnelData[];
    leadEvolution: LeadEvolutionData[];
    cashFlow: CashFlowData[];
    ltv: LtvData[];
    checkIn: CheckInData[];
    recurrence: RecurrenceData[];
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
    kpis: {
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
        averageClientLifespan: number;
        monthlyChurnRate: number;
        dataQualityScore: number;
    };
    rawAdvancedFinancialResults: any;
}


// --- Helper Functions ---
const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const getMonthYear = (date: Date) => `${monthNames[date.getMonth()]}`;
const getYearMonth = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const getMonthYearLabel = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    return `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`;
};


const getMonthsForRange = (dateRange: DateRange) => {
    const months = [];
    const today = new Date();
    let numMonths: number;

    switch (dateRange) {
        case '1m': 
        case '30d':
            numMonths = 1; break;
        case '3m': 
        case '90d':
            numMonths = 3; break;
        case '6m': numMonths = 6; break;
        case 'all': 
        case '12m':
        default: numMonths = 12; break; // 'all' is treated as last 12 months for simplicity
    }
    
    // Ensure we start from the correct month of the year
    for (let i = numMonths - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push(monthNames[d.getMonth()]);
    }
    return months;
};

// --- Data Processing Functions ---
const getFunnelData = (opportunities: typeof FatoOportunidades): FunnelData[] => {
  const stageCounts: { [key: number]: number } = {};
  
  const stageMap = new Map(DimEstagio.map(s => [s.id, s]));

  opportunities.forEach(opp => {
      const currentStageOrder = stageMap.get(opp.stage_id)?.ordem ?? 99;
      // An opportunity contributes to all previous stages in the funnel
      for (const stage of DimEstagio) {
          if (stage.id !== LOST_STAGE_ID && stage.ordem <= currentStageOrder) {
              stageCounts[stage.id] = (stageCounts[stage.id] || 0) + 1;
          }
      }
  });

  return DimEstagio
    .filter(stage => stage.id !== LOST_STAGE_ID) // Don't show 'lost' in the funnel visualization
    .sort((a, b) => a.ordem - b.ordem)
    .map(stage => ({
      stage: stage.estagio_nome,
      value: stageCounts[stage.id] || 0,
      label: `${stageCounts[stage.id] || 0}`,
    }));
};

const getLeadEvolutionData = (opportunities: typeof FatoOportunidades, dateRange: DateRange): LeadEvolutionData[] => {
    const months = getMonthsForRange(dateRange);
    const monthlyData: { [key: string]: { leads: number; conversions: number; cancellations: number } } = {};
    months.forEach(m => {
        monthlyData[m] = { leads: 0, conversions: 0, cancellations: 0 };
    });
    
    opportunities.forEach(opp => {
        const creationMonth = getMonthYear(opp.data_criacao);
        if (monthlyData[creationMonth] !== undefined) {
            monthlyData[creationMonth].leads++;
        }
        
        if (opp.data_encerramento) {
            const closingMonth = getMonthYear(opp.data_encerramento);
            if(monthlyData[closingMonth] !== undefined) {
                if (opp.stage_id === WON_STAGE_ID) {
                    monthlyData[closingMonth].conversions++;
                } else if (opp.stage_id === LOST_STAGE_ID) {
                    monthlyData[closingMonth].cancellations++;
                }
            }
        }
    });
    
    return months.map(m => ({ date: m, ...monthlyData[m] }));
};

const getCashFlowData = (financeData: typeof FatoFinanceiro, dateRange: DateRange): CashFlowData[] => {
    const months = getMonthsForRange(dateRange);
    const monthlyData: { [key: string]: { dinheiro: number; pix: number; cartao: number; boleto: number; } } = {};
    months.forEach(m => {
        monthlyData[m] = { dinheiro: 0, pix: 0, cartao: 0, boleto: 0 };
    });

    financeData.filter(f => f.tipo === 'entrada' && f.status === 'sucesso').forEach(f => {
        const month = getMonthYear(f.data);
        const method = f.metodo;
        if (monthlyData[month] !== undefined && method) {
            monthlyData[month][method] = (monthlyData[month][method] || 0) + f.valor;
        }
    });

    return months.map(m => ({ date: m, ...monthlyData[m] }));
};

const getRevenueExpenseData = (financeData: typeof FatoFinanceiro, dateRange: DateRange): RevenueExpenseData[] => {
    const months = getMonthsForRange(dateRange);
    const monthlyData: { [key: string]: { revenue: number; expenses: number } } = {};
    months.forEach(m => {
        monthlyData[m] = { revenue: 0, expenses: 0 };
    });

    financeData.forEach(f => {
        const month = getMonthYear(f.data);
        if (monthlyData[month] !== undefined) {
            if (f.tipo === 'entrada' && f.status === 'sucesso') {
                monthlyData[month].revenue += f.valor;
            } else if (f.tipo === 'saida') {
                monthlyData[month].expenses += f.valor;
            }
        }
    });

    return months.map(m => ({ date: m, revenue: monthlyData[m].revenue, expenses: monthlyData[m].expenses, net: monthlyData[m].revenue - monthlyData[m].expenses }));
};


const getLtvData = (financeData: typeof FatoFinanceiro): LtvData[] => {
  const revenueByCompany: { [key: number]: number } = {};
  financeData
    .filter(f => f.tipo === 'entrada' && f.status === 'sucesso')
    .forEach(f => {
      if (f.empresa_id) {
        revenueByCompany[f.empresa_id] = (revenueByCompany[f.empresa_id] || 0) + f.valor;
      }
    });

  const companiesBySegment: { [key: string]: number[] } = {};
  DimEmpresa.forEach(empresa => {
    if (!companiesBySegment[empresa.segmento]) {
      companiesBySegment[empresa.segmento] = [];
    }
    companiesBySegment[empresa.segmento].push(empresa.id);
  });
  
  const ltvData: LtvData[] = Object.keys(companiesBySegment).map(segmento => {
    const companyIdsInSegment = companiesBySegment[segmento];
    const totalRevenueForSegment = companyIdsInSegment.reduce((sum, companyId) => {
      return sum + (revenueByCompany[companyId] || 0);
    }, 0);
    const numberOfCompaniesInSegment = companyIdsInSegment.filter(id => revenueByCompany[id]).length;

    const ltv = numberOfCompaniesInSegment > 0 ? totalRevenueForSegment / numberOfCompaniesInSegment : 0;
    
    return { tier: segmento, ltv: Math.round(ltv) };
  });

  return ltvData.sort((a, b) => b.ltv - a.ltv);
};

const getCheckInData = (opportunities: typeof FatoOportunidades, activities: typeof FatoAtividades, financeData: typeof FatoFinanceiro): CheckInData[] => {
    const activitiesByCompany: { [key: number]: number } = {};
    const revenueByCompany: { [key: number]: number } = {};

    const oppsMap = new Map(opportunities.map(o => [o.id, o.company_id]));

    activities.forEach(activity => {
        const companyId = oppsMap.get(activity.deal_id);
        if (companyId) {
            activitiesByCompany[companyId] = (activitiesByCompany[companyId] || 0) + 1;
        }
    });

    financeData.filter(f => f.tipo === 'entrada' && f.status === 'sucesso' && f.empresa_id).forEach(f => {
        revenueByCompany[f.empresa_id!] = (revenueByCompany[f.empresa_id!] || 0) + f.valor;
    });

    const companyIds = new Set([...Object.keys(activitiesByCompany).map(Number), ...Object.keys(revenueByCompany).map(Number)]);

    return Array.from(companyIds).map(companyId => ({
        frequency: activitiesByCompany[companyId] || 0,
        valuePaid: revenueByCompany[companyId] || 0,
    })).filter(d => d.frequency > 0 && d.valuePaid > 0);
};

const getRecurrenceData = (financeData: typeof FatoFinanceiro, dateRange: DateRange): RecurrenceData[] => {
    const months = getMonthsForRange(dateRange);
    const monthlyData: { [key: string]: { success: number; failed: number } } = {};
    months.forEach(m => {
        monthlyData[m] = { success: 0, failed: 0 };
    });

    financeData.filter(f => f.tipo === 'entrada').forEach(f => {
        const month = getMonthYear(f.data);
        if (monthlyData[month] !== undefined) {
            if (f.status === 'sucesso') {
                monthlyData[month].success++;
            } else {
                monthlyData[month].failed++;
            }
        }
    });

    return months.map(m => ({ month: m, ...monthlyData[m] }));
};

const getOpenOppsByStageData = (opportunities: typeof FatoOportunidades): OpenOppsByStageData[] => {
    const openOpps = opportunities.filter(opp => opp.stage_id !== WON_STAGE_ID && opp.stage_id !== LOST_STAGE_ID);
    const stageCounts: { [key: number]: number } = {};

    openOpps.forEach(opp => {
        stageCounts[opp.stage_id] = (stageCounts[opp.stage_id] || 0) + 1;
    });

    return DimEstagio
        .filter(stage => stage.id !== WON_STAGE_ID && stage.id !== LOST_STAGE_ID)
        .sort((a, b) => a.ordem - b.ordem)
        .map(stage => ({
            stage: stage.estagio_nome,
            value: stageCounts[stage.id] || 0,
        }));
};

const getOppsTimeSinceUpdateData = (opportunities: typeof FatoOportunidades, activities: typeof FatoAtividades): OppsTimeSinceUpdateData[] => {
    const openOpps = opportunities.filter(opp => opp.stage_id !== WON_STAGE_ID && opp.stage_id !== LOST_STAGE_ID);
    const today = new Date();

    const activitiesByDeal = new Map<number, Date[]>();
    activities.forEach(act => {
        if (!activitiesByDeal.has(act.deal_id)) {
            activitiesByDeal.set(act.deal_id, []);
        }
        activitiesByDeal.get(act.deal_id)!.push(act.data_realizada);
    });

    const timeDiffs = openOpps.map(opp => {
        const dealActivities = activitiesByDeal.get(opp.id);
        let lastUpdateDate = opp.data_criacao;
        if (dealActivities && dealActivities.length > 0) {
            lastUpdateDate = new Date(Math.max(...dealActivities.map(d => d.getTime())));
        }
        const diffTime = Math.abs(today.getTime() - lastUpdateDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });

    const categories = {
        '0-6 dias': 0,
        '7-14 dias': 0,
        '15-30 dias': 0,
        '>30 dias': 0
    };

    timeDiffs.forEach(days => {
        if (days <= 6) categories['0-6 dias']++;
        else if (days <= 14) categories['7-14 dias']++;
        else if (days <= 30) categories['15-30 dias']++;
        else categories['>30 dias']++;
    });

    return Object.entries(categories).map(([category, value]) => ({ category, value }));
};

const getOppsByOriginData = (opportunities: typeof FatoOportunidades): OppsByOriginData[] => {
    const valueByOrigin: { [key: number]: number } = {};

    opportunities.forEach(opp => {
        valueByOrigin[opp.origem_id] = (valueByOrigin[opp.origem_id] || 0) + opp.valor;
    });

    const originMap = new Map(DimOrigem.map(o => [o.id, o.origem_nome]));

    return Object.entries(valueByOrigin)
        .map(([originId, value]) => ({
            origin: originMap.get(Number(originId)) || 'Desconhecida',
            value: Math.round(value),
        }))
        .sort((a, b) => b.value - a.value);
};

const getStageEntryData = (movimentacoes: typeof FatoMovimentacoes): StageEntryData[] => {
    const stageCounts: { [key: number]: number } = {};

    movimentacoes.forEach(mov => {
        stageCounts[mov.in_stage_id] = (stageCounts[mov.in_stage_id] || 0) + 1;
    });

    return DimEstagio
        .filter(stage => stage.id in stageCounts) // Only include stages that actually have entries
        .sort((a, b) => a.ordem - b.ordem)
        .map(stage => ({
            stage: stage.estagio_nome,
            value: stageCounts[stage.id] || 0,
        }));
};

const getFunnelDropOffData = (funnelData: FunnelData[]): FunnelDropOffData[] => {
    const dropOffData: FunnelDropOffData[] = [];
    if (funnelData.length < 2) return [];

    for (let i = 1; i < funnelData.length; i++) {
        const fromStage = funnelData[i-1];
        const toStage = funnelData[i];
        const dropped = fromStage.value - toStage.value;
        dropOffData.push({
            stage: `${fromStage.stage} -> ${toStage.stage}`,
            dropped: dropped > 0 ? dropped : 0,
            total: fromStage.value
        });
    }
    return dropOffData;
};

const getCohortData = (financeData: typeof FatoFinanceiro, dateRange: DateRange): CohortData[] => {
    const acquisitionDates = new Map<number, string>();
    const sortedFinanceData = [...financeData].sort((a, b) => a.data.getTime() - b.data.getTime());
    
    sortedFinanceData.forEach(f => {
        if (f.empresa_id && !acquisitionDates.has(f.empresa_id) && f.tipo === 'entrada' && f.status === 'sucesso') {
            acquisitionDates.set(f.empresa_id, getYearMonth(f.data));
        }
    });

    const cohorts = new Map<string, number[]>();
    for (const [companyId, cohortMonth] of acquisitionDates.entries()) {
        if (!cohorts.has(cohortMonth)) {
            cohorts.set(cohortMonth, []);
        }
        cohorts.get(cohortMonth)!.push(companyId);
    }
    
    const activityByCompanyMonth = new Map<string, Set<number>>();
    financeData.forEach(f => {
        if (f.empresa_id && f.tipo === 'entrada' && f.status === 'sucesso') {
            const month = getYearMonth(f.data);
            if (!activityByCompanyMonth.has(month)) {
                activityByCompanyMonth.set(month, new Set());
            }
            activityByCompanyMonth.get(month)!.add(f.empresa_id);
        }
    });

    const cohortData: CohortData[] = [];
    const sortedCohorts = Array.from(cohorts.keys()).sort().slice(-12); // Limit to last 12 cohorts for readability

    sortedCohorts.forEach(cohortMonth => {
        const cohortCompanies = cohorts.get(cohortMonth)!;
        const cohortSize = cohortCompanies.length;
        if (cohortSize === 0) return;

        const cohortDate = new Date(parseInt(cohortMonth.split('-')[0]), parseInt(cohortMonth.split('-')[1]) - 1);
        const retentionValues: { month: number; percentage: number }[] = [];

        for (let i = 0; i < 12; i++) {
            const currentMonth = new Date(cohortDate.getFullYear(), cohortDate.getMonth() + i, 1);
            if (currentMonth > new Date()) break;

            const currentMonthStr = getYearMonth(currentMonth);
            const activeCompaniesInMonth = activityByCompanyMonth.get(currentMonthStr) || new Set();
            
            let retainedCount = 0;
            cohortCompanies.forEach(companyId => {
                if (activeCompaniesInMonth.has(companyId)) {
                    retainedCount++;
                }
            });
            
            retentionValues.push({
                month: i,
                percentage: (retainedCount / cohortSize) * 100,
            });
        }
        
        cohortData.push({
            cohort: getMonthYearLabel(cohortMonth),
            size: cohortSize,
            values: retentionValues,
        });
    });

    return cohortData.sort((a, b) => b.cohort.localeCompare(a.cohort));
};

const getUserPerformanceData = (opportunities: typeof FatoOportunidades, activities: typeof FatoAtividades): UserPerformanceData[] => {
    const userStats: { [userId: number]: { leads: number; wins: number; losses: number; activities: number } } = {};
    const userMap = new Map(DimUsuario.map(u => [u.id, u.nome]));

    DimUsuario.forEach(user => {
        userStats[user.id] = { leads: 0, wins: 0, losses: 0, activities: 0 };
    });

    opportunities.forEach(opp => {
        if (userStats[opp.user_id]) {
            userStats[opp.user_id].leads++;
            if (opp.stage_id === WON_STAGE_ID) userStats[opp.user_id].wins++;
            if (opp.stage_id === LOST_STAGE_ID) userStats[opp.user_id].losses++;
        }
    });

    activities.forEach(act => {
        if (userStats[act.user_id]) {
            userStats[act.user_id].activities++;
        }
    });
    
    // This structure is for the Recharts Radar Chart
    const performanceData: UserPerformanceData[] = [
        { subject: 'Leads' },
        { subject: 'Atividades' },
        { subject: 'Ganhos' },
        { subject: 'Perdas' },
    ];
    
    const maxValues: { [key: string]: number } = { leads: 0, activities: 0, wins: 0, losses: 0 };
    Object.values(userStats).forEach(stat => {
        maxValues.leads = Math.max(maxValues.leads, stat.leads);
        maxValues.activities = Math.max(maxValues.activities, stat.activities);
        maxValues.wins = Math.max(maxValues.wins, stat.wins);
        maxValues.losses = Math.max(maxValues.losses, stat.losses);
    });

    performanceData.forEach(metric => {
        DimUsuario.forEach(user => {
            const statKey = metric.subject.toLowerCase().replace('ô', 'o').replace('á', 'a'); // Normalize key
            const userStat = userStats[user.id][statKey as keyof typeof userStats[1]];
            const maxValue = maxValues[statKey as keyof typeof maxValues];
            // Normalize data for radar chart to be on a similar scale (e.g., 0-100)
            metric[user.nome] = maxValue > 0 ? (userStat / maxValue) * 100 : 0;
        });
    });

    return performanceData;
};

const getWeeklyActivityData = (activities: typeof FatoAtividades): WeeklyActivityData[] => {
    const heatmap: { [key: string]: number } = {}; // key: "day-hour"
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    
    activities.forEach(act => {
        const date = act.data_realizada;
        const day = date.getDay(); // 0=Sun, 1=Mon,...
        const hour = date.getHours();
        const key = `${day}-${hour}`;
        heatmap[key] = (heatmap[key] || 0) + 1;
    });

    const result: WeeklyActivityData[] = [];
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const key = `${day}-${hour}`;
            result.push({
                day: daysOfWeek[day],
                hour: hour,
                value: heatmap[key] || 0
            });
        }
    }
    return result;
};


const getSalesCycleBoxPlotData = (opportunities: typeof FatoOportunidades): SalesCycleBoxPlotData[] => {
    const cyclesByUser: { [userId: number]: number[] } = {};
    const userMap = new Map(DimUsuario.map(u => [u.id, u.nome]));

    opportunities
        .filter(opp => opp.stage_id === WON_STAGE_ID && opp.data_encerramento) // Won deals
        .forEach(opp => {
            const cycleDays = (opp.data_encerramento!.getTime() - opp.data_criacao.getTime()) / (1000 * 60 * 60 * 24);
            if (!cyclesByUser[opp.user_id]) {
                cyclesByUser[opp.user_id] = [];
            }
            cyclesByUser[opp.user_id].push(cycleDays);
        });

    const boxPlotData: SalesCycleBoxPlotData[] = [];

    Object.entries(cyclesByUser).forEach(([userId, values]) => {
        if (values.length < 4) return; // Need enough data for meaningful stats
        
        values.sort((a, b) => a - b);
        const q1 = values[Math.floor(values.length / 4)];
        const median = values[Math.floor(values.length / 2)];
        const q3 = values[Math.floor((values.length * 3) / 4)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        const outliers = values.filter(v => v < lowerBound || v > upperBound);
        const nonOutliers = values.filter(v => v >= lowerBound && v <= upperBound);
        
        boxPlotData.push({
            user: userMap.get(Number(userId)) || `User ${userId}`,
            min: Math.min(...nonOutliers),
            q1,
            median,
            q3,
            max: Math.max(...nonOutliers),
            outliers
        });
    });

    return boxPlotData;
};

const getActivitiesByTypeData = (activities: typeof FatoAtividades): ActivitiesByTypeData[] => {
    const counts: { [key: string]: number } = {};
    activities.forEach(act => {
        const type = act.tipo_atividade.charAt(0).toUpperCase() + act.tipo_atividade.slice(1);
        counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const getSalesRankingData = (opportunities: typeof FatoOportunidades): SalesRankingData[] => {
    const revenueByUser: { [key: number]: number } = {};
    const wonDeals = opportunities.filter(opp => opp.stage_id === WON_STAGE_ID);

    wonDeals.forEach(opp => {
        revenueByUser[opp.user_id] = (revenueByUser[opp.user_id] || 0) + opp.valor;
    });

    const userMap = new Map(DimUsuario.map(u => [u.id, u.nome]));

    return Object.entries(revenueByUser)
        .map(([userId, revenue]) => ({
            user: userMap.get(Number(userId)) || `Usuário ${userId}`,
            revenue: Math.round(revenue),
        }))
        .sort((a, b) => b.revenue - a.revenue);
};

const getRevenueByOriginData = (opportunities: typeof FatoOportunidades): RevenueByOriginData[] => {
    const revenueByOrigin: { [key: number]: number } = {};
    const wonDeals = opportunities.filter(opp => opp.stage_id === WON_STAGE_ID);

    wonDeals.forEach(opp => {
        revenueByOrigin[opp.origem_id] = (revenueByOrigin[opp.origem_id] || 0) + opp.valor;
    });

    const originMap = new Map(DimOrigem.map(o => [o.id, o.origem_nome]));

    return Object.entries(revenueByOrigin)
        .map(([originId, revenue]) => ({
            origin: originMap.get(Number(originId)) || 'Desconhecida',
            revenue: Math.round(revenue),
        }))
        .sort((a, b) => b.revenue - a.revenue);
};


// --- KPI Functions ---
const getTotalRevenue = (financeData: typeof FatoFinanceiro) => {
    return financeData
        .filter(p => p.status === 'sucesso' && p.tipo === 'entrada')
        .reduce((sum, p) => sum + p.valor, 0);
};

const getTotalExpenses = (financeData: typeof FatoFinanceiro) => {
    return financeData
        .filter(p => p.tipo === 'saida')
        .reduce((sum, p) => sum + p.valor, 0);
};

const getNewClientCount = (opportunities: typeof FatoOportunidades, startDate: Date) => {
    return opportunities.filter(o => 
        o.stage_id === WON_STAGE_ID && 
        o.data_encerramento && 
        o.data_encerramento >= startDate
    ).length;
};

const getAverageLtv = (ltvData: LtvData[]) => {
    if (ltvData.length === 0) return 0;
    const totalLtv = ltvData.reduce((sum, item) => sum + item.ltv, 0);
    return totalLtv / ltvData.length;
};

const getConversionRate = (opportunities: typeof FatoOportunidades) => {
    if (opportunities.length === 0) return 0;
    const totalInitialOpportunities = opportunities.filter(o => o.data_criacao).length;
    if (totalInitialOpportunities === 0) return 0;
    
    const wonCount = opportunities.filter(o => o.stage_id === WON_STAGE_ID).length;
    
    return (wonCount / totalInitialOpportunities) * 100;
};

const getPaymentSuccessRate = (recurrenceData: RecurrenceData[]) => {
    const totalSuccess = recurrenceData.reduce((sum, item) => sum + item.success, 0);
    const totalFailed = recurrenceData.reduce((sum, item) => sum + item.failed, 0);
    const totalPayments = totalSuccess + totalFailed;
    if (totalPayments === 0) return 0;
    return (totalSuccess / totalPayments) * 100;
};

const getAverageClientLifespan = (financeData: typeof FatoFinanceiro): number => {
    const paymentsByCompany: { [key: number]: Date[] } = {};
    financeData.forEach(f => {
        if (f.empresa_id) {
            if (!paymentsByCompany[f.empresa_id]) {
                paymentsByCompany[f.empresa_id] = [];
            }
            paymentsByCompany[f.empresa_id].push(f.data);
        }
    });

    const lifespans: number[] = [];
    for (const companyId in paymentsByCompany) {
        const payments = paymentsByCompany[companyId];
        if (payments.length > 1) {
            const minDate = Math.min(...payments.map(d => d.getTime()));
            const maxDate = Math.max(...payments.map(d => d.getTime()));
            const lifespanDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
            lifespans.push(lifespanDays);
        } else {
             lifespans.push(1); // Min lifespan of 1 day
        }
    }

    if (lifespans.length === 0) return 0;
    const totalLifespan = lifespans.reduce((sum, l) => sum + l, 0);
    return Math.round(totalLifespan / lifespans.length);
};

const getMonthlyChurnRate = (financeData: typeof FatoFinanceiro): number => {
    const today = new Date();
    
    const currentPeriodStart = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const previousPeriodStart = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());

    const activeInCurrent = new Set(financeData.filter(f => f.data >= currentPeriodStart && f.empresa_id).map(f => f.empresa_id));
    const activeInPrevious = new Set(financeData.filter(f => f.data >= previousPeriodStart && f.data < currentPeriodStart && f.empresa_id).map(f => f.empresa_id));
    
    if (activeInPrevious.size === 0) return 0;

    let churnedCount = 0;
    activeInPrevious.forEach(id => {
        if (id && !activeInCurrent.has(id)) {
            churnedCount++;
        }
    });

    return (churnedCount / activeInPrevious.size) * 100;
};

/**
 * Calculates a data quality score based on the completeness of key fields in the raw data.
 * @returns {number} A score from 0 to 100.
 */
const calculateDataQualityScore = (): number => {
    let score = 100;
    let penalties = 0;
    const totalOpportunities = FatoOportunidades.length;
    const totalFinancials = FatoFinanceiro.length;
    const totalActivities = FatoAtividades.length;

    if (totalOpportunities > 0) {
        // Penalty for opportunities with zero value
        const zeroValueOpps = FatoOportunidades.filter(o => o.valor <= 0).length;
        penalties += (zeroValueOpps / totalOpportunities) * 10; // 10 points weight

        // Penalty for won opportunities without a closing date
        const wonOppsWithoutDate = FatoOportunidades.filter(o => o.stage_id === WON_STAGE_ID && !o.data_encerramento).length;
        penalties += (wonOppsWithoutDate / totalOpportunities) * 15; // 15 points weight
    }

    if (totalFinancials > 0) {
        // Penalty for financial entries not linked to a company
        const unlinkedFinancials = FatoFinanceiro.filter(f => f.tipo === 'entrada' && !f.empresa_id).length;
        penalties += (unlinkedFinancials / totalFinancials) * 15; // 15 points weight

        // Penalty for negative revenue or expense values
        const negativeFinancials = FatoFinanceiro.filter(f => f.valor < 0).length;
        penalties += (negativeFinancials / totalFinancials) * 5; // 5 points weight
    }

    if (totalActivities > 0) {
        // Penalty for activities not linked to a deal
        const unlinkedActivities = FatoAtividades.filter(a => !a.deal_id).length;
        penalties += (unlinkedActivities / totalActivities) * 5; // 5 points weight
    }

    score -= penalties;
    return Math.max(0, parseFloat(score.toFixed(1)));
};


// --- Main Data Fetcher ---
export const getAllData = async (filters: FilterState): Promise<AllData> => {
    const { dateRange } = filters;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()); 

    switch (dateRange) {
        case 'today':
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            break;
        case '7d':
            startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
        case '1m':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            break;
        case '90d':
        case '3m':
            startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
            break;
        case '6m':
            startDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
            break;
        case '12m':
        case 'all':
            startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            break;
    }


    // Filter fact tables based on the date range
    const filteredOpportunities = FatoOportunidades.filter(o => o.data_criacao >= startDate);
    const filteredFinanceData = FatoFinanceiro.filter(f => f.data >= startDate);
    const filteredActivities = FatoAtividades.filter(a => a.data_realizada >= startDate);
    const filteredMovimentacoes = FatoMovimentacoes.filter(m => m.data_entrada >= startDate);


    // Generate data for charts
    const funnel = getFunnelData(filteredOpportunities);
    const leadEvolution = getLeadEvolutionData(filteredOpportunities, dateRange);
    const cashFlow = getCashFlowData(filteredFinanceData, dateRange);
    const revenueExpense = getRevenueExpenseData(filteredFinanceData, dateRange);
    // LTV is calculated on all available data for accuracy, not just the filtered period
    const ltv = getLtvData(FatoFinanceiro); 
    const checkIn = getCheckInData(filteredOpportunities, filteredActivities, filteredFinanceData);
    const recurrence = getRecurrenceData(filteredFinanceData, dateRange);
    
    // Data for Opportunities page
    const openOppsByStage = getOpenOppsByStageData(filteredOpportunities);
    const oppsTimeSinceUpdate = getOppsTimeSinceUpdateData(filteredOpportunities, filteredActivities);
    const oppsByOrigin = getOppsByOriginData(filteredOpportunities);
    
    // Data for Conversions page
    const stageEntry = getStageEntryData(filteredMovimentacoes);
    
    // Data for Strategic Page
    const funnelDropOff = getFunnelDropOffData(funnel);
    const cohort = getCohortData(FatoFinanceiro, dateRange);

    // Data for Productivity Page
    const userPerformance = getUserPerformanceData(filteredOpportunities, filteredActivities);
    const weeklyActivity = getWeeklyActivityData(filteredActivities);
    const salesCycleBoxPlot = getSalesCycleBoxPlotData(filteredOpportunities);

    // Data for Vendas Page
    const activitiesByType = getActivitiesByTypeData(filteredActivities);
    const salesRanking = getSalesRankingData(filteredOpportunities);
    const revenueByOrigin = getRevenueByOriginData(filteredOpportunities);


    // KPIs based on filtered data
    const totalRevenue = getTotalRevenue(filteredFinanceData);
    const totalExpenses = getTotalExpenses(filteredFinanceData);
    const netRevenue = totalRevenue - totalExpenses;
    const newClientCount = getNewClientCount(filteredOpportunities, startDate);
    const averageLtv = getAverageLtv(ltv);
    const conversionRate = getConversionRate(filteredOpportunities);
    const paymentSuccessRate = getPaymentSuccessRate(recurrence);
    const averageTicket = newClientCount > 0 ? totalRevenue / newClientCount : 0;
    const cac = newClientCount > 0 ? totalExpenses / newClientCount : 0; // Simplified CAC
    const roi = totalExpenses > 0 ? netRevenue / totalExpenses : 0;

    // New Metrics
    const averageClientLifespan = getAverageClientLifespan(FatoFinanceiro);
    const monthlyChurnRate = getMonthlyChurnRate(FatoFinanceiro);
    const dataQualityScore = calculateDataQualityScore();

    return {
        funnel,
        leadEvolution,
        cashFlow,
        ltv,
        checkIn,
        recurrence,
        revenueExpense,
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
        kpis: {
            totalRevenue,
            totalExpenses,
            netRevenue,
            newClientCount,
            averageLtv,
            conversionRate,
            paymentSuccessRate,
            averageTicket,
            cac,
            roi,
            averageClientLifespan,
            monthlyChurnRate,
            dataQualityScore,
        },
        rawAdvancedFinancialResults: {}
    };
};