import pandas as pd
import numpy as np
import re
from io import StringIO
from collections import Counter

# 1. Client Overview Functions
def client_status_distribution(df):
    if 'Status Cliente' not in df.columns: return {}
    status_counts = df['Status Cliente'].value_counts()
    status_pct = (status_counts / len(df)) * 100
    return {'counts': status_counts.to_dict(), 'percentages': {k: round(v, 2) for k, v in status_pct.to_dict().items()}, 'total_clients': len(df)}

def new_client_trend(df, period='M'):
    if 'Início' not in df.columns: return pd.Series(dtype='int64')
    df_copy = df.copy()
    df_copy['Início'] = pd.to_datetime(df_copy['Início'], errors='coerce')
    return df_copy.set_index('Início').resample(period).size()

# 2. Revenue Analysis Functions
def revenue_analysis(df):
    if 'Valor' not in df.columns: return {}
    df['Valor_Num'] = pd.to_numeric(df['Valor'].astype(str).str.replace('.', '', regex=False).str.replace(',', '.', regex=False), errors='coerce').fillna(0)
    total_revenue = df['Valor_Num'].sum()
    avg_contract_value = df['Valor_Num'].mean()
    median_contract_value = df['Valor_Num'].median()
    revenue_by_contract = df.groupby('Contrato')['Valor_Num'].agg(['sum', 'mean', 'count']) if 'Contrato' in df.columns else pd.DataFrame()
    revenue_by_month = df.groupby(pd.Grouper(key='Início', freq='ME'))['Valor_Num'].sum() if 'Início' in df.columns else pd.Series(dtype='float64')
    return {'total_revenue': round(total_revenue, 2), 'average_contract_value': round(avg_contract_value, 2), 'median_contract_value': round(median_contract_value, 2), 'revenue_by_contract': revenue_by_contract.round(2).to_dict('index'), 'revenue_trend': {k.strftime('%Y-%m'): v for k, v in revenue_by_month.round(2).to_dict().items()}}

# 3. Contract Analysis Functions
def determine_optimal_duration_range(retention_data):
    retention_list = [(str(k), v) for k, v in retention_data.items()]
    if not retention_list: return {}
    best_range = max(retention_list, key=lambda x: x[1])
    peak_index = [i for i, (k, v) in enumerate(retention_list) if k == best_range[0]][0]
    significant_drop = False
    if peak_index < len(retention_list) - 1:
        next_range_retention = retention_list[peak_index + 1][1]
        drop_percentage = (best_range[1] - next_range_retention) / best_range[1]
        significant_drop = drop_percentage > 0.15
    return {'recommended_duration': best_range[0], 'retention_rate': round(best_range[1] * 100, 2), 'has_significant_drop': significant_drop, 'analysis_note': "Consider offering contracts in this duration range as primary option" if not significant_drop else "Strong peak detected - consider making this duration a standard option with limited longer options"}

def contract_duration_analysis(df):
    df = df.copy()
    df['Início'] = pd.to_datetime(df['Início'])
    df['Vencimento'] = pd.to_datetime(df['Vencimento'])
    df['duration_days'] = (df['Vencimento'] - df['Início']).dt.days
    duration_by_type = df.groupby('Contrato').agg(avg_duration=('duration_days', 'mean'), median_duration=('duration_days', 'median'), std_duration=('duration_days', 'std'), client_count=('Código', 'count'))
    df['is_retained'] = df['Status Cliente'].isin(['Bloqueado', 'Ativo'])
    retention_by_duration = df.groupby(pd.cut(df['duration_days'], bins=[0, 30, 60, 90, 180, 365, 730]))['is_retained'].mean()
    duration_distribution = pd.cut(df['duration_days'], bins=[0, 30, 60, 90, 180, 365, 730, 1095, 10000], labels=['<1m', '1-2m', '2-3m', '3-6m', '6-12m', '1-2y', '2-3y', '3+y']).value_counts().sort_index()
    return {'duration_by_contract_type': duration_by_type.round(1).to_dict(), 'retention_by_duration': {str(k): round(v * 100, 2) for k, v in retention_by_duration.items()}, 'duration_distribution': duration_distribution.to_dict(), 'optimal_duration_range': determine_optimal_duration_range(retention_by_duration)}

# 4. Acquisition Channel Value Analysis Functions
def generate_channel_strategy(channel_metrics):
    if 'GYMPASS' not in channel_metrics.index or 'Direct Sale' not in channel_metrics.index: return "Insufficient channel data to generate comprehensive strategy"
    gympass_clv, direct_clv, gympass_retention, direct_retention = channel_metrics.loc['GYMPASS', 'estimated_clv'], channel_metrics.loc['Direct Sale', 'estimated_clv'], channel_metrics.loc['GYMPASS', 'retention_rate'], channel_metrics.loc['Direct Sale', 'retention_rate']
    recommendations = []
    if direct_clv / gympass_clv > 2.0: recommendations.append("Direct sales CLV is more than double GYMPASS CLV - consider reducing GYMPASS reliance")
    if direct_retention - gympass_retention > 0.2: recommendations.append("Direct clients have much higher retention - focus on converting GYMPASS clients to direct")
    if not recommendations: return "All channels show relatively similar performance - maintain current channel mix"
    return "STRATEGY: " + " | ".join(recommendations)

def acquisition_channel_value(df):
    df = df.copy()
    df['Valor_Num'] = pd.to_numeric(df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False), errors='coerce').fillna(0)
    conditions = [df['Contrato'].str.contains('GYMPASS', case=False, na=False), df['Contrato'].str.contains('EXPERIMENTAL|AVULSA', case=False, na=False), ~df['Contrato'].str.contains('GYMPASS|EXPERIMENTAL|AVULSA', case=False, na=False)]
    choices = ['GYMPASS', 'Trial Conversion', 'Direct Sale']
    df['acquisition_channel'] = np.select(conditions, choices, default='Other')
    channel_metrics = df.groupby('acquisition_channel').agg(client_count=('Código', 'nunique'), total_revenue=('Valor_Num', 'sum'), avg_contract_value=('Valor_Num', 'mean'), retention_rate=('Status Cliente', lambda x: x.isin(['Bloqueado', 'Ativo']).mean()))
    channel_metrics['estimated_clv'] = channel_metrics['total_revenue'] / channel_metrics['client_count']
    df['contract_count'] = df.groupby('Código').cumcount() + 1
    progression_by_channel = df.groupby(['acquisition_channel', 'contract_count']).size().unstack(fill_value=0)
    progression_rates = progression_by_channel.div(progression_by_channel.get(1, 1), axis=0)
    clv_ratio = round(channel_metrics.loc['Direct Sale', 'estimated_clv'] / channel_metrics.loc['GYMPASS', 'estimated_clv'], 2) if 'GYMPASS' in channel_metrics.index and 'Direct Sale' in channel_metrics.index else None
    retention_adv = round((channel_metrics.loc['Direct Sale', 'retention_rate'] - channel_metrics.loc['GYMPASS', 'retention_rate']) * 100, 2) if 'GYMPASS' in channel_metrics.index and 'Direct Sale' in channel_metrics.index else None
    return {'channel_metrics': channel_metrics.round(2).to_dict(), 'progression_rates': progression_rates.round(4).to_dict(), 'channel_comparison': {'clv_ratio_direct_to_gympass': clv_ratio, 'retention_advantage_direct': retention_adv}, 'strategic_recommendation': generate_channel_strategy(channel_metrics)}

# 5. Service Utilization & Cross-Modal Analysis Functions
def generate_cross_sell_recommendation(score, top_combinations):
    if not top_combinations: return "Insufficient data on modality combinations to generate specific recommendations"
    top_pair = list(top_combinations.keys())[0]
    if score > 70: return f"High cross-sell potential - implement targeted offers for {top_pair[0]} clients to add {top_pair[1]} (strongest combination)"
    if score > 40: return f"Moderate cross-sell potential - test bundled offers for {top_pair[0]} and {top_pair[1]} modalities"
    return f"Low cross-sell potential - focus on core modality retention (top combination: {top_pair[0]} & {top_pair[1]})"

def calculate_cross_sell_score(multi_modality_rate, top_combinations, revenue_data):
    base_score = min(40, multi_modality_rate * 0.4)
    combination_score = 0
    if top_combinations:
        total_pairs = sum(top_combinations.values())
        if total_pairs > 0:
            top_pair_pct = list(top_combinations.values())[0] / total_pairs * 100
            combination_score = 30 if top_pair_pct > 30 else 20 if top_pair_pct > 20 else 10 if top_pair_pct > 10 else 0
    revenue_score = 0
    if 2 in revenue_data.index and 1 in revenue_data.index:
        revenue_increase = (revenue_data.loc[2, 'avg_revenue_per_client'] - revenue_data.loc[1, 'avg_revenue_per_client']) / revenue_data.loc[1, 'avg_revenue_per_client'] * 100
        revenue_score = min(30, revenue_increase * 0.3)
    total_score = base_score + combination_score + revenue_score
    interpretation = "High cross-sell potential" if total_score > 70 else "Moderate cross-sell potential" if total_score > 40 else "Low cross-sell potential"
    return {'score': round(total_score, 1), 'interpretation': interpretation, 'recommendation': generate_cross_sell_recommendation(total_score, top_combinations)}

def service_utilization_analysis(df):
    valid_modalities = df[df['Modalidade'] != '-']
    if valid_modalities.empty: return {}
    client_modality_count = valid_modalities.groupby('Código')['Modalidade'].nunique()
    multi_modality_rate = len(client_modality_count[client_modality_count > 1]) / len(client_modality_count) * 100
    client_modality_pairs = []
    for _, group in valid_modalities.groupby('Código'):
        modalities = group['Modalidade'].unique()
        if len(modalities) > 1:
            for i in range(len(modalities)):
                for j in range(i + 1, len(modalities)):
                    client_modality_pairs.append(tuple(sorted([modalities[i], modalities[j]])))
    top_combinations = dict(sorted(Counter(client_modality_pairs).items(), key=lambda x: x[1], reverse=True)[:5])
    df['modality_count'] = df.groupby('Código')['Modalidade'].transform('nunique')
    df['Valor_Num'] = pd.to_numeric(df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False), errors='coerce').fillna(0)
    revenue_by_modality_count = df.groupby('modality_count')['Valor_Num'].agg(total_revenue=('sum'), avg_revenue_per_client=('mean'), client_count=('count'))
    return {'clients_per_modality': valid_modalities.groupby('Modalidade')['Código'].nunique().to_dict(), 'multi_modality_rate': round(multi_modality_rate, 2), 'top_modality_combinations': {f"{k[0]} & {k[1]}": v for k, v in top_combinations.items()}, 'revenue_by_modality_count': revenue_by_modality_count.round(2).to_dict(), 'cross_sell_opportunity_score': calculate_cross_sell_score(multi_modality_rate, top_combinations, revenue_by_modality_count)}

# 6. Consultant Pipeline Efficiency Functions
def determine_bottleneck_priority(bottlenecks):
    if not bottlenecks: return "No significant bottlenecks detected in sales pipeline"
    high_severity = [b for b in bottlenecks if b['severity'] == 'high']
    if high_severity: return f"Priority: Address {high_severity[0]['issue']} (current rate: {high_severity[0]['current_rate']}%)"
    medium_severity = [b for b in bottlenecks if b['severity'] == 'medium']
    if medium_severity: return f"Next focus: Address {medium_severity[0]['issue']} (current rate: {medium_severity[0]['current_rate']}%)"
    return "All pipeline stages performing adequately - focus on incremental improvements"

def analyze_pipeline_bottlenecks(consultant_data, overall_metrics):
    bottlenecks = []
    if overall_metrics['trial_to_paid_rate'] < 30: bottlenecks.append({'stage': 'trial_to_paid', 'issue': 'Low trial-to-paid conversion rate', 'severity': 'high' if overall_metrics['trial_to_paid_rate'] < 20 else 'medium', 'current_rate': overall_metrics['trial_to_paid_rate'], 'recommendation': "Improve trial experience and follow-up process to increase conversion"})
    if overall_metrics['prospect_to_paid_rate'] < 10: bottlenecks.append({'stage': 'prospect_to_paid', 'issue': 'Low prospect-to-paid conversion rate', 'severity': 'high' if overall_metrics['prospect_to_paid_rate'] < 5 else 'medium', 'current_rate': overall_metrics['prospect_to_paid_rate'], 'recommendation': "Optimize prospecting and initial engagement process"})
    if overall_metrics['retention_rate'] < 60: bottlenecks.append({'stage': 'retention', 'issue': 'Low client retention rate', 'severity': 'high' if overall_metrics['retention_rate'] < 40 else 'medium', 'current_rate': overall_metrics['retention_rate'], 'recommendation': "Implement retention programs and improve client experience"})
    consultant_bottlenecks = {c: [s for s in ['trial_to_paid', 'prospect_to_paid', 'retention'] if m[f'{s}_rate'] < overall_metrics[f'{s}_rate'] * 0.8] for c, m in consultant_data.items()}
    return {'systemic_bottlenecks': bottlenecks, 'consultant_specific_bottlenecks': consultant_bottlenecks, 'bottleneck_priority': determine_bottleneck_priority(bottlenecks)}

def identify_top_consultants(consultant_data):
    sorted_consultants = sorted(consultant_data.items(), key=lambda x: x[1]['weighted_efficiency_score'], reverse=True)
    return [{'consultant': c, 'trial_to_paid_rate': m['trial_to_paid_rate'], 'prospect_to_paid_rate': m['prospect_to_paid_rate'], 'retention_rate': m['retention_rate'], 'efficiency_score': m['weighted_efficiency_score']} for c, m in sorted_consultants[:3]]

