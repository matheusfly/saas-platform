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

def perform_client_survival_analysis(df):
    """
    Performs survival analysis to model client retention using Kaplan-Meier estimator

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data

    Returns:
    dict: Survival analysis metrics and model parameters
    """
    import pandas as pd
    import numpy as np
    from lifelines import KaplanMeierFitter
    from lifelines.statistics import logrank_test

    metrics = {}

    if 'transaction_date' not in df.columns or df.empty:
        return metrics

    # Create client-level dataset for survival analysis
    reference_date = df['transaction_date'].max()

    # Calculate time between first and last transaction for each client
    client_activity = df.groupby('código').agg({
        'transaction_date': ['min', 'max']
    }).reset_index()
    client_activity.columns = ['código', 'first_transaction', 'last_transaction']

    # Calculate observation period (time from first transaction to today)
    client_activity['observation_period'] = (reference_date - client_activity['first_transaction']).dt.days

    # Calculate time to churn (time from first transaction to last transaction)
    client_activity['time_to_churn'] = (client_activity['last_transaction'] - client_activity['first_transaction']).dt.days

    # Define churned clients (those with no activity in the last 30 days)
    client_activity['churned'] = (reference_date - client_activity['last_transaction']).dt.days > 30

    # Prepare data for survival analysis
    T = client_activity['observation_period']
    E = client_activity['churned']

    # Fit Kaplan-Meier model
    kmf = KaplanMeierFitter()
    kmf.fit(T, event_observed=E)

    # Calculate key survival metrics
    metrics['survival_analysis'] = {
        'median_survival_time': float(kmf.median_survival_time_),
        'survival_at_30_days': float(kmf.survival_function_at_times(30).iloc[0]),
        'survival_at_90_days': float(kmf.survival_function_at_times(90).iloc[0]),
        'survival_at_180_days': float(kmf.survival_function_at_times(180).iloc[0]),
        'hazard_ratio': float(1 - kmf.survival_function_at_times(30).iloc[0]) /
                        (1 - kmf.survival_function_at_times(90).iloc[0]) ** (1/3) if kmf.survival_function_at_times(90).iloc[0] < 1 else 0.0
    }

    # Analyze survival by product category
    survival_by_category = {}
    for category in df['product_category'].unique():
        if pd.isna(category):
            continue

        category_clients = df[df['product_category'] == category]['código'].unique()
        category_data = client_activity[client_activity['código'].isin(category_clients)]

        if len(category_data) > 5:  # Minimum sample size
            T_cat = category_data['observation_period']
            E_cat = category_data['churned']

            kmf_cat = KaplanMeierFitter()
            kmf_cat.fit(T_cat, event_observed=E_cat)

            survival_by_category[category] = {
                'median_survival_time': float(kmf_cat.median_survival_time_),
                'survival_at_90_days': float(kmf_cat.survival_function_at_times(90).iloc[0]),
                'client_count': int(len(category_data))
            }

    metrics['survival_by_category'] = survival_by_category

    # Calculate hazard ratios between categories (using log-rank test)
    hazard_ratios = {}
    categories = list(survival_by_category.keys())
    for i in range(len(categories)):
        for j in range(i+1, len(categories)):
            cat1 = categories[i]
            cat2 = categories[j]

            cat1_data = client_activity[client_activity['código'].isin(df[df['product_category'] == cat1]['código'].unique())]
            cat2_data = client_activity[client_activity['código'].isin(df[df['product_category'] == cat2]['código'].unique())]

            if len(cat1_data) > 5 and len(cat2_data) > 5:
                results = logrank_test(
                    durations_A=cat1_data['observation_period'],
                    durations_B=cat2_data['observation_period'],
                    event_observed_A=cat1_data['churned'],
                    event_observed_B=cat2_data['churned']
                )

                hazard_ratios[f"{cat1}_vs_{cat2}"] = {
                    'p_value': float(results.p_value),
                    'significant': bool(results.p_value < 0.05),
                    'test_statistic': float(results.test_statistic)
                }

    metrics['hazard_ratios'] = hazard_ratios

    # Calculate expected client lifetime value using survival curve
    if not kmf.survival_function_.empty:
        # Calculate monthly revenue per client
        monthly_revenue = df.groupby(['código', df['transaction_date'].dt.to_period('M')])['net_revenue'].sum().mean()

        # Calculate LTV using survival curve
        ltv = 0
        for i in range(1, 25):  # Calculate up to 24 months
            if i-1 in kmf.survival_function_.index:
                survival_prob = kmf.survival_function_.loc[i-1].iloc[0]
                ltv += monthly_revenue * survival_prob

        metrics['survival_analysis']['ltv'] = float(ltv)

    return metrics

def analyze_pricing_optimization(df):
    """
    Analyzes pricing elasticity and optimizes pricing strategy

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data

    Returns:
    dict: Pricing optimization metrics
    """
    import pandas as pd
    import numpy as np
    from scipy import stats
    import statsmodels.api as sm

    metrics = {}

    # Filter for paid products (excluding Gympass)
    paid_products = df[df['product_category'] != 'Gympass']

    if paid_products.empty:
        return metrics

    # Calculate price points and quantities
    price_quantity = paid_products.groupby(['product_category', 'effective_unit_price']).agg({
        'quantidade': 'sum',
        'código': 'nunique'
    }).reset_index()

    price_quantity = price_quantity.rename(columns={'código': 'client_count'})

    # Calculate price elasticity for each product category
    elasticity_results = {}

    for category in price_quantity['product_category'].unique():
        category_data = price_quantity[price_quantity['product_category'] == category]

        if len(category_data) < 3:  # Need at least 3 price points
            continue

        # Sort by price
        category_data = category_data.sort_values('effective_unit_price')

        # Calculate percentage changes
        category_data['price_pct_change'] = category_data['effective_unit_price'].pct_change()
        category_data['quantity_pct_change'] = category_data['quantidade'].pct_change()

        # Calculate elasticity as %Q/%P
        valid_elasticities = category_data[
            (category_data['price_pct_change'] != 0) &
            (category_data['quantity_pct_change'].notna())
        ]

        if not valid_elasticities.empty:
            # Weighted average elasticity (weighted by quantity)
            weights = valid_elasticities['quantidade'] / valid_elasticities['quantidade'].sum()
            elasticity = (valid_elasticities['quantity_pct_change'] / valid_elasticities['price_pct_change'] * weights).sum()

            elasticity_results[category] = {
                'elasticity': float(elasticity),
                'demand_type': 'elastic' if abs(elasticity) > 1 else 'inelastic',
                'optimal_price': float(
                    category_data['effective_unit_price'].mean() * (1 + 1/abs(elasticity))
                ) if elasticity < 0 else None,
                'price_range_tested': {
                    'min': float(category_data['effective_unit_price'].min()),
                    'max': float(category_data['effective_unit_price'].max()),
                    'current': float(df[df['product_category'] == category]['effective_unit_price'].mean())
                }
            }

    metrics['price_elasticity'] = elasticity_results

    # Calculate revenue impact of potential price changes
    revenue_impact = {}

    for category, data in elasticity_results.items():
        if data['elasticity'] < 0:  # Only for normal goods
            current_price = data['price_range_tested']['current']
            current_revenue = df[df['product_category'] == category]['net_revenue'].sum()

            # Calculate impact of 5% price increase
            price_increase = 1.05
            quantity_change = data['elasticity'] * 0.05
            new_quantity = (1 + quantity_change) * len(df[df['product_category'] == category])

            # Calculate new revenue
            new_revenue = current_revenue * price_increase * (1 + quantity_change)
            revenue_change = new_revenue - current_revenue

            revenue_impact[category] = {
                'current_revenue': float(current_revenue),
                'revenue_change_5pct_increase': float(revenue_change),
                'revenue_change_pct': float(revenue_change / current_revenue * 100),
                'optimal_price_revenue': float(
                    current_revenue * (data['optimal_price'] / current_price) *
                    (1 + data['elasticity'] * ((data['optimal_price'] - current_price) / current_price))
                ) if data['optimal_price'] else None
            }

    metrics['revenue_impact'] = revenue_impact

    # Analyze package vs. single class pricing
    package_data = df[df['is_package'] == 1]
    single_class_data = df[(df['product_category'] == 'Calisthenics') & (df['quantidade'] == 1)]

    if not package_data.empty and not single_class_data.empty:
        # Calculate average revenue per class for packages
        classes_per_package = 10  # Assuming 10-class packages
        package_revenue_per_class = package_data['net_revenue'].sum() / (len(package_data) * classes_per_package)

        # Calculate average revenue for single classes
        single_class_revenue = single_class_data['net_revenue'].mean()

        # Calculate discount rate for packages
        package_discount_rate = (single_class_revenue - package_revenue_per_class) / single_class_revenue

        metrics['package_pricing'] = {
            'single_class_revenue': float(single_class_revenue),
            'package_revenue_per_class': float(package_revenue_per_class),
            'package_discount_rate': float(package_discount_rate * 100),
            'optimal_discount_rate': float(min(50, max(10, 30 + (package_discount_rate * 100 - 30) * 0.5)))  # Target 30% discount
        }

    return metrics

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

