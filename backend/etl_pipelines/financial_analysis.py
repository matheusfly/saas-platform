import pandas as pd
import numpy as np
import re
from io import StringIO
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter

# Custom formatter for currency
def brl_formatter(x, pos):
    return f'R$ {x:,.2f}'.replace(',', 'temp').replace('.', ',').replace('temp', '.')

# 1. Data Loading & Parsing Functions
def parse_markdown_tables(content):
    sheets = {}
    current_sheet = None
    table_lines = []

    for line in content.split('\n'):
        sheet_match = re.match(r'> metadata\.sheet_name: (.+)', line)
        if sheet_match:
            if current_sheet and table_lines:
                # Use StringIO to handle potential empty tables
                table_str = '\n'.join(table_lines)
                if table_str.strip():
                    sheets[current_sheet] = table_str
            current_sheet = sheet_match.group(1).strip()
            table_lines = []
        elif line.startswith('|') and current_sheet:
            table_lines.append(line)

    if current_sheet and table_lines:
        table_str = '\n'.join(table_lines)
        if table_str.strip():
            sheets[current_sheet] = table_str

    return sheets

def convert_to_dataframe(md_table):
    if not md_table:
        return pd.DataFrame()

    lines = md_table.strip().split('\n')
    header = [h.strip() for h in lines[0].split('|') if h.strip()]

    data = []
    for line in lines[2:]: # Skip header and separator
        if line.strip():
            data.append([d.strip() for d in line.split('|')[1:-1]])

    df = pd.DataFrame(data, columns=header)
    return df

def preprocess_financial_data(df):
    if df.empty: return df
    # Convert date columns
    date_cols = [col for col in df.columns if 'Data' in col or 'Vencimento' in col]
    for col in date_cols:
        df[col] = pd.to_datetime(df[col], format='%d/%m/%Y', errors='coerce')

    # Convert numeric columns (handling Brazilian format)
    for col in df.select_dtypes(include='object').columns:
        if df[col].str.contains(r'(\d\.\d{3})|(\d+,\d{2})', na=False).any():
            df[col] = (
                df[col]
                .str.replace('.', '', regex=False)
                .str.replace(',', '.', regex=False)
                .pipe(pd.to_numeric, errors='coerce')
            )

    # Convert boolean columns
    bool_cols = [col for col in df.columns if col.startswith('Recorrência') or 'ativo' in col.lower()]
    for col in bool_cols:
        if col in df.columns:
            df[col] = df[col].replace({'SIM': True, 'NÃO': False, 'true':True, 'false':False}).astype(bool)

    return df

# 2. Analysis Functions
def calculate_financial_trends(df):
    if df.empty or 'Data' not in df.columns: return pd.DataFrame()
    df = df.copy()
    df['Mês'] = df['Data'].dt.to_period('M')

    monthly = df.groupby('Mês').agg(
        Receita_Total=('Receita', 'sum'),
        Despesa_Total=('Despesa', 'sum'),
        Ticket_Médio=('Receita', 'mean'),
        Transações=('Data', 'count')
    ).reset_index()

    monthly['Crescimento_Receita'] = monthly['Receita_Total'].pct_change() * 100
    monthly['Lucro'] = monthly['Receita_Total'] - monthly['Despesa_Total']
    monthly['Margem_Lucro'] = (monthly['Lucro'] / monthly['Receita_Total']).replace([np.inf, -np.inf], 0) * 100

    return monthly.fillna(0)

def analyze_payment_methods(df):
    payment_cols = ['Dinheiro', 'Cartão de Débito', 'Cartão de Crédito',
                   'Cartão de Crédito Online', 'Pix Integrado', 'Pix Manual']
    payment_cols_exist = [col for col in payment_cols if col in df.columns]
    if not payment_cols_exist: return pd.Series(dtype='float64'), pd.DataFrame()

    total_sum = df[payment_cols_exist].sum().sum()
    payment_share = df[payment_cols_exist].sum() / total_sum * 100 if total_sum > 0 else pd.Series(dtype='float64')
    payment_trend = df.groupby(df['Data'].dt.to_period('M'))[payment_cols_exist].sum()

    return payment_share, payment_trend

def calculate_customer_metrics(customers_df, contracts_df):
    if customers_df.empty or contracts_df.empty: return pd.Series(dtype='float64'), pd.Series(dtype='float64'), 0

    status_dist = customers_df['Status Cliente'].value_counts(normalize=True) * 100
    contract_status = contracts_df['Status Contrato'].value_counts(normalize=True) * 100

    prospects = contracts_df[contracts_df['Status Cliente'] == 'Prospect'].shape[0]
    converted = contracts_df[
        (contracts_df['Status Cliente'] == 'Ativo') &
        (contracts_df['Status Contrato'].isin(['Ativo', 'Finalizado']))
    ].shape[0]

    conversion_rate = (converted / prospects) * 100 if prospects > 0 else 0

    return status_dist, contract_status, conversion_rate

