import pandas as pd
import re
from io import StringIO
from business_health_analysis import (
    business_health_dashboard,
    client_status_distribution,
    new_client_trend,
    revenue_analysis,
    contract_value_distribution,
    contract_type_analysis,
    contract_renewal_analysis,
    consultant_performance,
    modality_analysis,
    churn_analysis,
    lifetime_value_analysis,
    seasonal_trend_analysis,
    growth_rate_analysis
)
import json

def parse_markdown_tables(content):
    sheets = {}
    current_sheet = None
    table_lines = []

    for line in content.split('\n'):
        sheet_match = re.match(r'> metadata\.sheet_name: (.+)', line)
        if sheet_match:
            if current_sheet and table_lines:
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

def main():
    """
    Main function to run the business health analysis.
    """
    try:
        with open('fluxo_caixa.xlsx.md', 'r', encoding='utf-8') as f:
            content = f.read()

        sheets = parse_markdown_tables(content)

        # We will use the 'convenio' sheet as the main dataframe for this analysis
        df = convert_to_dataframe(sheets.get('convenio_2508021130'))

        if df.empty:
            print("Could not load the main data sheet ('convenio_2508021130'). Aborting analysis.")
            return

        # Run the main dashboard function
        dashboard_results = business_health_dashboard(df)

        # Print the results in a readable format
        print("--- Business Health Dashboard ---")
        print(json.dumps(dashboard_results, indent=4, ensure_ascii=False))

    except FileNotFoundError:
        print("Error: 'fluxo_caixa.xlsx.md' not found.")
    except Exception as e:
        print(f"An error occurred during analysis: {e}")

if __name__ == "__main__":
    main()