def perform_financial_scenario_analysis(df, fixed_costs, scenarios=None):
    """
    Performs financial scenario analysis with sensitivity testing

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data
    fixed_costs (float): Monthly fixed costs
    scenarios (dict): Custom scenarios to test (optional)

    Returns:
    dict: Scenario analysis results
    """
    import pandas as pd
    import numpy as np

    metrics = {}

    # Base case metrics
    base_metrics = calculate_financial_metrics(df)
    contribution = calculate_contribution_margin(df, fixed_costs)
    base_metrics['client_metrics'] = calculate_client_metrics(df)

    # Define default scenarios if none provided
    if scenarios is None:
        scenarios = {
            'optimistic': {
                'revenue_growth': 0.15,
                'churn_reduction': 0.2,
                'new_client_increase': 0.25
            },
            'pessimistic': {
                'revenue_growth': -0.05,
                'churn_reduction': -0.1,
                'new_client_increase': -0.15
            },
            'realistic': {
                'revenue_growth': 0.05,
                'churn_reduction': 0.05,
                'new_client_increase': 0.1
            }
        }

    # Calculate base case financials
    base_revenue = base_metrics['total_revenue']
    base_clients = df['código'].nunique()
    base_churn_rate = base_metrics['client_metrics']['monthly_churn_rate'] / 100

    # Calculate monthly contribution margin
    contribution_margin_ratio = contribution['contribution_margin_ratio'] / 100

    scenario_results = {}

    for scenario_name, params in scenarios.items():
        # Apply scenario parameters
        revenue_multiplier = 1 + params['revenue_growth']
        churn_rate = base_churn_rate * (1 - params['churn_reduction'])
        new_client_multiplier = 1 + params['new_client_increase']

        # Project revenue for next 12 months
        monthly_revenue = []
        client_counts = []
        current_clients = base_clients

        for month in range(12):
            # Calculate new clients for this month
            new_clients = (base_clients / 12) * new_client_multiplier

            # Calculate churned clients
            churned_clients = current_clients * churn_rate

            # Update client count
            current_clients = current_clients + new_clients - churned_clients
            client_counts.append(current_clients)

            # Calculate revenue (assuming proportional to client count)
            month_revenue = base_revenue / 12 * revenue_multiplier * (current_clients / base_clients)
            monthly_revenue.append(month_revenue)

        # Calculate financial outcomes
        total_revenue = sum(monthly_revenue)
        total_contribution = total_revenue * contribution_margin_ratio
        net_income = total_contribution - (fixed_costs * 12)

        # Calculate break-even point in months
        cumulative_contribution = np.cumsum(np.array(monthly_revenue) * contribution_margin_ratio)
        cumulative_costs = np.cumsum(np.array([fixed_costs] * 12))
        break_even_month = np.where(cumulative_contribution >= cumulative_costs)[0]
        break_even_month = int(break_even_month[0] + 1) if len(break_even_month) > 0 else 12

        scenario_results[scenario_name] = {
            'total_revenue': float(total_revenue),
            'net_income': float(net_income),
            'profit_margin': float(net_income / total_revenue * 100) if total_revenue > 0 else 0.0,
            'break_even_month': break_even_month,
            'peak_client_count': float(max(client_counts)),
            'final_client_count': float(client_counts[-1]),
            'client_growth_rate': float((client_counts[-1] - base_clients) / base_clients * 100),
            'parameters': params
        }

    metrics['scenarios'] = scenario_results

    # Calculate sensitivity to key variables
    sensitivity_results = {}

    # Test sensitivity to churn rate
    churn_rates = [base_churn_rate * 0.5, base_churn_rate * 0.75, base_churn_rate, base_churn_rate * 1.25, base_churn_rate * 1.5]
    revenue_impact = []

    for churn in churn_rates:
        # Project for 12 months with this churn rate
        current_clients = base_clients
        monthly_revenue = []

        for month in range(12):
            churned_clients = current_clients * churn
            current_clients = current_clients - churned_clients
            month_revenue = base_revenue / 12 * (current_clients / base_clients)
            monthly_revenue.append(month_revenue)

        total_revenue = sum(monthly_revenue)
        revenue_impact.append(total_revenue)

    # Calculate elasticity of revenue to churn
    if len(churn_rates) > 1 and churn_rates[1] != churn_rates[0]:
        churn_elasticity = ((revenue_impact[1] - revenue_impact[0]) / revenue_impact[0]) / ((churn_rates[1] - churn_rates[0]) / churn_rates[0])
    else:
        churn_elasticity = 0

    sensitivity_results['churn_sensitivity'] = {
        'elasticity': float(churn_elasticity),
        'revenue_at_50pct_base_churn': float(revenue_impact[0]),
        'revenue_at_75pct_base_churn': float(revenue_impact[1]),
        'revenue_at_100pct_base_churn': float(revenue_impact[2]),
        'revenue_at_125pct_base_churn': float(revenue_impact[3]),
        'revenue_at_150pct_base_churn': float(revenue_impact[4])
    }

    # Test sensitivity to revenue per client
    revenue_factors = [0.8, 0.9, 1.0, 1.1, 1.2]
    client_impact = []

    for factor in revenue_factors:
        # Calculate how many clients would be needed to maintain revenue
        required_clients = base_clients * (1.0 / factor)
        client_impact.append(required_clients)

    sensitivity_results['revenue_per_client_sensitivity'] = {
        'clients_at_80pct_revenue': float(client_impact[0]),
        'clients_at_90pct_revenue': float(client_impact[1]),
        'clients_at_100pct_revenue': float(client_impact[2]),
        'clients_at_110pct_revenue': float(client_impact[3]),
        'clients_at_120pct_revenue': float(client_impact[4])
    }

    metrics['sensitivity_analysis'] = sensitivity_results

    return metrics

