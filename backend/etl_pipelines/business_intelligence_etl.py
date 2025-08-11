import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

def extract_cash_flow_data(file_path):
    """
    Extracts raw cash flow data from Excel file

    Parameters:
    file_path (str): Path to the fluxo_caixa.xlsx file

    Returns:
    pd.DataFrame: Raw DataFrame with all columns from the Excel file
    """
    import pandas as pd

    # Read Excel file, handling potential formatting issues
    df = pd.read_excel(file_path, dtype={
        'Código': str,
        'Recibo': str,
        'Valor Unitário': str,
        'Valor Total': str,
        'Valor Desconto': str
    })

    # Drop completely empty rows
    df = df.dropna(how='all')

    return df

def clean_cash_flow_data(df):
    """
    Cleans and standardizes the cash flow data

    Parameters:
    df (pd.DataFrame): Raw DataFrame from extract_cash_flow_data

    Returns:
    pd.DataFrame: Cleaned DataFrame with standardized values
    """
    import pandas as pd
    import numpy as np

    # Create a copy to avoid modifying the original
    cleaned_df = df.copy()

    # Standardize column names (remove special characters, lower case)
    cleaned_df.columns = [col.replace(' ', '_').replace('(', '').replace(')', '').lower()
                         for col in cleaned_df.columns]

    # Handle numeric columns with potential formatting issues
    numeric_cols = ['valor_unitário', 'valor_total', 'valor_desconto']
    for col in numeric_cols:
        # Replace non-numeric characters and convert to numeric
        cleaned_df[col] = pd.to_numeric(
            cleaned_df[col].astype(str).str.replace(r'[^\d.-]', '', regex=True),
            errors='coerce'
        )

    # Convert quantity to integer
    cleaned_df['quantidade'] = pd.to_numeric(cleaned_df['quantidade'], errors='coerce').fillna(1).astype(int)

    # Standardize status values
    status_mapping = {
        'ativo': 'Active',
        'bloqueado': 'Blocked',
        'cancelado': 'Cancelled',
        'cliente pass': 'Client Pass'
    }
    cleaned_df['status'] = cleaned_df['status'].str.lower().map(status_mapping).fillna('Unknown')

    # Standardize payment methods
    payment_mapping = {
        'dinheiro': 'Cash',
        'pix': 'PIX',
        'cartão crédito online': 'Credit Card Online',
        'cartão débito': 'Debit Card'
    }
    cleaned_df['forma_pagamento'] = cleaned_df['forma_pagamento'].str.lower().map(payment_mapping).fillna('Other')

    # Standardize consultant names
    cleaned_df['consultor'] = cleaned_df['consultor'].str.replace('CONSULTOR PADRÃO - ', '', regex=False)
    cleaned_df['consultor'] = cleaned_df['consultor'].str.replace('--', '', regex=False).str.strip()

    # Handle date column
    if 'data_recibo' in cleaned_df.columns:
        # Extract date part only (remove time if present)
        cleaned_df['transaction_date'] = pd.to_datetime(
            cleaned_df['data_recibo'].astype(str).str.split().str[0],
            errors='coerce'
        )

    return cleaned_df

