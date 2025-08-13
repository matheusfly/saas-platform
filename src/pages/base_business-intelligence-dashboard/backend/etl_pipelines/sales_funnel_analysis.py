import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from io import StringIO

# ======================
# DATA LOADING FUNCTIONS
# ======================

def parse_markdown_table(md_table):
    """Parse markdown table into DataFrame"""
    lines = md_table.strip().split('\n')
    if len(lines) < 2:
        return pd.DataFrame()
    headers = [h.strip() for h in lines[0].split('|')[1:-1]]
    data = []
    for line in lines[2:]:
        if line.startswith('|'):
            row = [c.strip() for c in line.split('|')[1:-1]]
            if len(row) == len(headers):
                data.append(row)
    return pd.DataFrame(data, columns=headers)

def load_excel_from_markdown(content):
    """Load all sheets from markdown content"""
    sheets = {}
    current_sheet = None
    table_content = []

    for line in content.split('\n'):
        if line.startswith('> metadata.sheet_name:'):
            if current_sheet and table_content:
                sheets[current_sheet] = parse_markdown_table('\n'.join(table_content))
            table_content = []
            current_sheet = line.split(': ')[1].strip()
        elif line.startswith('|'):
            table_content.append(line)

    if current_sheet and table_content:
        sheets[current_sheet] = parse_markdown_table('\n'.join(table_content))

    return sheets

# =====================
# DATA PROCESSING UTILS
# =====================

def clean_daily_data(df):
    """Clean and process daily status data"""
    if df.empty or '#' not in df.columns: return pd.DataFrame()
    df['Date'] = pd.to_datetime(df['#'], errors='coerce')

    numeric_cols = df.columns.drop('Date')
    for col in numeric_cols:
        if col != '#':
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)

    df_cleaned = df.dropna(subset=['Date'])
    return df_cleaned.set_index('Date').drop(columns=['#'])

def clean_email_data(df):
    """Clean and process email validation data"""
    if df.empty or 'E-mail Validado' not in df.columns: return pd.DataFrame()
    df['E-mail Validado'] = df['E-mail Validado'].map({'True': True, 'False': False, 'true': True, 'false': False}).fillna(False)
    return df

# =====================
# ANALYSIS FUNCTIONS
# =====================

def analyze_daily_trends(df):
    """Generate statistics and trends from daily data"""
    if df.empty: return pd.DataFrame(), pd.DataFrame()
    numeric_df = df.select_dtypes(include=np.number)
    stats = numeric_df.describe().loc[['min', 'max', 'mean']].T
    stats['last_value'] = numeric_df.iloc[-1] if not numeric_df.empty else 0
    trends = numeric_df.rolling('7D').mean()
    return stats, trends

def analyze_email_validation(df):
    """Analyze email validation rates by status"""
    if df.empty or 'Status' not in df.columns: return pd.DataFrame(), 0
    status_counts = df['Status'].value_counts()
    validated_counts = df.groupby('Status')['E-mail Validado'].sum()
    result = pd.DataFrame({'count': status_counts, 'validated': validated_counts}).fillna(0)
    result['validation_rate'] = (result['validated'] / result['count']).fillna(0)
    overall_rate = df['E-mail Validado'].mean() if not df.empty else 0
    return result, overall_rate

def compare_status_counts(daily_df, email_df, date):
    """Compare status counts between daily and email data"""
    if daily_df.empty or email_df.empty: return {}
    daily_counts = daily_df.loc[date].to_dict() if date in daily_df.index else {}
    email_counts = email_df['Status'].value_counts().to_dict()
    comparison = {}
    for status in set(list(daily_counts.keys()) + list(email_counts.keys())):
        daily_val = daily_counts.get(status, 0)
        email_val = email_counts.get(status, 0)
        comparison[status] = {'daily': daily_val, 'email': email_val, 'difference': email_val - daily_val}
    return comparison

# =====================
# REPORTING FUNCTIONS
# =====================

def generate_daily_report(stats, trends):
    """Generate formatted daily report"""
    if stats.empty or trends.empty: return "No daily data to report."
    report = "📅 DAILY STATUS REPORT\n=====================\n"
    report += f"Period: {trends.index.min().date()} to {trends.index.max().date()}\n"
    report += f"Days analyzed: {len(trends)}\n\nKey Metrics:\n"
    report += "| Status                 | Avg  | Min | Max | Last Value |\n"
    report += "|------------------------|------|-----|-----|------------|\n"
    for status, row in stats.iterrows():
        report += f"| {status:<22} | {row.get('mean', 0):.1f} | {row.get('min', 0)} | {row.get('max', 0)} | {row.get('last_value', 0)} |\n"
    return report