def develop_churn_early_warning_system(df, lookback_days=60):
    """
    Develops an advanced churn prediction model with early warning indicators

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data
    lookback_days (int): Number of days to look back for activity

    Returns:
    dict: Churn prediction and early warning metrics
    """
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.metrics import (classification_report, roc_auc_score,
                               precision_recall_curve, average_precision_score)
    from sklearn.preprocessing import StandardScaler

    metrics = {}

    if df.empty or 'transaction_date' not in df.columns:
        return metrics

    # Define reference date
    reference_date = df['transaction_date'].max()

    # Create client-level features with lagged indicators
    client_features = df.groupby('código').agg({
        'transaction_date': ['max', 'min', 'count', lambda x: (reference_date - x.max()).days],
        'net_revenue': ['sum', 'mean', 'std'],
        'is_trial': 'sum',
        'is_package': 'sum',
        'product_category': lambda x: x.nunique(),
        'day_of_week': lambda x: x.mode()[0] if not x.empty else -1
    }).reset_index()

    client_features.columns = ['código', 'last_transaction', 'first_transaction',
                             'transaction_count', 'days_since_last',
                             'total_revenue', 'avg_revenue', 'revenue_std',
                             'trial_count', 'package_count', 'product_diversity',
                             'preferred_day']

    # Calculate tenure
    client_features['tenure'] = (client_features['last_transaction'] - client_features['first_transaction']).dt.days

    # Create lagged features (activity in previous periods)
    for period in [7, 14, 30, 60]:
        period_start = reference_date - pd.Timedelta(days=period)
        period_data = df[df['transaction_date'] >= period_start]

        period_features = period_data.groupby('código').agg({
            'transaction_date': 'count',
            'net_revenue': 'sum'
        }).reset_index()
        period_features.columns = ['código', f'transactions_last_{period}d', f'revenue_last_{period}d']

        client_features = pd.merge(client_features, period_features, on='código', how='left')
        client_features[[f'transactions_last_{period}d', f'revenue_last_{period}d']] = client_features[[
            f'transactions_last_{period}d', f'revenue_last_{period}d']
        ].fillna(0)

    # Create churn label (clients who haven't transacted in lookback period)
    client_features['churned'] = client_features['days_since_last'] > lookback_days

    # Create early warning features
    client_features['transaction_velocity'] = client_features['transaction_count'] / client_features['tenure'].replace(0, 1)
    client_features['recent_velocity'] = client_features['transactions_last_30d'] / 30

    # Calculate engagement decline (ratio of recent to historical velocity)
    client_features['engagement_decline'] = (
        client_features['recent_velocity'] /
        client_features['transaction_velocity'].replace(0, np.nan)
    ).fillna(0)

    # Identify clients with declining engagement
    client_features['declining_engagement'] = client_features['engagement_decline'] < 0.7

    # Create features for prediction
    feature_cols = [
        'transaction_count', 'days_since_last', 'total_revenue', 'avg_revenue',
        'trial_count', 'package_count', 'product_diversity', 'tenure',
        'transactions_last_7d', 'transactions_last_14d', 'transactions_last_30d',
        'revenue_last_7d', 'revenue_last_14d', 'revenue_last_30d',
        'transaction_velocity', 'recent_velocity', 'engagement_decline'
    ]

    X = client_features[feature_cols]
    y = client_features['churned']

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split data
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.25, random_state=42, stratify=y
        )

        # Train model with class weighting
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train, y_train)

        # Evaluate model
        y_pred = model.predict(X_test)
        y_proba = model.predict_proba(X_test)[:, 1]

        # Calculate precision-recall curve
        precision, recall, _ = precision_recall_curve(y_test, y_proba)
        avg_precision = average_precision_score(y_test, y_proba)

        # Get feature importances
        feature_importances = dict(zip(feature_cols, model.feature_importances_))

        # Predict churn probability for all clients
        churn_prob = model.predict_proba(X_scaled)[:, 1]
        client_features['churn_probability'] = churn_prob

        # Identify critical warning signs
        critical_signs = []
        high_risk_clients = client_features[client_features['churn_probability'] > 0.8]

        if not high_risk_clients.empty:
            # Check for specific patterns in high-risk clients
            if (high_risk_clients['engagement_decline'] < 0.5).mean() > 0.7:
                critical_signs.append("Sharp decline in engagement (more than 50%)")

            if (high_risk_clients['days_since_last'] > 14).mean() > 0.6:
                critical_signs.append("Extended inactivity (more than 14 days)")

            if (high_risk_clients['transactions_last_30d'] == 0).mean() > 0.5:
                critical_signs.append("No transactions in the last 30 days")

        # Calculate early warning lead time
        lead_times = []
        for _, client in client_features[client_features['churned']].iterrows():
            # For churned clients, calculate how early we could have predicted
            if client['days_since_last'] > lookback_days:
                # Look at historical probability
                historical_prob = []
                for days_back in range(lookback_days, 0, -7):
                    # Simulate prediction at this point in time
                    cutoff = reference_date - pd.Timedelta(days=days_back)
                    client_history = df[(df['código'] == client['código']) & (df['transaction_date'] <= cutoff)]

                    if not client_history.empty:
                        # Calculate features as of this date
                        days_since_last = (cutoff - client_history['transaction_date'].max()).days
                        transaction_count = len(client_history)
                        tenure = (client_history['transaction_date'].max() - client_history['transaction_date'].min()).days

                        # Calculate velocity
                        velocity = transaction_count / tenure if tenure > 0 else 0

                        # Calculate recent velocity (last 30 days)
                        period_start = cutoff - pd.Timedelta(days=30)
                        recent_transactions = client_history[client_history['transaction_date'] >= period_start]
                        recent_velocity = len(recent_transactions) / 30

                        # Engagement decline
                        engagement_decline = recent_velocity / velocity if velocity > 0 else 0

                        # Create feature vector
                        features = [
                            transaction_count, days_since_last,
                            client_history['net_revenue'].sum(),
                            client_history['net_revenue'].mean(),
                            client_history['is_trial'].sum(),
                            client_history['is_package'].sum(),
                            client_history['product_category'].nunique(),
                            tenure,
                            len(client_history[client_history['transaction_date'] >= (cutoff - pd.Timedelta(days=7))]),
                            len(client_history[client_history['transaction_date'] >= (cutoff - pd.Timedelta(days=14))]),
                            len(client_history[client_history['transaction_date'] >= (cutoff - pd.Timedelta(days=30))]),
                            client_history[client_history['transaction_date'] >= (cutoff - pd.Timedelta(days=7))]['net_revenue'].sum(),
                            client_history[client_history['transaction_date'] >= (cutoff - pd.Timedelta(days=14))]['net_revenue'].sum(),
                            client_history[client_history['transaction_date'] >= (cutoff - pd.Timedelta(days=30))]['net_revenue'].sum(),
                            velocity,
                            recent_velocity,
                            engagement_decline
                        ]

                        # Scale and predict
                        features_scaled = scaler.transform([features])
                        prob = model.predict_proba(features_scaled)[0, 1]

                        # If probability was high enough to flag
                        if prob > 0.5:
                            lead_times.append(days_back)
                            break

        metrics['churn_early_warning'] = {
            'model_performance': {
                'accuracy': float((y_pred == y_test).mean()),
                'roc_auc': float(roc_auc_score(y_test, y_proba)),
                'precision': float((y_test[y_pred == 1] == 1).mean() if sum(y_pred) > 0 else 0),
                'recall': float(sum(y_test[y_pred == 1]) / sum(y_test) if sum(y_test) > 0 else 0),
                'f1_score': float(2 * ((metrics['churn_early_warning']['model_performance']['precision'] *
                                      metrics['churn_early_warning']['model_performance']['recall']) /
                                      (metrics['churn_early_warning']['model_performance']['precision'] +
                                       metrics['churn_early_warning']['model_performance']['recall'] + 1e-10))),
                'avg_precision': float(avg_precision)
            },
            'feature_importances': {k: float(v) for k, v in feature_importances.items()},
            'critical_warning_signs': critical_signs,
            'average_lead_time_days': float(np.mean(lead_times)) if lead_times else 0.0,
            'high_risk_clients': int((client_features['churn_probability'] > 0.7).sum()),
            'medium_risk_clients': int(((client_features['churn_probability'] > 0.4) &
                                     (client_features['churn_probability'] <= 0.7)).sum()),
            'revenue_at_risk': float((client_features[client_features['churn_probability'] > 0.5]['total_revenue'] *
                                    client_features[client_features['churn_probability'] > 0.5]['churn_probability']).sum())
        }

    except Exception as e:
        metrics['churn_early_warning'] = {'error': str(e)}

    return metrics

