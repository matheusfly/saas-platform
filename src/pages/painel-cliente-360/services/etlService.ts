import { Customer } from '../types';

interface EtlResult {
    addedCustomers: Customer[];
    summary: string;
}

/**
 * Simula um pipeline de ETL (Extract, Transform, Load) para a ingestão de dados de clientes.
 */
const etlService = {
    /**
     * Executa o pipeline: limpa, valida e carrega novos clientes, evitando duplicatas.
     * @param newBatch Lote de novos clientes a serem processados.
     * @param existingCustomers A lista atual de clientes para verificação de duplicatas.
     * @returns Um objeto com os clientes adicionados e um resumo do processo.
     */
    runPipeline: (newBatch: Customer[], existingCustomers: Customer[]): EtlResult => {
        const existingEmails = new Set(existingCustomers.map(c => c.email.toLowerCase()));
        const addedCustomers: Customer[] = [];
        
        let addedCount = 0;
        let duplicateCount = 0;
        let invalidCount = 0;

        for (const customer of newBatch) {
            // Transform
            const cleanedName = customer.name.trim();
            const cleanedEmail = customer.email.trim().toLowerCase();

            // Validate
            if (!cleanedName || !cleanedEmail) {
                invalidCount++;
                continue;
            }

            if (existingEmails.has(cleanedEmail)) {
                duplicateCount++;
                continue;
            }

            // Load
            const processedCustomer = {
                ...customer,
                name: cleanedName,
                email: cleanedEmail,
            };
            
            addedCustomers.push(processedCustomer);
            existingEmails.add(cleanedEmail); // Evita duplicatas dentro do mesmo lote
            addedCount++;
        }

        const failedCount = duplicateCount + invalidCount;
        let summary = `${addedCount} adicionado(s).`;
        if (failedCount > 0) {
            summary += ` ${failedCount} falhou(aram) (${duplicateCount} duplicado(s), ${invalidCount} inválido(s)).`
        }

        return {
            addedCustomers,
            summary,
        };
    }
};

export default etlService;
