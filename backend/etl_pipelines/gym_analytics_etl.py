import pandas as pd
import numpy as np
from typing import Dict

def extract_gym_data(folder_path: str) -> Dict[str, pd.DataFrame]:
    """Loads all gym-related CSV files from a directory."""
    files = ['members.csv', 'membership_types.csv', 'class_schedules.csv', 'class_attendance.csv']
    return {f.split('.')[0]: pd.read_csv(f"{folder_path}/{f}") for f in files}

def transform_gym_data(data: Dict[str, pd.DataFrame]) -> Dict:
    """Performs all data prep and analysis for gym data."""
    # --- Data Prep ---
    members_df = data['members']
    membership_types_df = data['membership_types']
    class_schedules_df = data['class_schedules']
    attendance_df = data['class_attendance']

    members_df['join_date'] = pd.to_datetime(members_df['join_date'])
    attendance_df['date'] = pd.to_datetime(attendance_df['date'])

    members_merged_df = pd.merge(members_df, membership_types_df, on='membership_id')
    master_df = pd.merge(members_merged_df, pd.merge(attendance_df, class_schedules_df, on='class_id'), on='member_id')

    unique_members_df = members_merged_df.drop_duplicates(subset=['member_id']).copy()

    # --- Calculations ---
    # Demographics
    avg_member_age = unique_members_df['age'].mean()

    # Revenue
    total_monthly_revenue = unique_members_df['monthly_fee'].sum()

    # Class Popularity
    most_popular_class = master_df['class_name'].mode()[0]

    # Churn Analysis
    last_attendance = master_df.groupby('member_id')['date'].max().reset_index()
    last_attendance.rename(columns={'date': 'last_attendance_date'}, inplace=True)
    churn_df = pd.merge(unique_members_df, last_attendance, on='member_id', how='left')
    current_date = master_df['date'].max()
    churn_df['days_since_last_attendance'] = (current_date - churn_df['last_attendance_date']).dt.days

    churn_threshold = 90
    churn_df['churn_status'] = 'Active'
    churn_df.loc[churn_df['days_since_last_attendance'] > churn_threshold, 'churn_status'] = 'Churned'
    churn_df.loc[(churn_df['last_attendance_date'].isnull()) & ((current_date - churn_df['join_date']).dt.days > churn_threshold), 'churn_status'] = 'Churned'

    churned_count = churn_df[churn_df['churn_status'] == 'Churned'].shape[0]
    total_members = churn_df.shape[0]
    churn_rate = churned_count / total_members if total_members > 0 else 0

    return {
        'avg_member_age': avg_member_age,
        'total_monthly_revenue': total_monthly_revenue,
        'most_popular_class': most_popular_class,
        'churn_rate': churn_rate
    }

def generate_gym_kpis(metrics: Dict) -> pd.DataFrame:
    """Compiles gym metrics into a KPI dashboard."""
    kpis = {
        'Avg Member Age': metrics['avg_member_age'],
        'Total Monthly Revenue': metrics['total_monthly_revenue'],
        'Most Popular Class': metrics['most_popular_class'],
        'Churn Rate': metrics['churn_rate']
    }
    df = pd.DataFrame.from_dict(kpis, orient='index', columns=['Value'])
    df.loc['Churn Rate'] = df.loc['Churn Rate'].apply(lambda x: f"{x:.2%}")
    return df

def run_gym_etl(folder_path: str = 'datasets') -> pd.DataFrame:
    """Main ETL pipeline function for gym data."""
    # Extract
    data = extract_gym_data(folder_path)

    # Transform
    metrics = transform_gym_data(data)

    # Load
    kpi_dashboard = generate_gym_kpis(metrics)
    return kpi_dashboard

# Example usage
if __name__ == "__main__":
    kpis = run_gym_etl()
    print(kpis)

    # Save to CSV
    kpis.to_csv('gym_kpis.csv')