def perform_time_series_decomposition(df, period=7):
    """
    Performs advanced time series decomposition and anomaly detection

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data
    period (int): Period for seasonal decomposition (7 for weekly, 30 for monthly)

    Returns:
    dict: Time series decomposition metrics
    """
    import pandas as pd
    import numpy as np
    import statsmodels.api as sm
    from scipy import stats
    from sklearn.ensemble import IsolationForest

    metrics = {}

    if 'transaction_date' not in df.columns or df.empty:
        return metrics

    # Create daily revenue series
    daily_revenue = df.set_index('transaction_date').resample('D')['net_revenue'].sum()

    # Fill missing dates with zero revenue
    date_range = pd.date_range(start=daily_revenue.index.min(), end=daily_revenue.index.max())
    daily_revenue = daily_revenue.reindex(date_range, fill_value=0)

    # Ensure we have enough data for decomposition
    if len(daily_revenue) < 2 * period:
        return metrics

    try:
        # STL Decomposition (Seasonal-Trend decomposition using LOESS)
        stl = sm.tsa.STL(daily_revenue, period=period, seasonal=7)
        result = stl.fit()

        # Extract components
        trend = result.trend
        seasonal = result.seasonal
        residual = result.resid

        # Calculate anomaly scores using residual component
        z_scores = np.abs(stats.zscore(residual.fillna(0)))
        anomaly_threshold = 2.5  # Z-score threshold for anomalies
        anomalies = daily_revenue[z_scores > anomaly_threshold]

        # Calculate seasonal indices
        seasonal_indices = {}
        for i in range(period):
            idx = (daily_revenue.index.dayofweek == i) if period == 7 else (daily_revenue.index.day == min(i+1, 28))
            seasonal_indices[str(i)] = float(seasonal[idx].mean())

        # Calculate trend slope
        x = np.arange(len(trend))
        slope, intercept, r_value, p_value, std_err = stats.linregress(x[~np.isnan(trend)], trend[~np.isnan(trend)])

        # Calculate seasonal strength
        seasonal_strength = 1 - np.var(residual) / np.var(trend + residual)

        # Calculate trend strength
        trend_strength = 1 - np.var(residual) / np.var(seasonal + residual)

        metrics['time_series_decomposition'] = {
            'trend': {
                'slope': float(slope),
                'intercept': float(intercept),
                'r_squared': float(r_value ** 2),
                'p_value': float(p_value),
                'std_err': float(std_err),
                'trend_strength': float(trend_strength)
            },
            'seasonal': {
                'seasonal_strength': float(seasonal_strength),
                'seasonal_indices': {k: float(v) for k, v in seasonal_indices.items()},
                'seasonal_amplitude': float(seasonal.max() - seasonal.min())
            },
            'anomalies': {
                'count': int(len(anomalies)),
                'dates': [str(date.date()) for date in anomalies.index],
                'values': [float(value) for value in anomalies.values],
                'anomaly_scores': [float(z_scores[i]) for i in range(len(z_scores)) if z_scores[i] > anomaly_threshold]
            },
            'residual_stats': {
                'mean': float(residual.mean()),
                'std': float(residual.std()),
                'skew': float(stats.skew(residual)),
                'kurtosis': float(stats.kurtosis(residual))
            }
        }

        # Additional anomaly detection using Isolation Forest
        # Prepare data for Isolation Forest
        df_features = pd.DataFrame({
            'revenue': daily_revenue.values,
            'day_of_week': daily_revenue.index.dayofweek,
            'day_of_month': daily_revenue.index.day,
            'is_weekend': (daily_revenue.index.dayofweek >= 5).astype(int)
        })

        # Train Isolation Forest
        iso_forest = IsolationForest(contamination=0.05, random_state=42)
        anomalies_iso = iso_forest.fit_predict(df_features)

        # Get anomaly scores
        anomaly_scores = iso_forest.decision_function(df_features)

        # Identify anomalies
        iso_anomalies = daily_revenue[anomalies_iso == -1]

        metrics['anomaly_detection'] = {
            'isolation_forest': {
                'anomaly_count': int(len(iso_anomalies)),
                'anomaly_dates': [str(date.date()) for date in iso_anomalies.index],
                'anomaly_values': [float(value) for value in iso_anomalies.values],
                'anomaly_scores': [float(score) for score in anomaly_scores[anomalies_iso == -1]]
            },
            'anomaly_diagnosis': {}
        }

        # Diagnose anomalies
        for i, date in enumerate(iso_anomalies.index):
            revenue = iso_anomalies.iloc[i]
            day_of_week = date.dayofweek
            expected_revenue = seasonal[seasonal.index.dayofweek == day_of_week].mean()

            if revenue > expected_revenue * 1.5:
                impact = "positive"
                reason = "Exceptionally high revenue day"
            else:
                impact = "negative"
                reason = "Significantly lower revenue than expected"

            # Check for special events (holidays, promotions, etc.)
            special_events = []
            if date.month == 12 and date.day >= 15:
                special_events.append("Holiday season")
            if date.isocalendar()[1] == 27:  # Mid-year
                special_events.append("Mid-year promotion")

            metrics['anomaly_detection']['anomaly_diagnosis'][str(date.date())] = {
                'revenue': float(revenue),
                'expected_revenue': float(expected_revenue),
                'deviation_pct': float((revenue - expected_revenue) / expected_revenue * 100),
                'impact': impact,
                'potential_reasons': [reason] + special_events
            }

    except Exception as e:
        metrics['time_series_decomposition'] = {'error': str(e)}

    return metrics

