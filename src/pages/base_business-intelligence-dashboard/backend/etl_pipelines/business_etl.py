import pandas as pd
from typing import Dict
import random
from datetime import datetime
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

# --- Base ETL Functions ---

def extract_data(file_path: str) -> Dict[str, pd.DataFrame]:
    """Extract all sheets from Excel file into a dictionary of DataFrames"""
    return pd.read_excel(file_path, sheet_name=None)

def run_etl_pipeline(file_path: str) -> Dict[str, Dict]:
    """Original ETL pipeline, returns a dictionary of calculated metrics."""
    data = extract_data(file_path)
    metrics = {
        'acceptance': transform_acceptance_metrics(data),
        'blocked': transform_blocked_clients(data),
        'active': transform_active_contracts(data),
        'conversion': transform_conversion_metrics(data)
    }
    return metrics

def transform_acceptance_metrics(data: Dict[str, pd.DataFrame]) -> Dict[str, float]:
    df = data.get('aceite-ctr_2508021017', pd.DataFrame())
    if df.empty: return {'acceptance_rate': 0, 'pending_rate': 0}
    total = df.shape[0]
    accepted = df[df['Último Aceite'].str.contains('Aceito', na=False)].shape[0]
    pending = df[df['Último Aceite'] == 'Aguardando aceite'].shape[0]
    return {'acceptance_rate': accepted / total if total > 0 else 0, 'pending_rate': pending / total if total > 0 else 0}

def transform_blocked_clients(data: Dict[str, pd.DataFrame]) -> Dict[str, float]:
    df = data.get('blocks_2508011617', pd.DataFrame())
    if df.empty: return {'avg_days_blocked': 0}
    return {'avg_days_blocked': df['Total de dias bloqueados'].mean()}

def transform_active_contracts(data: Dict[str, pd.DataFrame]) -> Dict[str, float]:
    df = data.get('clientes_ativos_2507311423', pd.DataFrame())
    if df.empty: return {'valid_email_rate': 0}
    total_active = df.shape[0]
    valid_emails = df[df['E-mail válido'] == True].shape[0]
    return {'valid_email_rate': valid_emails / total_active if total_active > 0 else 0}

def transform_conversion_metrics(data: Dict[str, pd.DataFrame]) -> Dict[str, float]:
    df = data.get('conversoes_2507311426', pd.DataFrame())
    if df.empty: return {'status_distribution': {}, 'origin_distribution': {}}
    return {
        'status_distribution': df['Status atual'].value_counts(normalize=True).to_dict(),
        'origin_distribution': df['Origem'].value_counts(normalize=True).to_dict(),
    }

def generate_kpis(metrics: Dict[str, Dict]) -> pd.DataFrame:
    kpis = {
        'Acceptance Rate': metrics.get('acceptance', {}).get('acceptance_rate', 0),
        'Pending Contracts': metrics.get('acceptance', {}).get('pending_rate', 0),
        'Avg Days Blocked': metrics.get('blocked', {}).get('avg_days_blocked', 0),
        'Valid Email Rate': metrics.get('active', {}).get('valid_email_rate', 0),
        'Conversion Rate': metrics.get('conversion', {}).get('status_distribution', {}).get('Ativo', 0),
        'System Signups %': metrics.get('conversion', {}).get('origin_distribution', {}).get('Sistema', 0)
    }
    return pd.DataFrame.from_dict(kpis, orient='index', columns=['Value'])

# --- New Predictive Functions ---

