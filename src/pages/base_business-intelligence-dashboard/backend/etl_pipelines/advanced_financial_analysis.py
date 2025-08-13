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

def calculate_break_even_analysis(df, fixed_costs, variable_cost_percentage=0.3):
    """
    Calculates break-even point and margin of safety

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data
    fixed_costs (float): Monthly fixed costs for the gym
    variable_cost_percentage (float): Percentage of revenue that goes to variable costs

    Returns:
    dict: Break-even analysis metrics
    """
    import numpy as np

    metrics = {}

    # Calculate average revenue per client
    revenue_per_client = df.groupby('código')['net_revenue'].sum().mean()

    # Calculate contribution margin
    contribution_margin = 1 - variable_cost_percentage

    # Calculate break-even point in clients
    break_even_clients = fixed_costs / (revenue_per_client * contribution_margin)
    metrics['break_even_clients'] = float(break_even_clients)

    # Current client count
    current_clients = df['código'].nunique()
    metrics['current_clients'] = int(current_clients)

    # Margin of safety
    metrics['margin_of_safety'] = float((current_clients - break_even_clients) / current_clients * 100) if current_clients > 0 else -100.0

    # Revenue needed to break even
    metrics['break_even_revenue'] = float(fixed_costs / contribution_margin)

    # Current revenue vs break-even
    current_revenue = df['net_revenue'].sum()
    metrics['revenue_above_break_even'] = float(current_revenue - metrics['break_even_revenue'])
    metrics['revenue_above_break_even_percentage'] = float(
        (current_revenue - metrics['break_even_revenue']) / metrics['break_even_revenue'] * 100
    ) if metrics['break_even_revenue'] > 0 else 0.0

    # Days to break even in month
    if 'transaction_date' in df.columns and not df.empty:
        monthly_revenue = df.groupby(df['transaction_date'].dt.to_period('M'))['net_revenue'].sum()
        if not monthly_revenue.empty:
            avg_daily_revenue = monthly_revenue.iloc[-1] / len(df[df['transaction_date'].dt.to_period('M') == monthly_revenue.index[-1]])
            if avg_daily_revenue > 0:
                metrics['days_to_break_even'] = float(metrics['break_even_revenue'] / avg_daily_revenue)
            else:
                metrics['days_to_break_even'] = float('inf')

    return metrics

def calculate_advanced_cohort_metrics(df):
    """
    Calculates advanced cohort metrics including predictive retention

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features

    Returns:
    dict: Advanced cohort metrics
    """
    import pandas as pd
    import numpy as np
    from scipy.optimize import curve_fit

    metrics = {}

    # Create cohort month for each client
    first_purchase = df.groupby('código')['transaction_date'].min().reset_index()
    first_purchase['cohort_month'] = first_purchase['transaction_date'].dt.to_period('M')

    # Merge cohort month back to original data
    df = pd.merge(df, first_purchase[['código', 'cohort_month']], on='código')

    # Create transaction matrix for cohort analysis
    df['transaction_month'] = df['transaction_date'].dt.to_period('M')
    cohort_data = df.groupby(['cohort_month', 'transaction_month']).size().unstack()

    # Calculate retention matrix
    cohort_sizes = cohort_data.iloc[:, 0]
    retention_matrix = cohort_data.divide(cohort_sizes, axis=0)

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
            retention_by_month[i] = np.mean(month_data)

    # Fit exponential decay model to retention curve
    months = list(retention_by_month.keys())
    retention_rates = [retention_by_month[m] for m in months]

    def exp_decay(x, a, b):
        return a * np.exp(-b * x)

    try:
        popt, _ = curve_fit(exp_decay, months, retention_rates, p0=[1, 0.1])
        a, b = popt
        metrics['retention_model'] = {
            'a': float(a),
            'b': float(b),
            'equation': f"R(t) = {a:.4f} * e^(-{b:.4f} * t)"
        }

        # Predict 12-month retention
        predicted_12m = exp_decay(12, a, b)
        metrics['predicted_12m_retention'] = float(predicted_12m * 100)

        # Calculate half-life of retention
        if b > 0:
            half_life = np.log(2) / b
            metrics['retention_half_life'] = float(half_life)
    except:
        metrics['retention_model'] = None
        metrics['predicted_12m_retention'] = None
        metrics['retention_half_life'] = None

    # Calculate cohort-based LTV
    ltv_by_cohort = {}
    for cohort in retention_matrix.index:
        cohort_df = df[df['cohort_month'] == cohort]
        if not cohort_df.empty:
            monthly_rev_per_client = cohort_df.groupby(['código', cohort_df['transaction_date'].dt.to_period('M')])['net_revenue'].sum().mean()
            cohort_size = cohort_sizes[cohort]

            # Calculate LTV using retention curve
            ltv = 0
            for month in range(12):  # 12-month LTV
                target_month = (cohort.to_timestamp() + pd.DateOffset(months=month)).to_period('M')
                retention = retention_matrix.loc[cohort, target_month] if target_month in retention_matrix.columns else 0
                ltv += monthly_rev_per_client * retention

            ltv_by_cohort[str(cohort)] = float(ltv)

    metrics['cohort_ltv'] = ltv_by_cohort

    # Calculate overall LTV
    if ltv_by_cohort:
        metrics['average_ltv'] = float(np.mean(list(ltv_by_cohort.values())))
        metrics['ltv_cac_ratio'] = metrics['average_ltv'] / (fixed_costs / df['código'].nunique()) if 'fixed_costs' in globals() else None

    return metrics

