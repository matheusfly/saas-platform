import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import re
from sklearn.preprocessing import LabelEncoder
import calendar

# =====================================================================
# 19. GYM-SPECIFIC DATA PROCESSING FOR YOUR ACTUAL SCHEMA
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
        df['inicio'] = pd.to_datetime(df['inicio'], errors='coerce')

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
        df['vencimento'] = pd.to_datetime(df['vencimento'], errors='coerce')

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
# 20. SPECIALIZED GYM METRICS FOR YOUR DATA STRUCTURE
# =====================================================================

def calcular_metricas_ativacao(df_clientes, df_fluxo):
    """
    Calcula métricas de ativação de novos membros com base na estrutura real dos dados
    """
    # Processa dados
    clientes = processar_dados_reais_clientes(df_clientes)
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    # Calcula tempo para primeira sessão
    if not fluxo.empty and 'vencimento' in fluxo.columns and 'codigo' in fluxo.columns and 'inicio' in clientes.columns:
        # Identifica primeira data de vencimento por cliente
        primeira_sessao = fluxo.groupby('codigo')['vencimento'].min().reset_index()
        primeira_sessao.columns = ['codigo', 'primeira_sessao']

        # Junta com dados de clientes
        clientes = clientes.merge(primeira_sessao, on='codigo', how='left')

        # Calcula dias até a primeira sessão
        clientes['dias_ate_primeira_sessao'] = (clientes['primeira_sessao'] - clientes['inicio']).dt.days
    else:
        clientes['dias_ate_primeira_sessao'] = np.nan

    # Calcula taxa de ativação
    total_clientes = len(clientes)
    clientes_ativados = len(clientes[clientes['dias_ate_primeira_sessao'] <= 7])
    taxa_ativacao = (clientes_ativados / total_clientes * 100) if total_clientes > 0 else 0

    # Calcula por categoria de contrato
    if not fluxo.empty and 'categoria' in fluxo.columns:
        ativacao_por_categoria = []
        for categoria in fluxo['categoria'].unique():
            clientes_categoria = clientes[clientes['codigo'].isin(
                fluxo[fluxo['categoria'] == categoria]['codigo'].unique()
            )]
            total = len(clientes_categoria)
            ativados = len(clientes_categoria[clientes_categoria['dias_ate_primeira_sessao'] <= 7])
            taxa = (ativados / total * 100) if total > 0 else 0
            ativacao_por_categoria.append({
                'categoria': categoria,
                'total_clientes': total,
                'clientes_ativados': ativados,
                'taxa_ativacao': taxa
            })
    else:
        ativacao_por_categoria = []

    return {
        'taxa_ativacao_global': taxa_ativacao,
        'clientes_ativados': clientes_ativados,
        'total_clientes': total_clientes,
        'ativacao_por_categoria': ativacao_por_categoria,
        'distribuicao_tempo_ativacao': {
            'ate_1d': len(clientes[clientes['dias_ate_primeira_sessao'] <= 1]),
            '1_3d': len(clientes[(clientes['dias_ate_primeira_sessao'] > 1) & (clientes['dias_ate_primeira_sessao'] <= 3)]),
            '3_7d': len(clientes[(clientes['dias_ate_primeira_sessao'] > 3) & (clientes['dias_ate_primeira_sessao'] <= 7)]),
            'acima_7d': len(clientes[clientes['dias_ate_primeira_sessao'] > 7])
        }
    }