def calculate_efficiency_score(trial_to_paid, prospect_to_paid, retention_rate):
    return round(((trial_to_paid * 40) + (prospect_to_paid * 30) + (retention_rate * 30)), 1)

def consultant_pipeline_efficiency(df):
    df = df.copy()
    df['Consultor_Clean'] = df['Consultor'].str.replace('--', '', regex=False).str.strip()
    df = df[df['Consultor_Clean'] != '-']
    if df.empty: return {}
    funnel_stages = {'prospect': df['Status Cliente'].isin(['Prospect', 'Excluído']), 'trial': df['Contrato'].str.contains('EXPERIMENTAL|AVULSA', case=False, na=False), 'paid': ~df['Contrato'].str.contains('GYMPASS|EXPERIMENTAL|AVULSA', case=False, na=False) & (df['Valor'] != '000'), 'retained': df['Status Cliente'].isin(['Bloqueado', 'Ativo'])}
    consultant_funnel = {}
    for consultant, group in df.groupby('Consultor_Clean'):
        stage_counts = {stage: funnel_stages[stage][group.index].sum() for stage in funnel_stages}
        trial_to_paid = stage_counts['paid'] / stage_counts['trial'] if stage_counts['trial'] > 0 else 0
        prospect_to_paid = stage_counts['paid'] / stage_counts['prospect'] if stage_counts['prospect'] > 0 else 0
        retention_rate = stage_counts['retained'] / stage_counts['paid'] if stage_counts['paid'] > 0 else 0
        consultant_funnel[consultant] = {'stage_counts': stage_counts, 'trial_to_paid_rate': round(trial_to_paid * 100, 2), 'prospect_to_paid_rate': round(prospect_to_paid * 100, 2), 'retention_rate': round(retention_rate * 100, 2), 'weighted_efficiency_score': calculate_efficiency_score(trial_to_paid, prospect_to_paid, retention_rate)}
    overall_funnel = {f"total_{stage}": series.sum() for stage, series in funnel_stages.items()}
    overall_funnel.update({'trial_to_paid_rate': round(overall_funnel['total_paid'] / overall_funnel['total_trials'] * 100, 2) if overall_funnel['total_trials'] > 0 else 0, 'prospect_to_paid_rate': round(overall_funnel['total_paid'] / overall_funnel['total_prospects'] * 100, 2) if overall_funnel['total_prospects'] > 0 else 0, 'retention_rate': round(overall_funnel['total_retained'] / overall_funnel['total_paid'] * 100, 2) if overall_funnel['total_paid'] > 0 else 0})
    return {'consultant_funnel_metrics': consultant_funnel, 'overall_funnel_metrics': overall_funnel, 'top_performing_consultants': identify_top_consultants(consultant_funnel), 'pipeline_bottleneck_analysis': analyze_pipeline_bottlenecks(consultant_funnel, overall_funnel)}

# 7. Client Health Score & Risk Prediction Functions
def determine_risk_intervention_priorities(client_metrics):
    critical_risk = client_metrics[client_metrics['risk_category'] == 'Critical Risk']
    if critical_risk.empty: return {'message': 'No critical risk clients identified'}
    critical_risk['potential_recovery_value'] = (critical_risk['avg_contract_value'] * (12 - (critical_risk['days_since_last_contract'] / 30).clip(upper=12)))
    priority_clients = critical_risk.sort_values('potential_recovery_value', ascending=False)
    return priority_clients[['Cliente', 'total_value', 'days_since_last_contract', 'potential_recovery_value']].head(5).to_dict('records')

def identify_high_value_healthy(client_metrics):
    healthy_clients = client_metrics[client_metrics['risk_category'] == 'Healthy']
    if healthy_clients.empty: return []
    high_value_threshold = healthy_clients['total_value'].quantile(0.75)
    high_value_healthy = healthy_clients[healthy_clients['total_value'] >= high_value_threshold].sort_values('total_value', ascending=False)
    return high_value_healthy[['Cliente', 'total_value', 'contract_count', 'modalities_count']].head(5).to_dict('records')

def client_health_scoring(df):
    df = df.copy()
    df['Início'] = pd.to_datetime(df['Início'])
    df['Vencimento'] = pd.to_datetime(df['Vencimento'])
    df['Valor_Num'] = pd.to_numeric(df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False), errors='coerce').fillna(0)
    client_metrics = df.groupby('Código').agg(total_value=('Valor_Num', 'sum'), contract_count=('Contrato', 'count'), first_contract=('Início', 'min'), last_contract=('Vencimento', 'max'), avg_contract_value=('Valor_Num', 'mean'), modalities_count=('Modalidade', 'nunique'), gympass_count=('Contrato', lambda x: x.str.contains('GYMPASS', case=False).sum()), trial_count=('Contrato', lambda x: x.str.contains('EXPERIMENTAL|AVULSA', case=False).sum()))
    client_metrics['contract_duration'] = (client_metrics['last_contract'] - client_metrics['first_contract']).dt.days
    client_metrics['days_since_last_contract'] = (pd.to_datetime(df['Vencimento']).max() - client_metrics['last_contract']).dt.days
    client_metrics['value_score'] = client_metrics['total_value'].apply(lambda x: min(30, x / 1000))
    client_metrics['engagement_score'] = client_metrics['contract_count'].apply(lambda x: min(20, x * 5))
    client_metrics['retention_score'] = client_metrics['contract_duration'].apply(lambda x: min(20, x / 30))
    client_metrics['risk_factor_recent_inactivity'] = client_metrics['days_since_last_contract'].apply(lambda x: 15 if x > 90 else 10 if x > 60 else 5 if x > 30 else 0)
    client_metrics['risk_factor_gympass_heavy'] = client_metrics.apply(lambda row: 10 if row['gympass_count'] / row['contract_count'] > 0.7 else 5 if row['gympass_count'] / row['contract_count'] > 0.5 else 0, axis=1)
    client_metrics['health_score'] = client_metrics['value_score'] + client_metrics['engagement_score'] + client_metrics['retention_score'] - client_metrics['risk_factor_recent_inactivity'] - client_metrics['risk_factor_gympass_heavy']
    client_metrics['risk_category'] = pd.cut(client_metrics['health_score'], bins=[-np.inf, 20, 50, 80, np.inf], labels=['Critical Risk', 'Elevated Risk', 'Moderate Risk', 'Healthy'])
    client_names = df[['Código', 'Cliente']].drop_duplicates().set_index('Código')['Cliente']
    client_metrics = client_metrics.join(client_names, how='left')
    risk_distribution = client_metrics['risk_category'].value_counts(normalize=True) * 100
    return {'client_health_scores': client_metrics[['Cliente', 'health_score', 'risk_category']].to_dict('records'), 'risk_distribution': {k: round(v, 2) for k, v in risk_distribution.to_dict().items()}, 'at_risk_clients_count': int((client_metrics['risk_category'].isin(['Critical Risk', 'Elevated Risk'])).sum()), 'high_value_healthy_clients': identify_high_value_healthy(client_metrics), 'risk_intervention_priorities': determine_risk_intervention_priorities(client_metrics)}

# 8. Comprehensive Executive Dashboard Functions
def generate_executive_action_plan(priorities, risk, client_health, df):
    action_plan = []
    if risk.get('overall_risk_score', 0) > 50: action_plan.append({'area': 'Risk Mitigation', 'actions': [f"Address top risk factor: {risk['high_risk_contract_types'][0]['type']} (risk score: {risk['high_risk_contract_types'][0]['risk_score']})", f"Focus on consultant {risk['high_risk_consultants'][0]['consultant']} for improvement (churn risk: {risk['high_risk_consultants'][0]['churn_risk']}%)", f"Prioritize intervention for {len(client_health['critical_risk_clients'])} critical risk clients"], 'timeline': 'Immediate (0-30 days)'})
    channel_conversion = gympass_to_direct_conversion_analysis(df)
    if channel_conversion.get('conversion_potential_score', {}).get('score', 0) > 50: action_plan.append({'area': 'Channel Optimization', 'actions': [channel_conversion['conversion_potential_score']['recommendation'], f"Target modality with highest conversion: {max(channel_conversion['conversion_by_modality'].items(), key=lambda x: x[1])[0]}"], 'timeline': 'Short-term (30-60 days)'})
    if priorities: action_plan.append({'area': 'Sales Pipeline', 'actions': priorities[0]['actions'], 'timeline': 'Ongoing'})
    action_plan.append({'area': 'High-Value Client Retention', 'actions': ["Implement VIP program for top high-value clients", "Personalize communication for high-value clients"], 'timeline': 'Medium-term (60-90 days)'})
    return action_plan

def generate_strategic_priorities(kpis, risk, channel, pipeline):
    priorities = []
    if kpis.get('clv_cac_ratio') and kpis['clv_cac_ratio'] > 2.0: priorities.append({'priority': 'Optimize Direct Sales Channel', 'rationale': f"Direct sales CLV is {kpis['clv_cac_ratio']}x GYMPASS CLV", 'actions': ["Increase direct sales marketing efforts", "Create GYMPASS-to-direct conversion program"], 'impact_score': 9})
    if risk.get('overall_risk_score', 0) > 40: priorities.append({'priority': 'Address High-Risk Areas', 'rationale': f"Business risk score at {risk['overall_risk_score']}/100", 'actions': risk.get('mitigation_recommendations', []), 'impact_score': 8})
    if pipeline.get('pipeline_bottleneck_analysis', {}).get('systemic_bottlenecks'): priorities.append({'priority': f"Fix {pipeline['pipeline_bottleneck_analysis']['systemic_bottlenecks'][0]['stage'].replace('_', ' ').title()} Bottleneck", 'rationale': f"{pipeline['pipeline_bottleneck_analysis']['systemic_bottlenecks'][0]['issue']} (current rate: {pipeline['pipeline_bottleneck_analysis']['systemic_bottlenecks'][0]['current_rate']}%)", 'actions': [pipeline['pipeline_bottleneck_analysis']['systemic_bottlenecks'][0]['recommendation']], 'impact_score': 7})
    if kpis.get('multi_modality_impact', {}).get('overall_impact_score', 0) > 15: priorities.append({'priority': 'Expand Multi-Modality Offerings', 'rationale': f"Multi-modality clients generate {kpis['multi_modality_impact']['overall_impact_score']}% higher revenue impact", 'actions': ["Create bundled modality packages", "Train consultants on cross-selling modalities"], 'impact_score': 6})
    if kpis.get('consultant_efficiency_index', 100) < 60: priorities.append({'priority': 'Improve Consultant Pipeline Efficiency', 'rationale': f"Consultant efficiency index at {kpis['consultant_efficiency_index']}/100", 'actions': ["Implement consultant training on identified bottlenecks", "Create peer learning program with top performers"], 'impact_score': 7})
    priorities.sort(key=lambda x: x['impact_score'], reverse=True)
    return priorities[:3]

def calculate_financial_health_score(financial_data):
    score = 0
    if financial_data.get('mrr_growth_rate', 0) > 0: score += min(30, financial_data['mrr_growth_rate'] * 2)
    score += min(30, financial_data.get('net_revenue_retention', 0) * 0.3)
    score += min(20, financial_data.get('profitability_indicator', {}).get('profitability_score', 0) * 0.2)
    concentration_risk = financial_data.get('revenue_concentration', {}).get('top_10_percent', 30) - 30
    score -= max(0, min(20, concentration_risk * 0.5))
    return max(0, min(100, round(score, 1)))

def calculate_profitability_indicator(revenue_data, df):
    avg_contract_value = revenue_data.get('average_contract_value', 0)
    estimated_cac = cac_analysis(df.copy())['cac_per_client']
    estimated_ltv = lifetime_value_analysis(df.copy())['annualized_clv_estimate']
    estimated_profit_margin = ((estimated_ltv - estimated_cac) / estimated_ltv) * 100 if estimated_ltv > 0 else 0
    return {'estimated_profit_margin': round(estimated_profit_margin, 2), 'break_even_point': round(estimated_cac / (avg_contract_value / 12), 1) if avg_contract_value > 0 else None, 'profitability_score': min(100, max(0, estimated_profit_margin - 20))}

def calculate_herfindahl_index(revenue_series):
    total_revenue = revenue_series.sum()
    if total_revenue == 0: return 0
    market_shares = revenue_series / total_revenue
    return round((market_shares ** 2).sum() * 10000, 1)

def calculate_revenue_concentration(df):
    df['Valor_Num'] = pd.to_numeric(df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False), errors='coerce').fillna(0)
    revenue_by_client = df.groupby('Código')['Valor_Num'].sum().sort_values(ascending=False)
    if revenue_by_client.empty: return {}
    total_revenue = revenue_by_client.sum()
    top_5_revenue = revenue_by_client.head(5).sum()
    top_10_revenue = revenue_by_client.head(10).sum()
    return {'top_5_percent': round(top_5_revenue / total_revenue * 100, 2), 'top_10_percent': round(top_10_revenue / total_revenue * 100, 2), 'herfindahl_index': calculate_herfindahl_index(revenue_by_client)}

def calculate_risk_mitigation_progress(risk_data, client_health_data):
    total_at_risk = client_health_data.get('at_risk_clients_count', 0)
    critical_risk = client_health_data.get('risk_distribution', {}).get('Critical Risk', 0)
    elevated_risk = client_health_data.get('risk_distribution', {}).get('Elevated Risk', 0)
    intervention_count = len(client_health_data.get('risk_intervention_priorities', []))
    intervention_rate = (intervention_count / total_at_risk) * 100 if total_at_risk > 0 else 100
    return {'critical_risk_percentage': round(critical_risk, 2), 'elevated_risk_percentage': round(elevated_risk, 2), 'intervention_rate': round(intervention_rate, 2), 'risk_mitigation_score': round(100 - (critical_risk * 0.7 + elevated_risk * 0.3), 2)}