def engineer_features(df):
    """
    Creates derived features for advanced analytics

    Parameters:
    df (pd.DataFrame): Cleaned DataFrame from clean_cash_flow_data

    Returns:
    pd.DataFrame: DataFrame with engineered features
    """
    import pandas as pd
    import numpy as np

    # Create a copy to avoid modifying the original
    engineered_df = df.copy()

    # Add date components
    engineered_df['year'] = engineered_df['transaction_date'].dt.year
    engineered_df['month'] = engineered_df['transaction_date'].dt.month
    engineered_df['day'] = engineered_df['transaction_date'].dt.day
    engineered_df['day_of_week'] = engineered_df['transaction_date'].dt.dayofweek  # 0=Monday, 6=Sunday
    engineered_df['is_weekend'] = engineered_df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)

    # Add month-year for time series analysis
    engineered_df['month_year'] = engineered_df['transaction_date'].dt.to_period('M')

    # Calculate effective unit price (handling potential division by zero)
    engineered_df['effective_unit_price'] = engineered_df['valor_total'] / engineered_df['quantidade'].replace(0, np.nan)

    # Identify product categories
    def categorize_product(item):
        item_lower = str(item).lower()
        if 'gympass' in item_lower:
            return 'Gympass'
        elif 'calistenia' in item_lower or 'calisthenics' in item_lower:
            if '10x' in item_lower or '10 aulas' in item_lower:
                return 'Calisthenics Package'
            elif 'experimental' in item_lower or 'aula experimental' in item_lower:
                return 'Calisthenics Trial'
            else:
                return 'Calisthenics'
        elif 'personal' in item_lower:
            return 'Personal Training'
        else:
            return 'Other'

    engineered_df['product_category'] = engineered_df['item'].apply(categorize_product)

    # Identify if it's a trial class (typically with non-zero price)
    engineered_df['is_trial'] = engineered_df.apply(
        lambda x: 1 if (x['product_category'] in ['Calisthenics Trial', 'Trial Class'] and x['valor_total'] > 0) else 0,
        axis=1
    )

    # Identify if it's a package (typically higher value)
    engineered_df['is_package'] = engineered_df['product_category'].apply(
        lambda x: 1 if x == 'Calisthenics Package' else 0
    )

    # Flag zero-value transactions (likely Gympass entries)
    engineered_df['is_zero_value'] = (engineered_df['valor_total'] == 0).astype(int)

    # Calculate revenue after discount
    engineered_df['net_revenue'] = engineered_df['valor_total'] - engineered_df['valor_desconto']

    return engineered_df

def calculate_financial_metrics(df):
    """
    Calculates key financial metrics from the transaction data

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features

    Returns:
    dict: Dictionary containing financial metrics
    """
    import numpy as np
    from datetime import datetime, timedelta

    metrics = {}

    # Total revenue calculations
    total_revenue = df['net_revenue'].sum()
    metrics['total_revenue'] = float(total_revenue)

    # Revenue by payment method
    revenue_by_payment = df.groupby('forma_pagamento')['net_revenue'].sum().to_dict()
    metrics['revenue_by_payment_method'] = {k: float(v) for k, v in revenue_by_payment.items()}

    # Revenue by product category
    revenue_by_product = df.groupby('product_category')['net_revenue'].sum().to_dict()
    metrics['revenue_by_product_category'] = {k: float(v) for k, v in revenue_by_product.items()}

    # Average transaction value
    metrics['average_transaction_value'] = float(df['net_revenue'].mean()) if len(df) > 0 else 0.0

    # Total transactions
    metrics['total_transactions'] = int(len(df))

    # Daily revenue metrics
    if not df.empty:
        first_date = df['transaction_date'].min()
        last_date = df['transaction_date'].max()
        total_days = (last_date - first_date).days + 1

        metrics['daily_revenue_avg'] = float(total_revenue / total_days) if total_days > 0 else 0.0
        metrics['transactions_per_day_avg'] = float(len(df) / total_days) if total_days > 0 else 0.0

        # Monthly revenue
        monthly_revenue = df.groupby(df['transaction_date'].dt.to_period('M'))['net_revenue'].sum()
        if not monthly_revenue.empty:
            metrics['monthly_revenue_trend'] = {str(k): float(v) for k, v in monthly_revenue.items()}
            metrics['monthly_revenue_growth_rate'] = (
                (monthly_revenue.pct_change().mean() * 100)
                if len(monthly_revenue) > 1 else 0.0
            )

    # Zero-value transactions (Gympass usage)
    zero_value_count = df['is_zero_value'].sum()
    metrics['gympass_usage_count'] = int(zero_value_count)
    metrics['gympass_usage_percentage'] = float((zero_value_count / len(df)) * 100) if len(df) > 0 else 0.0

    # Trial conversion metrics
    trial_count = df['is_trial'].sum()
    converted_from_trial = df[df['is_trial'] == 1]['código'].nunique()
    total_clients = df['código'].nunique()

    metrics['trial_count'] = int(trial_count)
    metrics['clients_from_trials'] = int(converted_from_trial)
    metrics['trial_conversion_rate'] = float((converted_from_trial / trial_count) * 100) if trial_count > 0 else 0.0

    # Package sales
    package_sales = df[df['is_package'] == 1]['net_revenue'].sum()
    metrics['package_revenue'] = float(package_sales)
    metrics['package_sales_count'] = int(df[df['is_package'] == 1].shape[0])

    # Consultant performance
    consultant_revenue = df.groupby('consultor')['net_revenue'].sum().to_dict()
    metrics['consultant_revenue'] = {k: float(v) for k, v in consultant_revenue.items()}

    return metrics