def analisar_ciclo_vida_real(df_clientes, df_fluxo):
    """
    Analisa o ciclo de vida do cliente com base na estrutura real dos dados
    """
    # Processa dados
    clientes = processar_dados_reais_clientes(df_clientes)
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    # Calcula receita por cliente
    if not fluxo.empty and 'codigo' in fluxo.columns and 'valor_final' in fluxo.columns:
        receita_cliente = fluxo.groupby('codigo')['valor_final'].sum().reset_index()
        receita_cliente.columns = ['codigo', 'receita_total']

        # Junta com dados de clientes
        clientes = clientes.merge(receita_cliente, on='codigo', how='left')
    else:
        clientes['receita_total'] = 0

    # Calcula LTV
    clientes['ltv_estimado'] = clientes['receita_total'] * 1.5  # Fator de multiplicação simplificado

    # Cria faixas de tempo
    if 'idade_contrato' in clientes.columns:
        clientes['faixa_tempo'] = pd.cut(
            clientes['idade_contrato'],
            bins=[0, 1, 3, 6, 12, 100],
            labels=['<1m', '1-3m', '3-6m', '6-12m', '12+m']
        )
    else:
        clientes['faixa_tempo'] = 'N/A'

    # Calcula churn por faixa de tempo
    if 'faixa_tempo' in clientes.columns and 'churn_potencial' in clientes.columns:
        churn_por_tempo = clientes.groupby('faixa_tempo').agg(
            total_clientes=('codigo', 'count'),
            churn_clientes=('churn_potencial', 'sum'),
            receita_media=('receita_total', 'mean'),
            ltv_medio=('ltv_estimado', 'mean')
        ).reset_index()
        churn_por_tempo['taxa_churn'] = churn_por_tempo['churn_clientes'] / churn_por_tempo['total_clientes'] * 100
    else:
        churn_por_tempo = pd.DataFrame()

    # Identifica pontos críticos
    if not churn_por_tempo.empty and not churn_por_tempo['taxa_churn'].isna().all():
        churn_por_tempo['delta_churn'] = churn_por_tempo['taxa_churn'].diff()
        idx = churn_por_tempo['delta_churn'].idxmax()
        if pd.notna(idx):
            ponto_critico = churn_por_tempo.loc[idx, 'faixa_tempo']
            maior_aumento_churn = churn_por_tempo['delta_churn'].max()
        else:
            ponto_critico = None
            maior_aumento_churn = 0
    else:
        ponto_critico = None
        maior_aumento_churn = 0

    return {
        'churn_por_tempo': churn_por_tempo.to_dict('records'),
        'ponto_critico': ponto_critico,
        'maior_aumento_churn': maior_aumento_churn
    }

def calcular_metricas_gympass(df_fluxo):
    """
    Calcula métricas específicas para contratos GYMPASS
    """
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    # Filtra apenas contratos GYMPASS
    gympass = fluxo[fluxo['contrato'].str.contains('GYMPASS', na=False, case=False)].copy()

    if gympass.empty:
        return {
            'total_gympass': 0,
            'taxa_utilizacao': 0,
            'clientes_ativos': 0,
            'receita_mensal': 0
        }

    # Calcula métricas
    total_clientes = gympass['codigo'].nunique()

    # Calcula utilização (sessões por mês)
    if 'vencimento' in gympass.columns:
        gympass['mes'] = gympass['vencimento'].dt.to_period('M')
        utilizacao = gympass.groupby(['codigo', 'mes']).size().reset_index(name='sessoes')
        utilizacao_media = utilizacao['sessoes'].mean()
        clientes_por_sessao = utilizacao.groupby('sessoes').size().to_dict()
    else:
        utilizacao_media = 0
        clientes_por_sessao = {}

    # Calcula clientes ativos (com sessões nos últimos 30 dias)
    hoje = datetime.now()
    ativos = gympass[gympass['vencimento'] >= (hoje - timedelta(days=30))] if 'vencimento' in gympass.columns else pd.DataFrame()
    clientes_ativos = ativos['codigo'].nunique()

    # Calcula receita mensal (considerando que cada sessão tem valor fixo)
    receita_mensal = clientes_ativos * 30  # Valor hipotético por cliente

    return {
        'total_gympass': total_clientes,
        'taxa_utilizacao': utilizacao_media,
        'clientes_ativos': clientes_ativos,
        'receita_mensal': receita_mensal,
        'clientes_por_sessao': clientes_por_sessao
    }

# =====================================================================
# 21. ADVANCED RETENTION & CHURN PREDICTION FOR YOUR DATA
# =====================================================================

