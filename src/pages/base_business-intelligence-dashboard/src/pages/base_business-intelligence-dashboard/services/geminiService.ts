import { GoogleGenAI } from "@google/genai";
import { AllData } from "./dataService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateInsights = async (data: AllData): Promise<string> => {
    try {
        const simplifiedData = {
            funnel: data.funnel.map(d => ({ stage: d.stage, value: d.value })),
            leadEvolution: data.leadEvolution,
            cashFlow: data.cashFlow,
            customerLTV: data.ltv,
            paymentRecurrence: data.recurrence,
        };

        const prompt = `
            You are a sharp and experienced business analyst for a fitness company called 'Calistenia & Escalada'.
            Analyze the following business dashboard data for the specified period, which is provided in JSON format.
            Your task is to provide a concise summary followed by three actionable insights to help management improve the business.
            The response should be in Portuguese (Brazil).
            Structure your response in Markdown with a main header, a summary section, and a numbered list for the actionable insights.

            Business Data:
            ${JSON.stringify(simplifiedData, null, 2)}

            **Análise de Desempenho**

            **Resumo:**
            [Forneça um breve resumo dos principais pontos dos dados, considerando o período analisado]

            **Insights Acionáveis:**
            1. [Insight 1: Identifique uma oportunidade ou problema e sugira uma ação clara e específica.]
            2. [Insight 2: Identifique uma oportunidade ou problema e sugira uma ação clara e específica.]
            3. [Insight 3: Identifique uma oportunidade ou problema e sugira uma ação clara e específica.]
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating insights:", error);
        if (error instanceof Error) {
            return `Error communicating with AI service: ${error.message}`;
        }
        return "An unknown error occurred while generating insights.";
    }
};