def calculate_client_metrics(df):
    """
    Calculates key client metrics from the transaction data

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features

    Returns:
    dict: Dictionary containing client metrics
    """
    import pandas as pd
    import numpy as np

    metrics = {}

    # Total unique clients
    total_clients = df['código'].nunique()
    metrics['total_clients'] = int(total_clients)

    # Active vs Inactive clients
    active_clients = df[df['status'] == 'Active']['código'].nunique()
    blocked_clients = df[df['status'] == 'Blocked']['código'].nunique()
    cancelled_clients = df[df['status'] == 'Cancelled']['código'].nunique()

    metrics['active_clients'] = int(active_clients)
    metrics['blocked_clients'] = int(blocked_clients)
    metrics['cancelled_clients'] = int(cancelled_clients)
    metrics['client_retention_rate'] = float((active_clients / total_clients) * 100) if total_clients > 0 else 0.0

    # Client acquisition timeline
    first_purchase = df.groupby('código')['transaction_date'].min().reset_index()
    first_purchase['cohort_month'] = first_purchase['transaction_date'].dt.to_period('M')

    # Calculate clients per cohort
    cohort_counts = first_purchase['cohort_month'].value_counts().sort_index()
    metrics['new_clients_by_month'] = {str(k): int(v) for k, v in cohort_counts.items()}

    # Calculate average client lifespan
    last_purchase = df.groupby('código')['transaction_date'].max().reset_index()
    client_activity = pd.merge(first_purchase, last_purchase, on='código', suffixes=('_first', '_last'))
    client_activity['days_active'] = (client_activity['transaction_date_last'] -
                                    client_activity['transaction_date_first']).dt.days

    metrics['avg_client_lifespan_days'] = float(client_activity['days_active'].mean())

    # Revenue per client
    client_revenue = df.groupby('código')['net_revenue'].sum().reset_index()
    metrics['avg_revenue_per_client'] = float(client_revenue['net_revenue'].mean())
    metrics['median_revenue_per_client'] = float(client_revenue['net_revenue'].median())
    metrics['client_lifetime_value'] = float(client_revenue['net_revenue'].mean() *
                                          (metrics['avg_client_lifespan_days'] / 30)
                                          if metrics['avg_client_lifespan_days'] > 0 else 0)

    # Purchase frequency
    purchase_count = df.groupby('código').size().reset_index(name='purchase_count')
    metrics['avg_purchases_per_client'] = float(purchase_count['purchase_count'].mean())

    # Identify churned clients (no activity in last 30 days)
    cutoff_date = df['transaction_date'].max() - pd.Timedelta(days=30)
    active_clients_recent = df[df['transaction_date'] >= cutoff_date]['código'].nunique()
    churned_clients = total_clients - active_clients_recent

    metrics['churned_clients_last_30_days'] = int(churned_clients)
    metrics['monthly_churn_rate'] = float((churned_clients / total_clients) * 100) if total_clients > 0 else 0.0

    return metrics