def prever_churn_avancado(df_clientes, df_fluxo):
    """
    Modelo avançado de previsão de churn usando a estrutura real dos dados
    """
    # Processa dados
    clientes = processar_dados_reais_clientes(df_clientes)
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    # Calcula frequência de uso
    if not fluxo.empty and 'codigo' in fluxo.columns and 'vencimento' in fluxo.columns:
        frequencia = fluxo.groupby('codigo').agg(
            total_sessoes=('vencimento', 'count'),
            dias_unicos=('vencimento', lambda x: x.dt.date.nunique())
        ).reset_index()

        # Frequência semanal
        hoje = datetime.now()
        frequencia['dias_ativos'] = (datetime.now() - fluxo['vencimento'].min()).days
        frequencia['frequencia_semanal'] = frequencia['total_sessoes'] / (frequencia['dias_ativos'] / 7)

        clientes = clientes.merge(frequencia, left_on='codigo', right_on='codigo', how='left')
    else:
        clientes['frequencia_semanal'] = 0

    # Calcula dias desde a última sessão
    if not fluxo.empty and 'codigo' in fluxo.columns and 'vencimento' in fluxo.columns:
        ultima_sessao = fluxo.groupby('codigo')['vencimento'].max().reset_index()
        ultima_sessao.columns = ['codigo', 'ultima_sessao']
        clientes = clientes.merge(ultima_sessao, on='codigo', how='left')

        clientes['dias_sem_sessao'] = (datetime.now() - clientes['ultima_sessao']).dt.days
    else:
        clientes['dias_sem_sessao'] = 0

    # Calcula probabilidade de churn
    clientes['prob_churn_30d'] = 0

    # Regra 1: Dias sem sessão
    clientes['prob_churn_30d'] += np.where(
        clientes['dias_sem_sessao'] > 14, 0.6,
        np.where(clientes['dias_sem_sessao'] > 7, 0.3, 0.1)
    )

    # Regra 2: Frequência de uso
    if 'frequencia_semanal' in clientes.columns:
        clientes['prob_churn_30d'] += np.where(
            clientes['frequencia_semanal'] < 1, 0.3,
            np.where(clientes['frequencia_semanal'] < 2, 0.1, 0)
        )

    # Regra 3: Idade do contrato
    if 'idade_contrato' in clientes.columns:
        clientes['prob_churn_30d'] = np.where(
            clientes['idade_contrato'] < 3,
            clientes['prob_churn_30d'] * 0.5,  # Menos churn no início
            clientes['prob_churn_30d']
        )

    # Limita entre 0 e 1
    clientes['prob_churn_30d'] = clientes['prob_churn_30d'].clip(0, 1)

    # Classifica risco
    clientes['risco_churn'] = np.select(
        [
            clientes['prob_churn_30d'] > 0.7,
            clientes['prob_churn_30d'] > 0.4,
            clientes['prob_churn_30d'] > 0.2
        ],
        [
            'Alto',
            'Médio',
            'Baixo-Médio'
        ],
        default='Baixo'
    )

    return clientes[[
        'codigo', 'cliente', 'prob_churn_30d', 'risco_churn',
        'dias_sem_sessao', 'frequencia_semanal', 'idade_contrato'
    ]]