def analyze_sales_funnel_conversion(df, sales_funnel_data):
    """
    Performs advanced conversion analysis of the sales funnel

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data
    sales_funnel_data (pd.DataFrame): DataFrame with sales funnel status data

    Returns:
    dict: Sales funnel conversion metrics
    """
    import pandas as pd
    import numpy as np
    from sklearn.linear_model import LogisticRegression
    import statsmodels.api as sm

    metrics = {}

    # Process sales funnel data
    if not isinstance(sales_funnel_data, pd.DataFrame) or sales_funnel_data.empty:
        return metrics

    # Extract date columns (assuming first column is date)
    date_cols = sales_funnel_data.columns[1:]
    dates = [pd.to_datetime(col) for col in date_cols]

    # Calculate daily conversion rates between stages
    conversion_rates = {}

    # Define funnel stages in order
    funnel_stages = ['Prospect', 'Cliente Pass', 'Ativo', 'Bloqueado', 'Cancelado']

    # Calculate conversion rates between each pair of consecutive stages
    for i in range(len(funnel_stages) - 1):
        from_stage = funnel_stages[i]
        to_stage = funnel_stages[i+1]

        if from_stage in sales_funnel_data.columns and to_stage in sales_funnel_data.columns:
            # Calculate conversion rate for each date
            conversion_rate = []
            for col in date_cols:
                from_count = pd.to_numeric(sales_funnel_data.loc[sales_funnel_data['#'] == from_stage, col].values[0], errors='coerce')
                to_count = pd.to_numeric(sales_funnel_data.loc[sales_funnel_data['#'] == to_stage, col].values[0], errors='coerce')

                if from_count > 0:
                    rate = to_count / from_count
                    conversion_rate.append(rate)

            if conversion_rate:
                conversion_rates[f"{from_stage}_to_{to_stage}"] = {
                    'mean': float(np.mean(conversion_rate)),
                    'std': float(np.std(conversion_rate)),
                    'trend': float(np.polyfit(range(len(conversion_rate)), conversion_rate, 1)[0]),
                    'recent_7d_avg': float(np.mean(conversion_rate[-7:])) if len(conversion_rate) >= 7 else None
                }

    metrics['funnel_conversion_rates'] = conversion_rates

    # Calculate overall funnel conversion
    if 'Prospect' in sales_funnel_data.columns and 'Ativo' in sales_funnel_data.columns:
        prospect_to_active = []
        for col in date_cols:
            prospect_count = pd.to_numeric(sales_funnel_data.loc[sales_funnel_data['#'] == 'Prospect', col].values[0], errors='coerce')
            active_count = pd.to_numeric(sales_funnel_data.loc[sales_funnel_data['#'] == 'Ativo', col].values[0], errors='coerce')

            if prospect_count > 0:
                rate = active_count / prospect_count
                prospect_to_active.append(rate)

        if prospect_to_active:
            metrics['overall_funnel_conversion'] = {
                'prospect_to_active_mean': float(np.mean(prospect_to_active)),
                'prospect_to_active_std': float(np.std(prospect_to_active)),
                'prospect_to_active_trend': float(np.polyfit(range(len(prospect_to_active)), prospect_to_active, 1)[0]),
                'recent_7d_avg': float(np.mean(prospect_to_active[-7:])) if len(prospect_to_active) >= 7 else None
            }

    # Analyze trial class conversion
    trial_clients = df[df['is_trial'] == 1]['código'].unique()
    converted_clients = df[(df['código'].isin(trial_clients)) & (df['is_package'] == 1)]['código'].unique()

    metrics['trial_conversion'] = {
        'trial_clients_count': int(len(trial_clients)),
        'converted_clients_count': int(len(converted_clients)),
        'conversion_rate': float(len(converted_clients) / len(trial_clients)) if len(trial_clients) > 0 else 0.0,
        'revenue_per_trial': float(df[df['is_trial'] == 1]['net_revenue'].sum() / len(trial_clients)) if len(trial_clients) > 0 else 0.0
    }

    # Calculate time-to-conversion for trial clients
    if len(converted_clients) > 0:
        conversion_times = []
        for client in converted_clients:
            client_df = df[df['código'] == client]
            trial_date = client_df[client_df['is_trial'] == 1]['transaction_date'].min()
            package_date = client_df[client_df['is_package'] == 1]['transaction_date'].min()

            if trial_date and package_date and package_date > trial_date:
                days_to_conversion = (package_date - trial_date).days
                conversion_times.append(days_to_conversion)

        if conversion_times:
            metrics['trial_conversion']['avg_days_to_conversion'] = float(np.mean(conversion_times))
            metrics['trial_conversion']['median_days_to_conversion'] = float(np.median(conversion_times))
            metrics['trial_conversion']['conversion_by_day'] = {}

            # Calculate conversion rate by day after trial
            for day in range(1, 31):
                converted_by_day = 0
                for client in trial_clients:
                    client_df = df[df['código'] == client]
                    trial_date = client_df[client_df['is_trial'] == 1]['transaction_date'].min()

                    if trial_date:
                        # Check if converted within 'day' days
                        package_date = client_df[client_df['is_package'] == 1]['transaction_date'].min()
                        if package_date and (package_date - trial_date).days <= day:
                            converted_by_day += 1

                metrics['trial_conversion']['conversion_by_day'][str(day)] = float(converted_by_day / len(trial_clients)) if len(trial_clients) > 0 else 0.0

    # Build conversion prediction model
    try:
        # Create client features for conversion prediction
        client_features = []
        conversion_labels = []

        for client in trial_clients:
            client_df = df[df['código'] == client]
            trial_date = client_df[client_df['is_trial'] == 1]['transaction_date'].min()

            if trial_date:
                # Calculate features based on first 7 days after trial
                followup_period = trial_date + pd.Timedelta(days=7)
                client_activity = client_df[client_df['transaction_date'] <= followup_period]

                features = {
                    'days_after_trial': min(7, (pd.Timestamp.now() - trial_date).days),
                    'visit_count': len(client_activity),
                    'revenue_7d': client_activity['net_revenue'].sum(),
                    'package_purchased': int(client in converted_clients)
                }

                client_features.append(features)
                conversion_labels.append(features['package_purchased'])

        if client_features:
            features_df = pd.DataFrame(client_features)

            # Train logistic regression model
            X = features_df[['days_after_trial', 'visit_count', 'revenue_7d']]
            y = features_df['package_purchased']

            # Add constant for statsmodels
            X_sm = sm.add_constant(X)

            # Fit logistic regression
            model = sm.Logit(y, X_sm).fit(disp=0)

            # Get odds ratios and significance
            odds_ratios = np.exp(model.params)
            p_values = model.pvalues

            metrics['conversion_prediction_model'] = {
                'model_summary': {
                    'log_likelihood': float(model.llf),
                    'pseudo_r_squared': float(model.prsquared),
                    'aic': float(model.aic),
                    'bic': float(model.bic)
                },
                'coefficients': {
                    'intercept': {
                        'odds_ratio': float(odds_ratios['const']),
                        'p_value': float(p_values['const'])
                    },
                    'days_after_trial': {
                        'odds_ratio': float(odds_ratios['days_after_trial']),
                        'p_value': float(p_values['days_after_trial'])
                    },
                    'visit_count': {
                        'odds_ratio': float(odds_ratios['visit_count']),
                        'p_value': float(p_values['visit_count'])
                    },
                    'revenue_7d': {
                        'odds_ratio': float(odds_ratios['revenue_7d']),
                        'p_value': float(p_values['revenue_7d'])
                    }
                },
                'prediction_example': {
                    '1_visit_0_revenue': float(1 / (1 + np.exp(-(model.params['const'] +
                                                            model.params['visit_count'] * 1 +
                                                            model.params['revenue_7d'] * 0)))) * 100,
                    '2_visits_50_revenue': float(1 / (1 + np.exp(-(model.params['const'] +
                                                              model.params['visit_count'] * 2 +
                                                              model.params['revenue_7d'] * 50)))) * 100
                }
            }

    except Exception as e:
        metrics['conversion_prediction_model'] = {'error': str(e)}

    # Calculate funnel health metrics
    metrics['funnel_health'] = {}

    if 'overall_funnel_conversion' in metrics:
        # Calculate funnel health score (0-100)
        base_rate = 0.1  # Typical industry benchmark
        current_rate = metrics['overall_funnel_conversion']['prospect_to_active_mean']

        # Score based on how much better/worse than benchmark
        funnel_health = 50 + (current_rate - base_rate) / base_rate * 50
        funnel_health = max(0, min(100, funnel_health))

        metrics['funnel_health']['funnel_health_score'] = float(funnel_health)

        # Calculate bottleneck score for each stage
        bottleneck_scores = {}
        for conversion in conversion_rates:
            stage = conversion.split('_to_')[0]
            rate = conversion_rates[conversion]['mean']
            expected_rate = 0.8 if stage == 'Prospect' else 0.9 if stage == 'Cliente Pass' else 0.7

            bottleneck_score = (expected_rate - rate) / expected_rate * 100
            bottleneck_scores[stage] = float(max(0, bottleneck_score))

        metrics['funnel_health']['bottleneck_scores'] = bottleneck_scores
        metrics['funnel_health']['primary_bottleneck'] = max(bottleneck_scores, key=bottleneck_scores.get)

    return metrics