def calculate_product_performance(df):
    """
    Calculates product performance metrics

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features

    Returns:
    dict: Dictionary containing product performance metrics
    """
    import pandas as pd

    metrics = {}

    # Group by product category
    product_groups = df.groupby('product_category')

    # Calculate metrics for each product category
    product_metrics = {}
    for category, group in product_groups:
        category_metrics = {
            'total_revenue': float(group['net_revenue'].sum()),
            'total_units_sold': int(group['quantidade'].sum()),
            'avg_price': float(group['effective_unit_price'].mean()),
            'transaction_count': int(len(group)),
            'client_count': int(group['código'].nunique()),
            'revenue_per_client': float(group['net_revenue'].sum() / group['código'].nunique())
                                 if group['código'].nunique() > 0 else 0.0
        }

        # Calculate month-over-month growth if possible
        monthly_revenue = group.groupby(group['transaction_date'].dt.to_period('M'))['net_revenue'].sum()
        if len(monthly_revenue) > 1:
            category_metrics['monthly_growth_rate'] = float(monthly_revenue.pct_change().mean() * 100)
        else:
            category_metrics['monthly_growth_rate'] = 0.0

        product_metrics[category] = category_metrics

    metrics['product_category_metrics'] = product_metrics

    # Calculate product bundling (clients who purchased multiple categories)
    client_product_matrix = pd.crosstab(df['código'], df['product_category'])
    multi_product_clients = client_product_matrix[client_product_matrix.sum(axis=1) > 1]

    metrics['clients_with_multiple_products'] = int(len(multi_product_clients))
    metrics['multi_product_penetration'] = float((len(multi_product_clients) / df['código'].nunique()) * 100) \
                                         if df['código'].nunique() > 0 else 0.0

    # Calculate trial to package conversion
    trial_clients = df[df['is_trial'] == 1]['código'].unique()
    converted_clients = df[(df['código'].isin(trial_clients)) & (df['is_package'] == 1)]['código'].nunique()

    metrics['trial_to_package_conversion'] = float((converted_clients / len(trial_clients)) * 100) \
                                          if len(trial_clients) > 0 else 0.0

    # Calculate package renewal rate
    package_clients = df[df['is_package'] == 1]
    if not package_clients.empty:
        # For each client, get their package purchase dates
        client_package_dates = package_clients.groupby(['código', 'item'])['transaction_date'].apply(list).reset_index()

        # Calculate renewals (multiple purchases of the same package)
        renewals = 0
        total_packages = 0
        for _, row in client_package_dates.iterrows():
            dates = sorted(row['transaction_date'])
            total_packages += len(dates)
            if len(dates) > 1:
                renewals += len(dates) - 1

        metrics['package_renewal_rate'] = float((renewals / total_packages) * 100) if total_packages > 0 else 0.0
    else:
        metrics['package_renewal_rate'] = 0.0

    return metrics