def forecast_cash_flow(df, periods=6):
    """
    Forecasts future cash flow using multiple time series models

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data
    periods (int): Number of months to forecast

    Returns:
    dict: Cash flow forecast metrics
    """
    import pandas as pd
    import numpy as np
    from statsmodels.tsa.arima.model import ARIMA
    from sklearn.linear_model import LinearRegression
    import warnings

    metrics = {}

    if 'transaction_date' not in df.columns or df.empty:
        return metrics

    # Create monthly revenue series
    monthly_revenue = df.set_index('transaction_date').resample('M')['net_revenue'].sum()

    # Ensure we have enough data
    if len(monthly_revenue) < 3:
        return metrics

    # ARIMA Model
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            model = ARIMA(monthly_revenue, order=(1, 1, 1))
            arima_result = model.fit()
            arima_forecast = arima_result.get_forecast(steps=periods)
            arima_pred = arima_forecast.predicted_mean
            arima_conf = arima_forecast.conf_int()

        metrics['arima_forecast'] = {
            'values': {str(arima_pred.index[i].date()): float(arima_pred.iloc[i]) for i in range(len(arima_pred))},
            'confidence_interval': {
                'lower': {str(arima_pred.index[i].date()): float(arima_conf.iloc[i, 0]) for i in range(len(arima_pred))},
                'upper': {str(arima_pred.index[i].date()): float(arima_conf.iloc[i, 1]) for i in range(len(arima_pred))}
            }
        }
    except:
        metrics['arima_forecast'] = None

    # Linear Trend Model
    try:
        X = np.array(range(len(monthly_revenue))).reshape(-1, 1)
        y = monthly_revenue.values
        model = LinearRegression().fit(X, y)

        future_X = np.array(range(len(monthly_revenue), len(monthly_revenue) + periods)).reshape(-1, 1)
        linear_pred = model.predict(future_X)

        # Calculate confidence interval (simplified)
        residuals = y - model.predict(X)
        std_error = np.std(residuals)
        conf_interval = 1.96 * std_error  # 95% confidence

        metrics['linear_trend_forecast'] = {
            'values': {str((monthly_revenue.index[-1] + pd.DateOffset(months=i+1)).date()): float(linear_pred[i]) for i in range(periods)},
            'confidence_interval': {
                'lower': {str((monthly_revenue.index[-1] + pd.DateOffset(months=i+1)).date()): float(linear_pred[i] - conf_interval) for i in range(periods)},
                'upper': {str((monthly_revenue.index[-1] + pd.DateOffset(months=i+1)).date()): float(linear_pred[i] + conf_interval) for i in range(periods)}
            }
        }
    except:
        metrics['linear_trend_forecast'] = None

    # Seasonal Naive Model (using last year's pattern)
    try:
        if len(monthly_revenue) >= 12:
            last_year = monthly_revenue[-12:]
            seasonal_forecast = []

            for i in range(periods):
                # Get the same month from last year
                month_idx = (len(monthly_revenue) - 12 + i) % 12
                seasonal_forecast.append(last_year.values[month_idx])

            metrics['seasonal_forecast'] = {
                'values': {str((monthly_revenue.index[-1] + pd.DateOffset(months=i+1)).date()): float(seasonal_forecast[i]) for i in range(periods)}
            }
        else:
            metrics['seasonal_forecast'] = None
    except:
        metrics['seasonal_forecast'] = None

    # Ensemble Forecast (simple average of available models)
    try:
        ensemble_forecast = {}
        count = 0

        for model_name in ['arima_forecast', 'linear_trend_forecast', 'seasonal_forecast']:
            if model_name in metrics and metrics[model_name] and 'values' in metrics[model_name]:
                for date, value in metrics[model_name]['values'].items():
                    if date not in ensemble_forecast:
                        ensemble_forecast[date] = 0
                    ensemble_forecast[date] += value
                    count += 1

        if count > 0:
            metrics['ensemble_forecast'] = {
                'values': {date: float(value / count) for date, value in ensemble_forecast.items()}
            }
    except:
        metrics['ensemble_forecast'] = None

    # Calculate forecasted growth rate
    if metrics.get('ensemble_forecast') and metrics['ensemble_forecast'].get('values'):
        forecast_values = list(metrics['ensemble_forecast']['values'].values())
        if len(forecast_values) > 1:
            first_val = forecast_values[0]
            last_val = forecast_values[-1]
            metrics['forecasted_growth_rate'] = float((last_val - first_val) / first_val * 100 / len(forecast_values))

    return metrics

def calculate_contribution_margin(df, fixed_costs):
    """
    Calculates contribution margin by product category and overall

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features
    fixed_costs (float): Total fixed costs for the period

    Returns:
    dict: Contribution margin analysis
    """
    import pandas as pd

    metrics = {}

    # Total revenue
    total_revenue = df['net_revenue'].sum()
    metrics['total_revenue'] = float(total_revenue)

    # Calculate variable costs (assumed to be 30% of revenue for simplicity)
    # In a real scenario, this would come from detailed cost accounting
    variable_costs = total_revenue * 0.3
    metrics['total_variable_costs'] = float(variable_costs)

    # Contribution margin
    contribution_margin = total_revenue - variable_costs
    metrics['total_contribution_margin'] = float(contribution_margin)
    metrics['contribution_margin_ratio'] = float(contribution_margin / total_revenue * 100) if total_revenue > 0 else 0.0

    # Contribution margin by product category
    product_groups = df.groupby('product_category')
    category_metrics = {}

    for category, group in product_groups:
        cat_revenue = group['net_revenue'].sum()
        cat_variable_costs = cat_revenue * 0.3
        cat_contribution = cat_revenue - cat_variable_costs

        category_metrics[category] = {
            'revenue': float(cat_revenue),
            'variable_costs': float(cat_variable_costs),
            'contribution_margin': float(cat_contribution),
            'contribution_margin_ratio': float(cat_contribution / cat_revenue * 100) if cat_revenue > 0 else 0.0,
            'revenue_percentage': float(cat_revenue / total_revenue * 100) if total_revenue > 0 else 0.0
        }

    metrics['contribution_by_category'] = category_metrics

    # Calculate operating income
    operating_income = contribution_margin - fixed_costs
    metrics['operating_income'] = float(operating_income)
    metrics['operating_margin'] = float(operating_income / total_revenue * 100) if total_revenue > 0 else 0.0

    # Calculate degree of operating leverage
    if contribution_margin > 0 and operating_income != 0:
        metrics['operating_leverage'] = float(contribution_margin / operating_income)
    else:
        metrics['operating_leverage'] = None

    # Calculate margin of safety
    break_even_revenue = fixed_costs / (contribution_margin / total_revenue) if contribution_margin > 0 else float('inf')
    metrics['break_even_revenue'] = float(break_even_revenue)
    metrics['margin_of_safety'] = float((total_revenue - break_even_revenue) / total_revenue * 100) if total_revenue > 0 else -100.0

    return metrics