def identificar_padroes_churn(df_clientes, df_fluxo):
    """
    Identifica padrões específicos de churn na sua base de dados
    """
    # Processa dados
    clientes = processar_dados_reais_clientes(df_clientes)
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    # Identifica clientes com churn
    churn_clientes = clientes[clientes['churn_potencial'] == 1].copy()

    if churn_clientes.empty:
        return {
            'padroes': [],
            'recomendacoes': []
        }

    # Calcula métricas antes do churn
    if not fluxo.empty and 'codigo' in fluxo.columns and 'vencimento' in fluxo.columns:
        # Calcula dias até o churn
        if 'vencimento' in churn_clientes.columns and 'inicio' in churn_clientes.columns:
            churn_clientes['dias_ate_churn'] = (churn_clientes['vencimento'] - churn_clientes['inicio']).dt.days
        else:
            churn_clientes['dias_ate_churn'] = 0

        # Calcula frequência antes do churn
        fluxo_churn = fluxo[fluxo['codigo'].isin(churn_clientes['codigo'])].copy()
        if not fluxo_churn.empty:
            fluxo_churn = fluxo_churn.merge(churn_clientes[['codigo', 'vencimento']], on='codigo', suffixes=('', '_cliente'))
            fluxo_churn['dias_antes_churn'] = (fluxo_churn['vencimento_cliente'] - fluxo_churn['vencimento']).dt.days

            # Filtra sessões nos últimos 30 dias antes do churn
            sessoes_pre_churn = fluxo_churn[fluxo_churn['dias_antes_churn'] <= 30]

            # Calcula frequência nos últimos 30 dias
            frequencia_pre_churn = sessoes_pre_churn.groupby('codigo').size().reset_index(name='sessoes_30d')
            churn_clientes = churn_clientes.merge(frequencia_pre_churn, on='codigo', how='left')
            churn_clientes['sessoes_30d'] = churn_clientes['sessoes_30d'].fillna(0)
        else:
            churn_clientes['sessoes_30d'] = 0
    else:
        churn_clientes['dias_ate_churn'] = 0
        churn_clientes['sessoes_30d'] = 0

    # Identifica padrões
    churn_clientes['padrao'] = np.select(
        [
            (churn_clientes['dias_ate_churn'] <= 30) & (churn_clientes['sessoes_30d'] == 0),
            (churn_clientes['dias_ate_churn'] <= 90) & (churn_clientes['sessoes_30d'] <= 2),
            (churn_clientes['dias_ate_churn'] > 90) & (churn_clientes['sessoes_30d'] <= 1)
        ],
        [
            'Nunca utilizou',
            'Baixo engajamento inicial',
            'Perda de interesse após período inicial'
        ],
        default='Padrão indefinido'
    )

    # Calcula estatísticas por padrão
    padroes = churn_clientes.groupby('padrao').agg(
        total_clientes=('codigo', 'count'),
        percentual=('codigo', lambda x: len(x) / len(churn_clientes) * 100 if len(churn_clientes) > 0 else 0),
        tempo_medio=('dias_ate_churn', 'mean')
    ).reset_index()

    # Gera recomendações
    recomendacoes = []
    for _, row in padroes.iterrows():
        if row['padrao'] == 'Nunca utilizou':
            recomendacoes.append(
                "Implementar programa de onboarding mais robusto com acompanhamento " +
                "nos primeiros 7 dias para novos membros"
            )
        elif row['padrao'] == 'Baixo engajamento inicial':
            recomendacoes.append(
                "Oferecer programa de 30 dias com sessões personalizadas " +
                "para membros com baixo engajamento nos primeiros meses"
            )
        elif row['padrao'] == 'Perda de interesse após período inicial':
            recomendacoes.append(
                "Implementar programa de reengajamento com desafios mensais " +
                "e recompensas para membros de longa data"
            )

    return {
        'padroes': padroes.to_dict('records'),
        'recomendacoes': list(set(recomendacoes))  # Remove duplicados
    }

# =====================================================================
# 22. PRODUCT & CONTRACT PERFORMANCE ANALYSIS
# =====================================================================

