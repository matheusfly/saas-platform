import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import re
from sklearn.preprocessing import LabelEncoder
import calendar

# =====================================================================
# DATA PROCESSING FUNCTIONS
# =====================================================================

def processar_dados_reais_clientes(df_clientes):
    """
    Processa dados do arquivo clientes.xlsx conforme estrutura real observada
    """
    # Limpeza inicial
    df = df_clientes.copy()

    # Remove linhas HTML/JS indesejadas
    if 'Código' in df.columns:
        df = df[~df['Código'].astype(str).str.contains('<|>', regex=True, na=False)]

    # Renomeia colunas para padronização
    column_mapping = {
        'Código': 'codigo',
        'Cliente': 'cliente',
        'Cliente desde': 'inicio',
        'Status atual': 'status_cliente',
        'Continuidade (meses)': 'idade_contrato',
        'Contratos': 'total_contratos'
    }
    df = df.rename(columns=column_mapping)

    # Converte datas
    if 'inicio' in df.columns:
        df['inicio'] = pd.to_datetime(df['inicio'], errors='coerce', dayfirst=True)

    # Converte valores numéricos
    numeric_cols = ['codigo', 'idade_contrato', 'total_contratos']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Padroniza status
    if 'status_cliente' in df.columns:
        status_mapping = {
            'Ativo': 'Ativo',
            'Bloqueado': 'Bloqueado',
            'Cancelado': 'Cancelado',
            'Excluído': 'Cancelado'
        }
        df['status_cliente'] = df['status_cliente'].map(status_mapping).fillna(df['status_cliente'])

    # Calcula churn potencial
    if 'status_cliente' in df.columns:
        df['churn_potencial'] = (df['status_cliente'].isin(['Cancelado', 'Bloqueado'])).astype(int)

    # Calcula vencimento estimado (assumindo 1 mês de contrato)
    if 'inicio' in df.columns:
        df['vencimento'] = df['inicio'] + pd.DateOffset(months=1)

    return df

def processar_dados_reais_fluxo(df_fluxo):
    """
    Processa dados do arquivo fluxo_caixa.xlsx conforme estrutura real observada
    """
    # Limpeza inicial
    df = df_fluxo.copy()

    # Remove linhas HTML/JS indesejadas
    if 'Tecnofit' in df.columns:
        df = df[~df['Tecnofit'].astype(str).str.contains('<|>', regex=True, na=False)]

    # Renomeia colunas para padronização
    column_mapping = {
        'Código': 'codigo',
        'Nome': 'cliente',
        'Status Cliente': 'status_cliente',
        'Contrato': 'contrato',
        'Status Contrato': 'status_contrato',
        'Convênio': 'convenio',
        'Desconto': 'desconto',
        'Valor Contrato': 'valor_contrato',
        'Descontos': 'descontos',
        'Valor Final': 'valor_final',
        'Vencimento': 'vencimento'
    }
    df = df.rename(columns=column_mapping)

    # Converte datas
    if 'vencimento' in df.columns:
        df['vencimento'] = pd.to_datetime(df['vencimento'], errors='coerce', dayfirst=True)

    # Converte valores monetários
    monetary_cols = ['valor_contrato', 'descontos', 'valor_final']
    for col in monetary_cols:
        if col in df.columns:
            # Remove caracteres não numéricos
            df[col] = df[col].astype(str).str.replace(r'[^\d\.,]', '', regex=True)
            # Substitui vírgula por ponto
            df[col] = df[col].str.replace(',', '.')
            # Converte para float
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Converte código para numérico
    if 'codigo' in df.columns:
        df['codigo'] = pd.to_numeric(df['codigo'], errors='coerce')

    # Padroniza contratos
    if 'contrato' in df.columns:
        df['categoria'] = df['contrato'].apply(
            lambda x: 'GYMPASS' if 'GYMPASS' in str(x) else
                     'CALISTENIA' if 'CALISTENIA' in str(x) else 'OUTROS')

        df['tipo_plano'] = df['contrato'].apply(
            lambda x: 'MENSAL' if 'MENSAL' in str(x) else
                     '10X AULAS' if '10X AULAS' in str(x) else
                     'PASSE PADRÃO' if 'PASSE PADRÃO' in str(x) else 'OUTROS')

    return df

# =====================================================================
# 24. STATISTICAL CHURN PREDICTION & HYPOTHESIS TESTING
# =====================================================================