def perform_client_segmentation(df):
    """
    Performs RFM (Recency, Frequency, Monetary) segmentation and clustering

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features

    Returns:
    dict: Client segmentation metrics
    """
    import pandas as pd
    import numpy as np
    from sklearn.cluster import KMeans
    from sklearn.preprocessing import StandardScaler

    metrics = {}

    # Calculate RFM metrics
    reference_date = df['transaction_date'].max() + pd.DateOffset(days=1)

    rfm_table = df.groupby('código').agg({
        'transaction_date': lambda x: (reference_date - x.max()).days,
        'código': 'count',
        'net_revenue': 'sum'
    })
    rfm_table.rename(columns={
        'transaction_date': 'recency',
        'código': 'frequency',
        'net_revenue': 'monetary'
    }, inplace=True)

    def assign_qcut_labels(series, q, labels):
        bins = pd.qcut(series, q=q, duplicates='drop', retbins=True)[1]
        return pd.cut(series, bins=bins, labels=labels[:len(bins)-1], include_lowest=True)

    # Calculate RFM scores
    r_labels = [4, 3, 2, 1]
    f_labels = [1, 2, 3, 4]
    m_labels = [1, 2, 3, 4]

    rfm_table['r_score'] = assign_qcut_labels(rfm_table['recency'], 4, r_labels)
    rfm_table['f_score'] = assign_qcut_labels(rfm_table['frequency'], 4, f_labels)
    rfm_table['m_score'] = assign_qcut_labels(rfm_table['monetary'], 4, m_labels)

    # Convert to numeric for calculation
    rfm_table['r_score'] = rfm_table['r_score'].cat.add_categories([0]).fillna(0).astype(int)
    rfm_table['f_score'] = rfm_table['f_score'].cat.add_categories([0]).fillna(0).astype(int)
    rfm_table['m_score'] = rfm_table['m_score'].cat.add_categories([0]).fillna(0).astype(int)

    # Calculate RFM composite score
    rfm_table['rfm_score'] = rfm_table['r_score'] + rfm_table['f_score'] + rfm_table['m_score']
    rfm_table['rfm_segment'] = pd.cut(rfm_table['rfm_score'], bins=[0, 4, 5, 6, 7, 8, 9, 10, 12],
                                     labels=['Lost Cause', 'Hibernating', 'Can\'t Lose',
                                             'Need Attention', 'Loyal Customers', 'Potential Loyalist',
                                             'Promising', 'Champions'])

    # Segment metrics
    segment_metrics = rfm_table.groupby('rfm_segment').agg({
        'recency': 'mean',
        'frequency': 'mean',
        'monetary': 'mean',
        'rfm_score': 'mean'
    }).to_dict('index')

    # Convert to float for JSON serialization
    for segment, data in segment_metrics.items():
        for metric, value in data.items():
            segment_metrics[segment][metric] = float(value)

    metrics['rfm_segmentation'] = {
        'segment_metrics': segment_metrics,
        'client_counts': rfm_table['rfm_segment'].value_counts().to_dict(),
        'total_clients': len(rfm_table)
    }

    # K-means clustering for more nuanced segmentation
    try:
        # Prepare data for clustering
        X = rfm_table[['recency', 'frequency', 'monetary']].values
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Determine optimal number of clusters using elbow method
        inertia = []
        k_range = range(1, 10)
        for k in k_range:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(X_scaled)
            inertia.append(kmeans.inertia_)

        # Calculate elbow point (simplified)
        angles = []
        for i in range(1, len(inertia)-1):
            v1 = np.array([k_range[i-1], inertia[i-1]]) - np.array([k_range[i], inertia[i]])
            v2 = np.array([k_range[i+1], inertia[i+1]]) - np.array([k_range[i], inertia[i]])
            cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
            angles.append((i+1, cos_angle))

        optimal_k = max(angles, key=lambda x: x[1])[0] if angles else 4

        # Perform final clustering
        kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(X_scaled)
        rfm_table['cluster'] = clusters

        # Calculate cluster metrics
        cluster_metrics = {}
        for i in range(optimal_k):
            cluster_data = rfm_table[rfm_table['cluster'] == i]
            cluster_metrics[f'cluster_{i}'] = {
                'size': int(len(cluster_data)),
                'percentage': float(len(cluster_data) / len(rfm_table) * 100),
                'avg_recency': float(cluster_data['recency'].mean()),
                'avg_frequency': float(cluster_data['frequency'].mean()),
                'avg_monetary': float(cluster_data['monetary'].mean()),
                'recency_std': float(cluster_data['recency'].std()),
                'frequency_std': float(cluster_data['frequency'].std()),
                'monetary_std': float(cluster_data['monetary'].std())
            }

        metrics['kmeans_segmentation'] = {
            'optimal_clusters': int(optimal_k),
            'cluster_metrics': cluster_metrics,
            'inertia': float(inertia[optimal_k-1]) if optimal_k <= len(inertia) else None
        }

    except Exception as e:
        metrics['kmeans_segmentation'] = {'error': str(e)}

    return metrics