def calculate_consultant_performance(df):
    """
    Calculates consultant performance metrics

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features

    Returns:
    dict: Dictionary containing consultant performance metrics
    """
    import pandas as pd

    metrics = {}

    # Group by consultant
    consultant_groups = df.groupby('consultor')

    # Calculate metrics for each consultant
    consultant_metrics = {}
    for consultant, group in consultant_groups:
        if consultant.strip() == '':  # Skip empty consultant names
            continue

        total_revenue = group['net_revenue'].sum()
        transaction_count = len(group)
        client_count = group['código'].nunique()

        consultant_metrics[consultant] = {
            'total_revenue': float(total_revenue),
            'transaction_count': int(transaction_count),
            'client_count': int(client_count),
            'revenue_per_transaction': float(total_revenue / transaction_count) if transaction_count > 0 else 0.0,
            'revenue_per_client': float(total_revenue / client_count) if client_count > 0 else 0.0,
            'avg_client_value': float(total_revenue / client_count) if client_count > 0 else 0.0
        }

    metrics['consultant_metrics'] = consultant_metrics

    # Calculate overall consultant metrics
    if consultant_metrics:
        # Top performing consultant by revenue
        top_consultant = max(consultant_metrics.items(), key=lambda x: x[1]['total_revenue'])
        metrics['top_consultant_by_revenue'] = {
            'name': top_consultant[0],
            'revenue': top_consultant[1]['total_revenue']
        }

        # Average metrics across consultants
        total_revenue_all = sum(m['total_revenue'] for m in consultant_metrics.values())
        metrics['avg_revenue_per_consultant'] = float(total_revenue_all / len(consultant_metrics))

    # Trial conversion by consultant
    trial_groups = df[df['is_trial'] == 1].groupby('consultor')
    for consultant, group in trial_groups:
        if consultant.strip() == '':
            continue

        trial_clients = group['código'].nunique()
        converted_clients = df[(df['código'].isin(group['código'])) &
                              (df['is_package'] == 1) &
                              (df['consultor'] == consultant)]['código'].nunique()

        if consultant not in consultant_metrics:
            consultant_metrics[consultant] = {}

        consultant_metrics[consultant]['trial_conversion_rate'] = float(
            (converted_clients / trial_clients) * 100) if trial_clients > 0 else 0.0

    # Package sales by consultant
    package_groups = df[df['is_package'] == 1].groupby('consultor')
    for consultant, group in package_groups:
        if consultant.strip() == '':
            continue

        if consultant not in consultant_metrics:
            consultant_metrics[consultant] = {}

        consultant_metrics[consultant]['packages_sold'] = int(len(group))
        consultant_metrics[consultant]['package_revenue'] = float(group['net_revenue'].sum())

    return metrics

def calculate_time_series_metrics(df, window=7):
    """
    Calculates time series metrics with rolling windows

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features
    window (int): Window size for rolling calculations

    Returns:
    dict: Dictionary containing time series metrics
    """
    import pandas as pd
    import numpy as np

    metrics = {}

    if df.empty or 'transaction_date' not in df.columns:
        return metrics

    # Create daily revenue series
    daily_revenue = df.set_index('transaction_date').resample('D')['net_revenue'].sum()

    # Fill missing dates with zero revenue
    date_range = pd.date_range(start=daily_revenue.index.min(), end=daily_revenue.index.max())
    daily_revenue = daily_revenue.reindex(date_range, fill_value=0)

    # Calculate rolling metrics
    metrics['rolling_revenue'] = {
        '7_day': {str(date.date()): float(value) for date, value in daily_revenue.rolling(window=7).mean().dropna().items()},
        '30_day': {str(date.date()): float(value) for date, value in daily_revenue.rolling(window=30).mean().dropna().items()}
    }

    # Daily transaction count
    daily_transactions = df.set_index('transaction_date').resample('D').size()
    daily_transactions = daily_transactions.reindex(date_range, fill_value=0)

    metrics['rolling_transactions'] = {
        '7_day': {str(date.date()): int(value) for date, value in daily_transactions.rolling(window=7).mean().dropna().items()},
        '30_day': {str(date.date()): int(value) for date, value in daily_transactions.rolling(window=30).mean().dropna().items()}
    }

    # Calculate seasonality metrics
    df['day_of_week'] = df['transaction_date'].dt.dayofweek
    revenue_by_day = df.groupby('day_of_week')['net_revenue'].mean()

    metrics['daily_seasonality'] = {
        'monday': float(revenue_by_day.get(0, 0)),
        'tuesday': float(revenue_by_day.get(1, 0)),
        'wednesday': float(revenue_by_day.get(2, 0)),
        'thursday': float(revenue_by_day.get(3, 0)),
        'friday': float(revenue_by_day.get(4, 0)),
        'saturday': float(revenue_by_day.get(5, 0)),
        'sunday': float(revenue_by_day.get(6, 0))
    }

    # Calculate monthly seasonality
    df['month'] = df['transaction_date'].dt.month
    revenue_by_month = df.groupby('month')['net_revenue'].mean()

    metrics['monthly_seasonality'] = {str(month): float(revenue) for month, revenue in revenue_by_month.items()}

    # Calculate growth rates
    if len(daily_revenue) > 30:
        last_month = daily_revenue[-30:].sum()
        prev_month = daily_revenue[-60:-30].sum()
        metrics['monthly_growth_rate'] = float(((last_month - prev_month) / prev_month) * 100) if prev_month > 0 else 0.0
    else:
        metrics['monthly_growth_rate'] = 0.0

    if len(daily_revenue) > 7:
        last_week = daily_revenue[-7:].sum()
        prev_week = daily_revenue[-14:-7].sum()
        metrics['weekly_growth_rate'] = float(((last_week - prev_week) / prev_week) * 100) if prev_week > 0 else 0.0
    else:
        metrics['weekly_growth_rate'] = 0.0

    return metrics

