import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Customer, GeminiInsight, StrategicInsight, CustomerStatus } from "../types";

// Assume API_KEY is set in the environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

const insightSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "Um resumo breve e perspicaz do status e da atividade recente do cliente em 1-2 frases."
        },
        risk_level: {
            type: Type.STRING,
            enum: ['Baixo', 'Médio', 'Alto'],
            description: "O nível de risco de cancelamento (churn) potencial para este cliente."
        },
        suggested_actions: {
            type: Type.ARRAY,
            items: { 
                type: Type.STRING 
            },
            description: "Dois próximos passos concisos e acionáveis para engajar com este cliente (ex: 'Oferecer um desconto de fidelidade', 'Enviar um e-mail de acompanhamento sobre a última compra')."
        }
    },
    required: ["summary", "risk_level", "suggested_actions"]
};

const strategicInsightSchema = {
    type: Type.OBJECT,
    properties: {
        trends: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            },
            description: "Identifique 1-2 tendências principais do resumo de dados de clientes fornecido. Por exemplo: 'Um número significativo de novos clientes está em risco.'"
        },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            },
            description: "Forneça 2-3 recomendações estratégicas de alto nível com base nas tendências identificadas. Por exemplo: 'Desenvolver uma campanha de integração direcionada para novos usuários.'"
        }
    },
    required: ["trends", "recommendations"]
}

export const createCustomerChatSession = (customer: Customer): Chat => {
    const { name, status, totalSpend, lastSeen, joinDate } = customer;
    const systemInstruction = `
        Você é um assistente de CRM (Customer Relationship Management) inteligente, prestativo e amigável.
        Sua tarefa é fornecer insights e responder a perguntas sobre um cliente específico com base nos dados fornecidos.
        Seja sempre conciso e direto ao ponto. Responda em português.
        
        DADOS DO CLIENTE ATUAL:
        - Nome: ${name}
        - Status: ${status}
        - Gasto Total: R$${totalSpend}
        - Visto por Último: ${lastSeen}
        - Data de Cadastro: ${joinDate}

        Não mencione que você tem esses dados, apenas os use para responder às perguntas.
        Por exemplo, se o usuário perguntar "qual o status dele?", responda apenas "${status}".
    `;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        },
    });
    return chat;
};


export const generateStrategicInsights = async (customers: Customer[]): Promise<StrategicInsight> => {
    // Create a summary of the customer data to send to the model
    const totalCustomers = customers.length;
    const statusCounts = customers.reduce((acc, customer) => {
        acc[customer.status] = (acc[customer.status] || 0) + 1;
        return acc;
    }, {} as Record<CustomerStatus, number>);

    const prompt = `
        Analise o seguinte resumo de um banco de dados de clientes. Com base nesses dados, forneça as principais tendências e recomendações estratégicas em português.
        
        Resumo dos Dados:
        - Total de Clientes: ${totalCustomers}
        - Clientes Ativos: ${statusCounts.Ativo || 0}
        - Clientes em Risco: ${statusCounts['Em Risco'] || 0}
        - Clientes Cancelados: ${statusCounts.Cancelado || 0}
        - Novos Clientes: ${statusCounts.Novo || 0}
        - Métricas de receita total e outras métricas financeiras não são fornecidas, foque na distribuição de status dos clientes.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: strategicInsightSchema,
            }
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        const strategicInsights: StrategicInsight = {
            trends: parsedJson.trends,
            recommendations: parsedJson.recommendations,
        };

        return strategicInsights;

    } catch (error) {
        console.error("Error generating strategic insights from Gemini:", error);
        throw new Error("Falha ao gerar insights estratégicos.");
    }
};