def analyze_sales_funnel(df):
    """
    Analyzes the sales funnel from trial to paid conversion

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features

    Returns:
    dict: Sales funnel metrics
    """
    import pandas as pd
    import numpy as np

    metrics = {}

    # Identify trial clients (those who purchased a trial class)
    trial_clients = df[df['is_trial'] == 1]['código'].unique()
    metrics['total_trial_clients'] = int(len(trial_clients))

    # Identify clients who converted to paid packages
    converted_clients = df[(df['código'].isin(trial_clients)) &
                         (df['is_package'] == 1)]['código'].unique()
    metrics['converted_clients'] = int(len(converted_clients))

    # Calculate trial conversion rate
    metrics['trial_conversion_rate'] = float(
        (len(converted_clients) / len(trial_clients)) * 100) if len(trial_clients) > 0 else 0.0

    # Calculate time to conversion
    if len(converted_clients) > 0:
        # For each converted client, find the trial date and first package date
        conversion_times = []
        for client in converted_clients:
            client_df = df[df['código'] == client]
            trial_date = client_df[client_df['is_trial'] == 1]['transaction_date'].min()
            package_date = client_df[client_df['is_package'] == 1]['transaction_date'].min()

            if trial_date and package_date and package_date > trial_date:
                days_to_conversion = (package_date - trial_date).days
                conversion_times.append(days_to_conversion)

        if conversion_times:
            metrics['avg_days_to_conversion'] = float(np.mean(conversion_times))
            metrics['median_days_to_conversion'] = float(np.median(conversion_times))
            metrics['std_days_to_conversion'] = float(np.std(conversion_times))

    # Funnel by consultant
    consultant_funnel = {}
    for consultant in df['consultor'].unique():
        if pd.isna(consultant) or consultant.strip() == '':
            continue

        consultant_df = df[df['consultor'] == consultant]
        consultant_trials = consultant_df[consultant_df['is_trial'] == 1]['código'].unique()

        if len(consultant_trials) > 0:
            consultant_converted = df[(df['código'].isin(consultant_trials)) &
                                    (df['is_package'] == 1) &
                                    (df['consultor'] == consultant)]['código'].unique()

            consultant_funnel[consultant] = {
                'trial_clients': int(len(consultant_trials)),
                'converted_clients': int(len(consultant_converted)),
                'conversion_rate': float((len(consultant_converted) / len(consultant_trials)) * 100)
            }

    metrics['consultant_funnel'] = consultant_funnel

    # Product-specific funnel
    product_funnel = {}
    for product in df['product_category'].unique():
        if pd.isna(product):
            continue

        product_df = df[df['product_category'] == product]
        product_trials = product_df[product_df['is_trial'] == 1]['código'].unique()

        if len(product_trials) > 0:
            product_converted = df[(df['código'].isin(product_trials)) &
                                 (df['is_package'] == 1) &
                                 (df['product_category'] == product)]['código'].unique()

            product_funnel[product] = {
                'trial_clients': int(len(product_trials)),
                'converted_clients': int(len(product_converted)),
                'conversion_rate': float((len(product_converted) / len(product_trials)) * 100)
            }

    metrics['product_funnel'] = product_funnel

    # Calculate funnel drop-off rates
    if len(trial_clients) > 0:
        # Calculate how many clients made multiple visits but didn't convert
        multiple_visit_clients = df[df['código'].isin(trial_clients)].groupby('código').size()
        multiple_visit_clients = multiple_visit_clients[multiple_visit_clients > 1].index.unique()

        metrics['multiple_visit_rate'] = float(
            len(multiple_visit_clients) / len(trial_clients) * 100)

        # Of those with multiple visits, how many converted
        multiple_visit_converted = [c for c in multiple_visit_clients if c in converted_clients]
        metrics['conversion_rate_after_multiple_visits'] = float(
            len(multiple_visit_converted) / len(multiple_visit_clients) * 100) if len(multiple_visit_clients) > 0 else 0.0

    return metrics