def calculate_cohort_analysis(df):
    """
    Calculates cohort-based retention metrics

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features

    Returns:
    dict: Dictionary containing cohort analysis metrics
    """
    import pandas as pd
    import numpy as np

    metrics = {}

    if df.empty or 'transaction_date' not in df.columns:
        return metrics

    # Create cohort month for each client
    first_purchase = df.groupby('código')['transaction_date'].min().reset_index()
    first_purchase['cohort_month'] = first_purchase['transaction_date'].dt.to_period('M')

    # Merge cohort month back to original data
    df = pd.merge(df, first_purchase[['código', 'cohort_month']], on='código')

    # Create retention matrix
    df['transaction_month'] = df['transaction_date'].dt.to_period('M')
    cohort_data = df.groupby(['cohort_month', 'transaction_month']).size().unstack()

    # Calculate retention rates
    cohort_sizes = cohort_data.iloc[:, 0]
    retention_matrix = cohort_data.divide(cohort_sizes, axis=0)

    # Convert to dictionary format
    retention_dict = {}
    for i, (cohort, row) in enumerate(retention_matrix.iterrows()):
        retention_dict[str(cohort)] = {
            str(col): float(val * 100)
            for col, val in row.items()
            if not pd.isna(val) and i <= retention_matrix.columns.get_loc(col)
        }

    metrics['cohort_retention'] = retention_dict

    # Calculate average retention by month since acquisition
    retention_by_month = {}
    for i in range(len(retention_matrix.columns)):
        month_data = []
        for j in range(len(retention_matrix)):
            if i + j < len(retention_matrix.columns):
                val = retention_matrix.iloc[j, i + j]
                if not pd.isna(val):
                    month_data.append(val)

        if month_data:
            retention_by_month[str(i)] = float(np.mean(month_data) * 100)

    metrics['average_retention_by_month'] = retention_by_month

    # Calculate overall retention metrics
    if retention_by_month:
        metrics['avg_month_1_retention'] = retention_by_month.get('1', 0.0)
        metrics['avg_month_3_retention'] = retention_by_month.get('3', 0.0)
        metrics['avg_month_6_retention'] = retention_by_month.get('6', 0.0)
        metrics['avg_month_12_retention'] = retention_by_month.get('12', 0.0)

    return metrics