def analise_estatistica_churn(df_clientes, df_fluxo):
    """
    Realiza análise estatística rigorosa dos fatores que levam ao churn
    """
    # Processa dados
    clientes = processar_dados_reais_clientes(df_clientes)
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    # Calcula métricas de engajamento
    if not fluxo.empty:
        # Frequência de uso
        frequencia = fluxo.groupby('codigo').agg(
            total_sessoes=('vencimento', 'count'),
            dias_ativos=('vencimento', lambda x: (x.max() - x.min()).days + 1)
        ).reset_index()
        frequencia['frequencia_semanal'] = frequencia['total_sessoes'] / (frequencia['dias_ativos'] / 7)

        # Dias desde última sessão
        ultima_sessao = fluxo.groupby('codigo')['vencimento'].max().reset_index()
        ultima_sessao.columns = ['codigo', 'ultima_sessao']
        ultima_sessao['dias_sem_sessao'] = (datetime.now() - ultima_sessao['ultima_sessao']).dt.days

        # Junta com dados de clientes
        clientes = clientes.merge(frequencia[['codigo', 'frequencia_semanal']], on='codigo', how='left')
        clientes = clientes.merge(ultima_sessao[['codigo', 'dias_sem_sessao']], on='codigo', how='left')

    # Prepara dados para análise estatística
    churn_data = clientes.copy()

    # Remove valores nulos
    churn_data = churn_data.dropna(subset=['frequencia_semanal', 'dias_sem_sessao', 'idade_contrato'])

    # Define churn como variável dependente
    churn_data['churn'] = (churn_data['status_cliente'].isin(['Cancelado', 'Bloqueado'])).astype(int)

    # Teste t para comparar médias entre grupos com churn e sem churn
    churn_group = churn_data[churn_data['churn'] == 1]
    no_churn_group = churn_data[churn_data['churn'] == 0]

    from scipy import stats
    if not churn_group.empty and not no_churn_group.empty:
        # Teste t para frequência semanal
        t_freq, p_freq = stats.ttest_ind(
            churn_group['frequencia_semanal'],
            no_churn_group['frequencia_semanal'],
            nan_policy='omit'
        )

        # Teste t para dias sem sessão
        t_dias, p_dias = stats.ttest_ind(
            churn_group['dias_sem_sessao'],
            no_churn_group['dias_sem_sessao'],
            nan_policy='omit'
        )

        # Teste t para idade do contrato
        t_idade, p_idade = stats.ttest_ind(
            churn_group['idade_contrato'],
            no_churn_group['idade_contrato'],
            nan_policy='omit'
        )
    else:
        t_freq, p_freq, t_dias, p_dias, t_idade, p_idade = 0, 1, 0, 1, 0, 1

    # Calcula tamanho do efeito (Cohen's d)
    def cohen_d(group1, group2):
        diff = group1.mean() - group2.mean()
        n1, n2 = len(group1), len(group2)
        if n1 + n2 == 0:
            return 0
        var1 = group1.var()
        var2 = group2.var()
        pooled_var = (n1 * var1 + n2 * var2) / (n1 + n2)
        if pooled_var == 0:
            return 0
        return diff / np.sqrt(pooled_var)

    if not churn_group.empty and not no_churn_group.empty:
        d_freq = cohen_d(churn_group['frequencia_semanal'], no_churn_group['frequencia_semanal'])
        d_dias = cohen_d(churn_group['dias_sem_sessao'], no_churn_group['dias_sem_sessao'])
        d_idade = cohen_d(churn_group['idade_contrato'], no_churn_group['idade_contrato'])
    else:
        d_freq, d_dias, d_idade = 0, 0, 0

    # Regressão logística simples
    if len(churn_data) > 10:
        import statsmodels.api as sm
        X = churn_data[['frequencia_semanal', 'dias_sem_sessao', 'idade_contrato']]
        X = sm.add_constant(X)  # Adiciona intercepto
        y = churn_data['churn']

        try:
            model = sm.Logit(y, X).fit(disp=0)
            odds_ratios = np.exp(model.params)
            p_values = model.pvalues
        except:
            odds_ratios = pd.Series([np.nan]*4, index=['const', 'frequencia_semanal', 'dias_sem_sessao', 'idade_contrato'])
            p_values = pd.Series([np.nan]*4, index=['const', 'frequencia_semanal', 'dias_sem_sessao', 'idade_contrato'])
    else:
        odds_ratios = pd.Series([np.nan]*4, index=['const', 'frequencia_semanal', 'dias_sem_sessao', 'idade_contrato'])
        p_values = pd.Series([np.nan]*4, index=['const', 'frequencia_semanal', 'dias_sem_sessao', 'idade_contrato'])

    return {
        'testes_estatisticos': {
            'frequencia_semanal': {
                'media_churn': churn_group['frequencia_semanal'].mean(),
                'media_sem_churn': no_churn_group['frequencia_semanal'].mean(),
                't_stat': t_freq,
                'p_value': p_freq,
                'cohen_d': d_freq,
                'significativo': p_freq < 0.05
            },
            'dias_sem_sessao': {
                'media_churn': churn_group['dias_sem_sessao'].mean(),
                'media_sem_churn': no_churn_group['dias_sem_sessao'].mean(),
                't_stat': t_dias,
                'p_value': p_dias,
                'cohen_d': d_dias,
                'significativo': p_dias < 0.05
            },
            'idade_contrato': {
                'media_churn': churn_group['idade_contrato'].mean(),
                'media_sem_churn': no_churn_group['idade_contrato'].mean(),
                't_stat': t_idade,
                'p_value': p_idade,
                'cohen_d': d_idade,
                'significativo': p_idade < 0.05
            }
        },
        'regressao_logistica': {
            'odds_ratios': odds_ratios.to_dict(),
            'p_values': p_values.to_dict(),
            'significativos': {k: v < 0.05 for k, v in p_values.items() if k != 'const'}
        },
        'recomendacoes_baseadas_evidencia': [
            "Implementar programa de retenção para membros com frequência < 2x/semana" if p_freq < 0.05 and d_freq > 0.5 else "",
            "Contato proativo para membros com > 7 dias sem sessão" if p_dias < 0.05 and d_dias > 0.5 else "",
            "Programa especial para membros nos primeiros 3 meses" if p_idade < 0.05 and d_idade > 0.5 else ""
        ]
    }

# =====================================================================
# 25. TIME SERIES FORECASTING FOR MEMBERSHIP TRENDS
# =====================================================================

