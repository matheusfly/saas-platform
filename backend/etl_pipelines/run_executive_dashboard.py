import pandas as pd
from business_health_analysis import executive_dashboard

def main():
    """
    Main function to run the executive dashboard and save the results.
    """
    # Create a dummy DataFrame for demonstration purposes
    # In a real scenario, this would be your actual data
    data = {
        'ID_Cliente': range(100),
        'Valor_Mensal': [100] * 100,
        'Data_Inicio_Contrato': pd.to_datetime(['2022-01-01'] * 100),
        'Data_Fim_Contrato': [pd.NaT] * 100,
        'Tipo_Contrato': ['Mensal'] * 100,
        'Status_Cliente': ['Ativo'] * 100,
        'Origem_Cliente': ['Marketing Digital'] * 100,
        'Feedback_Cliente': [None] * 100,
        'Frequencia_Uso': [10] * 100,
        'Tempo_Desde_Ultima_Visita': [5] * 100,
        'Gasto_Adicional': [20] * 100,
        'Churn_Historico': [0] * 100,
        'Idade': [30] * 100,
        'Regiao': ['A'] * 100,
        'Codigo': ['C001'] * 100,
        'Cliente': ['Client ' + str(i) for i in range(100)],
        'Contatos': [3] * 100
    }
    df = pd.DataFrame(data)

    # Execute the dashboard function
    kpis, alerts, recommendations, report = executive_dashboard(df)

    # Print and save the results
    print("KPIs:", kpis)
    print("Alerts:", alerts)
    print("Recommendations:", recommendations)
    print("Executive Report:", report)

    # Save to files
    kpis.to_csv('executive_kpis.csv', index=False)
    with open('executive_alerts.txt', 'w') as f:
        for alert in alerts:
            f.write(f"{alert}\n")
    with open('executive_recommendations.txt', 'w') as f:
        for recommendation in recommendations:
            f.write(f"{recommendation}\n")
    with open('executive_report.txt', 'w') as f:
        f.write(report)

if __name__ == '__main__':
    main()
