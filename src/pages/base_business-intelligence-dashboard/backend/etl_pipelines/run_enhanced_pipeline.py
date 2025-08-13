from enhanced_etl_pipeline import executar_pipeline_completo_especifico
import pandas as pd

if __name__ == "__main__":
    # Em produção, você carregaria os dados assim:
    df_clientes = pd.read_excel('clientes.xlsx')
    df_fluxo = pd.read_excel('fluxo_caixa.xlsx')

    # Executa o pipeline
    gym_analysis = executar_pipeline_completo_especifico(df_clientes, df_fluxo)

    # Exibe resultados
    print("\n=== KPIs ESTRATÉGICOS ===")
    print(f"Taxa de Ativação: {gym_analysis['kpis']['taxa_ativacao']:.2f}%")
    print(f"Churn Rate: {gym_analysis['kpis']['churn_rate']:.2f}%")
    print(f"Frequência Média: {gym_analysis['kpis']['frequencia_media']:.2f}x/semana")
    print(f"LTV Médio: R$ {gym_analysis['kpis']['ltv_medio']:,.2f}")
    print(f"Oportunidades de Upsell: {gym_analysis['kpis']['clientes_upsell']}")

    print("\n=== OKRs EM DESTAQUE ===")
    for nome, okr in gym_analysis['okrs'].items():
        status = "✅" if okr['status'] == 'Atingido' else "🔄"
        print(f"{status} {okr['titulo']}")
        print(f"   Meta: {okr['meta']} | Realizado: {okr['realizado']:.2f}")

    print("\n=== ALERTAS OPERACIONAIS ===")
    if gym_analysis['dashboard_data']['resumo_executivo']['alertas']['clientes_alto_risco'] > 0:
        print(f"⚠️ {gym_analysis['dashboard_data']['resumo_executivo']['alertas']['clientes_alto_risco']} clientes em alto risco de churn")

    if gym_analysis['dashboard_data']['resumo_executivo']['alertas']['ponto_critico'] == '1-3m':
        print("⚠️ Ponto crítico de churn identificado nos primeiros 3 meses")

    print("\n=== PRINCIPAIS OPORTUNIDADES DE UPSell ===")
    upsell = gym_analysis['get_oportunidades_upsell']()
    if not upsell.empty:
        for i, (_, row) in enumerate(upsell.head(3).iterrows(), 1):
            print(f"{i}. {row['cliente']} (Frequência: {row['frequencia_semanal']:.2f}x/semana)")
            print(f"   - Sugestão: {row['produto_sugerido']}")
            print(f"   - Potencial: R$ {row['potencial_upsell']:,.2f}")
    else:
        print("Nenhuma oportunidade de upsell identificada")

    print("\n=== PADRÕES DE CHURN IDENTIFICADOS ===")
    for padrao in gym_analysis['dashboard_data']['padroes_churn']['padroes']:
        print(f"- {padrao['padrao']}: {padrao['total_clientes']} clientes ({padrao['percentual']:.1f}%)")
        print(f"  Tempo médio até churn: {padrao['tempo_medio']:.1f} dias")

    print("\n=== RECOMENDAÇÕES ESTRATÉGICAS ===")
    for i, rec in enumerate(gym_analysis['dashboard_data']['padroes_churn']['recomendacoes'], 1):
        print(f"{i}. {rec}")