def predict_churn_risk(df, lookback_months=3):
    """
    Predicts churn risk for clients based on recent activity

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features
    lookback_months (int): Number of months to look back for activity

    Returns:
    dict: Churn prediction metrics
    """
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report

    metrics = {}

    if df.empty or 'transaction_date' not in df.columns:
        return metrics

    # Define reference date
    reference_date = df['transaction_date'].max()

    # Create client-level features
    client_features = df.groupby('código').agg({
        'transaction_date': ['max', 'count', lambda x: (reference_date - x.max()).days],
        'net_revenue': ['sum', 'mean'],
        'is_trial': 'sum',
        'is_package': 'sum',
        'product_category': lambda x: x.nunique()
    }).reset_index()

    client_features.columns = ['código', 'last_transaction', 'transaction_count',
                             'days_since_last', 'total_revenue', 'avg_revenue',
                             'trial_count', 'package_count', 'product_diversity']

    # Create churn label (clients who haven't transacted in lookback period)
    client_features['churned'] = client_features['days_since_last'] > (lookback_months * 30)

    # Create features for prediction
    X = client_features[['transaction_count', 'days_since_last', 'total_revenue',
                        'avg_revenue', 'trial_count', 'package_count', 'product_diversity']]
    y = client_features['churned']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    try:
        model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
        model.fit(X_train, y_train)

        # Predict on test set
        y_pred = model.predict(X_test)

        # Get feature importances
        feature_importances = dict(zip(X.columns, model.feature_importances_))

        # Predict churn probability for all clients
        churn_prob = model.predict_proba(X)[:, 1]
        client_features['churn_probability'] = churn_prob

        # Segment clients by churn risk
        high_risk = client_features[client_features['churn_probability'] > 0.7]
        medium_risk = client_features[(client_features['churn_probability'] <= 0.7) &
                                    (client_features['churn_probability'] > 0.3)]
        low_risk = client_features[client_features['churn_probability'] <= 0.3]

        # Calculate metrics
        metrics['churn_prediction'] = {
            'high_risk_clients': int(len(high_risk)),
            'medium_risk_clients': int(len(medium_risk)),
            'low_risk_clients': int(len(low_risk)),
            'high_risk_percentage': float(len(high_risk) / len(client_features) * 100),
            'feature_importances': {k: float(v) for k, v in feature_importances.items()},
            'model_accuracy': float((y_pred == y_test).mean() * 100)
        }

        # Calculate potential revenue at risk
        revenue_at_risk = client_features[client_features['churn_probability'] > 0.5]['total_revenue'].sum()
        metrics['churn_prediction']['revenue_at_risk'] = float(revenue_at_risk)

        # Calculate expected churn
        expected_churn = client_features['churn_probability'].mean() * 100
        metrics['churn_prediction']['expected_churn_rate'] = float(expected_churn)

    except Exception as e:
        metrics['churn_prediction'] = {'error': str(e)}

    return metrics

def analyze_capacity_utilization(df, max_capacity=100):
    """
    Analyzes class capacity utilization based on transaction patterns

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features
    max_capacity (int): Maximum capacity per class (hypothetical)

    Returns:
    dict: Capacity utilization metrics
    """
    import pandas as pd
    import numpy as np

    metrics = {}

    if 'transaction_date' not in df or df.empty:
        return metrics

    # Extract time components
    df = df.copy()
    df['hour'] = df['transaction_date'].dt.hour
    df['day_of_week'] = df['transaction_date'].dt.dayofweek  # 0=Monday, 6=Sunday
    df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)

    # Group by hour and day of week
    utilization = df.groupby(['day_of_week', 'hour']).size().reset_index(name='count')

    # Calculate average utilization
    utilization['avg_count'] = utilization['count'] / len(df['transaction_date'].dt.to_period('M').unique())

    # Convert to matrix format for analysis
    utilization_matrix = utilization.pivot(index='day_of_week', columns='hour', values='avg_count').fillna(0)

    # Calculate overall utilization rate
    total_possible_slots = len(utilization_matrix) * len(utilization_matrix.columns) * max_capacity
    total_actual = utilization['avg_count'].sum()
    metrics['overall_utilization_rate'] = float(total_actual / total_possible_slots * 100)

    # Identify peak hours
    peak_hours = utilization.sort_values('avg_count', ascending=False).head(5)
    metrics['peak_hours'] = [
        {
            'day_of_week': int(row['day_of_week']),
            'hour': int(row['hour']),
            'average_attendance': float(row['avg_count']),
            'utilization_rate': float(row['avg_count'] / max_capacity * 100)
        } for _, row in peak_hours.iterrows()
    ]

    # Identify low utilization periods
    low_utilization = utilization[utilization['avg_count'] < (max_capacity * 0.3)]
    metrics['low_utilization_periods'] = [
        {
            'day_of_week': int(row['day_of_week']),
            'hour': int(row['hour']),
            'average_attendance': float(row['avg_count']),
            'utilization_rate': float(row['avg_count'] / max_capacity * 100)
        } for _, row in low_utilization.iterrows()
    ]

    # Calculate weekday vs weekend utilization
    weekday_util = utilization[utilization['day_of_week'] < 5]['avg_count'].mean()
    weekend_util = utilization[utilization['day_of_week'] >= 5]['avg_count'].mean()

    metrics['weekday_utilization'] = float(weekday_util / max_capacity * 100)
    metrics['weekend_utilization'] = float(weekend_util / max_capacity * 100)

    # Calculate revenue per capacity unit
    revenue_by_hour = df.groupby(['day_of_week', 'hour'])['net_revenue'].sum().reset_index()
    revenue_by_hour = pd.merge(revenue_by_hour, utilization[['day_of_week', 'hour', 'avg_count']],
                              on=['day_of_week', 'hour'])

    revenue_by_hour['revenue_per_attendee'] = revenue_by_hour['net_revenue'] / revenue_by_hour['avg_count']
    avg_revenue_per_attendee = revenue_by_hour['revenue_per_attendee'].mean()

    metrics['revenue_per_capacity_unit'] = float(avg_revenue_per_attendee)
    metrics['potential_revenue_increase'] = float(
        (max_capacity - utilization['avg_count'].mean()) * avg_revenue_per_attendee *
        len(utilization) / len(df['transaction_date'].dt.to_period('M').unique())
    )

    # Calculate optimal staffing levels
    metrics['optimal_staffing'] = float(utilization['avg_count'].mean() / 15)  # Assuming 1 trainer per 15 clients

    return metrics