def analisar_desempenho_contratos(df_clientes, df_fluxo):
    """
    Analisa o desempenho de diferentes tipos de contratos na sua academia
    """
    # Processa dados
    clientes = processar_dados_reais_clientes(df_clientes)
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    if fluxo.empty:
        return pd.DataFrame()

    # Calcula métricas por contrato
    contrato_data = fluxo.groupby('contrato').agg(
        total_clientes=('codigo', 'nunique'),
        total_sessoes=('vencimento', 'count'),
        receita_total=('valor_final', 'sum')
    ).reset_index()

    # Calcula métricas adicionais
    contrato_data['receita_por_cliente'] = contrato_data['receita_total'] / contrato_data['total_clientes']
    contrato_data['sessoes_por_cliente'] = contrato_data['total_sessoes'] / contrato_data['total_clientes']

    # Junta com dados de churn
    if not clientes.empty and 'contrato' in fluxo.columns and 'churn_potencial' in clientes.columns:
        churn_por_contrato = clientes.merge(
            fluxo[['codigo', 'contrato']],
            left_on='codigo',
            right_on='codigo',
            how='inner'
        ).groupby('contrato').agg(
            churn_rate=('churn_potencial', 'mean')
        ).reset_index()

        contrato_data = contrato_data.merge(churn_por_contrato, on='contrato', how='left')
    else:
        contrato_data['churn_rate'] = 0

    # Calcula LTV estimado
    contrato_data['ltv_estimado'] = contrato_data['receita_por_cliente'] / contrato_data['churn_rate'] if 'churn_rate' in contrato_data.columns and contrato_data['churn_rate'].all() != 0 else 0

    # Classifica desempenho
    if 'receita_por_cliente' in contrato_data.columns and 'churn_rate' in contrato_data.columns:
        contrato_data['desempenho'] = np.select(
            [
                (contrato_data['receita_por_cliente'] > contrato_data['receita_por_cliente'].quantile(0.66)) &
                (contrato_data['churn_rate'] < contrato_data['churn_rate'].quantile(0.33)),

                (contrato_data['receita_por_cliente'] > contrato_data['receita_por_cliente'].quantile(0.33)) &
                (contrato_data['churn_rate'] < contrato_data['churn_rate'].quantile(0.66)),

                True
            ],
            [
                'Alto Valor',
                'Valor Médio',
                'Baixo Valor'
            ],
            default='N/A'
        )
    else:
        contrato_data['desempenho'] = 'N/A'

    return contrato_data.sort_values('receita_total', ascending=False)

def identificar_oportunidades_upsell_real(df_clientes, df_fluxo):
    """
    Identifica oportunidades de upsell específicas para sua base de dados
    """
    # Processa dados
    clientes = processar_dados_reais_clientes(df_clientes)
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    # Identifica clientes elegíveis para upsell
    if not fluxo.empty and 'codigo' in fluxo.columns and 'vencimento' in fluxo.columns:
        # Calcula frequência atual
        frequencia = fluxo.groupby('codigo').agg(
            total_sessoes=('vencimento', 'count'),
            dias_ativos=('vencimento', lambda x: (datetime.now() - x.min()).days)
        ).reset_index()
        frequencia['frequencia_semanal'] = frequencia['total_sessoes'] / (frequencia['dias_ativos'] / 7)

        clientes = clientes.merge(frequencia, left_on='codigo', right_on='codigo', how='left')

        # Calcula receita atual
        receita_cliente = fluxo.groupby('codigo')['valor_final'].sum().reset_index()
        receita_cliente.columns = ['codigo', 'receita_total']
        clientes = clientes.merge(receita_cliente, on='codigo', how='left')

        # Identifica clientes elegíveis
        clientes['upsell_eligivel'] = np.where(
            (clientes['frequencia_semanal'] >= 2) &
            (clientes['churn_potencial'] == 0) &
            (clientes['idade_contrato'] >= 2),
            1, 0
        )

        # Determina produto sugerido
        clientes['produto_sugerido'] = np.select(
            [
                (clientes['frequencia_semanal'] >= 2) & (clientes['frequencia_semanal'] < 3),
                (clientes['frequencia_semanal'] >= 3) & (clientes['frequencia_semanal'] < 5),
                clientes['frequencia_semanal'] >= 5
            ],
            [
                'Pacote 10x Aulas',
                'Plano Semestral',
                'Personal Trainer'
            ],
            default='Nenhum'
        )

        # Calcula potencial de receita
        clientes['potencial_upsell'] = np.where(
            clientes['upsell_eligivel'] == 1,
            clientes['receita_total'] * 0.5,  # Potencial de aumento de 50%
            0
        )
    else:
        clientes['frequencia_semanal'] = 0
        clientes['idade_contrato'] = 0
        clientes['produto_sugerido'] = 'Nenhum'
        clientes['potencial_upsell'] = 0

    return clientes[clientes.get('upsell_eligivel', pd.Series(0)) == 1].sort_values(
        'potencial_upsell', ascending=False
    )[[
        'codigo', 'cliente', 'frequencia_semanal', 'idade_contrato',
        'produto_sugerido', 'potencial_upsell'
    ]]

# =====================================================================
# 23. INTEGRATION WITH YOUR EXISTING GYM ANALYTICS SYSTEM
# =====================================================================

