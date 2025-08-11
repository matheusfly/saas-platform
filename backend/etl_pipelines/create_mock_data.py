import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def create_mock_data():
    # Create clientes.xlsx
    clientes_data = {
        'codigo': [f'C{i:03d}' for i in range(1, 101)],
        'Cliente': [f'Cliente {i}' for i in range(1, 101)],
        'Cliente desde': [datetime.now() - timedelta(days=np.random.randint(30, 365)) for _ in range(100)],
        'Status atual': np.random.choice(['Ativo', 'Inativo', 'Bloqueado', 'Cancelado', 'Excluído'], 100, p=[0.6, 0.1, 0.1, 0.1, 0.1]),
        'Continuidade (meses)': np.random.randint(1, 24, 100),
        'Contratos': np.random.randint(1, 5, 100),
        'professor': np.random.choice(['Prof. A', 'Prof. B', 'Prof. C', 'Prof. D'], 100),
        'status_venda': np.random.choice(['Convertido', 'Não Convertido'], 100, p=[0.8, 0.2]),
    }
    clientes_df = pd.DataFrame(clientes_data)
    with pd.ExcelWriter('clientes.xlsx') as writer:
        clientes_df.to_excel(writer, sheet_name='clientes_ativos', index=False)

    # Create fluxo_caixa.xlsx
    fluxo_data = {
        'Código': np.random.choice(clientes_df['codigo'], 200),
        'Nome': [f'Cliente {i}' for i in np.random.choice(range(1, 101), 200)],
        'Status Cliente': np.random.choice(['Ativo', 'Inativo', 'Bloqueado'], 200),
        'Contrato': np.random.choice(['GYMPASS - PASSE PADRÃO', 'CALISTENIA MENSAL 5X', 'FISIO 1X', 'EXPERIMENTAL'], 200),
        'Status Contrato': np.random.choice(['Ativo', 'Vencido', 'Cancelado'], 200),
        'Convênio': '-',
        'Desconto': '0',
        'Valor Contrato': np.random.uniform(50, 200, 200).astype(str),
        'Descontos': '0',
        'Valor Final': np.random.uniform(50, 200, 200).astype(str),
        'Vencimento': [datetime.now() + timedelta(days=np.random.randint(-30, 30)) for _ in range(200)],
        'tipo': np.random.choice(['Contrato', 'Avulso'], 200, p=[0.8, 0.2]),
        'status': np.random.choice(['Quitada', 'Em aberto'], 200, p=[0.9, 0.1]),
    }
    fluxo_df = pd.DataFrame(fluxo_data)
    with pd.ExcelWriter('fluxo_caixa.xlsx') as writer:
        fluxo_df.to_excel(writer, sheet_name='vendas_totais', index=False)

    # Create funil_vendas.xlsx
    funil_data = {
        'codigo': np.random.choice(clientes_df['codigo'], 150),
        'cliente': [f'Cliente {i}' for i in np.random.choice(range(1, 101), 150)],
        'contrato': np.random.choice(['GYMPASS - PASSE PADRÃO', 'CALISTENIA MENSAL 5X', 'FISIO 1X', 'EXPERIMENTAL'], 150),
        'inicio': [datetime.now() - timedelta(days=np.random.randint(30, 365)) for _ in range(150)],
        'vencimento': [datetime.now() + timedelta(days=np.random.randint(0, 90)) for _ in range(150)],
        'status_contrato': np.random.choice(['Ativo', 'Vencido', 'Cancelado'], 150, p=[0.6, 0.3, 0.1]),
        'valor': np.random.uniform(50, 200, 150),
        'status_cliente': np.random.choice(['Ativo', 'Inativo', 'Bloqueado', 'Prospect', 'Cliente Pass'], 150, p=[0.5, 0.1, 0.1, 0.2, 0.1]),
    }
    funil_df = pd.DataFrame(funil_data)
    with pd.ExcelWriter('funil_vendas.xlsx') as writer:
        funil_df.to_excel(writer, sheet_name='250', index=False)

    # Create fato_checkins.xlsx
    checkins_data = {
        'id_cliente': np.random.choice(range(100), 500),
        'data': [datetime.now() - timedelta(days=np.random.randint(0, 365), hours=np.random.randint(0, 24)) for _ in range(500)],
        'horario': [np.random.randint(6, 22) for _ in range(500)],
        'frequencia_semanal': np.random.uniform(0, 5, 500),
        'total_sessoes': np.random.randint(1, 20, 500),
        'nivel_engajamento': np.random.choice(['Baixo', 'Médio-Baixo', 'Médio', 'Alto'], 500),
        'consistencia': np.random.uniform(0, 1, 500),
    }
    checkins_df = pd.DataFrame(checkins_data)
    with pd.ExcelWriter('fato_checkins.xlsx') as writer:
        checkins_df.to_excel(writer, index=False)

if __name__ == '__main__':
    create_mock_data()
