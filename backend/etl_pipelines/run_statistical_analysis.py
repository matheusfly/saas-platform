import pandas as pd
from statistical_analysis import executar_analise_estatistica_completa

if __name__ == "__main__":
    print("=== ANÁLISE ESTATÍSTICA AVANÇADA PARA ACADEMIA ===")

    # Para demonstração, usaremos os dados do knowledge base (simplificado)
    df_clientes = pd.DataFrame({
        'Código': [448, 715, 442, 465, 469, 125, 620, 758, 836],
        'Cliente': ['KLEBER KLINGER DE OLIVEIRA MEDEIROS', 'Kleber William', 'LAILA LIMA', 'LAIRANNE VALVERDE', 'LAIRANNE VALVERDE', 'LAIS ANDRADE CORREARD', 'LAÍSE MATIAS DE MELO', 'LARA RODRIGUES SANTOS DE NOVAIS', 'Larissa Borges'],
        'Cliente desde': ['13/03/2025', '27/06/2025', '21/03/2025', '20/03/2025', '21/03/2025', '28/11/2024', '21/05/2025', '10/07/2025', '26/07/2025'],
        'Status atual': ['Cancelado', 'Ativo', 'Bloqueado', 'Cancelado', 'Cancelado', 'Cancelado', 'Cancelado', 'Ativo', 'Ativo'],
        'Continuidade (meses)': [1, 2, 3, 1, 1, 2, 1, 1, 1],
        'Contratos': [13, 1, 37, 1, 1, 2, 1, 2, 1]
    })

    df_fluxo = pd.DataFrame({
        'Código': [382, 382, 382, 784, 784, 411, 411, 411, 411],
        'Nome': ['ARTHUR IGOR CRUZ LIMA', 'ARTHUR IGOR CRUZ LIMA', 'ARTHUR IGOR CRUZ LIMA', 'Erica Melo Marques', 'Erica Melo Marques', 'JULIO CESAR VAZ', 'JULIO CESAR VAZ', 'JULIO CESAR VAZ', 'JULIO CESAR VAZ'],
        'Status Cliente': ['Bloqueado', 'Bloqueado', 'Bloqueado', 'Bloqueado', 'Bloqueado', 'Bloqueado', 'Bloqueado', 'Bloqueado', 'Bloqueado'],
        'Contrato': ['GYMPASS - PASSE PADRÃO', 'GYMPASS - PASSE PADRÃO', 'GYMPASS - PASSE PADRÃO', 'GYMPASS - PASSE PADRÃO', 'GYMPASS - PASSE PADRÃO', 'GYMPASS - PASSE PADRÃO', 'GYMPASS - PASSE PADRÃO', 'GYMPASS - PASSE PADRÃO', 'GYMPASS - PASSE PADRÃO'],
        'Status Contrato': ['Finalizado', 'Finalizado', 'Finalizado', 'Finalizado', 'Finalizado', 'Finalizado', 'Finalizado', 'Finalizado', 'Finalizado'],
        'Convênio': ['-', '-', '-', '-', '-', '-', '-', '-', '-'],
        'Desconto': ['-', '-', '-', '-', '-', '-', '-', '-', '-'],
        'Valor Contrato': ['000', '000', '000', '000', '000', '000', '000', '000', '000'],
        'Descontos': ['000', '000', '000', '000', '000', '000', '000', '000', '000'],
        'Valor Final': ['000', '000', '000', '000', '000', '000', '000', '000', '000'],
        'Vencimento': ['23/04/2025', '24/04/2025', '25/04/2025', '16/07/2025', '18/07/2025', '21/03/2025', '24/03/2025', '26/03/2025', '27/03/2025']
    })

    # Executa a análise estatística completa
    statistical_analysis = executar_analise_estatistica_completa(df_clientes, df_fluxo)

    # Exibe resultados estatísticos
    print("\n=== ANÁLISE ESTATÍSTICA DO CHURN ===")
    churn = statistical_analysis['statistical_data']['analise_churn']
    if churn['testes_estatisticos']['frequencia_semanal']['significativo']:
        print(f"- Frequência semanal é significativamente diferente entre quem cancela e não cancela (p={churn['testes_estatisticos']['frequencia_semanal']['p_value']:.4f})")
        print(f"  Membros que cancelam: {churn['testes_estatisticos']['frequencia_semanal']['media_churn']:.2f}x/semana")
        print(f"  Membros que permanecem: {churn['testes_estatisticos']['frequencia_semanal']['media_sem_churn']:.2f}x/semana")

    if churn['testes_estatisticos']['dias_sem_sessao']['significativo']:
        print(f"- Dias sem sessão é significativamente diferente (p={churn['testes_estatisticos']['dias_sem_sessao']['p_value']:.4f})")
        print(f"  Membros que cancelam ficam {churn['testes_estatisticos']['dias_sem_sessao']['media_churn']:.1f} dias sem sessão antes de cancelar")

    print("\n=== PREVISÃO DE TENDÊNCIAS ===")
    forecast = statistical_analysis['statistical_data']['previsao_tendencias']
    if not forecast['previsao'].empty:
        print(f"- Projeção de membros ativos em 6 meses: {forecast['tendencia']['projecao_6m']:.0f}")
        print(f"- Taxa de churn atual: {forecast['tendencia']['churn_rate']:.2f}%")

    print("\n=== MODELO ESTATÍSTICO DE LTV ===")
    ltv = statistical_analysis['statistical_data']['modelo_ltv']
    print(f"- LTV médio: R$ {ltv['ltv_medio']:,.2f}")
    print(f"- Intervalo de confiança (95%): R$ {ltv['ltv_ci_95'][0]:,.2f} - R$ {ltv['ltv_ci_95'][1]:,.2f}")

    print("\n=== PADRÕES DE BUNDLING IDENTIFICADOS ===")
    bundling = statistical_analysis['statistical_data']['analise_bundling']
    if bundling['regras_significativas']:
        top_rule = bundling['regras_significativas'][0]
        print(f"- Combinar '{top_rule['antecedente']}' com '{top_rule['consequente']}' (lift: {top_rule['lift']:.2f})")
        print(f"  Quando um membro compra '{top_rule['antecedente']}', há {top_rule['confianca']:.2%} de chance de comprar '{top_rule['consequente']}'")

    print("\n=== PADRÕES SAZONAIS IDENTIFICADOS ===")
    seasonality = statistical_analysis['statistical_data']['decomposicao_sazonal']
    if 'componentes' in seasonality and 'sazonalidade' in seasonality['componentes']:
        if 'dias_pico' in seasonality['componentes']['sazonalidade']:
            dias = {0: 'Seg', 1: 'Ter', 2: 'Qua', 3: 'Qui', 4: 'Sex', 5: 'Sáb', 6: 'Dom'}
            dias_pico = [dias.get(d, str(d)) for d in seasonality['componentes']['sazonalidade']['dias_pico']]
            print(f"- Dias de pico de uso: {', '.join(dias_pico)}")

    print("\n=== SEGMENTAÇÃO POR CLUSTER ===")
    clustering = statistical_analysis['statistical_data']['segmentacao_cluster']
    if clustering['numero_segmentos'] > 0:
        print(f"- Número ótimo de segmentos identificado: {clustering['numero_segmentos']}")
        print(f"- Segmento prioritário: {clustering['caracteristicas_segmentos'][0]['nome']}")
        print(f"  Receita média: R$ {clustering['caracteristicas_segmentos'][0]['receita_media']:,.2f}")
        print(f"  Taxa de churn: {clustering['caracteristicas_segmentos'][0]['taxa_churn']:.2f}%")

    print("\n=== INSIGHTS PRIORITÁRIOS ===")
    insights = statistical_analysis['statistical_data']['insights_prioritarios']
    for i, insight in enumerate([i for i in insights['oportunidades_imediatas'] if i], 1):
        print(f"{i}. {insight}")

    print("\n=== PROJETOS DE ALTO IMPACTO ===")
    for i, projeto in enumerate([p for p in insights['projetos_de_alto_impacto'] if p], 1):
        print(f"{i}. {projeto}")