def analyze_revenue_drivers(df):
    """
    Analyzes key drivers of revenue using correlation and regression

    Parameters:
    df (pd.DataFrame): DataFrame with engineered features

    Returns:
    dict: Revenue driver analysis
    """
    import pandas as pd
    import numpy as np
    from sklearn.linear_model import LinearRegression
    import statsmodels.api as sm

    metrics = {}

    # Create daily revenue dataset
    daily_data = df.copy()
    daily_data['date'] = daily_data['transaction_date'].dt.date
    daily_revenue = daily_data.groupby('date').agg({
        'net_revenue': 'sum',
        'is_trial': 'sum',
        'is_package': 'sum',
        'is_weekend': 'first',
        'day_of_week': 'first'
    }).reset_index()

    # Add lag features
    for lag in [1, 7, 14, 30]:
        daily_revenue[f'revenue_lag_{lag}'] = daily_revenue['net_revenue'].shift(lag)

    # Add rolling features
    daily_revenue['revenue_7d_ma'] = daily_revenue['net_revenue'].rolling(window=7).mean()
    daily_revenue['revenue_30d_ma'] = daily_revenue['net_revenue'].rolling(window=30).mean()

    # Drop NaN values
    daily_revenue = daily_revenue.dropna()

    if len(daily_revenue) < 10:
        return metrics

    # Calculate correlations
    corr_matrix = daily_revenue.corr()['net_revenue'].sort_values(ascending=False)
    metrics['revenue_correlations'] = {k: float(v) for k, v in corr_matrix.items() if k != 'net_revenue'}

    # Prepare data for regression
    X = daily_revenue[['is_trial', 'is_package', 'is_weekend', 'revenue_lag_1',
                      'revenue_lag_7', 'revenue_7d_ma']]
    y = daily_revenue['net_revenue']

    # Add constant for statsmodels
    X_sm = sm.add_constant(X)

    try:
        # Fit OLS model
        model = sm.OLS(y, X_sm).fit()

        # Extract coefficients and significance
        coef_summary = {}
        for var in X.columns:
            coef = model.params[var]
            pvalue = model.pvalues[var]
            significant = pvalue < 0.05

            coef_summary[var] = {
                'coefficient': float(coef),
                'p_value': float(pvalue),
                'significant': bool(significant)
            }

        metrics['revenue_regression'] = {
            'coefficients': coef_summary,
            'r_squared': float(model.rsquared),
            'adj_r_squared': float(model.rsquared_adj),
            'f_statistic': float(model.fvalue),
            'model_significance': float(model.f_pvalue) < 0.05
        }

        # Calculate elasticity for significant variables
        elasticity = {}
        for var, data in coef_summary.items():
            if data['significant'] and data['coefficient'] != 0:
                # Elasticity = (ΔY/Y) / (ΔX/X) = coefficient * (X_mean / Y_mean)
                x_mean = X[var].mean()
                y_mean = y.mean()
                if x_mean > 0 and y_mean > 0:
                    elasticity[var] = float(data['coefficient'] * (x_mean / y_mean))

        metrics['revenue_regression']['elasticity'] = {k: float(v) for k, v in elasticity.items()}

    except Exception as e:
        metrics['revenue_regression'] = {'error': str(e)}

    # Calculate marginal revenue for key variables
    metrics['marginal_revenue'] = {
        'per_trial': float(df[df['is_trial'] == 1]['net_revenue'].mean()),
        'per_package': float(df[df['is_package'] == 1]['net_revenue'].mean()),
        'weekend_vs_weekday': float(
            df[df['is_weekend'] == 1]['net_revenue'].mean() -
            df[df['is_weekend'] == 0]['net_revenue'].mean()
        )
    }

    return metrics