def calculate_consultant_efficiency_index(pipeline_data):
    if not pipeline_data or 'top_performing_consultants' not in pipeline_data: return 0
    top_consultants = pipeline_data['top_performing_consultants']
    if not top_consultants: return 0
    return round(sum(c['efficiency_score'] for c in top_consultants) / len(top_consultants), 1)

def calculate_multi_modality_impact(df):
    utilization = service_utilization_analysis(df)
    if 'revenue_by_modality_count' not in utilization or utilization['revenue_by_modality_count'] is None: return {}
    revenue_data = pd.DataFrame.from_dict(utilization['revenue_by_modality_count'], orient='index')
    if 1 in revenue_data.index and 2 in revenue_data.index:
        revenue_increase = (revenue_data.loc[2, 'avg_revenue_per_client'] - revenue_data.loc[1, 'avg_revenue_per_client']) / revenue_data.loc[1, 'avg_revenue_per_client'] * 100
        return {'revenue_increase_percent': round(revenue_increase, 2), 'client_percentage': utilization['multi_modality_rate'], 'overall_impact_score': round(revenue_increase * (utilization['multi_modality_rate'] / 100), 2)}
    return {}

# Placeholder for gympass_to_direct_conversion_analysis as it's not in the provided snippets
def gympass_to_direct_conversion_analysis(df):
    return {}

def executive_dashboard(df):
    risk = risk_assessment_dashboard(df.copy())
    channel = acquisition_channel_value(df.copy())
    pipeline = consultant_pipeline_efficiency(df.copy())
    client_health = client_health_scoring(df.copy())
    health_indicators = predictive_health_indicators(df.copy())
    revenue_data = revenue_analysis(df.copy())
    churn_data = revenue_churn_analysis(df.copy())
    growth_data = growth_rate_analysis(df.copy())

    strategic_kpis = {'clv_cac_ratio': channel.get('channel_comparison', {}).get('clv_ratio_direct_to_gympass'), 'retention_advantage': channel.get('channel_comparison', {}).get('retention_advantage_direct'), 'multi_modality_impact': calculate_multi_modality_impact(df.copy()), 'consultant_efficiency_index': calculate_consultant_efficiency_index(pipeline), 'risk_mitigation_progress': calculate_risk_mitigation_progress(risk, client_health)}
    strategic_priorities = generate_strategic_priorities(strategic_kpis, risk, channel, pipeline)

    financial_health = {'mrr': churn_data['mrr'], 'mrr_growth_rate': growth_data['average_revenue_growth'], 'net_revenue_retention': churn_data['net_revenue_retention'], 'revenue_concentration': calculate_revenue_concentration(df.copy()), 'profitability_indicator': calculate_profitability_indicator(revenue_data, df.copy())}

    health_score = (client_health.get('risk_distribution',{}).get('Healthy',0) * 0.4) + (health_indicators.get('trajectory_score',0) * 0.6)

    return {'executive_summary': {'business_health_score': round(health_score,1), 'risk_level': risk['risk_level'], 'trajectory_score': health_indicators['trajectory_score'], 'financial_health_score': calculate_financial_health_score(financial_health)}, 'strategic_kpis': strategic_kpis, 'financial_health': financial_health, 'strategic_priorities': strategic_priorities, 'critical_risk_clients': client_health['risk_intervention_priorities'], 'high_value_opportunities': client_health['high_value_healthy_clients'], 'action_plan': generate_executive_action_plan(strategic_priorities, risk, client_health, df.copy())}
[end of business_health_analysis.py]
def risk_assessment_dashboard(df):
    """
    Creates a comprehensive risk assessment dashboard
    """
    churn_indicators = churn_prediction_indicators(df)
    churn_data = churn_analysis(df)
    conversion = trial_conversion_analysis(df)

    high_risk_contract_types = sorted(churn_indicators.get('contract_type_risk', {}).items(), key=lambda x: x[1], reverse=True)[:3]
    high_risk_modalities = sorted(churn_indicators.get('modality_risk', {}).items(), key=lambda x: x[1], reverse=True)[:3]

    consultant_risk = {}
    for consultant, risk in churn_indicators.get('consultant_risk', {}).items():
        consultant_risk[consultant] = {'churn_risk': risk, 'conversion_rate': conversion.get('conversion_by_consultant', {}).get(consultant, 0)}

    high_risk_consultants = sorted(consultant_risk.items(), key=lambda x: (x[1]['churn_risk'], -x[1]['conversion_rate']), reverse=True)[:3]

    risk_score = (churn_data['churn_rate'] * 0.7) + ((100 - conversion.get('overall_conversion_rate', 100)) * 0.3)

    recommendations = []
    if churn_data['churn_rate'] > 20: recommendations.append("High churn rate detected - implement targeted retention program")
    if conversion.get('overall_conversion_rate', 100) < 30: recommendations.append("Low conversion rate - optimize trial-to-paid process")
    if high_risk_contract_types: recommendations.append(f"Address high churn in contract types: {', '.join([t[0] for t in high_risk_contract_types])}")
    if high_risk_modalities: recommendations.append(f"Focus on improving retention for modalities: {', '.join([m[0] for m in high_risk_modalities])}")
    if high_risk_consultants: recommendations.append(f"Provide additional training for consultants with high churn: {', '.join([c[0] for c in high_risk_consultants])}")

    return {
        'overall_risk_score': round(risk_score, 1),
        'risk_level': 'High' if risk_score > 60 else 'Medium' if risk_score > 30 else 'Low',
        'high_risk_contract_types': [{'type': t[0], 'risk_score': t[1]} for t in high_risk_contract_types],
        'high_risk_modalities': [{'modality': m[0], 'risk_score': m[1]} for m in high_risk_modalities],
        'high_risk_consultants': [{'consultant': c[0], 'churn_risk': c[1]['churn_risk'], 'conversion_rate': c[1]['conversion_rate']} for c in high_risk_consultants],
        'mitigation_recommendations': recommendations,
        'critical_risk_factors': len(recommendations)
    }

def predictive_health_indicators(df):
    """
    Calculates forward-looking business health indicators
    """
    df['Início'] = pd.to_datetime(df['Início'])
    df['Valor_Num'] = df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    recent_data = df[df['Início'] >= (pd.Timestamp.now() - pd.DateOffset(months=3))]

    monthly_clients = recent_data.set_index('Início').resample('M').size()
    client_growth_rate = monthly_clients.pct_change().mean() * 100

    monthly_revenue = recent_data.set_index('Início').resample('M')['Valor_Num'].sum()
    revenue_growth_rate = monthly_revenue.pct_change().mean() * 100

    churn = churn_analysis(df)
    revenue_churn = revenue_churn_analysis(df)

    clv = lifetime_value_analysis(df)['annualized_clv_estimate']
    cac = cac_analysis(df)['cac_per_client']
    clv_cac_ratio = clv / cac if cac > 0 else None

    trajectory_score = 0
    trajectory_score += max(0, min(30, client_growth_rate * 2)) if not np.isnan(client_growth_rate) else 0
    trajectory_score += max(0, min(40, revenue_growth_rate * 2.5)) if not np.isnan(revenue_growth_rate) else 0
    trajectory_score -= min(20, churn['churn_rate'] * 0.5)
    if clv_cac_ratio: trajectory_score += min(30, clv_cac_ratio * 5)
    trajectory_score = max(0, min(100, trajectory_score))

    client_projection = len(df) * (1 + (client_growth_rate / 100)) ** 6 if not np.isnan(client_growth_rate) else len(df)
    revenue_projection = df['Valor_Num'].sum() * (1 + (revenue_growth_rate / 100)) ** 6 if not np.isnan(revenue_growth_rate) else df['Valor_Num'].sum()

    # Handle potential infinity
    if np.isinf(client_projection):
        client_projection = len(df) # Fallback to current number if projection is unstable
    if np.isinf(revenue_projection):
        revenue_projection = df['Valor_Num'].sum() # Fallback to current revenue

    return {
        'trajectory_score': round(trajectory_score, 1),
        'client_growth_rate_3m': round(client_growth_rate, 2),
        'revenue_growth_rate_3m': round(revenue_growth_rate, 2),
        'churn_rate': churn['churn_rate'],
        'revenue_churn_rate': revenue_churn['revenue_churn_rate'],
        'clv_cac_ratio': round(clv_cac_ratio, 2) if clv_cac_ratio else None,
        '6_month_client_projection': int(client_projection),
        '6_month_revenue_projection': round(revenue_projection, 2),
        'growth_momentum': 'Positive' if revenue_growth_rate > 0 and client_growth_rate > 0 else 'Negative'
    }