# 3. Visualization Functions
def plot_financial_trends(monthly_df):
    if monthly_df.empty: return None
    fig, ax = plt.subplots(2, 2, figsize=(15, 12))

    ax[0, 0].plot(monthly_df['Mês'].astype(str), monthly_df['Receita_Total'], marker='o', label='Receita')
    ax[0, 0].plot(monthly_df['Mês'].astype(str), monthly_df['Lucro'], marker='o', label='Lucro')
    ax[0, 0].set_title('Receita e Lucro Mensal')
    ax[0, 0].yaxis.set_major_formatter(FuncFormatter(brl_formatter))
    ax[0, 0].legend()

    ax[0, 1].bar(monthly_df['Mês'].astype(str), monthly_df['Transações'], color='skyblue')
    ax[0, 1].set_title('Total de Transações Mensais')

    ax[1, 0].plot(monthly_df['Mês'].astype(str), monthly_df['Margem_Lucro'], marker='o', color='green')
    ax[1, 0].axhline(y=0, color='r', linestyle='--')
    ax[1, 0].set_title('Margem de Lucro (%)')
    ax[1, 0].set_ylabel('%')

    ax[1, 1].plot(monthly_df['Mês'].astype(str), monthly_df['Crescimento_Receita'], marker='o', color='purple')
    ax[1, 1].set_title('Crescimento da Receita (%)')
    ax[1, 1].set_ylabel('%')

    plt.tight_layout()
    return fig

def plot_payment_methods(payment_share, payment_trend):
    if payment_share.empty: return None
    fig, ax = plt.subplots(1, 2, figsize=(15, 6))

    ax[0].pie(payment_share, labels=payment_share.index, autopct='%1.1f%%', startangle=90)
    ax[0].set_title('Distribuição de Métodos de Pagamento')

    for method in payment_trend.columns:
        ax[1].plot(payment_trend.index.astype(str), payment_trend[method], marker='o', label=method)
    ax[1].set_title('Evolução dos Métodos de Pagamento')
    ax[1].yaxis.set_major_formatter(FuncFormatter(brl_formatter))
    ax[1].legend()

    plt.tight_layout()
    return fig

# 4. Reporting Functions
def generate_financial_report(monthly_df):
    if monthly_df.empty: return "Nenhum dado financeiro para relatar."
    report = "Relatório Financeiro Completo\n" + "="*40 + "\n"
    latest = monthly_df.iloc[-1]
    report += f"Último Mês Analisado: {latest['Mês']}\n"
    report += f"Receita Total: {brl_formatter(latest['Receita_Total'], None)}\n"
    report += f"Lucro Líquido: {brl_formatter(latest['Lucro'], None)}\n"
    report += f"Margem de Lucro: {latest['Margem_Lucro']:.1f}%\n"
    report += f"Crescimento da Receita: {latest['Crescimento_Receita']:.1f}%\n"
    report += f"Transações Realizadas: {int(latest['Transações'])}\n\n"
    report += "Tendências Mensais:\n"
    report += monthly_df.to_string(index=False)
    return report

def generate_customer_report(status_dist, contract_status, conversion_rate):
    report = "Análise de Clientes e Contratos\n" + "="*40 + "\n"
    if not status_dist.empty:
        report += "Distribuição de Status de Clientes:\n"
        for status, percent in status_dist.items():
            report += f"- {status}: {percent:.1f}%\n"
    if not contract_status.empty:
        report += "\nStatus de Contratos:\n"
        for status, percent in contract_status.items():
            report += f"- {status}: {percent:.1f}%\n"
    report += f"\nTaxa de Conversão de Prospects: {conversion_rate:.1f}%\n"
    return report

# Main Execution Pipeline
def run_full_analysis(file_content):
    sheets = parse_markdown_tables(file_content)

    financial_df = preprocess_financial_data(convert_to_dataframe(sheets.get('caixa_sintetico_2508021139')))
    customers_df = preprocess_financial_data(convert_to_dataframe(sheets.get('cartoes_cliente_2508021142')))
    contracts_df = preprocess_financial_data(convert_to_dataframe(sheets.get('convenio_2508021130')))

    monthly_finance = calculate_financial_trends(financial_df)
    payment_share, payment_trend = analyze_payment_methods(financial_df)
    status_dist, contract_status, conversion_rate = calculate_customer_metrics(customers_df, contracts_df)

    finance_report = generate_financial_report(monthly_finance)
    customer_report = generate_customer_report(status_dist, contract_status, conversion_rate)

    finance_fig = plot_financial_trends(monthly_finance)
    payment_fig = plot_payment_methods(payment_share, payment_trend)

    return {
        'reports': {'finance': finance_report, 'customer': customer_report},
        'figures': {'finance_trends': finance_fig, 'payment_methods': payment_fig},
        'data': {
            'monthly_finance': monthly_finance,
            'payment_analysis': (payment_share, payment_trend),
            'customer_metrics': (status_dist, contract_status, conversion_rate)
        }
    }

if __name__ == "__main__":
    try:
        with open('fluxo_caixa.xlsx.md', 'r', encoding='utf-8') as f:
            content = f.read()
        results = run_full_analysis(content)
        print(results['reports']['finance'])
        print("\n" + "="*80 + "\n")
        print(results['reports']['customer'])
        # Do not show plots as per instructions
        if results['figures']['finance_trends']:
            print("Finance trends plot generated.")
        if results['figures']['payment_methods']:
            print("Payment methods plot generated.")
        #     results['figures']['finance_trends'].show()
        #     results['figures']['payment_methods'].show()
        print("\nAnalysis complete. Plotting is disabled.")
    except FileNotFoundError:
        print("Error: 'fluxo_caixa.xlsx.md' not found.")
    except Exception as e:
        print(f"An error occurred: {e}")