def create_financial_health_dashboard(df, fixed_costs, variable_cost_percentage=0.3):
    """
    Creates a comprehensive financial health dashboard

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data
    fixed_costs (float): Monthly fixed costs
    variable_cost_percentage (float): Percentage of revenue that goes to variable costs

    Returns:
    dict: Financial health dashboard metrics
    """
    # Calculate core financial metrics
    financial_metrics = calculate_financial_metrics(df)

    # Calculate break-even analysis
    break_even = calculate_break_even_analysis(df, fixed_costs, variable_cost_percentage)

    # Calculate contribution margin
    contribution = calculate_contribution_margin(df, fixed_costs)

    # Calculate advanced cohort metrics
    cohort_metrics = calculate_advanced_cohort_metrics(df)

    # Calculate cash flow forecast
    forecast = forecast_cash_flow(df)

    client_metrics = calculate_client_metrics(df)
    # Consolidate all metrics into a dashboard
    dashboard = {
        'core_financials': {
            'revenue': financial_metrics['total_revenue'],
            'revenue_trend': financial_metrics.get('monthly_revenue_growth_rate', 0.0),
            'transaction_volume': financial_metrics['total_transactions'],
            'average_transaction_value': financial_metrics['average_transaction_value']
        },
        'profitability': {
            'contribution_margin': contribution['contribution_margin_ratio'],
            'operating_margin': contribution['operating_margin'],
            'break_even_clients': break_even['break_even_clients'],
            'margin_of_safety': break_even['margin_of_safety'],
            'operating_leverage': contribution['operating_leverage']
        },
        'client_health': {
            'active_clients': client_metrics['active_clients'],
            'churn_rate': client_metrics['monthly_churn_rate'],
            'avg_ltv': cohort_metrics.get('average_ltv', 0.0),
            'ltv_cac_ratio': cohort_metrics.get('ltv_cac_ratio', 0.0)
        },
        'growth_prospects': {
            'forecasted_growth': forecast.get('forecasted_growth_rate', 0.0),
            'predicted_12m_retention': cohort_metrics.get('predicted_12m_retention', 0.0),
            'revenue_at_risk': 0.0  # Will be populated after churn prediction
        },
        'operational_efficiency': {
            'capacity_utilization': 0.0,  # Will be populated after capacity analysis
            'revenue_per_capacity_unit': 0.0,
            'optimal_staffing': 0.0
        },
        'risk_indicators': {
            'high_risk_churn_clients': 0,  # Will be populated after churn prediction
            'revenue_at_risk': 0.0,
            'days_to_break_even': break_even.get('days_to_break_even', float('inf'))
        }
    }

    # Add capacity utilization metrics if possible
    try:
        capacity_metrics = analyze_capacity_utilization(df)
        dashboard['operational_efficiency']['capacity_utilization'] = capacity_metrics['overall_utilization_rate']
        dashboard['operational_efficiency']['revenue_per_capacity_unit'] = capacity_metrics['revenue_per_capacity_unit']
        dashboard['operational_efficiency']['optimal_staffing'] = capacity_metrics['optimal_staffing']
    except:
        pass

    # Add churn prediction metrics
    try:
        churn_metrics = predict_churn_risk(df)
        if 'churn_prediction' in churn_metrics and churn_metrics['churn_prediction'].get('high_risk_clients'):
            dashboard['growth_prospects']['revenue_at_risk'] = churn_metrics['churn_prediction'].get('revenue_at_risk', 0.0)
            dashboard['risk_indicators']['high_risk_churn_clients'] = churn_metrics['churn_prediction']['high_risk_clients']
            dashboard['risk_indicators']['revenue_at_risk'] = churn_metrics['churn_prediction'].get('revenue_at_risk', 0.0)
    except:
        pass

    # Calculate health score (0-100)
    health_score = 50  # Base score

    # Add points for positive indicators
    if dashboard['profitability']['contribution_margin'] > 60:
        health_score += 15
    elif dashboard['profitability']['contribution_margin'] > 40:
        health_score += 10
    else:
        health_score += 5

    if dashboard['profitability']['margin_of_safety'] > 30:
        health_score += 15
    elif dashboard['profitability']['margin_of_safety'] > 10:
        health_score += 10
    else:
        health_score += 5

    if dashboard['client_health']['churn_rate'] < 5:
        health_score += 10
    elif dashboard['client_health']['churn_rate'] < 10:
        health_score += 5

    if dashboard['growth_prospects']['forecasted_growth'] > 2:
        health_score += 10
    elif dashboard['growth_prospects']['forecasted_growth'] > 0:
        health_score += 5

    # Subtract points for negative indicators
    if dashboard['risk_indicators']['revenue_at_risk'] > dashboard['core_financials']['revenue'] * 0.2:
        health_score -= 10
    elif dashboard['risk_indicators']['revenue_at_risk'] > dashboard['core_financials']['revenue'] * 0.1:
        health_score -= 5

    if dashboard['profitability']['operating_leverage'] and dashboard['profitability']['operating_leverage'] > 3:
        health_score -= 5  # High operating leverage increases risk

    dashboard['health_score'] = max(0, min(100, health_score))

    # Add health classification
    if health_score >= 80:
        dashboard['health_classification'] = "Excellent"
    elif health_score >= 65:
        dashboard['health_classification'] = "Good"
    elif health_score >= 50:
        dashboard['health_classification'] = "Fair"
    elif health_score >= 35:
        dashboard['health_classification'] = "Poor"
    else:
        dashboard['health_classification'] = "Critical"

    return dashboard

def advanced_gym_business_intelligence_etl(cash_flow_file, fixed_costs):
    """
    Advanced ETL pipeline for gym business intelligence with deep financial analysis

    Parameters:
    cash_flow_file (str): Path to the fluxo_caixa.xlsx file
    fixed_costs (float): Monthly fixed costs for the gym

    Returns:
    dict: Comprehensive business intelligence metrics with advanced financial analysis
    """
    # Extract
    cash_flow_df = extract_cash_flow_data(cash_flow_file)

    # Clean and transform
    cleaned_df = clean_cash_flow_data(cash_flow_df)
    engineered_df = engineer_features(cleaned_df)

    # Calculate advanced metrics
    financial_metrics = calculate_financial_metrics(engineered_df)
    client_metrics = calculate_client_metrics(engineered_df)
    product_metrics = calculate_product_performance(engineered_df)
    consultant_metrics = calculate_consultant_performance(engineered_df)
    time_series_metrics = calculate_time_series_metrics(engineered_df)
    cohort_metrics = calculate_cohort_analysis(engineered_df)
    advanced_cohort_metrics = calculate_advanced_cohort_metrics(engineered_df)
    break_even_analysis = calculate_break_even_analysis(engineered_df, fixed_costs)
    contribution_margin = calculate_contribution_margin(engineered_df, fixed_costs)
    cash_flow_forecast = forecast_cash_flow(engineered_df)
    client_segmentation = perform_client_segmentation(engineered_df)
    sales_funnel = analyze_sales_funnel(engineered_df)
    churn_prediction = predict_churn_risk(engineered_df)
    capacity_utilization = analyze_capacity_utilization(engineered_df)
    revenue_drivers = analyze_revenue_drivers(engineered_df)
    financial_health = create_financial_health_dashboard(engineered_df, fixed_costs)
    data_quality = assess_data_quality(engineered_df)

    # Consolidate all metrics
    business_intelligence = {
        'metadata': {
            'processing_date': str(pd.Timestamp.now()),
            'cash_flow_records': len(engineered_df),
            'date_range': {
                'start': str(engineered_df['transaction_date'].min()),
                'end': str(engineered_df['transaction_date'].max())
            },
            'fixed_costs': float(fixed_costs)
        },
        'financial_metrics': {
            'core': financial_metrics,
            'break_even_analysis': break_even_analysis,
            'contribution_margin': contribution_margin,
            'cash_flow_forecast': cash_flow_forecast
        },
        'client_metrics': {
            'core': client_metrics,
            'segmentation': client_segmentation,
            'churn_prediction': churn_prediction
        },
        'product_metrics': product_metrics,
        'consultant_metrics': {
            'core': consultant_metrics,
            'sales_funnel': sales_funnel
        },
        'operational_metrics': {
            'time_series': time_series_metrics,
            'cohort': {
                'basic': cohort_metrics,
                'advanced': advanced_cohort_metrics
            },
            'capacity_utilization': capacity_utilization,
            'revenue_drivers': revenue_drivers
        },
        'financial_health_dashboard': financial_health,
        'data_quality': data_quality
    }

    return business_intelligence