def generate_validation_report(validation_df, overall_rate, sheet_name):
    """Generate email validation report"""
    if validation_df.empty: return f"No email validation data to report for {sheet_name}."
    report = f"📧 EMAIL VALIDATION REPORT ({sheet_name})\n================================\n"
    report += f"Total Records: {validation_df['count'].sum()}\n"
    report += f"Overall Validation Rate: {overall_rate:.1%}\n\nBy Status:\n"
    report += "| Status           | Count | Validated | Rate  |\n"
    report += "|------------------|-------|-----------|-------|\n"
    for status, row in validation_df.iterrows():
        report += f"| {status:<16} | {row.get('count', 0)} | {row.get('validated', 0)} | {row.get('validation_rate', 0):.1%} |\n"
    return report

# =====================
# VISUALIZATION FUNCTIONS
# =====================

def plot_daily_trends(df, columns=None):
    """Plot daily trends with annotations"""
    if df.empty: return None
    plt.figure(figsize=(14, 8))
    columns = columns if columns else df.columns
    for col in columns:
        if col in df.columns:
            plt.plot(df.index, df[col], label=col)
    plt.title('Daily Status Trends', fontsize=16)
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Count', fontsize=12)
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.tight_layout()
    return plt

def plot_validation_rates(validation_df):
    """Plot email validation rates by status"""
    if validation_df.empty: return None
    plt.figure(figsize=(10, 6))
    ax = sns.barplot(x=validation_df.index, y=validation_df['validation_rate'], palette='viridis')
    plt.title('Email Validation Rates by Status', fontsize=16)
    plt.xlabel('Status', fontsize=12)
    plt.ylabel('Validation Rate', fontsize=12)
    plt.ylim(0, 1)
    for p in ax.patches:
        ax.annotate(f'{p.get_height():.1%}', (p.get_x() + p.get_width() / 2., p.get_height()),
                   ha='center', va='center', xytext=(0, 10), textcoords='offset points')
    plt.xticks(rotation=45)
    plt.tight_layout()
    return plt

# =====================
# MAIN EXECUTION
# =====================

def main(content):
    """Main function to run the sales funnel analysis."""
    data = load_excel_from_markdown(content)

    # Process and analyze daily data
    cleaned_daily_df = clean_daily_data(data.get('ativos_dia_2508021127', pd.DataFrame()))
    daily_stats, daily_trends = analyze_daily_trends(cleaned_daily_df)

    # Process and analyze email data
    email_data1 = clean_email_data(data.get('email_check_2507290033', pd.DataFrame()))
    email_data2 = clean_email_data(data.get('email_check_2508021059', pd.DataFrame()))

    email_stats1, overall_rate1 = analyze_email_validation(email_data1)
    email_stats2, overall_rate2 = analyze_email_validation(email_data2)

    # Compare status counts using the cleaned dataframe
    last_date = cleaned_daily_df.index[-1] if not cleaned_daily_df.empty else None
    status_comparison = compare_status_counts(cleaned_daily_df, email_data2, last_date) if last_date else {}

    reports = [
        generate_daily_report(daily_stats, daily_trends),
        generate_validation_report(email_stats1, overall_rate1, 'email_check_2507290033'),
        generate_validation_report(email_stats2, overall_rate2, 'email_check_2508021059')
    ]

    plot1 = plot_daily_trends(daily_trends, ['Ativo', 'Cancelado', 'Prospect'])
    plot2 = plot_validation_rates(email_stats2)

    return {
        'reports': reports,
        'visualizations': [p for p in [plot1, plot2] if p],
        'comparison': status_comparison
    }

if __name__ == "__main__":
    try:
        with open('funil_vendas.md', 'r', encoding='utf-8') as f:
            content = f.read()

        results = main(content)

        for report in results['reports']:
            print(report)
            print("\n" + "="*80 + "\n")

        print("\nSTATUS COMPARISON (Last Day vs Email Data):")
        if results['comparison']:
            print("| Status           | Daily Count | Email Count | Difference |")
            print("|------------------|-------------|-------------|------------|")
            for status, data in results['comparison'].items():
                print(f"| {status:<16} | {data.get('daily', 0):>11} | {data.get('email', 0):>11} | {data.get('difference', 0):>10} |")
        else:
            print("No comparison data available.")

        # In a real environment, you might save plots instead of showing them
        if results['visualizations']:
            print(f"\nGenerated {len(results['visualizations'])} plot(s).")
            # for i, plot in enumerate(results['visualizations']):
            #     plot.savefig(f'plot_{i+1}.png')
            #     plot.show()

    except FileNotFoundError:
        print("Error: 'funil_vendas.md' not found. Please create this file with the required markdown tables.")
    except Exception as e:
        print(f"An error occurred: {e}")