def analyze_staff_performance_optimization(df):
    """
    Analyzes staff performance with optimization recommendations

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data

    Returns:
    dict: Staff performance optimization metrics
    """
    import pandas as pd
    import numpy as np
    from sklearn.linear_model import LinearRegression
    from sklearn.metrics import r2_score

    metrics = {}

    if 'consultor' not in df.columns or df.empty:
        return metrics

    # Filter out default/placeholder consultants
    consultant_df = df[~df['consultor'].str.contains('CONSULTOR PADRÃO', case=False, na=False)]

    if consultant_df.empty:
        return metrics

    # Calculate key performance metrics by consultant
    consultant_metrics = consultant_df.groupby('consultor').agg({
        'net_revenue': 'sum',
        'código': 'nunique',
        'transaction_date': 'count',
        'is_trial': 'sum',
        'is_package': 'sum'
    }).reset_index()

    consultant_metrics.columns = ['consultor', 'total_revenue', 'client_count',
                                'transaction_count', 'trial_count', 'package_count']

    # Calculate derived metrics
    consultant_metrics['revenue_per_client'] = consultant_metrics['total_revenue'] / consultant_metrics['client_count']
    consultant_metrics['conversion_rate'] = consultant_metrics['package_count'] / consultant_metrics['trial_count'].replace(0, np.nan)
    consultant_metrics['revenue_per_transaction'] = consultant_metrics['total_revenue'] / consultant_metrics['transaction_count']

    # Calculate overall averages for benchmarking
    overall_avg_revenue_per_client = consultant_metrics['revenue_per_client'].mean()
    overall_avg_conversion_rate = consultant_metrics['conversion_rate'].mean()

    # Identify high-performing consultants
    high_performers = consultant_metrics[
        (consultant_metrics['revenue_per_client'] > overall_avg_revenue_per_client) &
        (consultant_metrics['conversion_rate'] > overall_avg_conversion_rate)
    ]

    # Calculate performance clusters
    X = consultant_metrics[['revenue_per_client', 'conversion_rate']].values

    # Scale features
    X_scaled = (X - X.mean(axis=0)) / X.std(axis=0)

    # Determine optimal number of clusters
    distortions = []
    K = range(1, 6)
    for k in K:
        km = LinearRegression()  # Using linear regression as a simple alternative to KMeans
        try:
            # Fit a linear model to approximate clustering
            km.fit(np.arange(len(X_scaled)).reshape(-1, 1), X_scaled)
            distortions.append(np.sum((X_scaled - km.predict(np.arange(len(X_scaled)).reshape(-1, 1)))**2))
        except:
            distortions.append(float('inf'))

    # Calculate performance quadrants
    consultant_metrics['performance_quadrant'] = consultant_metrics.apply(
        lambda x: 'High Revenue, High Conversion' if (x['revenue_per_client'] > overall_avg_revenue_per_client and
                                                   x['conversion_rate'] > overall_avg_conversion_rate) else
                'High Revenue, Low Conversion' if (x['revenue_per_client'] > overall_avg_revenue_per_client and
                                                 x['conversion_rate'] <= overall_avg_conversion_rate) else
                'Low Revenue, High Conversion' if (x['revenue_per_client'] <= overall_avg_revenue_per_client and
                                                 x['conversion_rate'] > overall_avg_conversion_rate) else
                'Low Revenue, Low Conversion', axis=1
    )

    # Calculate quadrant metrics
    quadrant_metrics = consultant_metrics.groupby('performance_quadrant').agg({
        'consultor': 'count',
        'revenue_per_client': 'mean',
        'conversion_rate': 'mean'
    }).to_dict('index')

    # Convert to float for JSON serialization
    for quadrant, data in quadrant_metrics.items():
        for metric, value in data.items():
            if metric != 'consultor':
                quadrant_metrics[quadrant][metric] = float(value)

    metrics['performance_quadrants'] = quadrant_metrics

    # Analyze time-based performance patterns
    df['hour'] = df['transaction_date'].dt.hour
    df['day_of_week'] = df['transaction_date'].dt.dayofweek

    hourly_performance = df.groupby(['consultor', 'hour']).agg({
        'net_revenue': 'sum',
        'código': 'nunique'
    }).reset_index()

    hourly_performance['revenue_per_client'] = hourly_performance['net_revenue'] / hourly_performance['código']

    # Find optimal hours for each consultant
    optimal_hours = {}
    for consultant in hourly_performance['consultor'].unique():
        if pd.isna(consultant):
            continue

        consultant_data = hourly_performance[hourly_performance['consultor'] == consultant]
        if not consultant_data.empty:
            best_hour = consultant_data.loc[consultant_data['revenue_per_client'].idxmax(), 'hour']
            optimal_hours[consultant] = int(best_hour)

    metrics['optimal_staffing_hours'] = optimal_hours

    # Calculate staff scheduling efficiency
    total_possible_hours = len(df['transaction_date'].dt.date.unique()) * 12 * len(consultant_df['consultor'].unique())
    active_hours = len(df.groupby([df['transaction_date'].dt.date, 'consultor']))

    metrics['staff_scheduling_efficiency'] = {
        'total_possible_hours': int(total_possible_hours),
        'active_hours': int(active_hours),
        'utilization_rate': float(active_hours / total_possible_hours * 100),
        'optimal_staff_count': float(active_hours / len(df['transaction_date'].dt.date.unique()) / 8)  # Assuming 8 productive hours per day
    }

    # Analyze cross-selling performance
    cross_sell_metrics = {}
    for consultant in consultant_df['consultor'].unique():
        if pd.isna(consultant):
            continue

        consultant_data = consultant_df[consultant_df['consultor'] == consultant]
        client_products = consultant_data.groupby('código')['product_category'].nunique()

        cross_sell_metrics[consultant] = {
            'avg_products_per_client': float(client_products.mean()),
            'cross_sell_rate': float((client_products > 1).mean() * 100)
        }

    metrics['cross_sell_metrics'] = cross_sell_metrics

    # Calculate revenue impact of optimizing staff scheduling
    current_revenue = df['net_revenue'].sum()
    potential_revenue_increase = 0

    # Estimate potential revenue from better scheduling
    if 'optimal_staff_count' in metrics['staff_scheduling_efficiency']:
        current_staff_count = len(consultant_df['consultor'].unique())
        optimal_staff = metrics['staff_scheduling_efficiency']['optimal_staff_count']

        # If we're understaffed
        if optimal_staff > current_staff_count:
            staff_gap = optimal_staff - current_staff_count
            # Estimate revenue per additional staff member
            revenue_per_staff = current_revenue / current_staff_count
            potential_revenue_increase = revenue_per_staff * staff_gap

    metrics['scheduling_optimization'] = {
        'potential_revenue_increase': float(potential_revenue_increase),
        'recommended_staff_change': float(optimal_staff - current_staff_count)
    }

    return metrics