def preparar_dados_especificos_gym(df_clientes, df_fluxo, df_funil=None):
    """
    Prepara dados específicos para integração com seu sistema de analytics
    """
    # Processa dados
    clientes = processar_dados_reais_clientes(df_clientes)
    fluxo = processar_dados_reais_fluxo(df_fluxo)

    # Calcula métricas específicas
    metricas_ativacao = calcular_metricas_ativacao(df_clientes, df_fluxo)
    ciclo_vida = analisar_ciclo_vida_real(df_clientes, df_fluxo)
    metricas_gympass = calcular_metricas_gympass(df_fluxo)
    churn_prediction = prever_churn_avancado(df_clientes, df_fluxo)
    padroes_churn = identificar_padroes_churn(df_clientes, df_fluxo)
    desempenho_contratos = analisar_desempenho_contratos(df_clientes, df_fluxo)
    oportunidades_upsell = identificar_oportunidades_upsell_real(df_clientes, df_fluxo)

    # Prepara dados para o dashboard
    dashboard_data = {
        'resumo_executivo': {
            'kpis': {
                'taxa_ativacao': metricas_ativacao['taxa_ativacao_global'],
                'churn_30d_previsto': churn_prediction['prob_churn_30d'].mean() * 100,
                'clientes_upsell': len(oportunidades_upsell),
                'receita_upsell_potencial': oportunidades_upsell['potencial_upsell'].sum() if not oportunidades_upsell.empty else 0
            },
            'alertas': {
                'clientes_alto_risco': len(churn_prediction[churn_prediction['risco_churn'] == 'Alto']),
                'ponto_critico_churn': ciclo_vida['ponto_critico'],
                'contrato_menos_rentavel': desempenho_contratos.iloc[-1]['contrato'] if not desempenho_contratos.empty else 'N/A'
            }
        },
        'analise_ativacao': metricas_ativacao,
        'ciclo_vida': ciclo_vida,
        'metricas_gympass': metricas_gympass,
        'churn_prediction': churn_prediction,
        'padroes_churn': padroes_churn,
        'desempenho_contratos': desempenho_contratos.to_dict('records'),
        'oportunidades_upsell': oportunidades_upsell.to_dict('records') if not oportunidades_upsell.empty else []
    }

    return dashboard_data

def executar_pipeline_completo_especifico(df_clientes, df_fluxo, df_funil=None):
    """
    Executa o pipeline completo com foco nos dados específicos da sua academia
    """
    # Prepara dados
    dashboard_data = preparar_dados_especificos_gym(df_clientes, df_fluxo, df_funil)

    # Calcula KPIs estratégicos
    kpis = {
        'taxa_ativacao': dashboard_data['analise_ativacao']['taxa_ativacao_global'],
        'churn_rate': dashboard_data['ciclo_vida']['churn_por_tempo'][0]['taxa_churn'] if dashboard_data['ciclo_vida']['churn_por_tempo'] else 0,
        'frequencia_media': dashboard_data['churn_prediction']['frequencia_semanal'].mean(),
        'ltv_medio': dashboard_data['desempenho_contratos'][0]['ltv_estimado'] if dashboard_data['desempenho_contratos'] else 0,
        'clientes_upsell': len(dashboard_data['oportunidades_upsell'])
    }

    # Define OKRs
    okrs = {
        'ativacao': {
            'titulo': 'Melhorar taxa de ativação de novos membros',
            'meta': 70,
            'realizado': kpis['taxa_ativacao'],
            'status': 'Atingido' if kpis['taxa_ativacao'] >= 70 else 'Em Progresso'
        },
        'retencao': {
            'titulo': 'Reduzir churn nos primeiros 3 meses',
            'meta': 15,
            'realizado': dashboard_data['ciclo_vida']['churn_por_tempo'][1]['taxa_churn'] if len(dashboard_data['ciclo_vida']['churn_por_tempo']) > 1 else 0,
            'status': 'Atingido' if (dashboard_data['ciclo_vida']['churn_por_tempo'][1]['taxa_churn'] if len(dashboard_data['ciclo_vida']['churn_por_tempo']) > 1 else 100) <= 15 else 'Em Progresso'
        },
        'upsell': {
            'titulo': 'Aumentar conversão de upsell',
            'meta': 30,
            'realizado': (kpis['clientes_upsell'] / len(dashboard_data['churn_prediction'])) * 100 if len(dashboard_data['churn_prediction']) > 0 else 0,
            'status': 'Atingido' if ((kpis['clientes_upsell'] / len(dashboard_data['churn_prediction'])) * 100 if len(dashboard_data['churn_prediction']) > 0 else 0) >= 30 else 'Em Progresso'
        }
    }

    return {
        'dashboard_data': dashboard_data,
        'kpis': kpis,
        'okrs': okrs,
        'get_metricas_ativacao': lambda: calcular_metricas_ativacao(df_clientes, df_fluxo),
        'get_ciclo_vida': lambda: analisar_ciclo_vida_real(df_clientes, df_fluxo),
        'get_churn_prediction': lambda: prever_churn_avancado(df_clientes, df_fluxo),
        'get_padroes_churn': lambda: identificar_padroes_churn(df_clientes, df_fluxo),
        'get_desempenho_contratos': lambda: analisar_desempenho_contratos(df_clientes, df_fluxo),
        'get_oportunidades_upsell': lambda: identificar_oportunidades_upsell_real(df_clientes, df_fluxo)
    }

