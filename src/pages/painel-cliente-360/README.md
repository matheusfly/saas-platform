
# Painel Cliente 360 - Dashboard de Inteligência de Clientes

O **Painel Cliente 360** é um dashboard interativo e moderno construído para fornecer uma visão completa e estratégica dos clientes de uma empresa. Ele combina visualização de dados, gerenciamento de informações e insights baseados em Inteligência Artificial para capacitar equipes a tomar decisões proativas e melhorar o engajamento do cliente.

A aplicação foi desenvolvida com React, TypeScript e Tailwind CSS, e utiliza a API do Google Gemini para funcionalidades avançadas de IA.

## Tech Stack

*   **Frontend:** [React](https://reactjs.org/)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
*   **Roteamento:** [React Router](https://reactrouter.com/)
*   **Inteligência Artificial:** [Google Gemini API](https://ai.google.dev/)
*   **Ícones:** SVGs customizados e [Font Awesome](https://fontawesome.com/)

## ✨ Principais Funcionalidades

*   **Dashboard Interativo:** Visualize KPIs e a saúde da sua base de clientes em uma interface limpa e moderna.
*   **UI Profissional com Skeleton Loading:** Uma experiência de carregamento suave que mostra placeholders de conteúdo em vez de um spinner de página inteira.
*   **Filtragem Dinâmica:** Filtre a lista de clientes clicando no gráfico de status para uma análise focada.
*   **Tabela de Clientes Virtualizada e de Alta Performance:** Uma lista rolável e ordenável que renderiza apenas os itens visíveis, garantindo performance com milhares de registros.
*   **Chat com IA por Cliente:** Inicie uma conversa com um assistente de IA (Gemini) para obter uma análise detalhada, nível de risco e ações sugeridas para qualquer cliente.
*   **Insights Estratégicos com IA:** Gere tendências e recomendações para toda a base de clientes com um único clique.
*   **Segmentação de Clientes com IA:** Agrupe automaticamente seus clientes em personas significativas, como "Campeões de Engajamento" ou "Gigantes Adormecidos".
*   **Previsão de Churn com IA:** Identifique os clientes com maior probabilidade de churn e suas respectivas probabilidades, permitindo ações de retenção proativas.
*   **Gerenciamento de Dados:** Simule o upload de arquivos de dados com um pipeline ETL que limpa, valida e carrega novos clientes, prevenindo duplicatas.
*   **Design Responsivo:** A interface se adapta perfeitamente a diferentes tamanhos de tela.

---

## 🏛️ Arquitetura e Componentes

A aplicação é construída sobre uma arquitetura modular e escalável, centrada em componentes reutilizáveis e gerenciamento de estado desacoplado.

### Diagrama Arquitetural

Este diagrama ilustra como os dados fluem do nosso serviço de API, através do `DataContext` centralizado, e para os componentes da UI, que renderizam skeletons durante o carregamento.

```mermaid
graph TD
    subgraph "Camada de Dados"
        API[apiService.ts]
    end

    subgraph "Gerenciamento de Estado Global"
        CTX[DataContext.tsx]
        CTX -- Fetches Data --> API
    end

    subgraph "Camada de Orquestração"
        App[App.tsx]
        App -- Consumes --> CTX
        DP[DashboardPage.tsx]
        App -- Routes to --> DP
    end
    
    subgraph "Camada de UI (Componentes)"
        Header[Header.tsx]
        Table[CustomerTable.tsx]
        FS[FinancialSummary.tsx]
        Chart[CustomerStatusChart.tsx]
        AIWidgets[AI Widgets]
        Skeletons[common/SkeletonLoader.tsx]
    end

    App -- Controls --> Header
    DP -- Lays out --> Table & FS & Chart & AIWidgets

    DP -- Passes 'loading' state --> Skeletons

    style API fill:#656B4B,stroke:#B0D236,stroke-width:2px
    style CTX fill:#4F512D,stroke:#B0D236,stroke-width:2px
    style App fill:#31331c,stroke:#BDB58A,stroke-width:1px
    style DP fill:#31331c,stroke:#BDB58A,stroke-width:1px
```

### Component Breakdown

| Componente                    | Diretório           | Responsabilidade                                                                                     |
| ----------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------- |
| **`App.tsx`**                 | `/`                 | Orquestrador principal. Gerencia rotas e o estado da busca.                                          |
| **`index.tsx`**               | `/`                 | Ponto de entrada da aplicação. Renderiza o `App` dentro dos provedores de Contexto e Roteador.       |
| **`DataContext.tsx`**         | `contexts/`         | **Fonte da Verdade.** Gerencia o estado global dos clientes (lista, loading, erro) e expõe via `useData`. |
| **`Header.tsx`**              | `components/`       | Barra de navegação, logo e campo de busca global.                                                    |
| **`DashboardPage.tsx`**       | `components/`       | Layout principal da dashboard. Orquestra a exibição dos widgets através de abas. |
| **`CustomerTable.tsx`**       | `components/`       | Exibe a tabela de clientes virtualizada e ordenável. Renderiza `SkeletonDivTable` durante o carregamento.   |
| **`StrategicInsights.tsx`**   | `components/`       | Card que busca e exibe insights estratégicos da API Gemini. Possui seu próprio estado de loading.   |
| **`CustomerSegmentation.tsx`**| `components/`       | Exibe personas de clientes geradas por IA. |
| **`ChurnPrediction.tsx`**     | `components/`       | Exibe uma lista de clientes com alto risco de churn previsto pela IA. |
| **`DataManagement.tsx`**      | `components/`       | Gerencia o upload de dados e exibe o histórico de processamento do ETL.                              |
| **`Modal.tsx`**               | `components/common/`| Componente de modal genérico e reutilizável.                                                         |
| **`SkeletonLoader.tsx`**      | `components/common/`| Contém os componentes de "skeleton" (placeholders de carregamento) para a UI.                        |

---

## ⚡ Otimizações de Performance

Para garantir que a aplicação seja rápida e responsiva, mesmo com grandes volumes de dados, foram implementadas otimizações chave.

### Tabela Virtualizada com `react-window`

*   **Problema:** Renderizar uma tabela com milhares de linhas cria milhares de nós no DOM, tornando a aplicação lenta.
*   **Solução:** A virtualização. Renderizamos apenas os itens que estão atualmente visíveis na tela.

```mermaid
graph TD
    subgraph "DOM (Navegador Renderiza)"
        direction LR
        A[Item Visível 2]
        B[Item Visível 3]
        C[Item Visível 4]
    end
    subgraph "Viewport (Área Visível na Tela)"
        style Viewport fill:none,stroke:#B0D236,stroke-width:3px,stroke-dasharray: 5 5
        A
        B
        C
    end
    subgraph "Memória (React State)"
        direction LR
        subgraph "Array de Dados Completo"
            Z1[Item 1]
            Z2[Item 2]
            Z3[Item 3]
            Z4[Item 4]
            Z5[...]
            Z6[Item 10.000]
        end
    end
    
    Z2 -- Renderizado --> A
    Z3 -- Renderizado --> B
    Z4 -- Renderizado --> C

    Z1 -- Em Memória, Não Renderizado --> Z1
    Z5 -- Em Memória, Não Renderizado --> Z5
    Z6 -- Em Memória, Não Renderizado --> Z6
```

### Memoização com `React.memo` e `useCallback`

*   **Problema:** Em React, quando o estado de um componente pai muda, todos os seus filhos são re-renderizados por padrão, mesmo que suas props não mudem.
*   **Solução:** `useCallback` para memorizar funções e `React.memo` para envolver componentes, prevenindo re-renderizações desnecessárias.

```mermaid
graph TD
    subgraph "Antes da Otimização"
        AppState["App State Muda"] --> AppRender{"App Re-renderiza"}
        AppRender --> DBRender{"DashboardPage Re-renderiza"}
        DBRender --> WidgetRender{"Widget Re-renderiza"}
    end
    subgraph "Depois da Otimização"
        AppStateOpt["App State Muda"] --> AppRenderOpt{"App Re-renderiza"}
        AppRenderOpt --> DBRenderOpt{"DashboardPage Re-renderiza"}
        note["Props para o Widget não mudaram.
        <b>React.memo previne o re-render</b>"]
        DBRenderOpt -.-> note
        note -.-> WidgetNoRender["Widget NÃO re-renderiza"]
    end
    
    style WidgetRender fill:#C75450, color:#1E1E1E
    style WidgetNoRender fill:#B0D236, color:#1E1E1E
```

---

## 🧠 Estruturas de Dados e Mapeamento

A aplicação é fortemente tipada com TypeScript para garantir a integridade dos dados.

### A Interface `Customer`

```typescript
export interface Customer {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: CustomerStatus; // Enum: 'Ativo', 'Cancelado', 'Em Risco', 'Novo'
  totalSpend: number;
  lastSeen: string;
  joinDate: string;
}
```

### Mapeamento: De Dados à UI

Um único objeto `Customer` alimenta múltiplos componentes, garantindo consistência:

```mermaid
graph LR
    subgraph "Data Object"
        Customer["{ id: 1, name: 'Elena', ... }"]
    end

    subgraph "UI Components"
        A[Table Row]
        B[Chat Modal Title]
        C[Recent Signups List]
        D[Status Chart Count]
        E[Churn Prediction List]
    end

    Customer -- .name, .email, .avatar, .status --> A
    Customer -- .name --> B
    Customer -- .name, .avatar --> C
    Customer -- .status --> D
    Customer -- .id, .name, .avatar --> E


    style Customer fill:#B0D236,stroke:#1E1E1E,color:#1E1E1E
```

### Pipeline de ETL Visualizado

O `etlService` garante que apenas dados limpos e únicos entrem na aplicação.

```mermaid
sequenceDiagram
    participant Upload as User Upload
    participant ETL as etlService.runPipeline()
    participant Existing as Existing Data (Set)
    participant Output as Final Result

    Upload ->> ETL: Envia newBatch (array de clientes)
    loop Para cada `customer` no Lote
        ETL ->> ETL: 1. Limpa (trim) nome e email
        ETL ->> ETL: 2. Valida (verifica se nome/email existem)
        alt Se inválido
            ETL ->> Output: Incrementa `invalidCount`
        else
            ETL ->> Existing: 3. Verifica duplicata (email existe?)
            alt Se duplicado
                 ETL ->> Output: Incrementa `duplicateCount`
            else
                 ETL ->> Output: 4. Adiciona à `addedCustomers`
                 ETL ->> Existing: Adiciona novo email ao Set
            end
        end
    end
    ETL -->> Output: Retorna { addedCustomers, summary }
```

---

## 🛠️ Guias "How-To"

### Como Adicionar um Novo Campo (ex: `priority`)

Este guia mostra como estender a aplicação com um novo campo de dados.

1.  **Atualize o Tipo (`types.ts`):**
    Adicione o novo campo à interface `Customer`.

    ```typescript
    export interface Customer {
      // ... campos existentes
      priority: 'Baixa' | 'Média' | 'Alta';
    }
    ```

2.  **Atualize os Dados Mock (`data/customers.json`):**
    Adicione o novo campo aos seus dados de exemplo.

    ```json
    { "id": 1, ..., "priority": "Alta" }
    ```

3.  **Adicione à UI (`components/CustomerTable.tsx`):**
    a. Adicione o cabeçalho da nova coluna.
    b. Adicione a célula (`<div>`) para renderizar o novo dado na `Row` do componente.

    ```tsx
    // Adicionar ao cabeçalho
    <div className="w-1/6 ...">Prioridade</div>

    // Adicionar à célula na linha da tabela
    <div className="w-1/6 ...">{customer.priority}</div>
    ```

4.  **Atualize o ETL (`services/etlService.ts`):**
    Se o novo campo precisar de validação ou limpeza, adicione a lógica ao pipeline. Caso contrário, ele será incluído automaticamente.

---

## 🗺️ Roadmap para Produção

Esta aplicação tem uma base sólida. Os próximos passos para um ambiente de produção real envolvem mover a lógica para um backend.

### Arquitetura Alvo

```mermaid
graph TD
    Client[Browser: React App]
    LB[Load Balancer]
    API_Server[API Server (Node.js/Python/Go)]
    DB[(Database: PostgreSQL/MongoDB)]
    
    Client -- HTTPS Request --> LB
    LB -- Forwards --> API_Server
    API_Server -- CRUD Operations --> DB
    
    subgraph "Backend (AWS/GCP/Azure)"
        direction LR
        API_Server -- Caches Data --> Cache[Redis]
        API_Server -- Securely Calls --> Gemini[Gemini API]
    end

    style Client fill:#BDB58A,stroke:#1E1E1E
    style API_Server fill:#4F512D,stroke:#B0D236
    style DB fill:#656B4B,stroke:#B0D236
```

### Passos Estratégicos

1.  **Backend API:**
    *   Desenvolver uma API REST ou GraphQL.
    *   **Endpoints:**
        *   `GET /api/customers`: Com paginação, ordenação e filtragem no servidor.
        *   `POST /api/customers/upload`: Para receber arquivos CSV/XLS e iniciar o pipeline ETL no backend.
        *   `POST /api/customers/:id/chat`: Para interagir com a Gemini API de forma segura.
        *   `GET /api/ai/insights`: Para gerar insights estratégicos.
        *   `GET /api/ai/segmentation`: Para gerar segmentação de clientes.
        *   `GET /api/ai/churn-prediction`: Para gerar previsões de churn.

2.  **Banco de Dados:**
    *   Migrar `customers.json` para um banco de dados como PostgreSQL.
    *   **Schema `customers`:** Indexar campos frequentemente consultados como `email` e `status`.

3.  **Segurança e Performance:**
    *   **Mover a Chave de API:** A chamada para a API Gemini **DEVE** ser feita a partir do backend para proteger a chave.
    *   **Autenticação:** Implementar autenticação de usuário (ex: JWT, OAuth).
    *   **Cache:** Implementar cache (ex: Redis) para endpoints de leitura pesada.

4.  **DevOps:**
    *   **CI/CD:** Configurar um pipeline para build, teste e deploy automáticos.
    *   **Monitoramento:** Integrar ferramentas de monitoramento de performance e erros.

## 🚀 Como Executar

1.  **API Key:** O projeto requer uma chave de API do Google Gemini. Esta chave deve ser configurada como uma variável de ambiente chamada `API_KEY`. O código (`geminiService.ts`) já está preparado para lê-la de `process.env.API_KEY`.
2.  **Servidor Local:** Sirva os arquivos estáticos (`index.html`, `index.tsx`, etc.) a partir de um servidor web local. A maioria das ferramentas de desenvolvimento frontend (como Vite ou `live-server` do npm) faz isso automaticamente.
3.  **Navegador:** Abra o `index.html` no seu navegador. A aplicação será carregada e estará pronta para uso.
