import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, mean_squared_error
import json
from datetime import datetime, timedelta

# Helper Functions
def get_active_clients(df):
    return df[df['Status_Cliente'] == 'Ativo']

def get_churned_clients(df):
    return df[df['Status_Cliente'] == 'Cancelado']

def get_clients_at_risk(df):
    seven_days_ago = datetime.now() - timedelta(days=7)
    return df[(df['Status_Cliente'] == 'Ativo') & (df['Data_Ultima_Visita'] < pd.to_datetime(seven_days_ago))]

# KPI Calculation Functions
def calculate_mrr(df):
    return df[df['Status_Cliente'] == 'Ativo']['Valor_Mensal'].sum()

def calculate_churn_rate(df):
    # Ensure 'Data_Cancelamento' is datetime
    if 'Data_Cancelamento' in df.columns:
        df['Data_Cancelamento'] = pd.to_datetime(df['Data_Cancelamento'], errors='coerce')
        churned_this_month = df[(df['Status_Cliente'] == 'Cancelado') & (df['Data_Cancelamento'].dt.month == datetime.now().month) & (df['Data_Cancelamento'].dt.year == datetime.now().year)]
    else:
        churned_this_month = pd.DataFrame() # Empty if column doesn't exist

    active_last_month = df[df['Data_Inicio_Contrato'] < pd.to_datetime(datetime.now().strftime('%Y-%m-01'))]

    if len(active_last_month) == 0:
        return 0.0

    return len(churned_this_month) / len(active_last_month)

def calculate_ltv(df):
    avg_lifespan = (df['Data_Fim_Contrato'] - df['Data_Inicio_Contrato']).mean().days / 30
    avg_revenue_per_client = df['Valor_Mensal'].mean()
    return avg_revenue_per_client * avg_lifespan

# Predictive Models
def predict_churn(df):
    df_model = df.copy()
    df_model['Churn'] = (df_model['Status_Cliente'] == 'Cancelado').astype(int)

    features = ['Valor_Mensal', 'Frequencia_Uso', 'Tempo_Desde_Ultima_Visita', 'Idade']
    target = 'Churn'

    X = df_model[features].fillna(0)
    y = df_model[target]

    # Ensure there is more than one class in the target variable
    if len(y.unique()) < 2:
        df_model['Churn_Probability'] = 0 # Default probability
        return df_model[['ID_Cliente', 'Churn_Probability']], 1.0 # Accuracy is 1.0 if only one class

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = RandomForestClassifier(random_state=42)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    # Check shape of predict_proba output
    probabilities = model.predict_proba(X)
    if probabilities.shape[1] == 1:
        # If only one class was predicted, extend array
        df_model['Churn_Probability'] = 1 - probabilities[:, 0]
    else:
        df_model['Churn_Probability'] = probabilities[:, 1]

    return df_model[['ID_Cliente', 'Churn_Probability']], accuracy

def predict_ltv(df):
    df_model = df.copy()
    df_model = df_model[df_model['Status_Cliente'] == 'Ativo']

    df_model['Contract_Lifetime'] = (datetime.now() - df_model['Data_Inicio_Contrato']).dt.days

    features = ['Valor_Mensal', 'Frequencia_Uso', 'Gasto_Adicional', 'Idade']
    target = 'Contract_Lifetime'

    X = df_model[features].fillna(0)
    y = df_model[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(random_state=42)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))

    df_model['Predicted_LTV_Days'] = model.predict(X)
    df_model['Predicted_LTV'] = (df_model['Predicted_LTV_Days'] / 30) * df_model['Valor_Mensal']
    return df_model[['ID_Cliente', 'Predicted_LTV']], rmse

# Strategic Actions
def high_risk_client_alerts(df):
    churn_predictions, _ = predict_churn(df)
    high_risk_clients = churn_predictions[churn_predictions['Churn_Probability'] > 0.7]
    return high_risk_clients

def regional_outreach_automation(df):
    regional_churn = df.groupby('Regiao').apply(lambda x: calculate_churn_rate(x)).sort_values(ascending=False)
    outreach_list = regional_churn[regional_churn > regional_churn.mean()]
    return outreach_list