def prever_tendencias_membros(df_clientes, df_fluxo, periodos=6):
    """
    Prevê tendências futuras de membros usando modelos de séries temporais
    """
    # Processa dados
    clientes = processar_dados_reais_clientes(df_clientes)
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    # Cria série temporal de novos membros
    clientes['mes'] = clientes['inicio'].dt.to_period('M')
    novos_membros = clientes.groupby('mes').size().reset_index(name='novos')

    # Cria série temporal de cancelamentos
    cancelamentos = clientes[clientes['status_cliente'].isin(['Cancelado', 'Bloqueado'])]
    cancelamentos['mes'] = cancelamentos['vencimento'].dt.to_period('M')
    cancelamentos_ts = cancelamentos.groupby('mes').size().reset_index(name='cancelamentos')

    # Garante que temos dados para todos os meses
    if not novos_membros.empty:
        full_range = pd.period_range(
            start=novos_membros['mes'].min(),
            end=max(novos_membros['mes'].max(), cancelamentos_ts['mes'].max()),
            freq='M'
        )
        novos_membros = novos_membros.set_index('mes').reindex(full_range, fill_value=0).reset_index().rename(columns={'index': 'mes'})
        cancelamentos_ts = cancelamentos_ts.set_index('mes').reindex(full_range, fill_value=0).reset_index().rename(columns={'index': 'mes'})

        # Calcula membros ativos
        novos_membros = novos_membros.sort_values('mes')
        novos_membros['ativos'] = novos_membros['novos'].cumsum() - cancelamentos_ts['cancelamentos'].cumsum()

        # Prepara dados para previsão
        from statsmodels.tsa.arima.model import ARIMA
        import warnings
        warnings.filterwarnings('ignore')

        # Modelo para novos membros
        try:
            model_novos = ARIMA(novos_membros['novos'], order=(1,1,1))
            results_novos = model_novos.fit()
            forecast_novos = results_novos.get_forecast(steps=periodos)
            novos_conf_int = forecast_novos.conf_int()
        except:
            # Modelo simples se ARIMA falhar
            media = novos_membros['novos'].mean()
            novos_forecast = [media] * periodos
            novos_conf_int = pd.DataFrame({
                'lower novos': [media * 0.7] * periodos,
                'upper novos': [media * 1.3] * periodos
            })

        # Modelo para cancelamentos
        try:
            model_cancel = ARIMA(cancelamentos_ts['cancelamentos'], order=(1,1,1))
            results_cancel = model_cancel.fit()
            forecast_cancel = results_cancel.get_forecast(steps=periodos)
            cancel_conf_int = forecast_cancel.conf_int()
        except:
            # Modelo simples se ARIMA falhar
            media_cancel = cancelamentos_ts['cancelamentos'].mean()
            cancel_forecast = [media_cancel] * periodos
            cancel_conf_int = pd.DataFrame({
                'lower cancelamentos': [media_cancel * 0.7] * periodos,
                'upper cancelamentos': [media_cancel * 1.3] * periodos
            })

        # Gera períodos futuros
        ultimo_mes = novos_membros['mes'].max()
        periodos_futuros = [ultimo_mes + i for i in range(1, periodos+1)]

        # Cria DataFrame de previsão
        previsao = pd.DataFrame({
            'mes': periodos_futuros,
            'novos_previsto': forecast_novos.predicted_mean if 'forecast_novos' in locals() else novos_forecast,
            'novos_lower': novos_conf_int.iloc[:, 0],
            'novos_upper': novos_conf_int.iloc[:, 1],
            'cancelamentos_previsto': forecast_cancel.predicted_mean if 'forecast_cancel' in locals() else cancel_forecast,
            'cancelamentos_lower': cancel_conf_int.iloc[:, 0],
            'cancelamentos_upper': cancel_conf_int.iloc[:, 1]
        })

        # Calcula membros ativos previstos
        ultimo_ativo = novos_membros['ativos'].iloc[-1]
        ativos_previstos = [ultimo_ativo]

        for i in range(periodos):
            novos = previsao['novos_previsto'].iloc[i]
            cancel = previsao['cancelamentos_previsto'].iloc[i]
            ativos_previstos.append(ativos_previstos[-1] + novos - cancel)

        previsao['ativos_previsto'] = ativos_previstos[1:]

        return {
            'historico': novos_membros,
            'previsao': previsao,
            'tendencia': {
                'crescimento_mensal': novos_membros['novos'].pct_change().mean() * 100,
                'churn_rate': (cancelamentos_ts['cancelamentos'] / novos_membros['novos']).mean() * 100,
                'projecao_6m': ativos_previstos[-1]
            }
        }
    else:
        return {
            'historico': pd.DataFrame(),
            'previsao': pd.DataFrame(),
            'tendencia': {
                'crescimento_mensal': 0,
                'churn_rate': 0,
                'projecao_6m': 0
            }
        }

# =====================================================================
# 26. CUSTOMER LIFETIME VALUE MODELING WITH CONFIDENCE INTERVALS
# =====================================================================

def calcular_ltv_estatistico(df_clientes, df_fluxo, num_simulacoes=1000):
    """
    Calcula LTV com intervalos de confiança usando simulação Monte Carlo
    """
    # Processa dados
    clientes = processar_dados_reais_clientes(df_clientes)
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    # Calcula receita por cliente
    receita_cliente = fluxo.groupby('codigo')['valor_final'].sum().reset_index()
    receita_cliente.columns = ['codigo', 'receita_total']

    # Calcula tempo de retenção
    clientes = clientes.merge(receita_cliente, on='codigo', how='left')
    clientes['dias_retencao'] = (clientes['vencimento'] - clientes['inicio']).dt.days

    # Filtra clientes com dados completos
    clientes_validos = clientes[clientes['dias_retencao'] > 0].copy()

    if clientes_validos.empty:
        return {
            'ltv_medio': 0,
            'ltv_ci_95': (0, 0),
            'ltv_por_contrato': {},
            'simulacoes': []
        }

    # Calcula ARPU (Average Revenue Per User)
    clientes_validos['arpu_diario'] = clientes_validos['receita_total'] / clientes_validos['dias_retencao']

    # Calcula churn rate diário
    clientes_validos['churn_rate_diario'] = 1 / clientes_validos['dias_retencao']

    # Simulação Monte Carlo
    ltv_simulacoes = []

    for _ in range(num_simulacoes):
        # Amostra aleatória de ARPU
        arpu = clientes_validos['arpu_diario'].sample(1).values[0]

        # Amostra aleatória de churn rate
        churn = clientes_validos['churn_rate_diario'].sample(1).values[0]

        # Simula tempo de vida
        tempo_vida = 0
        while np.random.random() > churn and tempo_vida < 365*5:  # Limite de 5 anos
            tempo_vida += 1

        # Calcula LTV para esta simulação
        ltv = arpu * tempo_vida
        ltv_simulacoes.append(ltv)

    # Calcula estatísticas das simulações
    ltv_medio = np.mean(ltv_simulacoes)
    ltv_ci_95 = (np.percentile(ltv_simulacoes, 2.5), np.percentile(ltv_simulacoes, 97.5))

    # Calcula LTV por tipo de contrato
    if 'contrato' in fluxo.columns:
        fluxo_valido = fluxo[fluxo['codigo'].isin(clientes_validos['codigo'])]
        ltv_por_contrato = {}

        for contrato in fluxo_valido['contrato'].unique():
            clientes_contrato = fluxo_valido[fluxo_valido['contrato'] == contrato]['codigo'].unique()
            indices = [i for i, codigo in enumerate(clientes_validos['codigo']) if codigo in clientes_contrato]

            if indices:
                ltv_contrato = [ltv_simulacoes[i] for i in indices]
                ltv_por_contrato[contrato] = {
                    'ltv_medio': np.mean(ltv_contrato),
                    'ltv_ci_95': (np.percentile(ltv_contrato, 2.5), np.percentile(ltv_contrato, 97.5)),
                    'clientes': len(ltv_contrato)
                }
    else:
        ltv_por_contrato = {}

    return {
        'ltv_medio': ltv_medio,
        'ltv_ci_95': ltv_ci_95,
        'ltv_por_contrato': ltv_por_contrato,
        'simulacoes': ltv_simulacoes,
        'metricas_confianca': {
            'erro_padrao': np.std(ltv_simulacoes) / np.sqrt(len(ltv_simulacoes)),
            'coeficiente_variacao': np.std(ltv_simulacoes) / ltv_medio if ltv_medio > 0 else 0
        }
    }