# Exemplo de uso com os dados reais
if __name__ == "__main__":
    # Em produção, você carregaria os dados assim:
    # df_clientes = pd.read_excel('clientes.xlsx')
    # df_fluxo = pd.read_excel('fluxo_caixa.xlsx')

    # Para demonstração, usaremos os dados do knowledge base (simplificado)
    print("=== ANALISANDO DADOS DA SUA ACADEMIA ===")

    # Simulando carregamento dos dados
    df_clientes = pd.DataFrame({
        'Código': [448, 715, 442, 465, 469],
        'Cliente': ['KLEBER KLINGER DE OLIVEIRA MEDEIROS', 'Kleber William', 'LAILA LIMA', 'LAIRANNE VALVERDE', 'LAIRANNE VALVERDE'],
        'Cliente desde': ['13/03/2025', '27/06/2025', '21/03/2025', '20/03/2025', '21/03/2025'],
        'Status atual': ['Cancelado', 'Ativo', 'Bloqueado', 'Cancelado', 'Cancelado'],
        'Continuidade (meses)': [1, 2, 3, 1, 1],
        'Contratos': [13, 1, 37, 1, 1]
    })

    df_fluxo = pd.DataFrame({
        'Código': [382, 382, 382, 784, 784],
        'Nome': ['ARTHUR IGOR CRUZ LIMA', 'ARTHUR IGOR CRUZ LIMA', 'ARTHUR IGOR CRUZ LIMA', 'Erica Melo Marques', 'Erica Melo Marques'],
        'Status Cliente': ['Bloqueado', 'Bloqueado', 'Bloqueado', 'Bloqueado', 'Bloqueado'],
        'Contrato': ['GYMPASS - PASSE PADRÃO', 'GYMPASS - PASSE PADRÃO', 'GYMPASS - PASSE PADRÃO', 'GYMPASS - PASSE PADRÃO', 'GYMPASS - PASSE PADRÃO'],
        'Status Contrato': ['Finalizado', 'Finalizado', 'Finalizado', 'Finalizado', 'Finalizado'],
        'Convênio': ['-', '-', '-', '-', '-'],
        'Desconto': ['-', '-', '-', '-', '-'],
        'Valor Contrato': ['000', '000', '000', '000', '000'],
        'Descontos': ['000', '000', '000', '000', '000'],
        'Valor Final': ['000', '000', '000', '000', '000'],
        'Vencimento': ['23/04/2025', '24/04/2025', '25/04/2025', '16/07/2025', '18/07/2025']
    })

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

    if 'ponto_critico' in gym_analysis['dashboard_data']['resumo_executivo']['alertas'] and gym_analysis['dashboard_data']['resumo_executivo']['alertas']['ponto_critico'] == '1-3m':
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