def churn_prediction_indicators(df):
    """
    Identifies early warning indicators of potential churn
    """
    cancelled = df[df['Status Cliente'] == 'Cancelado']
    active = df[df['Status Cliente'] == 'Bloqueado']

    if cancelled.empty or active.empty: return {}

    cancelled['Valor_Num'] = cancelled['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)
    active['Valor_Num'] = active['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    cancelled_by_type = cancelled['Contrato'].value_counts(normalize=True)
    active_by_type = active['Contrato'].value_counts(normalize=True)

    cancelled_by_modality = cancelled['Modalidade'].value_counts(normalize=True)
    active_by_modality = active['Modalidade'].value_counts(normalize=True)

    cancelled_by_consultant = cancelled['Consultor'].value_counts(normalize=True)
    active_by_consultant = active['Consultor'].value_counts(normalize=True)

    cancelled['contract_length'] = (pd.to_datetime(cancelled['Vencimento']) - pd.to_datetime(cancelled['Início'])).dt.days
    active['contract_length'] = (pd.to_datetime(active['Vencimento']) - pd.to_datetime(active['Início'])).dt.days

    risk_indicators = {
        'contract_type_risk': {},
        'modality_risk': {},
        'consultant_risk': {},
        'contract_length_risk': {
            'cancelled_avg_days': cancelled['contract_length'].mean(),
            'active_avg_days': active['contract_length'].mean()
        }
    }

    for contract_type in set(cancelled_by_type.index) | set(active_by_type.index):
        cancelled_pct = cancelled_by_type.get(contract_type, 0)
        active_pct = active_by_type.get(contract_type, 0)
        risk_score = (cancelled_pct / (cancelled_pct + active_pct)) if (cancelled_pct + active_pct) > 0 else 0
        risk_indicators['contract_type_risk'][contract_type] = round(risk_score * 100, 2)

    for modality in set(cancelled_by_modality.index) | set(active_by_modality.index):
        if modality == '-' or pd.isna(modality): continue
        cancelled_pct = cancelled_by_modality.get(modality, 0)
        active_pct = active_by_modality.get(modality, 0)
        risk_score = (cancelled_pct / (cancelled_pct + active_pct)) if (cancelled_pct + active_pct) > 0 else 0
        risk_indicators['modality_risk'][modality] = round(risk_score * 100, 2)

    for consultant in set(cancelled_by_consultant.index) | set(active_by_consultant.index):
        if consultant == '-' or consultant == 'CONSULTOR PADRÃO - MATEUS --' or pd.isna(consultant): continue
        cancelled_pct = cancelled_by_consultant.get(consultant, 0)
        active_pct = active_by_consultant.get(consultant, 0)
        risk_score = (cancelled_pct / (cancelled_pct + active_pct)) if (cancelled_pct + active_pct) > 0 else 0
        risk_indicators['consultant_risk'][consultant] = round(risk_score * 100, 2)

    return risk_indicators

def revenue_churn_analysis(df):
    """
    Analyzes revenue churn (MRR churn) in addition to client churn
    """
    df['Início'] = pd.to_datetime(df['Início'])
    df['Vencimento'] = pd.to_datetime(df['Vencimento'])
    df['Valor_Num'] = df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    active_contracts = df[df['Status Cliente'] == 'Bloqueado']
    cancelled_contracts = df[df['Status Cliente'] == 'Cancelado']

    current_month = pd.Timestamp.now().replace(day=1)
    next_month = (current_month + pd.DateOffset(months=1)).replace(day=1)

    active_this_month = active_contracts[
        (active_contracts['Início'] <= current_month) &
        (active_contracts['Vencimento'] >= current_month)
    ]

    mrr = active_this_month['Valor_Num'].sum()

    last_month = (current_month - pd.DateOffset(months=1)).replace(day=1)

    active_last_month = active_contracts[
        (active_contracts['Início'] <= last_month) &
        (active_contracts['Vencimento'] >= last_month)
    ]

    churned_contracts = cancelled_contracts[
        (cancelled_contracts['Vencimento'] >= last_month) &
        (cancelled_contracts['Vencimento'] < current_month)
    ]

    churned_revenue = churned_contracts['Valor_Num'].sum()

    revenue_churn_rate = (churned_revenue / active_last_month['Valor_Num'].sum() * 100) if not active_last_month.empty and active_last_month['Valor_Num'].sum() > 0 else 0

    net_revenue_retention = 100 - revenue_churn_rate

    return {
        'mrr': round(mrr, 2),
        'churned_revenue': round(churned_revenue, 2),
        'revenue_churn_rate': round(revenue_churn_rate, 2),
        'net_revenue_retention': round(net_revenue_retention, 2),
        'churned_contracts_count': len(churned_contracts),
        'average_churn_value': round(churned_revenue / len(churned_contracts), 2) if len(churned_contracts) > 0 else 0
    }

def cac_trend_analysis(df, period='M', marketing_spend_data=None):
    """
    Analyzes CAC trends over time
    """
    df['Início'] = pd.to_datetime(df['Início'])

    new_clients = df[~df['Contrato'].str.contains('GYMPASS|EXPERIMENTAL|AVULSA', case=False, na=False) &
                    (df['Valor'] != '000')]

    new_clients_by_period = new_clients.set_index('Início').resample(period).size()

    df['Valor_Num'] = df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)
    revenue_by_period = df.set_index('Início').resample(period)['Valor_Num'].sum()

    cac_trends = {}

    for date, client_count in new_clients_by_period.items():
        if client_count > 0:
            period_revenue = revenue_by_period.get(date, 0)

            period_marketing_spend = period_revenue * 0.1
            period_sales_costs = period_revenue * 0.15

            period_cac = (period_marketing_spend + period_sales_costs) / client_count

            monthly_revenue = period_revenue / client_count / (30/365)
            clv_cac_ratio = monthly_revenue / period_cac if period_cac > 0 else None

            cac_trends[date.strftime('%Y-%m')] = {
                'new_clients': int(client_count),
                'estimated_cac': round(period_cac, 2),
                'clv_cac_ratio': round(clv_cac_ratio, 2) if clv_cac_ratio else None
            }

    return cac_trends

def cac_analysis(df, marketing_spend_data=None, staff_costs=None):
    """
    Analyzes Customer Acquisition Cost metrics
    """
    new_clients = df[~df['Contrato'].str.contains('GYMPASS|EXPERIMENTAL|AVULSA', case=False, na=False) &
                    (df['Valor'] != '000')]

    total_new_clients = len(new_clients)

    total_marketing_spend = 0
    total_sales_staff_costs = 0

    if marketing_spend_data:
        total_marketing_spend = sum(marketing_spend_data.values())
    else:
        revenue = revenue_analysis(df)['total_revenue']
        total_marketing_spend = revenue * 0.1

    if staff_costs:
        total_sales_staff_costs = sum(staff_costs.values())
    else:
        revenue = revenue_analysis(df)['total_revenue']
        total_sales_staff_costs = revenue * 0.15

    total_cac = total_marketing_spend + total_sales_staff_costs
    cac_per_client = total_cac / total_new_clients if total_new_clients > 0 else 0

    clv_data = lifetime_value_analysis(df)
    clv = clv_data['annualized_clv_estimate']
    monthly_revenue_per_client = clv / 12

    cac_payback_months = cac_per_client / monthly_revenue_per_client if monthly_revenue_per_client > 0 else None

    return {
        'total_new_clients': total_new_clients,
        'total_marketing_spend': round(total_marketing_spend, 2),
        'total_sales_staff_costs': round(total_sales_staff_costs, 2),
        'total_cac': round(total_cac, 2),
        'cac_per_client': round(cac_per_client, 2),
        'clv_cac_ratio': round(clv / cac_per_client, 2) if cac_per_client > 0 else None,
        'cac_payback_months': round(cac_payback_months, 1) if cac_payback_months else None,
        'marketing_efficiency': round((clv / total_marketing_spend) * 100, 2) if total_marketing_spend > 0 else None
    }

def trial_conversion_analysis(df):
    """
    Analyzes detailed trial class conversion patterns
    """
    trials = df[df['Contrato'].str.contains('EXPERIMENTAL|AVULSA', case=False, na=False)]

    if trials.empty:
        return {'message': 'No trial classes found in dataset'}

    conversion_data = []
    for _, trial in trials.iterrows():
        client_id = trial['Código']
        trial_type = trial['Contrato']
        consultant = trial['Consultor']

        paid_contracts = df[(df['Código'] == client_id) &
                           (~df['Contrato'].str.contains('EXPERIMENTAL|AVULSA|GYMPASS', case=False, na=False)) &
                           (df['Valor'] != '000')]

        converted = len(paid_contracts) > 0
        days_to_conversion = None

        if converted:
            first_paid = paid_contracts['Início'].min()
            trial_date = trial['Início']
            days_to_conversion = (pd.to_datetime(first_paid) - pd.to_datetime(trial_date)).days

        conversion_data.append({
            'client_id': client_id,
            'trial_type': trial_type,
            'consultant': consultant,
            'converted': converted,
            'days_to_conversion': days_to_conversion
        })

    conversion_df = pd.DataFrame(conversion_data)

    overall_rate = conversion_df['converted'].mean()
    by_trial_type = conversion_df.groupby('trial_type')['converted'].mean()
    by_consultant = conversion_df.groupby('consultant')['converted'].mean()

    avg_conversion_time = conversion_df[conversion_df['converted']]['days_to_conversion'].mean()

    return {
        'overall_conversion_rate': round(overall_rate * 100, 2),
        'conversion_by_trial_type': {k: round(v * 100, 2) for k, v in by_trial_type.to_dict().items()},
        'conversion_by_consultant': {k: round(v * 100, 2) for k, v in by_consultant.to_dict().items()},
        'average_days_to_conversion': round(avg_conversion_time, 1) if avg_conversion_time else None,
        'conversion_count': conversion_df['converted'].value_counts().to_dict()
    }

def lead_conversion_metrics(df):
    """
    Analyzes the conversion funnel from prospect to paying client
    """
    prospects = df[df['Status Cliente'].isin(['Prospect', 'Excluído']) |
                  df['Contrato'].str.contains('EXPERIMENTAL|AVULSA', case=False, na=False)]

    trials = df[df['Contrato'].str.contains('EXPERIMENTAL|AVULSA', case=False, na=False)]

    paid_contracts = df[~df['Contrato'].str.contains('GYMPASS|EXPERIMENTAL|AVULSA', case=False, na=False) &
                        (df['Valor'] != '000')]

    total_prospects = len(prospects)
    total_trials = len(trials)
    total_paying = len(paid_contracts)

    prospect_to_trial = (total_trials / total_prospects * 100) if total_prospects > 0 else 0
    trial_to_paid = (total_paying / total_trials * 100) if total_trials > 0 else 0
    overall_conversion = (total_paying / total_prospects * 100) if total_prospects > 0 else 0

    return {
        'total_prospects': total_prospects,
        'total_trials': total_trials,
        'total_paying_clients': total_paying,
        'prospect_to_trial_rate': round(prospect_to_trial, 2),
        'trial_to_paid_rate': round(trial_to_paid, 2),
        'overall_conversion_rate': round(overall_conversion, 2),
        'conversion_funnel': {
            'prospects': total_prospects,
            'trials': total_trials,
            'paid_clients': total_paying
        }
    }

def client_cohort_analysis(df, period='M'):
    """
    Performs cohort analysis to track client behavior over time
    """
    df = df.copy()
    df['Início'] = pd.to_datetime(df['Início'])
    df['Vencimento'] = pd.to_datetime(df['Vencimento'])

    df['cohort'] = df.groupby('Código')['Início'].transform('min')
    if period == 'M':
        df['cohort'] = df['cohort'].dt.to_period('M')
    elif period == 'Q':
        df['cohort'] = df['cohort'].dt.to_period('Q')

    df['period'] = (df['Início'].dt.to_period('M') - df['cohort'].apply(lambda x: x.asfreq('M'))).apply(lambda x: x.n)

    cohort_data = df.groupby(['cohort', 'period']).size().unstack(fill_value=0)

    cohort_sizes = cohort_data.iloc[:, 0]
    retention_matrix = cohort_data.divide(cohort_sizes, axis=0)

    retention_dict = {}
    for cohort, row in retention_matrix.iterrows():
        retention_dict[str(cohort)] = {str(k): round(v * 100, 2) for k, v in row.items() if k >= 0}

    avg_retention = retention_matrix.mean()

    return {
        'cohort_sizes': {str(k): v for k, v in cohort_sizes.to_dict().items()},
        'retention_matrix': retention_dict,
        'average_retention': {str(k): round(v * 100, 2) for k, v in avg_retention.items() if k >= 0},
        'cohort_period': period,
        'cohorts_analyzed': len(cohort_sizes)
    }

def revenue_cohort_analysis(df, period='M'):
    """
    Performs revenue cohort analysis to track revenue retention over time
    """
    df = df.copy()
    df['Início'] = pd.to_datetime(df['Início'])
    df['Vencimento'] = pd.to_datetime(df['Vencimento'])
    df['Valor_Num'] = df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    df['cohort'] = df.groupby('Código')['Início'].transform('min')
    if period == 'M':
        df['cohort'] = df['cohort'].dt.to_period('M')
    elif period == 'Q':
        df['cohort'] = df['cohort'].dt.to_period('Q')

    df['period'] = (df['Início'].dt.to_period('M') - df['cohort'].apply(lambda x: x.asfreq('M'))).apply(lambda x: x.n)

    revenue_data = df.groupby(['cohort', 'period'])['Valor_Num'].sum().unstack(fill_value=0)

    initial_revenue = revenue_data.iloc[:, 0]
    revenue_retention = revenue_data.divide(initial_revenue, axis=0)

    user_counts = df.groupby(['cohort', 'period']).size().unstack(fill_value=0)
    revenue_per_user = revenue_data.divide(user_counts, axis=0)

    revenue_retention_dict = {}
    for cohort, row in revenue_retention.iterrows():
        revenue_retention_dict[str(cohort)] = {str(k): round(v * 100, 2) for k, v in row.items() if k >= 0}

    revenue_per_user_dict = {}
    for cohort, row in revenue_per_user.iterrows():
        revenue_per_user_dict[str(cohort)] = {str(k): round(v, 2) for k, v in row.items() if k >= 0}

    return {
        'initial_revenue': {str(k): v for k, v in initial_revenue.round(2).to_dict().items()},
        'revenue_retention': revenue_retention_dict,
        'revenue_per_user': revenue_per_user_dict,
        'cohort_period': period,
        'total_revenue': df['Valor_Num'].sum()
    }

def cross_sell_analysis(df):
    """
    Analyzes cross-selling and upselling opportunities and patterns
    """
    client_contracts = df.groupby('Código').size().reset_index(name='contract_count')
    multi_contract_clients = client_contracts[client_contracts['contract_count'] > 1]

    contract_progression = []

    for client_id in multi_contract_clients['Código']:
        client_df = df[df['Código'] == client_id].sort_values('Início')

        if len(client_df) <= 1: continue

        previous_contract = None
        for _, current in client_df.iterrows():
            if previous_contract is not None:
                current_value = float(current['Valor'].replace('000', '0').replace('.', '').replace(',', '.'))
                previous_value = float(previous_contract['Valor'].replace('000', '0').replace('.', '').replace(',', '.'))

                is_upsell = current_value > previous_value
                value_change = current_value - previous_value

                contract_progression.append({
                    'client_id': client_id,
                    'previous_contract': previous_contract['Contrato'],
                    'new_contract': current['Contrato'],
                    'previous_value': previous_value,
                    'new_value': current_value,
                    'value_change': value_change,
                    'is_upsell': is_upsell,
                    'time_between_contracts': (pd.to_datetime(current['Início']) - pd.to_datetime(previous_contract['Início'])).days
                })

            previous_contract = current

    if not contract_progression: return {'message': 'No contract progression data found'}

    progression_df = pd.DataFrame(contract_progression)

    upsell_count = progression_df['is_upsell'].sum()
    total_progressions = len(progression_df)
    upsell_rate = upsell_count / total_progressions * 100

    avg_upsell_value = progression_df[progression_df['is_upsell']]['value_change'].mean()

    progression_paths = progression_df.groupby(['previous_contract', 'new_contract']).size().reset_index(name='count')
    progression_paths = progression_paths.sort_values('count', ascending=False)

    avg_time_between = progression_df['time_between_contracts'].mean()

    return {
        'total_clients_with_progression': len(progression_df['client_id'].unique()),
        'total_contract_progressions': total_progressions,
        'upsell_rate': round(upsell_rate, 2),
        'avg_upsell_value': round(avg_upsell_value, 2) if not progression_df[progression_df['is_upsell']].empty else 0,
        'top_progression_paths': progression_paths.head(5).to_dict('records'),
        'avg_days_between_contracts': round(avg_time_between, 1),
        'progression_data': progression_df.to_dict('records')
    }

def contract_renewal_timing(df):
    """
    Analyzes patterns in contract renewal timing
    """
    # Identify clients with multiple contracts
    client_contracts = df.sort_values(['Código', 'Início'])
    client_contracts['next_contract'] = client_contracts.groupby('Código')['Início'].shift(-1)

    # Calculate days between contracts
    client_contracts['days_between'] = (pd.to_datetime(client_contracts['next_contract']) -
                                      pd.to_datetime(client_contracts['Início'])).dt.days

    # Filter valid renewal intervals (positive values only)
    valid_renewals = client_contracts[client_contracts['days_between'] > 0]

    if valid_renewals.empty:
        return {'message': 'No renewal patterns detected'}

    # Analyze renewal timing by contract type
    renewal_timing = valid_renewals.groupby('Contrato')['days_between'].agg(
        avg_days=('mean'),
        median_days=('median'),
        std_days=('std'),
        renewal_count=('count')
    )

    # Create renewal timing buckets
    renewal_buckets = pd.cut(valid_renewals['days_between'],
                           bins=[0, 1, 7, 14, 30, 60, 90, 180, 365],
                           labels=['<1d', '1-7d', '7-14d', '14-30d', '1-2m', '2-3m', '3-6m', '6-12m'])

    renewal_distribution = renewal_buckets.value_counts(normalize=True).sort_index() * 100

    return {
        'overall_renewal_timing': {
            'avg_days_between_renewals': round(valid_renewals['days_between'].mean(), 1),
            'median_days_between_renewals': valid_renewals['days_between'].median(),
            'renewal_window_distribution': {str(k): round(v, 2) for k, v in renewal_distribution.items()}
        },
        'renewal_timing_by_contract': renewal_timing.round(1).to_dict(),
        'optimal_renewal_reminder_timing': determine_optimal_reminder_timing(renewal_distribution)
    }

def determine_optimal_reminder_timing(renewal_distribution):
    """
    Determines the optimal timing for renewal reminders based on renewal patterns
    """
    # Convert to list of (bucket, percentage) tuples
    renewal_list = [(k, v) for k, v in renewal_distribution.items()]

    # Find the peak renewal window
    peak_window = max(renewal_list, key=lambda x: x[1])

    # Determine reminder timing based on peak
    if peak_window[0] == '<1d':
        return "Send reminder 3-5 days before expiration - clients tend to renew at the last minute"
    elif peak_window[0] in ['1-7d', '7-14d']:
        return "Send reminder 7-10 days before expiration - clients typically renew within a week of expiration"
    elif peak_window[0] in ['14-30d', '1-2m']:
        return "Send reminder 14-21 days before expiration - clients typically renew 2-4 weeks before expiration"
    else:
        return "Send reminder 30 days before expiration - clients typically renew well in advance"

def executive_dashboard(df):
    risk = risk_assessment_dashboard(df.copy())
    channel = acquisition_channel_value(df.copy())
    pipeline = consultant_pipeline_efficiency(df.copy())
    client_health = client_health_scoring(df.copy())
    health_indicators = predictive_health_indicators(df.copy())
    revenue_data = revenue_analysis(df.copy())
    churn_data = revenue_churn_analysis(df.copy())
    growth_data = growth_rate_analysis(df.copy())

    strategic_kpis = {'clv_cac_ratio': channel.get('channel_comparison', {}).get('clv_ratio_direct_to_gympass'), 'retention_advantage': channel.get('channel_comparison', {}).get('retention_advantage_direct'), 'multi_modality_impact': calculate_multi_modality_impact(df.copy()), 'consultant_efficiency_index': calculate_consultant_efficiency_index(pipeline), 'risk_mitigation_progress': calculate_risk_mitigation_progress(risk, client_health)}
    strategic_priorities = generate_strategic_priorities(strategic_kpis, risk, channel, pipeline)

    financial_health = {'mrr': churn_data['mrr'], 'mrr_growth_rate': growth_data['average_revenue_growth'], 'net_revenue_retention': churn_data['net_revenue_retention'], 'revenue_concentration': calculate_revenue_concentration(df.copy()), 'profitability_indicator': calculate_profitability_indicator(revenue_data, df.copy())}

    health_score = (client_health.get('risk_distribution',{}).get('Healthy',0) * 0.4) + (health_indicators.get('trajectory_score',0) * 0.6)

    return {'executive_summary': {'business_health_score': round(health_score,1), 'risk_level': risk['risk_level'], 'trajectory_score': health_indicators['trajectory_score'], 'financial_health_score': calculate_financial_health_score(financial_health)}, 'strategic_kpis': strategic_kpis, 'financial_health': financial_health, 'strategic_priorities': strategic_priorities, 'critical_risk_clients': client_health['risk_intervention_priorities'], 'high_value_opportunities': client_health['high_value_healthy_clients'], 'action_plan': generate_executive_action_plan(strategic_priorities, risk, client_health, df.copy())}
[end of business_health_analysis.py]
def risk_assessment_dashboard(df):
    """
    Creates a comprehensive risk assessment dashboard
    """
    churn_indicators = churn_prediction_indicators(df)
    churn_data = churn_analysis(df)
    conversion = trial_conversion_analysis(df)

    high_risk_contract_types = sorted(churn_indicators.get('contract_type_risk', {}).items(), key=lambda x: x[1], reverse=True)[:3]
    high_risk_modalities = sorted(churn_indicators.get('modality_risk', {}).items(), key=lambda x: x[1], reverse=True)[:3]

    consultant_risk = {}
    for consultant, risk in churn_indicators.get('consultant_risk', {}).items():
        consultant_risk[consultant] = {'churn_risk': risk, 'conversion_rate': conversion.get('conversion_by_consultant', {}).get(consultant, 0)}

    high_risk_consultants = sorted(consultant_risk.items(), key=lambda x: (x[1]['churn_risk'], -x[1]['conversion_rate']), reverse=True)[:3]

    risk_score = (churn_data['churn_rate'] * 0.7) + ((100 - conversion.get('overall_conversion_rate', 100)) * 0.3)

    recommendations = []
    if churn_data['churn_rate'] > 20: recommendations.append("High churn rate detected - implement targeted retention program")
    if conversion.get('overall_conversion_rate', 100) < 30: recommendations.append("Low conversion rate - optimize trial-to-paid process")
    if high_risk_contract_types: recommendations.append(f"Address high churn in contract types: {', '.join([t[0] for t in high_risk_contract_types])}")
    if high_risk_modalities: recommendations.append(f"Focus on improving retention for modalities: {', '.join([m[0] for m in high_risk_modalities])}")
    if high_risk_consultants: recommendations.append(f"Provide additional training for consultants with high churn: {', '.join([c[0] for c in high_risk_consultants])}")

    return {
        'overall_risk_score': round(risk_score, 1),
        'risk_level': 'High' if risk_score > 60 else 'Medium' if risk_score > 30 else 'Low',
        'high_risk_contract_types': [{'type': t[0], 'risk_score': t[1]} for t in high_risk_contract_types],
        'high_risk_modalities': [{'modality': m[0], 'risk_score': m[1]} for m in high_risk_modalities],
        'high_risk_consultants': [{'consultant': c[0], 'churn_risk': c[1]['churn_risk'], 'conversion_rate': c[1]['conversion_rate']} for c in high_risk_consultants],
        'mitigation_recommendations': recommendations,
        'critical_risk_factors': len(recommendations)
    }

def predictive_health_indicators(df):
    """
    Calculates forward-looking business health indicators
    """
    df['Início'] = pd.to_datetime(df['Início'])
    df['Valor_Num'] = df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    recent_data = df[df['Início'] >= (pd.Timestamp.now() - pd.DateOffset(months=3))]

    monthly_clients = recent_data.set_index('Início').resample('M').size()
    client_growth_rate = monthly_clients.pct_change().mean() * 100

    monthly_revenue = recent_data.set_index('Início').resample('M')['Valor_Num'].sum()
    revenue_growth_rate = monthly_revenue.pct_change().mean() * 100

    churn = churn_analysis(df)
    revenue_churn = revenue_churn_analysis(df)

    clv = lifetime_value_analysis(df)['annualized_clv_estimate']
    cac = cac_analysis(df)['cac_per_client']
    clv_cac_ratio = clv / cac if cac > 0 else None

    trajectory_score = 0
    trajectory_score += max(0, min(30, client_growth_rate * 2)) if not np.isnan(client_growth_rate) else 0
    trajectory_score += max(0, min(40, revenue_growth_rate * 2.5)) if not np.isnan(revenue_growth_rate) else 0
    trajectory_score -= min(20, churn['churn_rate'] * 0.5)
    if clv_cac_ratio: trajectory_score += min(30, clv_cac_ratio * 5)
    trajectory_score = max(0, min(100, trajectory_score))

    client_projection = len(df) * (1 + (client_growth_rate / 100)) ** 6 if not np.isnan(client_growth_rate) else len(df)
    revenue_projection = df['Valor_Num'].sum() * (1 + (revenue_growth_rate / 100)) ** 6 if not np.isnan(revenue_growth_rate) else df['Valor_Num'].sum()

    # Handle potential infinity
    if np.isinf(client_projection):
        client_projection = len(df) # Fallback to current number if projection is unstable
    if np.isinf(revenue_projection):
        revenue_projection = df['Valor_Num'].sum() # Fallback to current revenue

    return {
        'trajectory_score': round(trajectory_score, 1),
        'client_growth_rate_3m': round(client_growth_rate, 2),
        'revenue_growth_rate_3m': round(revenue_growth_rate, 2),
        'churn_rate': churn['churn_rate'],
        'revenue_churn_rate': revenue_churn['revenue_churn_rate'],
        'clv_cac_ratio': round(clv_cac_ratio, 2) if clv_cac_ratio else None,
        '6_month_client_projection': int(client_projection),
        '6_month_revenue_projection': round(revenue_projection, 2),
        'growth_momentum': 'Positive' if revenue_growth_rate > 0 and client_growth_rate > 0 else 'Negative'
    }

def churn_prediction_indicators(df):
    """
    Identifies early warning indicators of potential churn
    """
    cancelled = df[df['Status Cliente'] == 'Cancelado']
    active = df[df['Status Cliente'] == 'Bloqueado']

    if cancelled.empty or active.empty: return {}

    cancelled['Valor_Num'] = cancelled['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)
    active['Valor_Num'] = active['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    cancelled_by_type = cancelled['Contrato'].value_counts(normalize=True)
    active_by_type = active['Contrato'].value_counts(normalize=True)

    cancelled_by_modality = cancelled['Modalidade'].value_counts(normalize=True)
    active_by_modality = active['Modalidade'].value_counts(normalize=True)

    cancelled_by_consultant = cancelled['Consultor'].value_counts(normalize=True)
    active_by_consultant = active['Consultor'].value_counts(normalize=True)

    cancelled['contract_length'] = (pd.to_datetime(cancelled['Vencimento']) - pd.to_datetime(cancelled['Início'])).dt.days
    active['contract_length'] = (pd.to_datetime(active['Vencimento']) - pd.to_datetime(active['Início'])).dt.days

    risk_indicators = {
        'contract_type_risk': {},
        'modality_risk': {},
        'consultant_risk': {},
        'contract_length_risk': {
            'cancelled_avg_days': cancelled['contract_length'].mean(),
            'active_avg_days': active['contract_length'].mean()
        }
    }

    for contract_type in set(cancelled_by_type.index) | set(active_by_type.index):
        cancelled_pct = cancelled_by_type.get(contract_type, 0)
        active_pct = active_by_type.get(contract_type, 0)
        risk_score = (cancelled_pct / (cancelled_pct + active_pct)) if (cancelled_pct + active_pct) > 0 else 0
        risk_indicators['contract_type_risk'][contract_type] = round(risk_score * 100, 2)

    for modality in set(cancelled_by_modality.index) | set(active_by_modality.index):
        if modality == '-' or pd.isna(modality): continue
        cancelled_pct = cancelled_by_modality.get(modality, 0)
        active_pct = active_by_modality.get(modality, 0)
        risk_score = (cancelled_pct / (cancelled_pct + active_pct)) if (cancelled_pct + active_pct) > 0 else 0
        risk_indicators['modality_risk'][modality] = round(risk_score * 100, 2)

    for consultant in set(cancelled_by_consultant.index) | set(active_by_consultant.index):
        if consultant == '-' or consultant == 'CONSULTOR PADRÃO - MATEUS --' or pd.isna(consultant): continue
        cancelled_pct = cancelled_by_consultant.get(consultant, 0)
        active_pct = active_by_consultant.get(consultant, 0)
        risk_score = (cancelled_pct / (cancelled_pct + active_pct)) if (cancelled_pct + active_pct) > 0 else 0
        risk_indicators['consultant_risk'][consultant] = round(risk_score * 100, 2)

    return risk_indicators

def revenue_churn_analysis(df):
    """
    Analyzes revenue churn (MRR churn) in addition to client churn
    """
    df['Início'] = pd.to_datetime(df['Início'])
    df['Vencimento'] = pd.to_datetime(df['Vencimento'])
    df['Valor_Num'] = df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    active_contracts = df[df['Status Cliente'] == 'Bloqueado']
    cancelled_contracts = df[df['Status Cliente'] == 'Cancelado']

    current_month = pd.Timestamp.now().replace(day=1)
    next_month = (current_month + pd.DateOffset(months=1)).replace(day=1)

    active_this_month = active_contracts[
        (active_contracts['Início'] <= current_month) &
        (active_contracts['Vencimento'] >= current_month)
    ]

    mrr = active_this_month['Valor_Num'].sum()

    last_month = (current_month - pd.DateOffset(months=1)).replace(day=1)

    active_last_month = active_contracts[
        (active_contracts['Início'] <= last_month) &
        (active_contracts['Vencimento'] >= last_month)
    ]

    churned_contracts = cancelled_contracts[
        (cancelled_contracts['Vencimento'] >= last_month) &
        (cancelled_contracts['Vencimento'] < current_month)
    ]

    churned_revenue = churned_contracts['Valor_Num'].sum()

    revenue_churn_rate = (churned_revenue / active_last_month['Valor_Num'].sum() * 100) if not active_last_month.empty and active_last_month['Valor_Num'].sum() > 0 else 0

    net_revenue_retention = 100 - revenue_churn_rate

    return {
        'mrr': round(mrr, 2),
        'churned_revenue': round(churned_revenue, 2),
        'revenue_churn_rate': round(revenue_churn_rate, 2),
        'net_revenue_retention': round(net_revenue_retention, 2),
        'churned_contracts_count': len(churned_contracts),
        'average_churn_value': round(churned_revenue / len(churned_contracts), 2) if len(churned_contracts) > 0 else 0
    }

def cac_trend_analysis(df, period='M', marketing_spend_data=None):
    """
    Analyzes CAC trends over time
    """
    df['Início'] = pd.to_datetime(df['Início'])

    new_clients = df[~df['Contrato'].str.contains('GYMPASS|EXPERIMENTAL|AVULSA', case=False, na=False) &
                    (df['Valor'] != '000')]

    new_clients_by_period = new_clients.set_index('Início').resample(period).size()

    df['Valor_Num'] = df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)
    revenue_by_period = df.set_index('Início').resample(period)['Valor_Num'].sum()

    cac_trends = {}

    for date, client_count in new_clients_by_period.items():
        if client_count > 0:
            period_revenue = revenue_by_period.get(date, 0)

            period_marketing_spend = period_revenue * 0.1
            period_sales_costs = period_revenue * 0.15

            period_cac = (period_marketing_spend + period_sales_costs) / client_count

            monthly_revenue = period_revenue / client_count / (30/365)
            clv_cac_ratio = monthly_revenue / period_cac if period_cac > 0 else None

            cac_trends[date.strftime('%Y-%m')] = {
                'new_clients': int(client_count),
                'estimated_cac': round(period_cac, 2),
                'clv_cac_ratio': round(clv_cac_ratio, 2) if clv_cac_ratio else None
            }

    return cac_trends

def cac_analysis(df, marketing_spend_data=None, staff_costs=None):
    """
    Analyzes Customer Acquisition Cost metrics
    """
    new_clients = df[~df['Contrato'].str.contains('GYMPASS|EXPERIMENTAL|AVULSA', case=False, na=False) &
                    (df['Valor'] != '000')]

    total_new_clients = len(new_clients)

    total_marketing_spend = 0
    total_sales_staff_costs = 0

    if marketing_spend_data:
        total_marketing_spend = sum(marketing_spend_data.values())
    else:
        revenue = revenue_analysis(df)['total_revenue']
        total_marketing_spend = revenue * 0.1

    if staff_costs:
        total_sales_staff_costs = sum(staff_costs.values())
    else:
        revenue = revenue_analysis(df)['total_revenue']
        total_sales_staff_costs = revenue * 0.15

    total_cac = total_marketing_spend + total_sales_staff_costs
    cac_per_client = total_cac / total_new_clients if total_new_clients > 0 else 0

    clv_data = lifetime_value_analysis(df)
    clv = clv_data['annualized_clv_estimate']
    monthly_revenue_per_client = clv / 12

    cac_payback_months = cac_per_client / monthly_revenue_per_client if monthly_revenue_per_client > 0 else None

    return {
        'total_new_clients': total_new_clients,
        'total_marketing_spend': round(total_marketing_spend, 2),
        'total_sales_staff_costs': round(total_sales_staff_costs, 2),
        'total_cac': round(total_cac, 2),
        'cac_per_client': round(cac_per_client, 2),
        'clv_cac_ratio': round(clv / cac_per_client, 2) if cac_per_client > 0 else None,
        'cac_payback_months': round(cac_payback_months, 1) if cac_payback_months else None,
        'marketing_efficiency': round((clv / total_marketing_spend) * 100, 2) if total_marketing_spend > 0 else None
    }

def trial_conversion_analysis(df):
    """
    Analyzes detailed trial class conversion patterns
    """
    trials = df[df['Contrato'].str.contains('EXPERIMENTAL|AVULSA', case=False, na=False)]

    if trials.empty:
        return {'message': 'No trial classes found in dataset'}

    conversion_data = []
    for _, trial in trials.iterrows():
        client_id = trial['Código']
        trial_type = trial['Contrato']
        consultant = trial['Consultor']

        paid_contracts = df[(df['Código'] == client_id) &
                           (~df['Contrato'].str.contains('EXPERIMENTAL|AVULSA|GYMPASS', case=False, na=False)) &
                           (df['Valor'] != '000')]

        converted = len(paid_contracts) > 0
        days_to_conversion = None

        if converted:
            first_paid = paid_contracts['Início'].min()
            trial_date = trial['Início']
            days_to_conversion = (pd.to_datetime(first_paid) - pd.to_datetime(trial_date)).days

        conversion_data.append({
            'client_id': client_id,
            'trial_type': trial_type,
            'consultant': consultant,
            'converted': converted,
            'days_to_conversion': days_to_conversion
        })

    conversion_df = pd.DataFrame(conversion_data)

    overall_rate = conversion_df['converted'].mean()
    by_trial_type = conversion_df.groupby('trial_type')['converted'].mean()
    by_consultant = conversion_df.groupby('consultant')['converted'].mean()

    avg_conversion_time = conversion_df[conversion_df['converted']]['days_to_conversion'].mean()

    return {
        'overall_conversion_rate': round(overall_rate * 100, 2),
        'conversion_by_trial_type': {k: round(v * 100, 2) for k, v in by_trial_type.to_dict().items()},
        'conversion_by_consultant': {k: round(v * 100, 2) for k, v in by_consultant.to_dict().items()},
        'average_days_to_conversion': round(avg_conversion_time, 1) if avg_conversion_time else None,
        'conversion_count': conversion_df['converted'].value_counts().to_dict()
    }

def lead_conversion_metrics(df):
    """
    Analyzes the conversion funnel from prospect to paying client
    """
    prospects = df[df['Status Cliente'].isin(['Prospect', 'Excluído']) |
                  df['Contrato'].str.contains('EXPERIMENTAL|AVULSA', case=False, na=False)]

    trials = df[df['Contrato'].str.contains('EXPERIMENTAL|AVULSA', case=False, na=False)]

    paid_contracts = df[~df['Contrato'].str.contains('GYMPASS|EXPERIMENTAL|AVULSA', case=False, na=False) &
                        (df['Valor'] != '000')]

    total_prospects = len(prospects)
    total_trials = len(trials)
    total_paying = len(paid_contracts)

    prospect_to_trial = (total_trials / total_prospects * 100) if total_prospects > 0 else 0
    trial_to_paid = (total_paying / total_trials * 100) if total_trials > 0 else 0
    overall_conversion = (total_paying / total_prospects * 100) if total_prospects > 0 else 0

    return {
        'total_prospects': total_prospects,
        'total_trials': total_trials,
        'total_paying_clients': total_paying,
        'prospect_to_trial_rate': round(prospect_to_trial, 2),
        'trial_to_paid_rate': round(trial_to_paid, 2),
        'overall_conversion_rate': round(overall_conversion, 2),
        'conversion_funnel': {
            'prospects': total_prospects,
            'trials': total_trials,
            'paid_clients': total_paying
        }
    }

def client_cohort_analysis(df, period='M'):
    """
    Performs cohort analysis to track client behavior over time
    """
    df = df.copy()
    df['Início'] = pd.to_datetime(df['Início'])
    df['Vencimento'] = pd.to_datetime(df['Vencimento'])

    df['cohort'] = df.groupby('Código')['Início'].transform('min')
    if period == 'M':
        df['cohort'] = df['cohort'].dt.to_period('M')
    elif period == 'Q':
        df['cohort'] = df['cohort'].dt.to_period('Q')

    df['period'] = (df['Início'].dt.to_period('M') - df['cohort'].apply(lambda x: x.asfreq('M'))).apply(lambda x: x.n)

    cohort_data = df.groupby(['cohort', 'period']).size().unstack(fill_value=0)

    cohort_sizes = cohort_data.iloc[:, 0]
    retention_matrix = cohort_data.divide(cohort_sizes, axis=0)

    retention_dict = {}
    for cohort, row in retention_matrix.iterrows():
        retention_dict[str(cohort)] = {str(k): round(v * 100, 2) for k, v in row.items() if k >= 0}

    avg_retention = retention_matrix.mean()

    return {
        'cohort_sizes': {str(k): v for k, v in cohort_sizes.to_dict().items()},
        'retention_matrix': retention_dict,
        'average_retention': {str(k): round(v * 100, 2) for k, v in avg_retention.items() if k >= 0},
        'cohort_period': period,
        'cohorts_analyzed': len(cohort_sizes)
    }

def revenue_cohort_analysis(df, period='M'):
    """
    Performs revenue cohort analysis to track revenue retention over time
    """
    df = df.copy()
    df['Início'] = pd.to_datetime(df['Início'])
    df['Vencimento'] = pd.to_datetime(df['Vencimento'])
    df['Valor_Num'] = df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    df['cohort'] = df.groupby('Código')['Início'].transform('min')
    if period == 'M':
        df['cohort'] = df['cohort'].dt.to_period('M')
    elif period == 'Q':
        df['cohort'] = df['cohort'].dt.to_period('Q')

    df['period'] = (df['Início'].dt.to_period('M') - df['cohort'].apply(lambda x: x.asfreq('M'))).apply(lambda x: x.n)

    revenue_data = df.groupby(['cohort', 'period'])['Valor_Num'].sum().unstack(fill_value=0)

    initial_revenue = revenue_data.iloc[:, 0]
    revenue_retention = revenue_data.divide(initial_revenue, axis=0)

    user_counts = df.groupby(['cohort', 'period']).size().unstack(fill_value=0)
    revenue_per_user = revenue_data.divide(user_counts, axis=0)

    revenue_retention_dict = {}
    for cohort, row in revenue_retention.iterrows():
        revenue_retention_dict[str(cohort)] = {str(k): round(v * 100, 2) for k, v in row.items() if k >= 0}

    revenue_per_user_dict = {}
    for cohort, row in revenue_per_user.iterrows():
        revenue_per_user_dict[str(cohort)] = {str(k): round(v, 2) for k, v in row.items() if k >= 0}

    return {
        'initial_revenue': {str(k): v for k, v in initial_revenue.round(2).to_dict().items()},
        'revenue_retention': revenue_retention_dict,
        'revenue_per_user': revenue_per_user_dict,
        'cohort_period': period,
        'total_revenue': df['Valor_Num'].sum()
    }

def cross_sell_analysis(df):
    """
    Analyzes cross-selling and upselling opportunities and patterns
    """
    client_contracts = df.groupby('Código').size().reset_index(name='contract_count')
    multi_contract_clients = client_contracts[client_contracts['contract_count'] > 1]

    contract_progression = []

    for client_id in multi_contract_clients['Código']:
        client_df = df[df['Código'] == client_id].sort_values('Início')

        if len(client_df) <= 1: continue

        previous_contract = None
        for _, current in client_df.iterrows():
            if previous_contract is not None:
                current_value = float(current['Valor'].replace('000', '0').replace('.', '').replace(',', '.'))
                previous_value = float(previous_contract['Valor'].replace('000', '0').replace('.', '').replace(',', '.'))

                is_upsell = current_value > previous_value
                value_change = current_value - previous_value

                contract_progression.append({
                    'client_id': client_id,
                    'previous_contract': previous_contract['Contrato'],
                    'new_contract': current['Contrato'],
                    'previous_value': previous_value,
                    'new_value': current_value,
                    'value_change': value_change,
                    'is_upsell': is_upsell,
                    'time_between_contracts': (pd.to_datetime(current['Início']) - pd.to_datetime(previous_contract['Início'])).days
                })

            previous_contract = current

    if not contract_progression: return {'message': 'No contract progression data found'}

    progression_df = pd.DataFrame(contract_progression)

    upsell_count = progression_df['is_upsell'].sum()
    total_progressions = len(progression_df)
    upsell_rate = upsell_count / total_progressions * 100

    avg_upsell_value = progression_df[progression_df['is_upsell']]['value_change'].mean()

    progression_paths = progression_df.groupby(['previous_contract', 'new_contract']).size().reset_index(name='count')
    progression_paths = progression_paths.sort_values('count', ascending=False)

    avg_time_between = progression_df['time_between_contracts'].mean()

    return {
        'total_clients_with_progression': len(progression_df['client_id'].unique()),
        'total_contract_progressions': total_progressions,
        'upsell_rate': round(upsell_rate, 2),
        'avg_upsell_value': round(avg_upsell_value, 2) if not progression_df[progression_df['is_upsell']].empty else 0,
        'top_progression_paths': progression_paths.head(5).to_dict('records'),
        'avg_days_between_contracts': round(avg_time_between, 1),
        'progression_data': progression_df.to_dict('records')
    }

def contract_renewal_timing(df):
    """
    Analyzes patterns in contract renewal timing
    """
    # Identify clients with multiple contracts
    client_contracts = df.sort_values(['Código', 'Início'])
    client_contracts['next_contract'] = client_contracts.groupby('Código')['Início'].shift(-1)

    # Calculate days between contracts
    client_contracts['days_between'] = (pd.to_datetime(client_contracts['next_contract']) -
                                      pd.to_datetime(client_contracts['Início'])).dt.days

    # Filter valid renewal intervals (positive values only)
    valid_renewals = client_contracts[client_contracts['days_between'] > 0]

    if valid_renewals.empty:
        return {'message': 'No renewal patterns detected'}

    # Analyze renewal timing by contract type
    renewal_timing = valid_renewals.groupby('Contrato')['days_between'].agg(
        avg_days=('mean'),
        median_days=('median'),
        std_days=('std'),
        renewal_count=('count')
    )

    # Create renewal timing buckets
    renewal_buckets = pd.cut(valid_renewals['days_between'],
                           bins=[0, 1, 7, 14, 30, 60, 90, 180, 365],
                           labels=['<1d', '1-7d', '7-14d', '14-30d', '1-2m', '2-3m', '3-6m', '6-12m'])

    renewal_distribution = renewal_buckets.value_counts(normalize=True).sort_index() * 100

    return {
        'overall_renewal_timing': {
            'avg_days_between_renewals': round(valid_renewals['days_between'].mean(), 1),
            'median_days_between_renewals': valid_renewals['days_between'].median(),
            'renewal_window_distribution': {str(k): round(v, 2) for k, v in renewal_distribution.items()}
        },
        'renewal_timing_by_contract': renewal_timing.round(1).to_dict(),
        'optimal_renewal_reminder_timing': determine_optimal_reminder_timing(renewal_distribution)
    }

def determine_optimal_reminder_timing(renewal_distribution):
    """
    Determines the optimal timing for renewal reminders based on renewal patterns
    """
    # Convert to list of (bucket, percentage) tuples
    renewal_list = [(k, v) for k, v in renewal_distribution.items()]

    # Find the peak renewal window
    peak_window = max(renewal_list, key=lambda x: x[1])

    # Determine reminder timing based on peak
    if peak_window[0] == '<1d':
        return "Send reminder 3-5 days before expiration - clients tend to renew at the last minute"
    elif peak_window[0] in ['1-7d', '7-14d']:
        return "Send reminder 7-10 days before expiration - clients typically renew within a week of expiration"
    elif peak_window[0] in ['14-30d', '1-2m']:
        return "Send reminder 14-21 days before expiration - clients typically renew 2-4 weeks before expiration"
    else:
        return "Send reminder 30 days before expiration - clients typically renew well in advance"

# Placeholder for gympass_to_direct_conversion_analysis as it's not in the provided snippets
def gympass_to_direct_conversion_analysis(df):
    return {}

def risk_assessment_dashboard(df):
    """
    Creates a comprehensive risk assessment dashboard
    """
    churn_indicators = churn_prediction_indicators(df)
    churn_data = churn_analysis(df)
    conversion = trial_conversion_analysis(df)

    high_risk_contract_types = sorted(churn_indicators.get('contract_type_risk', {}).items(), key=lambda x: x[1], reverse=True)[:3]
    high_risk_modalities = sorted(churn_indicators.get('modality_risk', {}).items(), key=lambda x: x[1], reverse=True)[:3]

    consultant_risk = {}
    for consultant, risk in churn_indicators.get('consultant_risk', {}).items():
        consultant_risk[consultant] = {'churn_risk': risk, 'conversion_rate': conversion.get('conversion_by_consultant', {}).get(consultant, 0)}

    high_risk_consultants = sorted(consultant_risk.items(), key=lambda x: (x[1]['churn_risk'], -x[1]['conversion_rate']), reverse=True)[:3]

    risk_score = (churn_data['churn_rate'] * 0.7) + ((100 - conversion.get('overall_conversion_rate', 100)) * 0.3)

    recommendations = []
    if churn_data['churn_rate'] > 20: recommendations.append("High churn rate detected - implement targeted retention program")
    if conversion.get('overall_conversion_rate', 100) < 30: recommendations.append("Low conversion rate - optimize trial-to-paid process")
    if high_risk_contract_types: recommendations.append(f"Address high churn in contract types: {', '.join([t[0] for t in high_risk_contract_types])}")
    if high_risk_modalities: recommendations.append(f"Focus on improving retention for modalities: {', '.join([m[0] for m in high_risk_modalities])}")
    if high_risk_consultants: recommendations.append(f"Provide additional training for consultants with high churn: {', '.join([c[0] for c in high_risk_consultants])}")

    return {
        'overall_risk_score': round(risk_score, 1),
        'risk_level': 'High' if risk_score > 60 else 'Medium' if risk_score > 30 else 'Low',
        'high_risk_contract_types': [{'type': t[0], 'risk_score': t[1]} for t in high_risk_contract_types],
        'high_risk_modalities': [{'modality': m[0], 'risk_score': m[1]} for m in high_risk_modalities],
        'high_risk_consultants': [{'consultant': c[0], 'churn_risk': c[1]['churn_risk'], 'conversion_rate': c[1]['conversion_rate']} for c in high_risk_consultants],
        'mitigation_recommendations': recommendations,
        'critical_risk_factors': len(recommendations)
    }

def predictive_health_indicators(df):
    """
    Calculates forward-looking business health indicators
    """
    df['Início'] = pd.to_datetime(df['Início'])
    df['Valor_Num'] = df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    recent_data = df[df['Início'] >= (pd.Timestamp.now() - pd.DateOffset(months=3))]

    monthly_clients = recent_data.set_index('Início').resample('M').size()
    client_growth_rate = monthly_clients.pct_change().mean() * 100

    monthly_revenue = recent_data.set_index('Início').resample('M')['Valor_Num'].sum()
    revenue_growth_rate = monthly_revenue.pct_change().mean() * 100

    churn = churn_analysis(df)
    revenue_churn = revenue_churn_analysis(df)

    clv = lifetime_value_analysis(df)['annualized_clv_estimate']
    cac = cac_analysis(df)['cac_per_client']
    clv_cac_ratio = clv / cac if cac > 0 else None

    trajectory_score = 0
    trajectory_score += max(0, min(30, client_growth_rate * 2)) if not np.isnan(client_growth_rate) else 0
    trajectory_score += max(0, min(40, revenue_growth_rate * 2.5)) if not np.isnan(revenue_growth_rate) else 0
    trajectory_score -= min(20, churn['churn_rate'] * 0.5)
    if clv_cac_ratio: trajectory_score += min(30, clv_cac_ratio * 5)
    trajectory_score = max(0, min(100, trajectory_score))

    client_projection = len(df) * (1 + (client_growth_rate / 100)) ** 6 if not np.isnan(client_growth_rate) else len(df)
    revenue_projection = df['Valor_Num'].sum() * (1 + (revenue_growth_rate / 100)) ** 6 if not np.isnan(revenue_growth_rate) else df['Valor_Num'].sum()

    # Handle potential infinity
    if np.isinf(client_projection):
        client_projection = len(df) # Fallback to current number if projection is unstable
    if np.isinf(revenue_projection):
        revenue_projection = df['Valor_Num'].sum() # Fallback to current revenue

    return {
        'trajectory_score': round(trajectory_score, 1),
        'client_growth_rate_3m': round(client_growth_rate, 2),
        'revenue_growth_rate_3m': round(revenue_growth_rate, 2),
        'churn_rate': churn['churn_rate'],
        'revenue_churn_rate': revenue_churn['revenue_churn_rate'],
        'clv_cac_ratio': round(clv_cac_ratio, 2) if clv_cac_ratio else None,
        '6_month_client_projection': int(client_projection),
        '6_month_revenue_projection': round(revenue_projection, 2),
        'growth_momentum': 'Positive' if revenue_growth_rate > 0 and client_growth_rate > 0 else 'Negative'
    }

def churn_prediction_indicators(df):
    """
    Identifies early warning indicators of potential churn
    """
    cancelled = df[df['Status Cliente'] == 'Cancelado']
    active = df[df['Status Cliente'] == 'Bloqueado']

    if cancelled.empty or active.empty: return {}

    cancelled['Valor_Num'] = cancelled['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)
    active['Valor_Num'] = active['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    cancelled_by_type = cancelled['Contrato'].value_counts(normalize=True)
    active_by_type = active['Contrato'].value_counts(normalize=True)

    cancelled_by_modality = cancelled['Modalidade'].value_counts(normalize=True)
    active_by_modality = active['Modalidade'].value_counts(normalize=True)

    cancelled_by_consultant = cancelled['Consultor'].value_counts(normalize=True)
    active_by_consultant = active['Consultor'].value_counts(normalize=True)

    cancelled['contract_length'] = (pd.to_datetime(cancelled['Vencimento']) - pd.to_datetime(cancelled['Início'])).dt.days
    active['contract_length'] = (pd.to_datetime(active['Vencimento']) - pd.to_datetime(active['Início'])).dt.days

    risk_indicators = {
        'contract_type_risk': {},
        'modality_risk': {},
        'consultant_risk': {},
        'contract_length_risk': {
            'cancelled_avg_days': cancelled['contract_length'].mean(),
            'active_avg_days': active['contract_length'].mean()
        }
    }

    for contract_type in set(cancelled_by_type.index) | set(active_by_type.index):
        cancelled_pct = cancelled_by_type.get(contract_type, 0)
        active_pct = active_by_type.get(contract_type, 0)
        risk_score = (cancelled_pct / (cancelled_pct + active_pct)) if (cancelled_pct + active_pct) > 0 else 0
        risk_indicators['contract_type_risk'][contract_type] = round(risk_score * 100, 2)

    for modality in set(cancelled_by_modality.index) | set(active_by_modality.index):
        if modality == '-' or pd.isna(modality): continue
        cancelled_pct = cancelled_by_modality.get(modality, 0)
        active_pct = active_by_modality.get(modality, 0)
        risk_score = (cancelled_pct / (cancelled_pct + active_pct)) if (cancelled_pct + active_pct) > 0 else 0
        risk_indicators['modality_risk'][modality] = round(risk_score * 100, 2)

    for consultant in set(cancelled_by_consultant.index) | set(active_by_consultant.index):
        if consultant == '-' or consultant == 'CONSULTOR PADRÃO - MATEUS --' or pd.isna(consultant): continue
        cancelled_pct = cancelled_by_consultant.get(consultant, 0)
        active_pct = active_by_consultant.get(consultant, 0)
        risk_score = (cancelled_pct / (cancelled_pct + active_pct)) if (cancelled_pct + active_pct) > 0 else 0
        risk_indicators['consultant_risk'][consultant] = round(risk_score * 100, 2)

    return risk_indicators

def revenue_churn_analysis(df):
    """
    Analyzes revenue churn (MRR churn) in addition to client churn
    """
    df['Início'] = pd.to_datetime(df['Início'])
    df['Vencimento'] = pd.to_datetime(df['Vencimento'])
    df['Valor_Num'] = df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    active_contracts = df[df['Status Cliente'] == 'Bloqueado']
    cancelled_contracts = df[df['Status Cliente'] == 'Cancelado']

    current_month = pd.Timestamp.now().replace(day=1)
    next_month = (current_month + pd.DateOffset(months=1)).replace(day=1)

    active_this_month = active_contracts[
        (active_contracts['Início'] <= current_month) &
        (active_contracts['Vencimento'] >= current_month)
    ]

    mrr = active_this_month['Valor_Num'].sum()

    last_month = (current_month - pd.DateOffset(months=1)).replace(day=1)

    active_last_month = active_contracts[
        (active_contracts['Início'] <= last_month) &
        (active_contracts['Vencimento'] >= last_month)
    ]

    churned_contracts = cancelled_contracts[
        (cancelled_contracts['Vencimento'] >= last_month) &
        (cancelled_contracts['Vencimento'] < current_month)
    ]

    churned_revenue = churned_contracts['Valor_Num'].sum()

    revenue_churn_rate = (churned_revenue / active_last_month['Valor_Num'].sum() * 100) if not active_last_month.empty and active_last_month['Valor_Num'].sum() > 0 else 0

    net_revenue_retention = 100 - revenue_churn_rate

    return {
        'mrr': round(mrr, 2),
        'churned_revenue': round(churned_revenue, 2),
        'revenue_churn_rate': round(revenue_churn_rate, 2),
        'net_revenue_retention': round(net_revenue_retention, 2),
        'churned_contracts_count': len(churned_contracts),
        'average_churn_value': round(churned_revenue / len(churned_contracts), 2) if len(churned_contracts) > 0 else 0
    }

def cac_trend_analysis(df, period='M', marketing_spend_data=None):
    """
    Analyzes CAC trends over time
    """
    df['Início'] = pd.to_datetime(df['Início'])

    new_clients = df[~df['Contrato'].str.contains('GYMPASS|EXPERIMENTAL|AVULSA', case=False, na=False) &
                    (df['Valor'] != '000')]

    new_clients_by_period = new_clients.set_index('Início').resample(period).size()

    df['Valor_Num'] = df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)
    revenue_by_period = df.set_index('Início').resample(period)['Valor_Num'].sum()

    cac_trends = {}

    for date, client_count in new_clients_by_period.items():
        if client_count > 0:
            period_revenue = revenue_by_period.get(date, 0)

            period_marketing_spend = period_revenue * 0.1
            period_sales_costs = period_revenue * 0.15

            period_cac = (period_marketing_spend + period_sales_costs) / client_count

            monthly_revenue = period_revenue / client_count / (30/365)
            clv_cac_ratio = monthly_revenue / period_cac if period_cac > 0 else None

            cac_trends[date.strftime('%Y-%m')] = {
                'new_clients': int(client_count),
                'estimated_cac': round(period_cac, 2),
                'clv_cac_ratio': round(clv_cac_ratio, 2) if clv_cac_ratio else None
            }

    return cac_trends

def cac_analysis(df, marketing_spend_data=None, staff_costs=None):
    """
    Analyzes Customer Acquisition Cost metrics
    """
    new_clients = df[~df['Contrato'].str.contains('GYMPASS|EXPERIMENTAL|AVULSA', case=False, na=False) &
                    (df['Valor'] != '000')]

    total_new_clients = len(new_clients)

    total_marketing_spend = 0
    total_sales_staff_costs = 0

    if marketing_spend_data:
        total_marketing_spend = sum(marketing_spend_data.values())
    else:
        revenue = revenue_analysis(df)['total_revenue']
        total_marketing_spend = revenue * 0.1

    if staff_costs:
        total_sales_staff_costs = sum(staff_costs.values())
    else:
        revenue = revenue_analysis(df)['total_revenue']
        total_sales_staff_costs = revenue * 0.15

    total_cac = total_marketing_spend + total_sales_staff_costs
    cac_per_client = total_cac / total_new_clients if total_new_clients > 0 else 0

    clv_data = lifetime_value_analysis(df)
    clv = clv_data['annualized_clv_estimate']
    monthly_revenue_per_client = clv / 12

    cac_payback_months = cac_per_client / monthly_revenue_per_client if monthly_revenue_per_client > 0 else None

    return {
        'total_new_clients': total_new_clients,
        'total_marketing_spend': round(total_marketing_spend, 2),
        'total_sales_staff_costs': round(total_sales_staff_costs, 2),
        'total_cac': round(total_cac, 2),
        'cac_per_client': round(cac_per_client, 2),
        'clv_cac_ratio': round(clv / cac_per_client, 2) if cac_per_client > 0 else None,
        'cac_payback_months': round(cac_payback_months, 1) if cac_payback_months else None,
        'marketing_efficiency': round((clv / total_marketing_spend) * 100, 2) if total_marketing_spend > 0 else None
    }

def trial_conversion_analysis(df):
    """
    Analyzes detailed trial class conversion patterns
    """
    trials = df[df['Contrato'].str.contains('EXPERIMENTAL|AVULSA', case=False, na=False)]

    if trials.empty:
        return {'message': 'No trial classes found in dataset'}

    conversion_data = []
    for _, trial in trials.iterrows():
        client_id = trial['Código']
        trial_type = trial['Contrato']
        consultant = trial['Consultor']

        paid_contracts = df[(df['Código'] == client_id) &
                           (~df['Contrato'].str.contains('EXPERIMENTAL|AVULSA|GYMPASS', case=False, na=False)) &
                           (df['Valor'] != '000')]

        converted = len(paid_contracts) > 0
        days_to_conversion = None

        if converted:
            first_paid = paid_contracts['Início'].min()
            trial_date = trial['Início']
            days_to_conversion = (pd.to_datetime(first_paid) - pd.to_datetime(trial_date)).days

        conversion_data.append({
            'client_id': client_id,
            'trial_type': trial_type,
            'consultant': consultant,
            'converted': converted,
            'days_to_conversion': days_to_conversion
        })

    conversion_df = pd.DataFrame(conversion_data)

    overall_rate = conversion_df['converted'].mean()
    by_trial_type = conversion_df.groupby('trial_type')['converted'].mean()
    by_consultant = conversion_df.groupby('consultant')['converted'].mean()

    avg_conversion_time = conversion_df[conversion_df['converted']]['days_to_conversion'].mean()

    return {
        'overall_conversion_rate': round(overall_rate * 100, 2),
        'conversion_by_trial_type': {k: round(v * 100, 2) for k, v in by_trial_type.to_dict().items()},
        'conversion_by_consultant': {k: round(v * 100, 2) for k, v in by_consultant.to_dict().items()},
        'average_days_to_conversion': round(avg_conversion_time, 1) if avg_conversion_time else None,
        'conversion_count': conversion_df['converted'].value_counts().to_dict()
    }

def lead_conversion_metrics(df):
    """
    Analyzes the conversion funnel from prospect to paying client
    """
    prospects = df[df['Status Cliente'].isin(['Prospect', 'Excluído']) |
                  df['Contrato'].str.contains('EXPERIMENTAL|AVULSA', case=False, na=False)]

    trials = df[df['Contrato'].str.contains('EXPERIMENTAL|AVULSA', case=False, na=False)]

    paid_contracts = df[~df['Contrato'].str.contains('GYMPASS|EXPERIMENTAL|AVULSA', case=False, na=False) &
                        (df['Valor'] != '000')]

    total_prospects = len(prospects)
    total_trials = len(trials)
    total_paying = len(paid_contracts)

    prospect_to_trial = (total_trials / total_prospects * 100) if total_prospects > 0 else 0
    trial_to_paid = (total_paying / total_trials * 100) if total_trials > 0 else 0
    overall_conversion = (total_paying / total_prospects * 100) if total_prospects > 0 else 0

    return {
        'total_prospects': total_prospects,
        'total_trials': total_trials,
        'total_paying_clients': total_paying,
        'prospect_to_trial_rate': round(prospect_to_trial, 2),
        'trial_to_paid_rate': round(trial_to_paid, 2),
        'overall_conversion_rate': round(overall_conversion, 2),
        'conversion_funnel': {
            'prospects': total_prospects,
            'trials': total_trials,
            'paid_clients': total_paying
        }
    }

def client_cohort_analysis(df, period='M'):
    """
    Performs cohort analysis to track client behavior over time
    """
    df = df.copy()
    df['Início'] = pd.to_datetime(df['Início'])
    df['Vencimento'] = pd.to_datetime(df['Vencimento'])

    df['cohort'] = df.groupby('Código')['Início'].transform('min')
    if period == 'M':
        df['cohort'] = df['cohort'].dt.to_period('M')
    elif period == 'Q':
        df['cohort'] = df['cohort'].dt.to_period('Q')

    df['period'] = (df['Início'].dt.to_period('M') - df['cohort'].apply(lambda x: x.asfreq('M'))).apply(lambda x: x.n)

    cohort_data = df.groupby(['cohort', 'period']).size().unstack(fill_value=0)

    cohort_sizes = cohort_data.iloc[:, 0]
    retention_matrix = cohort_data.divide(cohort_sizes, axis=0)

    retention_dict = {}
    for cohort, row in retention_matrix.iterrows():
        retention_dict[str(cohort)] = {str(k): round(v * 100, 2) for k, v in row.items() if k >= 0}

    avg_retention = retention_matrix.mean()

    return {
        'cohort_sizes': {str(k): v for k, v in cohort_sizes.to_dict().items()},
        'retention_matrix': retention_dict,
        'average_retention': {str(k): round(v * 100, 2) for k, v in avg_retention.items() if k >= 0},
        'cohort_period': period,
        'cohorts_analyzed': len(cohort_sizes)
    }

def revenue_cohort_analysis(df, period='M'):
    """
    Performs revenue cohort analysis to track revenue retention over time
    """
    df = df.copy()
    df['Início'] = pd.to_datetime(df['Início'])
    df['Vencimento'] = pd.to_datetime(df['Vencimento'])
    df['Valor_Num'] = df['Valor'].replace('000', '0').str.replace('.', '', regex=False).str.replace(',', '.', regex=False).astype(float)

    df['cohort'] = df.groupby('Código')['Início'].transform('min')
    if period == 'M':
        df['cohort'] = df['cohort'].dt.to_period('M')
    elif period == 'Q':
        df['cohort'] = df['cohort'].dt.to_period('Q')

    df['period'] = (df['Início'].dt.to_period('M') - df['cohort'].apply(lambda x: x.asfreq('M'))).apply(lambda x: x.n)

    revenue_data = df.groupby(['cohort', 'period'])['Valor_Num'].sum().unstack(fill_value=0)

    initial_revenue = revenue_data.iloc[:, 0]
    revenue_retention = revenue_data.divide(initial_revenue, axis=0)

    user_counts = df.groupby(['cohort', 'period']).size().unstack(fill_value=0)
    revenue_per_user = revenue_data.divide(user_counts, axis=0)

    revenue_retention_dict = {}
    for cohort, row in revenue_retention.iterrows():
        revenue_retention_dict[str(cohort)] = {str(k): round(v * 100, 2) for k, v in row.items() if k >= 0}

    revenue_per_user_dict = {}
    for cohort, row in revenue_per_user.iterrows():
        revenue_per_user_dict[str(cohort)] = {str(k): round(v, 2) for k, v in row.items() if k >= 0}

    return {
        'initial_revenue': {str(k): v for k, v in initial_revenue.round(2).to_dict().items()},
        'revenue_retention': revenue_retention_dict,
        'revenue_per_user': revenue_per_user_dict,
        'cohort_period': period,
        'total_revenue': df['Valor_Num'].sum()
    }

def cross_sell_analysis(df):
    """
    Analyzes cross-selling and upselling opportunities and patterns
    """
    client_contracts = df.groupby('Código').size().reset_index(name='contract_count')
    multi_contract_clients = client_contracts[client_contracts['contract_count'] > 1]

    contract_progression = []

    for client_id in multi_contract_clients['Código']:
        client_df = df[df['Código'] == client_id].sort_values('Início')

        if len(client_df) <= 1: continue

        previous_contract = None
        for _, current in client_df.iterrows():
            if previous_contract is not None:
                current_value = float(current['Valor'].replace('000', '0').replace('.', '').replace(',', '.'))
                previous_value = float(previous_contract['Valor'].replace('000', '0').replace('.', '').replace(',', '.'))

                is_upsell = current_value > previous_value
                value_change = current_value - previous_value

                contract_progression.append({
                    'client_id': client_id,
                    'previous_contract': previous_contract['Contrato'],
                    'new_contract': current['Contrato'],
                    'previous_value': previous_value,
                    'new_value': current_value,
                    'value_change': value_change,
                    'is_upsell': is_upsell,
                    'time_between_contracts': (pd.to_datetime(current['Início']) - pd.to_datetime(previous_contract['Início'])).days
                })

            previous_contract = current

    if not contract_progression: return {'message': 'No contract progression data found'}

    progression_df = pd.DataFrame(contract_progression)

    upsell_count = progression_df['is_upsell'].sum()
    total_progressions = len(progression_df)
    upsell_rate = upsell_count / total_progressions * 100

    avg_upsell_value = progression_df[progression_df['is_upsell']]['value_change'].mean()

    progression_paths = progression_df.groupby(['previous_contract', 'new_contract']).size().reset_index(name='count')
    progression_paths = progression_paths.sort_values('count', ascending=False)

    avg_time_between = progression_df['time_between_contracts'].mean()

    return {
        'total_clients_with_progression': len(progression_df['client_id'].unique()),
        'total_contract_progressions': total_progressions,
        'upsell_rate': round(upsell_rate, 2),
        'avg_upsell_value': round(avg_upsell_value, 2) if not progression_df[progression_df['is_upsell']].empty else 0,
        'top_progression_paths': progression_paths.head(5).to_dict('records'),
        'avg_days_between_contracts': round(avg_time_between, 1),
        'progression_data': progression_df.to_dict('records')
    }

def contract_renewal_timing(df):
    """
    Analyzes patterns in contract renewal timing
    """
    # Identify clients with multiple contracts
    client_contracts = df.sort_values(['Código', 'Início'])
    client_contracts['next_contract'] = client_contracts.groupby('Código')['Início'].shift(-1)

    # Calculate days between contracts
    client_contracts['days_between'] = (pd.to_datetime(client_contracts['next_contract']) -
                                      pd.to_datetime(client_contracts['Início'])).dt.days

    # Filter valid renewal intervals (positive values only)
    valid_renewals = client_contracts[client_contracts['days_between'] > 0]

    if valid_renewals.empty:
        return {'message': 'No renewal patterns detected'}

    # Analyze renewal timing by contract type
    renewal_timing = valid_renewals.groupby('Contrato')['days_between'].agg(
        avg_days=('mean'),
        median_days=('median'),
        std_days=('std'),
        renewal_count=('count')
    )

    # Create renewal timing buckets
    renewal_buckets = pd.cut(valid_renewals['days_between'],
                           bins=[0, 1, 7, 14, 30, 60, 90, 180, 365],
                           labels=['<1d', '1-7d', '7-14d', '14-30d', '1-2m', '2-3m', '3-6m', '6-12m'])

    renewal_distribution = renewal_buckets.value_counts(normalize=True).sort_index() * 100

    return {
        'overall_renewal_timing': {
            'avg_days_between_renewals': round(valid_renewals['days_between'].mean(), 1),
            'median_days_between_renewals': valid_renewals['days_between'].median(),
            'renewal_window_distribution': {str(k): round(v, 2) for k, v in renewal_distribution.items()}
        },
        'renewal_timing_by_contract': renewal_timing.round(1).to_dict(),
        'optimal_renewal_reminder_timing': determine_optimal_reminder_timing(renewal_distribution)
    }

def determine_optimal_reminder_timing(renewal_distribution):
    """
    Determines the optimal timing for renewal reminders based on renewal patterns
    """
    # Convert to list of (bucket, percentage) tuples
    renewal_list = [(k, v) for k, v in renewal_distribution.items()]

    # Find the peak renewal window
    peak_window = max(renewal_list, key=lambda x: x[1])

    # Determine reminder timing based on peak
    if peak_window[0] == '<1d':
        return "Send reminder 3-5 days before expiration - clients tend to renew at the last minute"
    elif peak_window[0] in ['1-7d', '7-14d']:
        return "Send reminder 7-10 days before expiration - clients typically renew within a week of expiration"
    elif peak_window[0] in ['14-30d', '1-2m']:
        return "Send reminder 14-21 days before expiration - clients typically renew 2-4 weeks before expiration"
    else:
        return "Send reminder 30 days before expiration - clients typically renew well in advance"

# Placeholder for gympass_to_direct_conversion_analysis as it's not in the provided snippets
def gympass_to_direct_conversion_analysis(df):
    return {}

def executive_dashboard(df):
    risk = risk_assessment_dashboard(df.copy())
    channel = acquisition_channel_value(df.copy())
    pipeline = consultant_pipeline_efficiency(df.copy())
    client_health = client_health_scoring(df.copy())
    health_indicators = predictive_health_indicators(df.copy())
    revenue_data = revenue_analysis(df.copy())
    churn_data = revenue_churn_analysis(df.copy())
    growth_data = growth_rate_analysis(df.copy())

    strategic_kpis = {'clv_cac_ratio': channel.get('channel_comparison', {}).get('clv_ratio_direct_to_gympass'), 'retention_advantage': channel.get('channel_comparison', {}).get('retention_advantage_direct'), 'multi_modality_impact': calculate_multi_modality_impact(df.copy()), 'consultant_efficiency_index': calculate_consultant_efficiency_index(pipeline), 'risk_mitigation_progress': calculate_risk_mitigation_progress(risk, client_health)}
    strategic_priorities = generate_strategic_priorities(strategic_kpis, risk, channel, pipeline)

    financial_health = {'mrr': churn_data['mrr'], 'mrr_growth_rate': growth_data['average_revenue_growth'], 'net_revenue_retention': churn_data['net_revenue_retention'], 'revenue_concentration': calculate_revenue_concentration(df.copy()), 'profitability_indicator': calculate_profitability_indicator(revenue_data, df.copy())}

    health_score = (client_health.get('risk_distribution',{}).get('Healthy',0) * 0.4) + (health_indicators.get('trajectory_score',0) * 0.6)

    return {'executive_summary': {'business_health_score': round(health_score,1), 'risk_level': risk['risk_level'], 'trajectory_score': health_indicators['trajectory_score'], 'financial_health_score': calculate_financial_health_score(financial_health)}, 'strategic_kpis': strategic_kpis, 'financial_health': financial_health, 'strategic_priorities': strategic_priorities, 'critical_risk_clients': client_health['risk_intervention_priorities'], 'high_value_opportunities': client_health['high_value_healthy_clients'], 'action_plan': generate_executive_action_plan(strategic_priorities, risk, client_health, df.copy())}