# =====================================================================
# 27. PRODUCT BUNDLING ANALYSIS USING ASSOCIATION RULES
# =====================================================================

def analisar_bundling_produtos(df_clientes, df_fluxo):
    """
    Analisa padrões de compra conjunta usando regras de associação
    """
    # Processa dados
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    if fluxo.empty or 'contrato' not in fluxo.columns:
        return {
            'regras_significativas': [],
            'matriz_coocorrencia': pd.DataFrame(),
            'recomendacoes_bundling': []
        }

    # Cria lista de transações (compras por cliente)
    transacoes = []
    for codigo, grupo in fluxo.groupby('codigo'):
        contratos = grupo['contrato'].unique()
        transacoes.append(contratos.tolist())

    if not transacoes:
        return {
            'regras_significativas': [],
            'matriz_coocorrencia': pd.DataFrame(),
            'recomendacoes_bundling': []
        }

    # Calcula matriz de coocorrência
    from collections import defaultdict
    co_ocorrencias = defaultdict(lambda: defaultdict(int))

    for transacao in transacoes:
        for i in range(len(transacao)):
            for j in range(i+1, len(transacao)):
                p1, p2 = sorted([transacao[i], transacao[j]])
                co_ocorrencias[p1][p2] += 1

    # Converte para DataFrame
    produtos = sorted(set([p for transacao in transacoes for p in transacao]))
    matriz_coocorrencia = pd.DataFrame(0, index=produtos, columns=produtos)

    for p1 in produtos:
        for p2 in produtos:
            if p1 < p2 and p2 in co_ocorrencias[p1]:
                matriz_coocorrencia.loc[p1, p2] = co_ocorrencias[p1][p2]
                matriz_coocorrencia.loc[p2, p1] = co_ocorrencias[p1][p2]

    # Calcula suporte, confiança e lift
    regras = []
    total_transacoes = len(transacoes)

    for p1 in produtos:
        for p2 in produtos:
            if p1 < p2 and matriz_coocorrencia.loc[p1, p2] > 0:
                # Suporte: P(X e Y)
                suporte = matriz_coocorrencia.loc[p1, p2] / total_transacoes

                # Confiança: P(Y|X)
                confianca = matriz_coocorrencia.loc[p1, p2] / sum(1 for t in transacoes if p1 in t)

                # Lift: P(X e Y) / (P(X) * P(Y))
                suporte_x = sum(1 for t in transacoes if p1 in t) / total_transacoes
                suporte_y = sum(1 for t in transacoes if p2 in t) / total_transacoes
                lift = suporte / (suporte_x * suporte_y) if (suporte_x * suporte_y) > 0 else 0

                regras.append({
                    'antecedente': p1,
                    'consequente': p2,
                    'suporte': suporte,
                    'confianca': confianca,
                    'lift': lift
                })

    # Filtra regras significativas
    regras_significativas = [
        r for r in regras
        if r['suporte'] > 0.05 and r['confianca'] > 0.3 and r['lift'] > 1.2
    ]

    # Gera recomendações de bundling
    recomendacoes = []
    for regra in regras_significativas:
        if regra['lift'] > 1.5:
            recomendacoes.append(
                f"Oferecer pacote combinado de '{regra['antecedente']}' e '{regra['consequente']}' " +
                f"(lift: {regra['lift']:.2f}, confiança: {regra['confianca']:.2%})"
            )

    return {
        'regras_significativas': sorted(regras_significativas, key=lambda x: x['lift'], reverse=True),
        'matriz_coocorrencia': matriz_coocorrencia,
        'recomendacoes_bundling': recomendacoes,
        'estatisticas_gerais': {
            'total_transacoes': total_transacoes,
            'produtos_unicos': len(produtos)
        }
    }

# =====================================================================
# 28. SEASONALITY DECOMPOSITION FOR GYM USAGE PATTERNS
# =====================================================================