def calculate_confidence_intervals(df, column='net_revenue', confidence=0.95):
    """
    Calculates confidence intervals for key metrics

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data
    column (str): Column to calculate CI for
    confidence (float): Confidence level (0-1)

    Returns:
    dict: Confidence interval metrics
    """
    import numpy as np
    import scipy.stats as stats

    metrics = {}

    data = df[column].dropna().values
    if len(data) < 2:
        return metrics

    # Calculate basic statistics
    mean = np.mean(data)
    std_err = stats.sem(data)

    # Calculate confidence interval
    h = std_err * stats.t.ppf((1 + confidence) / 2, len(data) - 1)

    metrics = {
        'mean': float(mean),
        'std_error': float(std_err),
        'lower_bound': float(mean - h),
        'upper_bound': float(mean + h),
        'confidence_level': float(confidence * 100),
        'sample_size': int(len(data))
    }

    return metrics

def enhanced_data_quality_assessment(df):
    """
    Enhanced data quality assessment with statistical process control

    Parameters:
    df (pd.DataFrame): DataFrame to assess

    Returns:
    dict: Enhanced data quality metrics
    """
    import pandas as pd
    import numpy as np
    from scipy import stats

    base_metrics = assess_data_quality(df)
    enhanced_metrics = base_metrics.copy()

    # Statistical process control for revenue
    if 'net_revenue' in df.columns and not df['net_revenue'].isna().all():
        revenue = df['net_revenue'].dropna()

        # Calculate control limits (3-sigma)
        mean = revenue.mean()
        std = revenue.std()
        upper_limit = mean + 3 * std
        lower_limit = mean - 3 * std

        # Identify outliers
        outliers = df[(df['net_revenue'] > upper_limit) | (df['net_revenue'] < lower_limit)]

        enhanced_metrics['revenue_control'] = {
            'mean': float(mean),
            'std_dev': float(std),
            'upper_control_limit': float(upper_limit),
            'lower_control_limit': float(lower_limit),
            'outliers_count': int(len(outliers)),
            'outliers_percentage': float(len(outliers) / len(df) * 100) if len(df) > 0 else 0.0
        }

    # Temporal consistency check
    if 'transaction_date' in df.columns and not df['transaction_date'].isna().all():
        # Check for transactions on weekends if gym is typically closed
        df['day_of_week'] = df['transaction_date'].dt.dayofweek
        weekend_transactions = df[df['day_of_week'].isin([5, 6])]

        enhanced_metrics['temporal_consistency'] = {
            'weekend_transactions': int(len(weekend_transactions)),
            'weekend_transactions_percentage': float(len(weekend_transactions) / len(df) * 100) if len(df) > 0 else 0.0,
            'possible_data_entry_errors': int(len(df[df['transaction_date'].dt.hour.isin([0, 1, 2, 3, 4, 5])]))
        }

    # Cross-field validation
    if all(col in df.columns for col in ['valor_total', 'valor_unitário', 'quantidade']):
        # Check if valor_total = valor_unitário * quantidade
        calculated_total = df['valor_unitário'] * df['quantidade']
        mismatch = df[abs(calculated_total - df['valor_total']) > 0.01]

        enhanced_metrics['cross_field_validation'] = {
            'mismatch_count': int(len(mismatch)),
            'mismatch_percentage': float(len(mismatch) / len(df) * 100) if len(df) > 0 else 0.0
        }

    # Data distribution analysis
    if 'net_revenue' in df.columns and not df['net_revenue'].isna().all():
        revenue = df['net_revenue'].dropna()

        # Test for normality
        _, p_value = stats.normaltest(revenue)

        enhanced_metrics['distribution_analysis'] = {
            'skewness': float(stats.skew(revenue)),
            'kurtosis': float(stats.kurtosis(revenue)),
            'normality_p_value': float(p_value),
            'is_normal': bool(p_value > 0.05)
        }

    return enhanced_metrics

def execute_advanced_gym_analysis(cash_flow_file, fixed_costs=15000):
    """
    Executes the complete advanced gym business intelligence analysis

    Parameters:
    cash_flow_file (str): Path to the cash flow Excel file
    fixed_costs (float): Monthly fixed costs for the gym (default: $15,000)

    Returns:
    dict: Complete advanced business intelligence report
    """
    import time

    start_time = time.time()

    # Run the advanced ETL pipeline
    bi_report = advanced_gym_business_intelligence_etl(cash_flow_file, fixed_costs)

    # Add execution metrics
    bi_report['execution_metrics'] = {
        'start_time': str(pd.Timestamp.now() - pd.Timedelta(seconds=time.time()-start_time)),
        'end_time': str(pd.Timestamp.now()),
        'processing_time_seconds': float(time.time() - start_time),
        'data_quality_score': bi_report['data_quality']['data_quality_score']
    }

    return bi_report
