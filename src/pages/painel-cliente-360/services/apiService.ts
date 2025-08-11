import { Customer } from '../types';

// Em uma aplicação real, esta URL viria de uma variável de ambiente.
const API_BASE_URL = '.'; 

/**
 * Lida com a resposta de uma chamada de API, tratando erros de rede.
 * @param response A resposta da API.
 * @returns A resposta em JSON.
 */
const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
        throw new Error(`Erro de Rede: ${response.status} ${response.statusText}`);
    }
    return response.json();
};

/**
 * Objeto de serviço que encapsula todas as chamadas de API da aplicação.
 * Isso desacopla a lógica de acesso a dados dos componentes da UI.
 */
const apiService = {
    customers: {
        /**
         * Busca a lista completa de clientes.
         * Simula uma chamada para GET /api/customers
         * @returns Uma promessa que resolve para um array de Clientes.
         */
        getAll: async (): Promise<Customer[]> => {
            try {
                const response = await fetch(`${API_BASE_URL}/data/customers.json`);
                return await handleApiResponse(response);
            } catch (error) {
                console.error("Falha ao buscar todos os clientes:", error);
                throw new Error("Não foi possível carregar a lista de clientes do servidor.");
            }
        },

        /**
         * Busca um novo lote de clientes (para simular o upload de arquivo).
         * Simula uma chamada para GET /api/customers/new-batch ou similar.
         * @returns Uma promessa que resolve para um array de novos Clientes.
         */
        fetchNewBatch: async (): Promise<Customer[]> => {
            try {
                const response = await fetch(`${API_BASE_URL}/data/new_customers.json`);
                return await handleApiResponse(response);
            } catch (error) {
                console.error("Falha ao buscar novos clientes:", error);
                throw new Error("Não foi possível carregar o lote de novos clientes do servidor.");
            }
        }
    },
    // Outros serviços, como 'business' ou 'nfe' do seu exemplo, poderiam ser adicionados aqui.
    // Exemplo:
    // business: {
    //   getHealthData: async () => { ... }
    // }
};

export default apiService;