def decompor_sazonalidade(df_fluxo):
    """
    Decompõe padrões sazonais de uso da academia usando STL
    """
    # Processa dados
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    if fluxo.empty or 'vencimento' not in fluxo.columns:
        return {
            'tendencia': pd.Series(),
            'sazonalidade': pd.Series(),
            'residuo': pd.Series(),
            'componentes': {}
        }

    # Cria série temporal diária
    fluxo['data'] = pd.to_datetime(fluxo['vencimento'])
    fluxo_diario = fluxo.groupby('data').size().reset_index(name='sessoes')

    # Garante que temos dados para todos os dias
    if not fluxo_diario.empty:
        full_range = pd.date_range(
            start=fluxo_diario['data'].min(),
            end=fluxo_diario['data'].max()
        )
        fluxo_diario = fluxo_diario.set_index('data').reindex(full_range).fillna(0).reset_index().rename(columns={'index': 'data'})

        # Converte para série temporal
        from statsmodels.tsa.seasonal import STL
        import warnings
        warnings.filterwarnings('ignore')

        try:
            # STL decomposition
            stl = STL(fluxo_diario['sessoes'], period=7, seasonal_deg=0)
            result = stl.fit()

            # Extrai componentes
            tendencia = result.trend
            sazonalidade = result.seasonal
            residuo = result.resid

            # Analisa componentes
            componentes = {
                'tendencia': {
                    'slope': np.polyfit(range(len(tendencia)), tendencia, 1)[0],
                    'tendencia_crescente': np.polyfit(range(len(tendencia)), tendencia, 1)[0] > 0
                },
                'sazonalidade': {
                    'padrao_semanal': {
                        'seg': sazonalidade[fluxo_diario['data'].dt.dayofweek == 0].mean(),
                        'ter': sazonalidade[fluxo_diario['data'].dt.dayofweek == 1].mean(),
                        'qua': sazonalidade[fluxo_diario['data'].dt.dayofweek == 2].mean(),
                        'qui': sazonalidade[fluxo_diario['data'].dt.dayofweek == 3].mean(),
                        'sex': sazonalidade[fluxo_diario['data'].dt.dayofweek == 4].mean(),
                        'sab': sazonalidade[fluxo_diario['data'].dt.dayofweek == 5].mean(),
                        'dom': sazonalidade[fluxo_diario['data'].dt.dayofweek == 6].mean()
                    },
                    'dias_pico': fluxo_diario['data'].iloc[np.argsort(sazonalidade)[-3:]].dt.dayofweek.value_counts().index.tolist()
                },
                'residuo': {
                    'volatilidade': residuo.std(),
                    'outliers': np.where(np.abs(residuo - residuo.mean()) > 2 * residuo.std())[0].tolist()
                }
            }

            return {
                'tendencia': tendencia,
                'sazonalidade': sazonalidade,
                'residuo': residuo,
                'componentes': componentes,
                'dados_originais': fluxo_diario['sessoes']
            }
        except:
            # Método simplificado se STL falhar
            fluxo_diario['dia_semana'] = fluxo_diario['data'].dt.dayofweek
            sazonalidade_semanal = fluxo_diario.groupby('dia_semana')['sessoes'].mean()

            # Calcula tendência simples
            fluxo_diario['tendencia'] = fluxo_diario['sessoes'].rolling(window=30, min_periods=7).mean()

            return {
                'tendencia': fluxo_diario['tendencia'],
                'sazonalidade': sazonalidade_semanal,
                'residuo': fluxo_diario['sessoes'] - fluxo_diario['tendencia'],
                'componentes': {
                    'tendencia': {
                        'slope': fluxo_diario['tendencia'].pct_change().mean(),
                        'tendencia_crescente': fluxo_diario['tendencia'].iloc[-1] > fluxo_diario['tendencia'].iloc[0]
                    },
                    'sazonalidade': {
                        'padrao_semanal': sazonalidade_semanal.to_dict(),
                        'dias_pico': sazonalidade_semanal.nlargest(2).index.tolist()
                    }
                },
                'dados_originais': fluxo_diario['sessoes']
            }
    else:
        return {
            'tendencia': pd.Series(),
            'sazonalidade': pd.Series(),
            'residuo': pd.Series(),
            'componentes': {}
        }

# =====================================================================
# 29. CUSTOMER SEGMENTATION USING CLUSTERING ALGORITHMS
# =====================================================================