def develop_financial_health_diagnostic_system(df, fixed_costs):
    """
    Develops a comprehensive financial health diagnostic system with root cause analysis

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data
    fixed_costs (float): Monthly fixed costs

    Returns:
    dict: Financial health diagnostic metrics
    """
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestClassifier
    import shap

    metrics = {}

    # Calculate base financial metrics
    financial_metrics = calculate_financial_metrics(df)
    contribution = calculate_contribution_margin(df, fixed_costs)
    break_even = calculate_break_even_analysis(df, fixed_costs)

    # Define financial health status
    revenue = financial_metrics['total_revenue']
    operating_income = revenue * (contribution['contribution_margin_ratio'] / 100) - fixed_costs
    profit_margin = (operating_income / revenue * 100) if revenue > 0 else -100

    if profit_margin > 20:
        financial_health = "Excellent"
        health_score = 90
    elif profit_margin > 10:
        financial_health = "Good"
        health_score = 75
    elif profit_margin > 0:
        financial_health = "Fair"
        health_score = 60
    elif profit_margin > -10:
        financial_health = "Poor"
        health_score = 40
    else:
        financial_health = "Critical"
        health_score = 20

    metrics['financial_health_status'] = {
        'health_score': float(health_score),
        'health_category': financial_health,
        'profit_margin': float(profit_margin),
        'operating_income': float(operating_income)
    }

    client_metrics = calculate_client_metrics(df)
    product_metrics = calculate_product_performance(df)
    # Create diagnostic features
    diagnostic_features = {
        'revenue_trend': financial_metrics.get('monthly_revenue_growth_rate', 0.0),
        'client_churn_rate': client_metrics['monthly_churn_rate'],
        'trial_conversion_rate': client_metrics.get('trial_conversion_rate', 0.0),
        'package_penetration': (product_metrics['product_category_metrics']
                               .get('Calisthenics Package', {}).get('revenue_percentage', 0.0)),
        'consultant_performance': np.mean(list(
            financial_metrics['consultant_metrics']['consultant_metrics'].values(),
            key=lambda x: x['revenue_per_client']
        )) if 'consultant_metrics' in financial_metrics else 0.0,
        'capacity_utilization': 0.0,  # Will be calculated below
        'break_even_margin': break_even['margin_of_safety'],
        'operating_leverage': contribution['operating_leverage'] if contribution['operating_leverage'] else 1.0
    }

    # Calculate capacity utilization if possible
    try:
        capacity_metrics = analyze_capacity_utilization(df)
        diagnostic_features['capacity_utilization'] = capacity_metrics['overall_utilization_rate']
    except:
        diagnostic_features['capacity_utilization'] = 50.0  # Default estimate

    # Create diagnostic dataset (simulated historical data for training)
    np.random.seed(42)

    # Generate simulated historical data for training
    n_samples = 100
    historical_data = pd.DataFrame({
        'revenue_trend': np.random.normal(0, 5, n_samples),
        'client_churn_rate': np.random.uniform(5, 25, n_samples),
        'trial_conversion_rate': np.random.uniform(10, 40, n_samples),
        'package_penetration': np.random.uniform(20, 60, n_samples),
        'consultant_performance': np.random.uniform(500, 2000, n_samples),
        'capacity_utilization': np.random.uniform(30, 90, n_samples),
        'break_even_margin': np.random.uniform(-50, 100, n_samples),
        'operating_leverage': np.random.uniform(1, 3, n_samples)
    })

    # Create health scores for historical data
    historical_health = (
        0.2 * historical_data['revenue_trend'] +
        -0.3 * historical_data['client_churn_rate'] +
        0.25 * historical_data['trial_conversion_rate'] +
        0.15 * historical_data['package_penetration'] +
        0.1 * historical_data['consultant_performance'] / 1000 +
        0.2 * historical_data['capacity_utilization'] / 10 +
        0.25 * historical_data['break_even_margin'] / 10 +
        -0.1 * historical_data['operating_leverage']
    )

    # Normalize to 0-100 scale
    historical_health = 50 + historical_health
    historical_health = np.clip(historical_health, 0, 100)

    # Create health categories
    historical_data['health_category'] = pd.cut(
        historical_health,
        bins=[-1, 40, 60, 80, 101],
        labels=['Critical', 'Poor', 'Fair', 'Good']
    )

    # Train diagnostic model
    try:
        from sklearn.ensemble import RandomForestClassifier
        model = RandomForestClassifier(n_estimators=100, random_state=42)

        # One-hot encode the target
        y = pd.Categorical(historical_data['health_category']).codes
        X = historical_data.drop('health_category', axis=1)

        model.fit(X, y)

        # Calculate feature importances
        feature_importances = dict(zip(X.columns, model.feature_importances_))

        # Predict current health
        current_features = pd.DataFrame([list(diagnostic_features.values())], columns=X.columns)
        health_prob = model.predict_proba(current_features)[0]
        predicted_category = model.predict(current_features)[0]

        # Calculate SHAP values for explanation
        import shap
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(current_features)

        # Get the SHAP values for the predicted class
        predicted_class = int(predicted_category)
        shap_values_for_class = shap_values[predicted_class][0] if isinstance(shap_values, list) else shap_values[0]

        # Create impact analysis
        feature_impact = {}
        for i, feature in enumerate(X.columns):
            impact = shap_values_for_class[i]
            feature_impact[feature] = {
                'impact': float(impact),
                'absolute_impact': float(abs(impact)),
                'contribution_to_health': float(impact / sum(abs(shap_values_for_class)) * 100) if sum(abs(shap_values_for_class)) > 0 else 0.0
            }

        # Sort features by absolute impact
        sorted_impact = sorted(feature_impact.items(), key=lambda x: x[1]['absolute_impact'], reverse=True)

        # Identify root causes
        root_causes = []
        for feature, impact_data in sorted_impact[:3]:  # Top 3 contributors
            value = diagnostic_features[feature]
            if impact_data['impact'] < 0:
                if feature == 'client_churn_rate':
                    root_causes.append(f"High client churn rate ({value:.1f}%) is negatively impacting financial health")
                elif feature == 'revenue_trend':
                    root_causes.append(f"Negative revenue trend ({value:.1f}% monthly change) is concerning")
                else:
                    root_causes.append(f"Suboptimal {feature.replace('_', ' ')} ({value:.1f}) is affecting performance")

        # Generate improvement recommendations
        recommendations = []

        # Churn-related recommendation
        if diagnostic_features['client_churn_rate'] > 15:
            churn_reduction_needed = diagnostic_features['client_churn_rate'] - 10
            client_impact = int(df['código'].nunique() * churn_reduction_needed / 100)
            revenue_impact = client_impact * (df['net_revenue'].sum() / df['código'].nunique())
            recommendations.append(
                f"Reduce churn rate by {churn_reduction_needed:.1f}% to retain approximately {client_impact} "
                f"clients, potentially increasing revenue by R$ {revenue_impact:,.2f} monthly"
            )

        # Trial conversion recommendation
        if diagnostic_features['trial_conversion_rate'] < 30:
            conversion_gap = 30 - diagnostic_features['trial_conversion_rate']
            trial_clients = df[df['is_trial'] == 1]['código'].nunique()
            potential_conversions = int(trial_clients * conversion_gap / 100)
            avg_package_value = df[df['is_package'] == 1]['net_revenue'].mean()
            revenue_impact = potential_conversions * avg_package_value
            recommendations.append(
                f"Increase trial conversion rate by {conversion_gap:.1f}% to convert approximately {potential_conversions} "
                f"more trial clients, potentially generating R$ {revenue_impact:,.2f} in additional revenue"
            )

        # Capacity utilization recommendation
        if diagnostic_features['capacity_utilization'] < 60:
            utilization_gap = 60 - diagnostic_features['capacity_utilization']
            potential_revenue = (utilization_gap / 100) * df['net_revenue'].sum()
            recommendations.append(
                f"Increase capacity utilization by {utilization_gap:.1f}% to potentially generate "
                f"an additional R$ {potential_revenue:,.2f} in revenue"
            )

        metrics['diagnostic_model'] = {
            'feature_importances': {k: float(v) for k, v in feature_importances.items()},
            'current_health_prediction': {
                'category': str(historical_data['health_category'].cat.categories[predicted_category]),
                'probabilities': {str(cat): float(prob) for cat, prob in zip(historical_data['health_category'].cat.categories, health_prob)}
            },
            'feature_impact_analysis': {k: {ik: float(iv) for ik, iv in v.items()} for k, v in feature_impact.items()},
            'root_causes': root_causes,
            'improvement_recommendations': recommendations,
            'critical_thresholds': {
                'churn_rate': 15.0,
                'trial_conversion': 30.0,
                'capacity_utilization': 60.0,
                'break_even_margin': 20.0
            }
        }

    except Exception as e:
        metrics['diagnostic_model'] = {'error': str(e)}

    return metrics

def execute_deep_financial_analysis(cash_flow_file, sales_funnel_file, fixed_costs=15000):
    """
    Executes the deep financial analysis pipeline with advanced statistical metrics

    Parameters:
    cash_flow_file (str): Path to the cash flow Excel file
    sales_funnel_file (str): Path to the sales funnel Excel file
    fixed_costs (float): Monthly fixed costs for the gym

    Returns:
    dict: Complete deep financial analysis report
    """
    import pandas as pd
    import time

    start_time = time.time()

    # Extract and process data
    cash_flow_df = extract_cash_flow_data(cash_flow_file)
    sales_funnel_df = pd.read_excel(sales_funnel_file)

    # Clean and transform
    cleaned_df = clean_cash_flow_data(cash_flow_df)
    engineered_df = engineer_features(cleaned_df)

    # Calculate advanced metrics
    survival_analysis = perform_client_survival_analysis(engineered_df)
    pricing_optimization = analyze_pricing_optimization(engineered_df)
    scenario_analysis = perform_financial_scenario_analysis(engineered_df, fixed_costs)
    churn_early_warning = develop_churn_early_warning_system(engineered_df)
    time_series_analysis = perform_time_series_decomposition(engineered_df)
    sales_funnel_conversion = analyze_sales_funnel_conversion(engineered_df, sales_funnel_df)
    staff_performance = analyze_staff_performance_optimization(engineered_df)
    financial_diagnostic = develop_financial_health_diagnostic_system(engineered_df, fixed_costs)

    # Create comprehensive report
    deep_analysis_report = {
        'metadata': {
            'processing_date': str(pd.Timestamp.now()),
            'cash_flow_records': len(engineered_df),
            'date_range': {
                'start': str(engineered_df['transaction_date'].min()),
                'end': str(engineered_df['transaction_date'].max())
            },
            'fixed_costs': float(fixed_costs),
            'analysis_duration_seconds': float(time.time() - start_time)
        },
        'advanced_client_analysis': {
            'survival_analysis': survival_analysis,
            'churn_early_warning': churn_early_warning
        },
        'advanced_financial_analysis': {
            'pricing_optimization': pricing_optimization,
            'scenario_analysis': scenario_analysis,
            'financial_diagnostic': financial_diagnostic
        },
        'operational_analysis': {
            'time_series_analysis': time_series_analysis,
            'sales_funnel_conversion': sales_funnel_conversion,
            'staff_performance': staff_performance
        },
        'executive_summary': {
            'key_findings': [],
            'critical_issues': [],
            'top_opportunities': []
        }
    }

    # Generate executive summary
    executive_summary = deep_analysis_report['executive_summary']

    # Add key findings
    if 'survival_analysis' in survival_analysis and 'median_survival_time' in survival_analysis['survival_analysis']:
        executive_summary['key_findings'].append(
            f"Median client lifespan is {survival_analysis['survival_analysis']['median_survival_time']:.1f} days"
        )

    if 'price_elasticity' in pricing_optimization:
        for category, data in pricing_optimization['price_elasticity'].items():
            if data['demand_type'] == 'elastic':
                executive_summary['key_findings'].append(
                    f"{category} pricing is elastic (elasticity: {data['elasticity']:.2f}), "
                    f"meaning price changes significantly impact demand"
                )

    # Add critical issues
    if 'churn_early_warning' in churn_early_warning and 'high_risk_clients' in churn_early_warning['churn_early_warning']:
        high_risk_count = churn_early_warning['churn_early_warning']['high_risk_clients']
        if high_risk_count > 0:
            executive_summary['critical_issues'].append(
                f"{high_risk_count} clients at high risk of churn, representing "
                f"R$ {churn_early_warning['churn_early_warning']['revenue_at_risk']:,.2f} in potential revenue loss"
            )

    if 'diagnostic_model' in financial_diagnostic and 'current_health_prediction' in financial_diagnostic['diagnostic_model']:
        if financial_diagnostic['diagnostic_model']['current_health_prediction']['category'] in ['Poor', 'Critical']:
            executive_summary['critical_issues'].append(
                f"Financial health is currently rated as {financial_diagnostic['diagnostic_model']['current_health_prediction']['category']}"
            )
        executive_summary['critical_issues'].extend(
            financial_diagnostic['diagnostic_model'].get('root_causes', [])
        )

    # Add top opportunities
    if 'pricing_optimization' in pricing_optimization and 'revenue_impact' in pricing_optimization:
        for category, data in pricing_optimization['revenue_impact'].items():
            if data.get('revenue_change_5pct_increase', 0) > 0:
                executive_summary['top_opportunities'].append(
                    f"Price adjustment for {category} could increase revenue by R$ {data['revenue_change_5pct_increase']:,.2f} "
                    f"({data['revenue_change_pct']:.1f}%)"
                )

    if 'diagnostic_model' in financial_diagnostic:
        executive_summary['top_opportunities'].extend(
            financial_diagnostic['diagnostic_model'].get('improvement_recommendations', [])[:2]
        )

    return deep_analysis_report