def calculate_ltv(data: Dict[str, pd.DataFrame]) -> Dict[str, float]:
    """Predict client lifetime value based on contract history"""
    active_df = data.get('clientes_ativos_2507311423', pd.DataFrame())
    blocks_df = data.get('blocks_2508011617', pd.DataFrame())
    if active_df.empty: return {'avg_ltv': 0, 'top_10p_ltv': 0, 'ltv_by_contract': {}}

    merged = pd.merge(active_df, blocks_df[['Código', 'Total de dias bloqueados']], on='Código', how='left')

    avg_contract_duration = {'SEMESTRAL': 180, 'TRIMESTRAL': 90, 'MENSAL': 30}

    def estimate_ltv(row):
        contract_type = str(row['Contrato']).split()[-1]
        duration = avg_contract_duration.get(contract_type, 30)
        churn_risk = 0.5 if pd.notna(row['Total de dias bloqueados']) else 0.2
        return (row['Valor'] * (12 / (duration / 30))) * (1 - churn_risk)

    merged['LTV'] = merged.apply(estimate_ltv, axis=1)

    return {
        'avg_ltv': merged['LTV'].mean(),
        'top_10p_ltv': merged['LTV'].quantile(0.9),
        'ltv_by_contract': merged.groupby('Contrato')['LTV'].mean().to_dict()
    }

def predict_upgrades(data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
    """Predict which clients are likely to upgrade contracts"""
    active_df = data.get('clientes_ativos_2507311423', pd.DataFrame())
    aceite_df = data.get('aceite-ctr_2508021017', pd.DataFrame())
    if active_df.empty or aceite_df.empty: return pd.DataFrame()

    history_df = pd.concat([active_df, aceite_df.rename(columns={'Status': 'Status Cliente'})])

    features = history_df[['Valor', 'Status Cliente', 'Contrato']].copy()
    # Handle potential NaN values before encoding
    for col in ['Status Cliente', 'Contrato']:
        features[col] = features[col].fillna('Unknown')
    features['Valor'] = features['Valor'].fillna(features['Valor'].mean())

    features['upgraded'] = features['Contrato'].str.contains('SEMESTRAL|TRIMESTRAL').astype(int)

    encoders = {'Status Cliente': LabelEncoder(), 'Contrato': LabelEncoder()}
    for col, encoder in encoders.items():
        features[col] = encoder.fit_transform(features[col])

    X = features[['Valor', 'Status Cliente', 'Contrato']]
    y = features['upgraded']

    if len(features['upgraded'].unique()) < 2:
        print("Not enough class diversity to train upgrade model. Skipping.")
        return pd.DataFrame()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)

    current = active_df.copy()
    current_transformed = current[['Valor', 'Status Cliente', 'Contrato']].copy()
    # Handle potential NaN values before encoding
    for col in ['Status Cliente', 'Contrato']:
        current_transformed[col] = current_transformed[col].fillna('Unknown')
    current_transformed['Valor'] = current_transformed['Valor'].fillna(current_transformed['Valor'].mean())

    for col, encoder in encoders.items():
        current_transformed[col] = encoder.transform(current_transformed[col])

    current['upgrade_prob'] = model.predict_proba(current_transformed)[:, 1]

    return current.sort_values('upgrade_prob', ascending=False)[['Código', 'Cliente', 'Contrato', 'Valor', 'upgrade_prob']]

# --- Main Enhanced Pipeline Function ---

def complete_etl_pipeline(file_path: str) -> Dict:
    """Full pipeline with all metrics and predictive models"""
    print("--- Extracting Data ---")
    data = extract_data(file_path)

    print("--- Running Base ETL Metrics ---")
    base_metrics = run_etl_pipeline(file_path)

    print("--- Calculating LTV Metrics ---")
    ltv = calculate_ltv(data)

    print("--- Predicting Upgrade Candidates ---")
    upgrades = predict_upgrades(data)

    base_kpis = generate_kpis(base_metrics)

    return {
        'base_kpis': base_kpis,
        'ltv_metrics': ltv,
        'upgrade_candidates': upgrades.to_dict('records')[:10] if not upgrades.empty else [],
        'timestamp': pd.Timestamp.now().isoformat()
    }

if __name__ == "__main__":
    final_metrics = complete_etl_pipeline('datasets/clientes.xlsx')
    print("\n--- ETL Run Summary ---")
    print("\nBase KPIs:")
    print(final_metrics['base_kpis'])
    print(f"\nAverage Client LTV: R${final_metrics['ltv_metrics']['avg_ltv']:,.2f}")
    print("\nTop 5 Upgrade Candidates:")
    print(pd.DataFrame(final_metrics['upgrade_candidates']).head())