def segmentar_clientes_clusterizacao(df_clientes, df_fluxo):
    """
    Segmenta clientes usando algoritmos de clusterização (K-means)
    """
    # Processa dados
    clientes = processar_dados_reais_clientes(df_clientes)
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    # Calcula métricas de engajamento
    if not fluxo.empty:
        # Frequência de uso
        frequencia = fluxo.groupby('codigo').agg(
            total_sessoes=('vencimento', 'count'),
            dias_ativos=('vencimento', lambda x: (x.max() - x.min()).days + 1)
        ).reset_index()
        frequencia['frequencia_semanal'] = frequencia['total_sessoes'] / (frequencia['dias_ativos'] / 7)

        # Dias desde última sessão
        ultima_sessao = fluxo.groupby('codigo')['vencimento'].max().reset_index()
        ultima_sessao.columns = ['codigo', 'ultima_sessao']
        ultima_sessao['dias_sem_sessao'] = (datetime.now() - ultima_sessao['ultima_sessao']).dt.days

        # Receita total
        receita = fluxo.groupby('codigo')['valor_final'].sum().reset_index()
        receita.columns = ['codigo', 'receita_total']

        # Junta com dados de clientes
        clientes = clientes.merge(frequencia[['codigo', 'frequencia_semanal']], on='codigo', how='left')
        clientes = clientes.merge(ultima_sessao[['codigo', 'dias_sem_sessao']], on='codigo', how='left')
        clientes = clientes.merge(receita, on='codigo', how='left')

    # Prepara dados para clusterização
    features = clientes[['frequencia_semanal', 'dias_sem_sessao', 'idade_contrato', 'receita_total']].copy()

    # Remove valores nulos
    features = features.dropna()

    if features.empty or len(features) < 3:
        return {
            'segmentos': clientes,
            'caracteristicas_segmentos': {},
            'numero_segmentos': 0,
            'metricas_qualidade': {}
        }

    # Normaliza features
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    # Determina número ótimo de clusters usando método do cotovelo
    from sklearn.cluster import KMeans
    from sklearn.metrics import silhouette_score
    import numpy as np

    max_clusters = min(10, len(features) // 2)
    inertias = []
    silhouette_scores = []

    for k in range(2, max_clusters + 1):
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(features_scaled)
        inertias.append(kmeans.inertia_)
        silhouette_scores.append(silhouette_score(features_scaled, kmeans.labels_))

    # Encontra o "cotovelo" (método da distância máxima)
    if len(inertias) > 1:
        # Normaliza inertias
        inertias_norm = (inertias - min(inertias)) / (max(inertias) - min(inertias))

        # Calcula a distância de cada ponto à linha entre o primeiro e o último ponto
        a = inertias_norm[-1] - inertias_norm[0]
        b = float(len(inertias) - 1)
        c = inertias_norm[0] * b - a
        distances = np.abs(a * np.arange(len(inertias)) - b * inertias_norm + c) / np.sqrt(a**2 + b**2)

        # Seleciona o número de clusters com maior distância
        num_clusters = np.argmax(distances) + 2
    else:
        num_clusters = 3

    # Aplica K-means com o número ótimo de clusters
    kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
    clientes_validos = features.dropna()
    clientes_validos['cluster'] = kmeans.fit_predict(features_scaled)

    # Mapeia clusters de volta para o DataFrame original
    clientes['cluster'] = np.nan
    clientes.loc[clientes_validos.index, 'cluster'] = clientes_validos['cluster']

    # Nomeia os segmentos com base nas características
    caracteristicas_segmentos = {}
    for i in range(num_clusters):
        cluster_data = clientes[clientes['cluster'] == i]

        # Calcula características médias
        freq_media = cluster_data['frequencia_semanal'].mean()
        dias_sem_sessao_media = cluster_data['dias_sem_sessao'].mean()
        receita_media = cluster_data['receita_total'].mean()

        # Determina nome do segmento
        if freq_media > 3 and dias_sem_sessao_media < 7:
            nome = "Membros Leais"
        elif freq_media > 2 and receita_media > receita_media * 1.2:
            nome = "Membros de Alto Valor"
        elif freq_media < 1.5 and dias_sem_sessao_media > 14:
            nome = "Membros em Risco"
        elif freq_media > 1 and dias_sem_sessao_media < 14:
            nome = "Membros Estáveis"
        else:
            nome = f"Segmento {i+1}"

        caracteristicas_segmentos[i] = {
            'nome': nome,
            'tamanho': len(cluster_data),
            'frequencia_media': freq_media,
            'dias_sem_sessao_media': dias_sem_sessao_media,
            'receita_media': receita_media,
            'taxa_churn': cluster_data['churn_potencial'].mean() * 100 if 'churn_potencial' in cluster_data else 0
        }

    # Classifica segmentos por valor
    segmentos_ordenados = sorted(
        caracteristicas_segmentos.items(),
        key=lambda x: (x[1]['receita_media'], -x[1]['taxa_churn']),
        reverse=True
    )

    # Atribui nomes finais
    for i, (cluster_id, _) in enumerate(segmentos_ordenados):
        caracteristicas_segmentos[cluster_id]['prioridade'] = i + 1
        if i == 0:
            caracteristicas_segmentos[cluster_id]['nome'] = "Membros Premium"
        elif i == 1:
            caracteristicas_segmentos[cluster_id]['nome'] = "Membros Valiosos"
        elif i == len(segmentos_ordenados) - 1:
            caracteristicas_segmentos[cluster_id]['nome'] = "Membros em Alto Risco"
        elif i == len(segmentos_ordenados) - 2:
            caracteristicas_segmentos[cluster_id]['nome'] = "Membros em Risco"

    return {
        'segmentos': clientes,
        'caracteristicas_segmentos': caracteristicas_segmentos,
        'numero_segmentos': num_clusters,
        'metricas_qualidade': {
            'silhouette_score': max(silhouette_scores) if silhouette_scores else 0,
            'inertia': inertias[num_clusters-2] if num_clusters <= len(inertias) else 0
        }
    }

# =====================================================================
# 30. PRICING ELASTICITY ANALYSIS
# =====================================================================

def analisar_elasticidade_precos(df_clientes, df_fluxo):
    """
    Analisa elasticidade de preços para diferentes tipos de contratos
    """
    # Processa dados
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    if fluxo.empty or 'valor_final' not in fluxo.columns or 'contrato' not in fluxo.columns:
        return {
            'elasticidade_por_contrato': {},
            'recomendacoes_precificacao': []
        }

    # Calcula receita por contrato
    receita_contrato = fluxo.groupby('contrato').agg(
        receita_total=('valor_final', 'sum'),
        clientes=('codigo', 'nunique'),
        sessoes=('vencimento', 'count')
    ).reset_index()

    # Calcula receita média por cliente
    receita_contrato['receita_por_cliente'] = receita_contrato['receita_total'] / receita_contrato['clientes']

    # Identifica contratos similares para análise comparativa
    contratos_similares = []
    for i, contrato1 in enumerate(receita_contrato['contrato']):
        for j, contrato2 in enumerate(receita_contrato['contrato']):
            if i < j:
                # Verifica se são contratos similares (mesmo tipo mas diferentes períodos)
                if 'MENSAL' in contrato1 and 'TRIMESTRAL' in contrato2 and 'CALISTENIA' in contrato1 and 'CALISTENIA' in contrato2:
                    contratos_similares.append((contrato1, contrato2))
                elif 'MENSAL' in contrato1 and 'SEMESTRAL' in contrato2 and 'CALISTENIA' in contrato1 and 'CALISTENIA' in contrato2:
                    contratos_similares.append((contrato1, contrato2))

    # Calcula elasticidade para contratos similares
    elasticidade_por_contrato = {}

    for contrato1, contrato2 in contratos_similares:
        dados1 = receita_contrato[receita_contrato['contrato'] == contrato1].iloc[0]
        dados2 = receita_contrato[receita_contrato['contrato'] == contrato2].iloc[0]

        # Calcula preço por período (mensalizado)
        if 'MENSAL' in contrato1:
            preco1 = dados1['receita_por_cliente']
        elif 'TRIMESTRAL' in contrato1:
            preco1 = dados1['receita_por_cliente'] / 3
        elif 'SEMESTRAL' in contrato1:
            preco1 = dados1['receita_por_cliente'] / 6
        else:
            preco1 = dados1['receita_por_cliente']

        if 'MENSAL' in contrato2:
            preco2 = dados2['receita_por_cliente']
        elif 'TRIMESTRAL' in contrato2:
            preco2 = dados2['receita_por_cliente'] / 3
        elif 'SEMESTRAL' in contrato2:
            preco2 = dados2['receita_por_cliente'] / 6
        else:
            preco2 = dados2['receita_por_cliente']

        # Calcula elasticidade da demanda
        variacao_preco = (preco2 - preco1) / preco1
        variacao_demanda = (dados2['clientes'] / dados2['sessoes'] - dados1['clientes'] / dados1['sessoes']) / (dados1['clientes'] / dados1['sessoes'])

        if variacao_preco != 0:
            elasticidade = variacao_demanda / variacao_preco
            elasticidade_por_contrato[f"{contrato1} vs {contrato2}"] = {
                'elasticidade': elasticidade,
                'variacao_preco': variacao_preco,
                'variacao_demanda': variacao_demanda,
                'recomendacao': 'aumentar preço' if elasticidade > -1 else 'reduzir preço'
            }

    # Análise de receita marginal
    receita_contrato = receita_contrato.sort_values('receita_por_cliente')
    receita_contrato['receita_acumulada'] = receita_contrato['receita_total'].cumsum()
    receita_contrato['clientes_acumulados'] = receita_contrato['clientes'].cumsum()
    receita_contrato['receita_marginal'] = receita_contrato['receita_acumulada'].diff() / receita_contrato['clientes_acumulados'].diff()

    # Identifica ponto ótimo de precificação
    if not receita_contrato['receita_marginal'].dropna().empty:
        ponto_otimo = receita_contrato['receita_marginal'].idxmax()
    else:
        ponto_otimo = None

    recomendacoes = []
    contrato_otimo = None
    if not receita_contrato.empty and ponto_otimo is not None:
        contrato_otimo = receita_contrato.loc[ponto_otimo, 'contrato']
        recomendacoes.append(
            f"O contrato '{contrato_otimo}' apresenta a melhor relação receita-cliente. " +
            "Considere promovê-lo como opção principal."
        )

        # Verifica se há contratos com elasticidade negativa
        for chave, dados in elasticidade_por_contrato.items():
            if dados['elasticidade'] < -1:  # Elasticidade alta
                contrato1, contrato2 = chave.split(' vs ')
                recomendacoes.append(
                    f"Para {contrato1}, uma redução de preço de 10% poderia aumentar a demanda em " +
                    f"{abs(dados['elasticidade'] * 10):.1f}%"
                )

    return {
        'elasticidade_por_contrato': elasticidade_por_contrato,
        'ponto_otimo_precificacao': contrato_otimo if not receita_contrato.empty else None,
        'recomendacoes_precificacao': recomendacoes,
        'analise_receita_marginal': receita_contrato[['contrato', 'receita_por_cliente', 'receita_marginal']].to_dict('records')
    }

# =====================================================================
# 31. REFERRAL NETWORK ANALYSIS
# =====================================================================

def analisar_rede_indicacoes(df_clientes, df_fluxo):
    """
    Analisa padrões de rede de indicações entre membros
    """
    # Processa dados
    clientes = processar_dados_reais_clientes(df_clientes)
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    # Calcula receita por cliente
    if not fluxo.empty:
        receita_cliente = fluxo.groupby('codigo')['valor_final'].sum().reset_index()
        receita_cliente.columns = ['codigo', 'receita_total']
        clientes = clientes.merge(receita_cliente, on='codigo', how='left')
    else:
        clientes['receita_total'] = 0

    # Identifica possíveis indicações (clientes com mesmo sobrenome ou cadastro próximo)
    clientes['sobrenome'] = clientes['cliente'].str.split().str[-1]
    clientes['mes_cadastro'] = clientes['inicio'].dt.to_period('M')

    # Agrupa por sobrenome e mês de cadastro
    grupos = clientes.groupby(['sobrenome', 'mes_cadastro'])

    # Identifica grupos com múltiplos membros
    indicacoes = []
    for (sobrenome, mes), grupo in grupos:
        if len(grupo) > 1:
            # Verifica se os cadastros são próximos
            datas = grupo['inicio'].sort_values()
            diferenca_dias = (datas.iloc[-1] - datas.iloc[0]).days

            if diferenca_dias <= 30:  # Cadastros dentro de 30 dias
                for i in range(len(grupo)-1):
                    for j in range(i+1, len(grupo)):
                        indicacoes.append({
                            'cliente1': grupo.iloc[i]['codigo'],
                            'cliente2': grupo.iloc[j]['codigo'],
                            'sobrenome': sobrenome,
                            'dias_diferenca': (grupo.iloc[j]['inicio'] - grupo.iloc[i]['inicio']).days
                        })

    # Calcula métricas da rede
    if indicacoes:
        df_indicacoes = pd.DataFrame(indicacoes)

        # Calcula valor das indicações
        df_indicacoes = df_indicacoes.merge(
            clientes[['codigo', 'receita_total']],
            left_on='cliente1',
            right_on='codigo',
            suffixes=('', '_cliente1')
        ).drop(columns=['codigo'])

        df_indicacoes = df_indicacoes.merge(
            clientes[['codigo', 'receita_total']],
            left_on='cliente2',
            right_on='codigo',
            suffixes=('', '_cliente2')
        ).drop(columns=['codigo'])

        # Calcula receita média por indicação
        receita_media = df_indicacoes['receita_total_cliente2'].mean()

        # Calcula taxa de retenção de indicados
        clientes_indicados = df_indicacoes['cliente2'].unique()
        churn_indicados = clientes[clientes['codigo'].isin(clientes_indicados)]['churn_potencial'].mean()
        churn_geral = clientes['churn_potencial'].mean()

        # Identifica membros mais ativos em indicações
        membros_ativos = df_indicacoes['cliente1'].value_counts().reset_index()
        membros_ativos.columns = ['codigo', 'indicacoes_feitas']

        # Junta com dados de receita
        membros_ativos = membros_ativos.merge(
            clientes[['codigo', 'cliente', 'receita_total']],
            on='codigo'
        )

        # Calcula ROI das indicações
        custo_indicacao = 50  # Custo hipotético por indicação
        roi_indicacoes = (receita_media - custo_indicacao) / custo_indicacao * 100

        return {
            'indicacoes_identificadas': len(df_indicacoes),
            'receita_media_indicacao': receita_media,
            'taxa_retencao_indicados': (1 - churn_indicados) * 100,
            'taxa_retencao_geral': (1 - churn_geral) * 100,
            'membros_ativos_indicacao': membros_ativos.sort_values('indicacoes_feitas', ascending=False).to_dict('records'),
            'roi_indicacoes': roi_indicacoes,
            'recomendacoes_programa_indicacao': [
                f"Implementar programa de indicação com recompensa de R$ {int(custo_indicacao * 0.8)} " +
                f"já que o ROI é de {roi_indicacoes:.1f}%",
                f"Membros com mais de 3 indicações têm receita média de R$ {membros_ativos[membros_ativos['indicacoes_feitas'] > 2]['receita_total'].mean():,.2f}"
            ]
        }
    else:
        return {
            'indicacoes_identificadas': 0,
            'receita_media_indicacao': 0,
            'taxa_retencao_indicados': 0,
            'taxa_retencao_geral': 0,
            'membros_ativos_indicacao': [],
            'roi_indicacoes': 0,
            'recomendacoes_programa_indicacao': [
                "Implementar sistema formal de indicações com tracking por código único"
            ]
        }

# =====================================================================
# 32. INTEGRATION WITH GYM ANALYTICS SYSTEM - FINAL LAYER
# =====================================================================

def executar_analise_estatistica_completa(df_clientes, df_fluxo, df_funil=None):
    """
    Executa a análise estatística completa integrando todas as camadas anteriores
    """
    # Executa análises estatísticas
    churn_analysis = analise_estatistica_churn(df_clientes, df_fluxo)
    trend_forecast = prever_tendencias_membros(df_clientes, df_fluxo)
    ltv_model = calcular_ltv_estatistico(df_clientes, df_fluxo)
    bundling_analysis = analisar_bundling_produtos(df_clientes, df_fluxo)
    seasonality_analysis = decompor_sazonalidade(df_fluxo)
    clustering_analysis = segmentar_clientes_clusterizacao(df_clientes, df_fluxo)
    pricing_analysis = analisar_elasticidade_precos(df_clientes, df_fluxo)
    referral_analysis = analisar_rede_indicacoes(df_clientes, df_fluxo)

    # Prepara dados para o dashboard
    statistical_data = {
        'analise_churn': churn_analysis,
        'previsao_tendencias': trend_forecast,
        'modelo_ltv': ltv_model,
        'analise_bundling': bundling_analysis,
        'decomposicao_sazonal': seasonality_analysis,
        'segmentacao_cluster': clustering_analysis,
        'analise_precificacao': pricing_analysis,
        'rede_indicacoes': referral_analysis,
        'insights_prioritarios': {
            'oportunidades_imediatas': [
                f"Implementar programa de retenção para membros com frequência < 2x/semana (p={churn_analysis['testes_estatisticos']['frequencia_semanal']['p_value']:.4f})"
                if churn_analysis['testes_estatisticos']['frequencia_semanal']['significativo'] else "",

                f"Oferecer pacote combinado de '{bundling_analysis['regras_significativas'][0]['antecedente']}' e " +
                f"'{bundling_analysis['regras_significativas'][0]['consequente']}' (lift: {bundling_analysis['regras_significativas'][0]['lift']:.2f})"
                if bundling_analysis['regras_significativas'] else "",

                f"Promover contrato '{pricing_analysis['ponto_otimo_precificacao']}' como opção principal"
                if pricing_analysis['ponto_otimo_precificacao'] else ""
            ],
            'projetos_de_alto_impacto': [
                f"Implementar programa de indicação com ROI estimado de {referral_analysis['roi_indicacoes']:.1f}%"
                if referral_analysis['roi_indicacoes'] > 0 else "",

                f"Otimizar horários de pico identificados na análise sazonal ({', '.join(map(str, seasonality_analysis['componentes']['sazonalidade']['dias_pico']))})"
                if 'dias_pico' in seasonality_analysis['componentes']['sazonalidade'] else "",

                f"Desenvolver estratégia específica para o segmento '{clustering_analysis['caracteristicas_segmentos'][0]['nome']}' " +
                f"(maior receita média: R$ {clustering_analysis['caracteristicas_segmentos'][0]['receita_media']:,.2f})"
                if clustering_analysis['numero_segmentos'] > 0 else ""
            ],
            'metricas_criticas': {
                'churn_rate_estatistico': churn_analysis['testes_estatisticos']['dias_sem_sessao']['media_churn']
                    if 'dias_sem_sessao' in churn_analysis['testes_estatisticos'] else 0,
                'ltv_intervalo_confianca': f"R$ {ltv_model['ltv_ci_95'][0]:,.2f} - R$ {ltv_model['ltv_ci_95'][1]:,.2f}",
                'crescimento_previsto_6m': trend_forecast['tendencia']['projecao_6m']
            }
        }
    }

    return {
        'statistical_data': statistical_data,
        'get_statistical_churn': lambda: analise_estatistica_churn(df_clientes, df_fluxo),
        'get_trend_forecast': lambda: prever_tendencias_membros(df_clientes, df_fluxo),
        'get_ltv_model': lambda: calcular_ltv_estatistico(df_clientes, df_fluxo),
        'get_bundling_analysis': lambda: analisar_bundling_produtos(df_clientes, df_fluxo),
        'get_seasonality_analysis': lambda: decompor_sazonalidade(df_fluxo),
        'get_clustering_segmentation': lambda: segmentar_clientes_clusterizacao(df_clientes, df_fluxo),
        'get_pricing_analysis': lambda: analisar_elasticidade_precos(df_clientes, df_fluxo),
        'get_referral_analysis': lambda: analisar_rede_indicacoes(df_clientes, df_fluxo),
        'get_prioritized_insights': lambda: statistical_data['insights_prioritarios']
    }