def calculate_statistical_diagnostic_metrics(df):
    """
    Calculates advanced statistical diagnostic metrics for business health

    Parameters:
    df (pd.DataFrame): DataFrame with transaction data

    Returns:
    dict: Statistical diagnostic metrics
    """
    import pandas as pd
    import numpy as np
    from scipy import stats
    import statsmodels.api as sm

    metrics = {}

    # Check for stationarity in revenue time series
    if 'transaction_date' in df.columns and not df.empty:
        daily_revenue = df.set_index('transaction_date').resample('D')['net_revenue'].sum().fillna(0)

        if len(daily_revenue) > 30:
            # Augmented Dickey-Fuller test for stationarity
            try:
                adf_result = sm.tsa.stattools.adfuller(daily_revenue.values)
                metrics['stationarity_test'] = {
                    'adf_statistic': float(adf_result[0]),
                    'p_value': float(adf_result[1]),
                    'is_stationary': bool(adf_result[1] < 0.05),
                    'critical_values': {k: float(v) for k, v in adf_result[4].items()}
                }
            except:
                metrics['stationarity_test'] = {'error': 'ADF test failed'}

            # Calculate autocorrelation
            acf = sm.tsa.acf(daily_revenue, nlags=30)
            pacf = sm.tsa.pacf(daily_revenue, nlags=30)

            metrics['autocorrelation'] = {
                'acf': [float(x) for x in acf],
                'pacf': [float(x) for x in pacf],
                'significant_lags': [i for i, x in enumerate(acf[1:], 1) if abs(x) > 1.96/np.sqrt(len(daily_revenue))]
            }

    # Calculate process capability for key metrics
    key_metrics = {
        'revenue': df.groupby(df['transaction_date'].dt.to_period('D'))['net_revenue'].sum(),
        'transactions': df.groupby(df['transaction_date'].dt.to_period('D')).size(),
        'new_clients': df.groupby(df['transaction_date'].dt.to_period('D'))['código'].nunique()
    }

    process_capability = {}

    for metric_name, values in key_metrics.items():
        if len(values) > 30:  # Need sufficient data
            mean = values.mean()
            std = values.std()

            # Define specification limits (based on business goals)
            usl = mean * 1.2  # Upper specification limit (20% above mean)
            lsl = mean * 0.8  # Lower specification limit (20% below mean)

            # Calculate process capability indices
            cp = (usl - lsl) / (6 * std) if std > 0 else float('inf')
            cpu = (usl - mean) / (3 * std) if std > 0 else float('inf')
            cpl = (mean - lsl) / (3 * std) if std > 0 else float('inf')
            cpk = min(cpu, cpl)

            process_capability[metric_name] = {
                'mean': float(mean),
                'std_dev': float(std),
                'usl': float(usl),
                'lsl': float(lsl),
                'cp': float(cp),
                'cpk': float(cpk),
                'process_capability': 'capable' if cpk > 1.33 else 'marginally_capable' if cpk > 1.0 else 'not_capable'
            }

    metrics['process_capability'] = process_capability

    # Calculate statistical process control metrics
    spc_metrics = {}

    for metric_name, values in key_metrics.items():
        if len(values) > 20:
            mean = values.mean()
            std = values.std()

            # Calculate control limits (3-sigma)
            ucl = mean + 3 * std
            lcl = max(0, mean - 3 * std)  # Can't have negative revenue

            # Identify points outside control limits
            outliers = values[(values > ucl) | (values < lcl)]

            spc_metrics[metric_name] = {
                'mean': float(mean),
                'std_dev': float(std),
                'ucl': float(ucl),
                'lcl': float(lcl),
                'outliers_count': int(len(outliers)),
                'out_of_control': bool(len(outliers) > 0)
            }

    metrics['spc_metrics'] = spc_metrics

    # Calculate statistical significance of changes
    if 'transaction_date' in df.columns and not df.empty:
        # Compare recent period to previous period
        recent_period = df[df['transaction_date'] >= (df['transaction_date'].max() - pd.Timedelta(days=30))]
        previous_period = df[(df['transaction_date'] < (df['transaction_date'].max() - pd.Timedelta(days=30))) &
                           (df['transaction_date'] >= (df['transaction_date'].max() - pd.Timedelta(days=60)))]

        if not recent_period.empty and not previous_period.empty:
            # Revenue comparison
            revenue_recent = recent_period['net_revenue'].sum()
            revenue_previous = previous_period['net_revenue'].sum()

            # T-test for revenue per transaction
            t_stat, p_value = stats.ttest_ind(
                recent_period['net_revenue'],
                previous_period['net_revenue'],
                nan_policy='omit'
            )

            metrics['period_comparison'] = {
                'revenue_recent': float(revenue_recent),
                'revenue_previous': float(revenue_previous),
                'revenue_change_pct': float((revenue_recent - revenue_previous) / revenue_previous * 100) if revenue_previous > 0 else 0.0,
                't_statistic': float(t_stat),
                'p_value': float(p_value),
                'statistically_significant': bool(p_value < 0.05)
            }

    return metrics

def execute_comprehensive_deep_analysis(cash_flow_file, sales_funnel_file, fixed_costs=15000):
    """
    Executes the comprehensive deep analysis with all advanced metrics

    Parameters:
    cash_flow_file (str): Path to the cash flow Excel file
    sales_funnel_file (str): Path to the sales funnel Excel file
    fixed_costs (float): Monthly fixed costs for the gym

    Returns:
    dict: Complete deep analysis report with all advanced metrics
    """
    import time

    start_time = time.time()

    # Execute deep financial analysis
    deep_analysis = execute_deep_financial_analysis(cash_flow_file, sales_funnel_file, fixed_costs)

    # Add statistical diagnostics
    cash_flow_df = extract_cash_flow_data(cash_flow_file)
    cleaned_df = clean_cash_flow_data(cash_flow_df)
    engineered_df = engineer_features(cleaned_df)

    deep_analysis['statistical_diagnostics'] = calculate_statistical_diagnostic_metrics(engineered_df)

    # Add execution metrics
    deep_analysis['execution_metrics'] = {
        'start_time': str(pd.Timestamp.now() - pd.Timedelta(seconds=time.time()-start_time)),
        'end_time': str(pd.Timestamp.now()),
        'processing_time_seconds': float(time.time() - start_time),
        'data_quality_score': deep_analysis['metadata'].get('data_quality_score', 0)
    }

    return deep_analysis
