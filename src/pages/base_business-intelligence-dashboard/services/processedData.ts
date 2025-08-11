// This file simulates a processed database based on the provided OLAP data model.
// It acts as the single source of truth for the dashboard.

// Helper to generate random dates
const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const today = new Date();
const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));

// --- DIMENSION TABLES ---

export const DimUsuario = [
  { id: 1, nome: 'Ana Silva', email: 'ana.silva@example.com' },
  { id: 2, nome: 'Bruno Costa', email: 'bruno.costa@example.com' },
  { id: 3, nome: 'Carlos Dias', email: 'carlos.dias@example.com' },
];

export const DimEmpresa = [
  { id: 1, nome_empresa: 'Tech Solutions', segmento: 'Tecnologia' },
  { id: 2, nome_empresa: 'Health Inc.', segmento: 'Saúde' },
  { id: 3, nome_empresa: 'Market Masters', segmento: 'Marketing' },
  { id: 4, nome_empresa: 'Build Corp', segmento: 'Construção' },
  { id: 5, nome_empresa: 'Foodies', segmento: 'Alimentos' },
  { id: 6, nome_empresa: 'LogiFast', segmento: 'Logística' },
  { id: 7, nome_empresa: 'EducaMais', segmento: 'Educação' },
  { id: 8, nome_empresa: 'FinPro', segmento: 'Financeiro' },
  { id: 9, nome_empresa: 'Venda Certa', segmento: 'Varejo' },
  { id: 10, nome_empresa: 'Agro Forte', segmento: 'Agronegócio' },
];

export const DimPessoa = Array.from({ length: 150 }, (_, i) => ({
  id: i + 1,
  nome: `Pessoa Contato ${i + 1}`,
  empresa_id: (i % 10) + 1,
}));

export const DimEstagio = [
  { id: 1, estagio_nome: 'Prospect', ordem: 1 },
  { id: 2, estagio_nome: 'Qualificação', ordem: 2 },
  { id: 3, estagio_nome: 'Proposta', ordem: 3 },
  { id: 4, estagio_nome: 'Negociação', ordem: 4 },
  { id: 5, estagio_nome: 'Ganho', ordem: 5 },
  { id: 6, estagio_nome: 'Perdido', ordem: 6 },
];

export const DimOrigem = [
  { id: 1, origem_nome: 'Website' },
  { id: 2, origem_nome: 'Indicação' },
  { id: 3, origem_nome: 'Evento' },
  { id: 4, origem_nome: 'Parceiros' },
];

// --- FACT TABLES ---

// FatoOportunidades
export const FatoOportunidades = Array.from({ length: 100 }, (_, i) => {
  const data_criacao = generateRandomDate(oneYearAgo, today);
  const won = Math.random() > 0.4; // 60% win rate for closed deals
  const closed = Math.random() > 0.3; // 70% of deals are closed
  
  let stage_id;
  let data_encerramento;

  if (closed) {
    stage_id = won ? 5 : 6; // Ganho or Perdido
    data_encerramento = generateRandomDate(data_criacao, today);
  } else {
    stage_id = Math.floor(Math.random() * 4) + 1; // Stages 1 to 4 (Prospect to Negociação)
    data_encerramento = undefined;
  }
  
  return {
    id: i + 1, // This represents deal_id
    company_id: (i % 10) + 1,
    person_id: (i % 150) + 1,
    user_id: (i % 3) + 1,
    data_criacao,
    data_encerramento,
    stage_id,
    valor: (Math.random() * 5000) + 500, // Opportunity value
    origem_id: (i % 4) + 1,
  };
});

// FatoMovimentacoes
export const FatoMovimentacoes: {id: number, deal_id: number, out_stage_id: number, in_stage_id: number, user_id: number, data_entrada: Date, data_saida: Date}[] = [];
FatoOportunidades.forEach(opp => {
    let currentStage = 1;
    let currentDate = new Date(opp.data_criacao.getTime());

    while (currentStage < opp.stage_id && currentStage < 5) { // Stop before Ganho/Perdido
        const nextStage = currentStage + 1;
        // Ensure entry date is after creation and adds some time
        const entryDate = new Date(currentDate.getTime() + (Math.random() * 30 * 24 * 60 * 60 * 1000));
        const exitDate = new Date(entryDate.getTime());
        
        FatoMovimentacoes.push({
            id: FatoMovimentacoes.length + 1,
            deal_id: opp.id,
            out_stage_id: currentStage,
            in_stage_id: nextStage,
            user_id: opp.user_id,
            data_entrada: entryDate,
            data_saida: exitDate,
        });
        currentDate = exitDate;
        currentStage = nextStage;
    }
});

// FatoAtividades
export const FatoAtividades = Array.from({ length: 300 }, (_, i) => {
  const deal_id = (i % 100) + 1;
  const opp = FatoOportunidades.find(o => o.id === deal_id)!;
  const data_criacao = generateRandomDate(opp.data_criacao, opp.data_encerramento || today);
  return {
    id: i + 1,
    deal_id,
    user_id: opp.user_id,
    data_criacao,
    data_realizada: new Date(data_criacao.getTime() + (Math.random() * 24 * 60 * 60 * 1000)), // Realizada shortly after creation
    tipo_atividade: ['email', 'call', 'meeting'][i % 3],
  };
});

// FatoFinanceiro
type PaymentMethod = 'dinheiro' | 'pix' | 'cartao' | 'boleto';
const paymentMethods: PaymentMethod[] = ['dinheiro', 'pix', 'cartao', 'boleto'];

const wonOpportunities = FatoOportunidades.filter(opp => opp.stage_id === 5); // Only won opportunities generate revenue

export const FatoFinanceiro = wonOpportunities.map((opp, i) => {
    const status = Math.random() > 0.05 ? 'sucesso' : 'falha'; // 95% success rate for payments
    return {
      id: i + 1,
      empresa_id: opp.company_id,
      data: opp.data_encerramento!,
      valor: opp.valor,
      tipo: 'entrada' as 'entrada' | 'saida',
      // Fields added to support existing charts that expect them
      metodo: paymentMethods[i % paymentMethods.length],
      status: status as 'sucesso' | 'falha',
    };
  });

// Also add some 'saida' (expenses) for cash flow realism
const saidas = Array.from({length: 50}, (_, i) => {
  return {
      id: FatoFinanceiro.length + i + 1,
      empresa_id: null,
      data: generateRandomDate(oneYearAgo, today),
      valor: (Math.random() * 2000) + 100,
      tipo: 'saida' as 'saida',
      metodo: null,
      status: 'sucesso' as 'sucesso'
  }
})

// Using push correctly to modify the array
saidas.forEach(saida => FatoFinanceiro.push(saida as any));