def assess_data_quality(df):
    """
    Assesses data quality metrics

    Parameters:
    df (pd.DataFrame): DataFrame to assess

    Returns:
    dict: Dictionary containing data quality metrics
    """
    import pandas as pd
    import numpy as np

    metrics = {}

    # Missing value analysis
    missing_values = df.isnull().sum()
    total_records = len(df)

    metrics['missing_values'] = {
        col: {
            'count': int(missing_values[col]),
            'percentage': float((missing_values[col] / total_records) * 100)
        } for col in df.columns
    }

    # Completeness score (percentage of non-missing values)
    completeness = 100 - (missing_values.sum() / (total_records * len(df.columns)) * 100)
    metrics['data_completeness_score'] = float(completeness)

    # Consistency checks
    # Check for negative revenue values
    negative_revenue = df[df['net_revenue'] < 0]
    metrics['negative_revenue_count'] = int(len(negative_revenue))

    # Check for transactions with zero quantity
    zero_quantity = df[df['quantidade'] <= 0]
    metrics['zero_quantity_count'] = int(len(zero_quantity))

    # Check for transactions where unit price doesn't match total/quantity
    price_mismatch = df[
        (df['quantidade'] > 0) &
        (abs(df['valor_unitário'] - (df['valor_total'] / df['quantidade'])) > 0.01)
    ]
    metrics['price_mismatch_count'] = int(len(price_mismatch))

    # Temporal consistency
    if 'transaction_date' in df.columns:
        future_dates = df[df['transaction_date'] > pd.Timestamp.now()]
        metrics['future_date_count'] = int(len(future_dates))

        # Check for transactions with missing dates
        missing_dates = df['transaction_date'].isnull().sum()
        metrics['missing_date_count'] = int(missing_dates)

    # Client ID consistency
    if 'código' in df.columns:
        invalid_client_ids = df[df['código'].isnull() | (df['código'] == '')]
        metrics['invalid_client_id_count'] = int(len(invalid_client_ids))

    # Overall data quality score (simplified)
    quality_score = 100
    quality_score -= metrics['negative_revenue_count'] / total_records * 20
    quality_score -= metrics['zero_quantity_count'] / total_records * 10
    quality_score -= metrics['price_mismatch_count'] / total_records * 15
    if 'future_date_count' in metrics:
        quality_score -= metrics['future_date_count'] / total_records * 10
    if 'missing_date_count' in metrics:
        quality_score -= metrics['missing_date_count'] / total_records * 5

    metrics['data_quality_score'] = max(0, float(quality_score))

    return metrics

def gym_business_intelligence_etl(cash_flow_file):
    """
    Main ETL pipeline for gym business intelligence

    Parameters:
    cash_flow_file (str): Path to the fluxo_caixa.xlsx file

    Returns:
    dict: Comprehensive business intelligence metrics
    """
    # Extract
    cash_flow_df = extract_cash_flow_data(cash_flow_file)

    # Clean and transform
    cleaned_df = clean_cash_flow_data(cash_flow_df)
    engineered_df = engineer_features(cleaned_df)

    # Calculate metrics
    financial_metrics = calculate_financial_metrics(engineered_df)
    client_metrics = calculate_client_metrics(engineered_df)
    product_metrics = calculate_product_performance(engineered_df)
    consultant_metrics = calculate_consultant_performance(engineered_df)
    time_series_metrics = calculate_time_series_metrics(engineered_df)
    cohort_metrics = calculate_cohort_analysis(engineered_df)
    data_quality = assess_data_quality(engineered_df)

    # Consolidate all metrics
    business_intelligence = {
        'metadata': {
            'processing_date': str(pd.Timestamp.now()),
            'cash_flow_records': len(engineered_df),
            'date_range': {
                'start': str(engineered_df['transaction_date'].min()),
                'end': str(engineered_df['transaction_date'].max())
            }
        },
        'financial_metrics': financial_metrics,
        'client_metrics': client_metrics,
        'product_metrics': product_metrics,
        'consultant_metrics': consultant_metrics,
        'time_series_metrics': time_series_metrics,
        'cohort_metrics': cohort_metrics,
        'data_quality': data_quality
    }

    return business_intelligence

def save_bi_results(bi_results, output_file):
    """
    Saves business intelligence results to a JSON file

    Parameters:
    bi_results (dict): Results from gym_business_intelligence_etl
    output_file (str): Path to save the JSON file

    Returns:
    bool: Success status
    """
    import json

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(bi_results, f, ensure_ascii=False, indent=4)
        return True
    except Exception as e:
        print(f"Error saving results: {str(e)}")
        return False

def load_bi_results(input_file):
    """
    Loads business intelligence results from a JSON file

    Parameters:
    input_file (str): Path to the JSON file

    Returns:
    dict: Business intelligence results
    """
    import json

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading results: {str(e)}")
        return None