def ab_testing_framework(df, metric='Valor_Mensal'):
    group_a = df[df['Grupo_AB'] == 'A']
    group_b = df[df['Grupo_AB'] == 'B']

    mean_a = group_a[metric].mean()
    mean_b = group_b[metric].mean()

    from scipy.stats import ttest_ind
    ttest_res = ttest_ind(group_a[metric], group_b[metric])

    return {'Group_A_Mean': mean_a, 'Group_B_Mean': mean_b, 'p_value': ttest_res.pvalue}

def executive_dashboard(df):
    """
    Orchestrates all analytics and returns a comprehensive dashboard object.
    """
    # 1. Data Cleaning and Preparation
    df['Data_Inicio_Contrato'] = pd.to_datetime(df['Data_Inicio_Contrato'], errors='coerce')
    df['Data_Fim_Contrato'] = pd.to_datetime(df['Data_Fim_Contrato'], errors='coerce')
    df['Data_Cancelamento'] = pd.to_datetime(df.get('Data_Cancelamento'), errors='coerce')
    df['Data_Ultima_Visita'] = pd.to_datetime(df.get('Data_Ultima_Visita'), errors='coerce')

    # Fill NaNs for modeling
    for col in ['Valor_Mensal', 'Frequencia_Uso', 'Tempo_Desde_Ultima_Visita', 'Idade', 'Gasto_Adicional']:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    for col in ['Status_Cliente', 'Tipo_Contrato', 'Regiao', 'Origem_Cliente', 'Feedback_Cliente']:
        df[col] = df[col].astype(str).fillna('N/A')

    # 2. KPI Calculations
    kpis = {
        'MRR': calculate_mrr(df),
        'Churn_Rate': calculate_churn_rate(df),
        'LTV_Simple': calculate_ltv(df),
        'Active_Clients': len(get_active_clients(df)),
        'Churned_Clients': len(get_churned_clients(df)),
    }
    kpis_df = pd.DataFrame([kpis])

    # 3. Predictive Analytics
    churn_predictions, churn_accuracy = predict_churn(df)
    ltv_predictions, ltv_rmse = predict_ltv(df)
    kpis['Churn_Model_Accuracy'] = churn_accuracy
    kpis['LTV_Model_RMSE'] = ltv_rmse

    # 4. Strategic Analysis & Alerts
    alerts = []
    high_risk = high_risk_client_alerts(df)
    if not high_risk.empty:
        alerts.append(f"High-Risk Alert: {len(high_risk)} clients have a >70% churn probability.")

    regional_outreach = regional_outreach_automation(df)
    if not regional_outreach.empty:
        alerts.append(f"Regional Alert: High churn in regions: {', '.join(regional_outreach.index.tolist())}")

    # 5. Recommendations
    recommendations = []
    if kpis['Churn_Rate'] > 0.05:
        recommendations.append("Recommendation: Churn rate is high. Focus on retention campaigns for at-risk clients.")
    if ltv_rmse > 500:
        recommendations.append("Recommendation: LTV prediction model has high error. Improve features for more accuracy.")

    # 6. Executive Report Generation
    report = f"""
    Executive Summary - {datetime.now().strftime('%Y-%m-%d')}
    ----------------------------------------------------
    This report provides a snapshot of the business's health, including key performance indicators,
    predictive analytics, and strategic alerts.

    Key Performance Indicators:
    - Monthly Recurring Revenue (MRR): ${kpis['MRR']:.2f}
    - Churn Rate: {kpis['Churn_Rate']:.2%}
    - Average Customer Lifetime Value (LTV): ${kpis['LTV_Simple']:.2f}
    - Active Clients: {kpis['Active_Clients']}

    Predictive Insights:
    - The churn prediction model has an accuracy of {kpis['Churn_Model_Accuracy']:.2%}.
    - We have identified {len(high_risk)} clients with a high probability of churning.
    - The LTV prediction model has an RMSE of ${ltv_rmse:.2f}.

    Strategic Alerts:
    - {'. '.join(alerts) if alerts else 'No critical alerts.'}

    Recommendations:
    - {'. '.join(recommendations) if recommendations else 'All metrics are within acceptable ranges.'}
    """

    return kpis_df, alerts, recommendations, report.strip()
