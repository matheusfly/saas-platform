# Business Intelligence Dashboard

This project provides an interactive Business Intelligence Dashboard for "Calistenia & Escalada," offering data-driven insights powered by AI. It visualizes key metrics related to sales, finance, opportunities, conversions, and productivity.

## Technical Architecture

The dashboard is a frontend application built with React and Vite. It consumes data from internal services that simulate a processed OLAP data model. AI integration is handled through dedicated service modules.

### Data Flow

1.  **Data Source (Simulated):** The `processedData.ts` file acts as the single source of truth, simulating dimension and fact tables. **Currently, this data is mock data generated within the file and does not read from external `.xlsx` files directly.** In a real-world scenario, an ETL pipeline would process raw data (e.g., from `.xlsx` files in `@backend/datasets`) and populate a database or data warehouse, which `processedData.ts` would then query or receive data from.
2.  **Data Transformation:** The `dataService.ts` module retrieves and transforms this processed data into a format suitable for the various charts and components across the dashboard.
3.  **Frontend Visualization:** React components in the `components/` directory consume the prepared data from `dataService.ts` and render interactive charts and KPIs using the Recharts and D3.js libraries.
4.  **AI Integration:** `geminiService.ts` and `qwenService.ts` facilitate interaction with external AI models (Gemini and Qwen) to generate business insights based on the dashboard's data.

### Frontend Components

The application is structured into several React components, each responsible for a specific part of the dashboard:

*   **`App.tsx`**: The main application component, handling page navigation, global filter state, and data fetching.
*   **`Sidebar.tsx`**: Navigation component for switching between different dashboard pages.
*   **`FilterControls.tsx`**: Component for applying date range filters to the displayed data.
*   **`Dashboard.tsx`**: The main commercial overview page, displaying high-level KPIs and core charts.
*   **`VendasPage.tsx`**: Focuses on sales analysis, including sales ranking and revenue by origin.
*   **`OpportunitiesPage.tsx`**: Displays insights related to sales opportunities, such as open opportunities by stage and time since update.
*   **`ConversionsPage.tsx`**: Visualizes conversion funnels and stage entries.
*   **`FinancialPage.tsx`**: Presents financial metrics, cash flow, and revenue vs. expenses.
*   **`StrategicPage.tsx`**: Offers strategic insights like LTV, CAC, and cohort analysis.
*   **`ProductivityPage.tsx`**: Analyzes user and team productivity, including activity heatmaps and sales cycle data.
*   **`AdvancedAnalyticsPage.tsx`**: Provides deeper analytical views, including advanced funnels, cohort analysis, and revenue analysis.
*   **`PredictiveAnalyticsPage.tsx`**: Features predictive models for revenue and LTV forecasting.
*   **`SettingsPage.tsx`**: Allows for application settings and data export functionalities.
*   **`BusinessAssistant.tsx`**: An AI-powered chat assistant for querying dashboard data.
*   **`InsightsPanel.tsx`**: Generates AI-driven insights based on the current dashboard data.
*   **`ChartCard.tsx`**: A reusable wrapper component for displaying charts with a consistent title and styling.
*   **`ClientLifetimeValueCard.tsx`**: A reusable component for displaying key client-related metrics.
*   **`KeyMetricCard.tsx`**: A reusable component for displaying general key performance indicators.
*   **`EnhancedKpiCard.tsx`**: An enhanced reusable component for displaying KPIs with trend indicators and icons.
*   **`PerformanceSummary.tsx`**: Displays a summary of performance metrics with status indicators.
*   **`ProductivityAnalysisPage.tsx`**: Provides detailed productivity analysis charts.
*   **`ProductivityStorytellingDashboard.tsx`**: Presents productivity data in a narrative format, including timelines and collaboration networks.
*   **`SalesFunnelAnalysisPage.tsx`**: Offers in-depth analysis of the sales funnel, conversion rates, and sales cycle.

### Data Structures

This section details the primary data structures used throughout the application, defined in `types.ts` and `processedData.ts`.

#### Dimension Tables (`processedData.ts`)

These tables represent static or slowly changing attributes used to categorize and filter data.

*   **`DimUsuario`**: 
    *   `id`: Unique identifier for the user.
    *   `nome`: User's name.
    *   `email`: User's email address.
*   **`DimEmpresa`**: 
    *   `id`: Unique identifier for the company.
    *   `nome_empresa`: Company name.
    *   `segmento`: Industry segment of the company.
*   **`DimPessoa`**: 
    *   `id`: Unique identifier for the person (contact).
    *   `nome`: Person's name.
    *   `empresa_id`: Foreign key referencing `DimEmpresa`.
*   **`DimEstagio`**: 
    *   `id`: Unique identifier for the stage.
    *   `estagio_nome`: Name of the stage (e.g., 'Prospect', 'Qualificação').
    *   `ordem`: Order of the stage in a sequence.
*   **`DimOrigem`**: 
    *   `id`: Unique identifier for the origin.
    *   `origem_nome`: Name of the origin (e.g., 'Website', 'Indicação').

#### Fact Tables (`processedData.ts`)

These tables contain the core metrics and foreign keys to dimension tables.

*   **`FatoOportunidades`**: Represents sales opportunities.
    *   `id`: Unique identifier for the deal/opportunity.
    *   `company_id`: Foreign key referencing `DimEmpresa`.
    *   `person_id`: Foreign key referencing `DimPessoa`.
    *   `user_id`: Foreign key referencing `DimUsuario`.
    *   `data_criacao`: Date of opportunity creation.
    *   `data_encerramento`: Date of opportunity closure (if closed).
    *   `stage_id`: Foreign key referencing `DimEstagio`.
    *   `valor`: Value of the opportunity.
    *   `origem_id`: Foreign key referencing `DimOrigem`.
*   **`FatoMovimentacoes`**: Tracks movements between stages for opportunities.
    *   `id`: Unique identifier for the movement.
    *   `deal_id`: Foreign key referencing `FatoOportunidades`.
    *   `out_stage_id`: Stage exited.
    *   `in_stage_id`: Stage entered.
    *   `user_id`: User responsible for the movement.
    *   `data_entrada`: Date of entry into the new stage.
    *   `data_saida`: Date of exit from the previous stage.
*   **`FatoAtividades`**: Records activities related to opportunities.
    *   `id`: Unique identifier for the activity.
    *   `deal_id`: Foreign key referencing `FatoOportunidades`.
    *   `user_id`: User who performed the activity.
    *   `data_criacao`: Date of activity creation.
    *   `data_realizada`: Date the activity was performed.
    *   `tipo_atividade`: Type of activity (e.g., 'email', 'call', 'meeting').
*   **`FatoFinanceiro`**: Contains financial transaction data.
    *   `id`: Unique identifier for the financial record.
    *   `empresa_id`: Foreign key referencing `DimEmpresa` (can be null for general expenses).
    *   `data`: Date of the financial transaction.
    *   `valor`: Amount of the transaction.
    *   `tipo`: Type of transaction ('entrada' for income, 'saida' for expense).
    *   `metodo`: Payment method (e.g., 'dinheiro', 'pix', 'cartao', 'boleto').
    *   `status`: Status of the transaction ('sucesso', 'falha').

#### Core Data Interfaces (`types.ts`)

These interfaces define the structure of data used by various charts and components.

*   **`FunnelData`**: Represents a stage in a conversion funnel.
    *   `stage`: Name of the funnel stage.
    *   `value`: Numeric value for the stage (e.g., number of leads).
    *   `label`: Display label for the stage.
    *   `percentage`: Percentage relative to the initial stage.
    *   `avgDealSize?`: Optional average deal size for this stage.
    *   `count?`: Optional count for this stage.
    *   `avgDaysToConvert?`: Optional average days to convert for this stage.
*   **`LeadEvolutionData`**: Tracks the evolution of leads, conversions, and cancellations over time.
    *   `date`: Date of the data point.
    *   `leads`: Number of new leads.
    *   `conversions`: Number of conversions.
    *   `cancellations`: Number of cancellations.
*   **`CashFlowData`**: Represents cash flow by payment method over time.
    *   `date`: Date of the cash flow record.
    *   `dinheiro`: Cash amount.
    *   `pix`: PIX amount.
    *   `cartao`: Credit card amount.
    *   `boleto`: Boleto amount.
*   **`RevenueExpenseData`**: Details revenue, expenses, and net profit over time.
    *   `date`: Date of the record.
    *   `revenue`: Total revenue.
    *   `expenses`: Total expenses.
    *   `net`: Net profit (revenue - expenses).
*   **`LtvData`**: Lifetime Value data, categorized by tiers.
    *   `tier`: LTV tier (e.g., 'High', 'Medium', 'Low').
    *   `ltv`: Lifetime Value amount.
*   **`CheckInData`**: Data related to client check-ins and value paid.
    *   `frequency`: Check-in frequency.
    *   `valuePaid`: Total value paid.
*   **`RecurrenceData`**: Payment recurrence data (success vs. failed).
    *   `month`: Month of the data.
    *   `success`: Number of successful recurring payments.
    *   `failed`: Number of failed recurring payments.
*   **`OpenOppsByStageData`**: Open opportunities categorized by stage.
    *   `stage`: Name of the opportunity stage.
    *   `value`: Value of opportunities in this stage.
*   **`OppsTimeSinceUpdateData`**: Opportunities categorized by time since last update.
    *   `category`: Time category (e.g., '<7 days', '7-30 days').
    *   `value`: Number of opportunities in this category.
*   **`OppsByOriginData`**: Opportunities categorized by their origin.
    *   `origin`: Source of the opportunity.
    *   `value`: Value of opportunities from this origin.
*   **`StageEntryData`**: Entry data for each stage.
    *   `stage`: Name of the stage.
    *   `value`: Number of entries into this stage.
*   **`FunnelDropOffData`**: Data on lead drop-off between funnel stages.
    *   `stage`: Name of the stage.
    *   `dropped`: Number of leads dropped at this stage.
    *   `total`: Total leads entering this stage.
*   **`CohortData`**: Client retention data by cohort.
    *   `cohort`: Cohort identifier (e.g., '2023-01').
    *   `size`: Size of the cohort.
    *   `values`: Array of retention percentages for subsequent months.
        *   `month`: Month number relative to cohort creation (0-indexed).
        *   `percentage`: Retention percentage for that month.
*   **`UserPerformanceData`**: Performance metrics for users.
    *   `subject`: Metric name (e.g., 'Leads', 'Activities', 'Ganhos').
    *   `[key: string]`: Dynamic keys for user names, holding their performance value for the subject.
*   **`WeeklyActivityData`**: Activity data aggregated by day and hour.
    *   `day`: Day of the week.
    *   `hour`: Hour of the day.
    *   `value`: Activity value (e.g., productivity score).
*   **`SalesCycleBoxPlotData`**: Sales cycle distribution data for a user.
    *   `user`: User's name.
    *   `min`: Minimum sales cycle days.
    *   `q1`: First quartile of sales cycle days.
    *   `median`: Median sales cycle days.
    *   `q3`: Third quartile of sales cycle days.
    *   `max`: Maximum sales cycle days.
    *   `outliers`: Array of outlier sales cycle days.
*   **`ActivitiesByTypeData`**: Distribution of activities by type.
    *   `name`: Type of activity (e.g., 'Email', 'Ligações').
    *   `value`: Count of activities of this type.
*   **`SalesRankingData`**: Sales performance ranking by user.
    *   `user`: User's name.
    *   `revenue`: Total revenue generated by the user.
*   **`RevenueByOriginData`**: Revenue distribution by origin.
    *   `origin`: Source of revenue.
    *   `revenue`: Total revenue from this origin.
*   **`DateRange` (type alias)**: `'1m' | '3m' | '6m' | 'all'` - predefined date range strings.
*   **`FilterState`**: Represents the current filtering state of the dashboard.
    *   `dateRange`: The selected date range for filtering.
*   **`ChatMessage`**: Structure for chat messages in the AI assistant.
    *   `role`: Role of the message sender ('user' or 'model').
    *   `content`: The message text.

#### New Analytics Types (`types.ts`)

These interfaces define more advanced analytical data structures.

*   **`RfmData`**: RFM (Recency, Frequency, Monetary) segmentation data.
    *   `customerId`: Unique identifier for the customer.
    *   `customerName`: Name of the customer.
    *   `recency`: Days since last purchase.
    *   `frequency`: Number of purchases.
    *   `monetary`: Total amount spent.
    *   `rfmScore`: RFM score (1-5).
    *   `segment`: Customer segment based on RFM (e.g., 'Loyal Customers').
*   **`ChurnRiskData`**: Data related to customer churn risk.
    *   `customerId`: Unique identifier for the customer.
    *   `customerName`: Name of the customer.
    *   `daysSinceLastActivity`: Days since the customer's last activity.
    *   `recentActivityCount`: Number of recent activities.
    *   `riskScore`: Churn risk score (0-100).
    *   `riskLevel`: Churn risk level ('Low', 'Medium', 'High').
*   **`WinLossAnalysisData`**: Analysis of won vs. lost deals.
    *   `userId`: Unique identifier for the user.
    *   `userName`: Name of the user.
    *   `won`: Number of won deals.
    *   `lost`: Number of lost deals.
    *   `total`: Total deals.
    *   `winRate`: Win rate percentage.
    *   `performance`: Performance level ('Low', 'Medium', 'High').
*   **`DealSizeDistributionData`**: Distribution of deal sizes.
    *   `min`: Minimum deal size in the range.
    *   `max`: Maximum deal size in the range.
    *   `average`: Average deal size in the range.
    *   `median`: Median deal size in the range.
    *   `distribution`: Percentage distribution across 10 buckets.
*   **`RevenueForecastData`**: Forecasted revenue data.
    *   `date`: Date of the forecast.
    *   `actual`: Actual revenue (if available).
    *   `forecast`: Forecasted revenue.
    *   `lowerBound`: Lower bound of the confidence interval.
    *   `upperBound`: Upper bound of the confidence interval.
*   **`ExpenseBreakdownData`**: Breakdown of expenses by category.
    *   `category`: Expense category.
    *   `amount`: Amount spent.
    *   `percentage`: Percentage of total expenses.
    *   `trend`: Percentage change from the previous period.
*   **`ProductPerformanceData`**: Performance metrics for products.
    *   `productId`: Unique identifier for the product.
    *   `productName`: Name of the product.
    *   `revenue`: Total revenue from the product.
    *   `quantity`: Quantity sold.
    *   `profit`: Profit generated.
    *   `margin`: Profit margin percentage.
    *   `growth`: Percentage growth from the previous period.
*   **`ProductAffinityData`**: Data on product affinity (which products are bought together).
    *   `productA`: Name of the first product.
    *   `productB`: Name of the second product.
    *   `support`: Percentage of transactions containing both products.
    *   `confidence`: Probability that product B is purchased when product A is purchased.
    *   `lift`: How much more likely B is purchased when A is purchased.
*   **`ActivityEffectivenessData`**: Effectiveness of different activity types.
    *   `activityType`: Type of activity.
    *   `count`: Number of activities of this type.
    *   `conversionRate`: Percentage of activities leading to the next stage.
    *   `avgDaysToConvert`: Average days to convert after this activity.
    *   `valueGenerated`: Total value from converted opportunities linked to this activity.
*   **`ResponseTimeImpactData`**: Impact of response time on conversions.
    *   `responseTime`: Response time category (e.g., '<1h', '1-4h').
    *   `count`: Number of interactions in this category.
    *   `conversionRate`: Conversion rate for this response time.
    *   `avgDealSize`: Average deal size for this response time.
    *   `avgCycleTime`: Average cycle time in days.

#### Main Dashboard Data Type (`dataService.ts`)

*   **`AllData`**: The comprehensive data structure passed to the main dashboard components.
    *   `dateRange`: The date range applied to the data.
    *   `revenueExpense`: Array of `RevenueExpenseData`.
    *   `openOppsByStage`: Array of `OpenOppsByStageData`.
    *   `oppsTimeSinceUpdate`: Array of `OppsTimeSinceUpdateData`.
    *   `oppsByOrigin`: Array of `OppsByOriginData`.
    *   `stageEntry`: Array of `StageEntryData`.
    *   `funnelDropOff`: Array of `FunnelDropOffData`.
    *   `cohort`: Array of `CohortData`.
    *   `userPerformance`: Array of `UserPerformanceData`.
    *   `weeklyActivity`: Array of `WeeklyActivityData`.
    *   `salesCycleBoxPlot`: Array of `SalesCycleBoxPlotData`.
    *   `activitiesByType`: Array of `ActivitiesByTypeData`.
    *   `salesRanking`: Array of `SalesRankingData`.
    *   `revenueByOrigin`: Array of `RevenueByOriginData`.
    *   `rfmData`: Array of `RfmData`.
    *   `churnRisk`: Array of `ChurnRiskData`.
    *   `productPerformance`: Array of `ProductPerformanceData`.
    *   `activityEffectiveness`: Array of `ActivityEffectivenessData`.
    *   `responseTimeImpact`: `ResponseTimeImpactData` object.
    *   `dealSizeDistribution`: Array of `DealSizeDistributionData`.
    *   `metrics`: Object containing various key performance indicators.
        *   `totalRevenue`: Total revenue.
        *   `totalExpenses`: Total expenses.
        *   `netRevenue`: Net revenue.
        *   `newClientCount`: Number of new clients.
        *   `averageLtv`: Average customer lifetime value.
        *   `conversionRate`: Overall conversion rate.
        *   `paymentSuccessRate`: Rate of successful payments.
        *   `averageTicket`: Average transaction value.
        *   `cac`: Customer Acquisition Cost.
        *   `roi`: Return on Investment.
        *   `monthlyChurnRate`: Monthly churn rate.
        *   `dataQualityScore`: Score indicating data integrity.
        *   `totalOpportunities`: Total number of opportunities.
        *   `openOpportunities`: Number of open opportunities.
        *   `wonOpportunities`: Number of won opportunities.
        *   `lostOpportunities`: Number of lost opportunities.
    *   `rawData`: Object containing raw data from fact tables.
        *   `opportunities`: Raw opportunity data.
        *   `financials`: Raw financial data.
        *   `activities`: Raw activity data.
    *   `lastUpdated`: Timestamp of the last data update.

### Functions Reference

This section outlines the key functions within the service modules.

#### `dataService.ts` Functions

This module is responsible for processing and aggregating data for the dashboard.

*   **`parseDateRange(range: DateRangeInput): DateRange`**
    *   **Description**: Helper function to convert a date range string (e.g., '3m', 'all') or a `DateRange` object into a standardized `DateRange` object with `start` and `end` Date objects.
    *   **Parameters**: 
        *   `range`: `DateRangeInput` - The input date range, can be a string ('1m', '3m', '6m', 'all') or an object `{ start: Date, end: Date }`.
    *   **Returns**: `DateRange` - An object with `start` and `end` Date objects.
*   **`getMonthYearLabel(date: Date): string`**
    *   **Description**: Helper function to format a Date object into a "Month 'YY" string (e.g., "Jan '24").
    *   **Parameters**: 
        *   `date`: `Date` - The date to format.
    *   **Returns**: `string` - The formatted month and year string.
*   **`getMonthsForRange(range: DateRangeInput): string[]`**
    *   **Description**: Helper function to generate an array of month-year labels for a given date range.
    *   **Parameters**: 
        *   `range`: `DateRangeInput` - The date range to generate labels for.
    *   **Returns**: `string[]` - An array of formatted month-year strings.
*   **`getRevenueExpenseData(start: Date, end: Date): RevenueExpenseData[]`**
    *   **Description**: Generates revenue and expense data aggregated by month for a specified period. It processes `FatoFinanceiro` to calculate monthly revenues, expenses, and net profit.
    *   **Parameters**: 
        *   `start`: `Date` - The start date of the period.
        *   `end`: `Date` - The end date of the period.
    *   **Returns**: `RevenueExpenseData[]` - An array of objects containing date, revenue, expenses, and profit for each month.
*   **`getFunnelDropOffData(start: Date, end: Date): FunnelDropOffData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve data for funnel drop-off analysis.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `FunnelDropOffData[]`
*   **`getCohortData(start: Date, end: Date): CohortData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve cohort analysis data.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `CohortData[]`
*   **`getOpenOppsByStageData(start: Date, end: Date): OpenOppsByStageData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve data on open opportunities by stage.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `OpenOppsByStageData[]`
*   **`getOppsTimeSinceUpdateData(start: Date, end: Date): OppsTimeSinceUpdateData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve data on opportunities categorized by time since last update.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `OppsTimeSinceUpdateData[]`
*   **`getOppsByOriginData(start: Date, end: Date): OppsByOriginData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve data on opportunities by their origin.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `OppsByOriginData[]`
*   **`getStageEntryData(start: Date, end: Date): StageEntryData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve data on entries into each stage.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `StageEntryData[]`
*   **`getUserPerformanceData(start: Date, end: Date): UserPerformanceData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve user performance data.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `UserPerformanceData[]`
*   **`getSalesCycleBoxPlotData(start: Date, end: Date): SalesCycleBoxPlotData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve sales cycle box plot data.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `SalesCycleBoxPlotData[]`
*   **`getActivitiesByTypeData(start: Date, end: Date): ActivitiesByTypeData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve activity distribution by type.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `ActivitiesByTypeData[]`
*   **`getSalesRankingData(start: Date, end: Date): SalesRankingData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve sales ranking data.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `SalesRankingData[]`
*   **`getRevenueByOriginData(start: Date, end: Date): RevenueByOriginData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve revenue by origin data.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `RevenueByOriginData[]`
*   **`getRfmData(start: Date, end: Date): RfmData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve RFM (Recency, Frequency, Monetary) data.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `RfmData[]`
*   **`getChurnRiskData(start: Date, end: Date): ChurnRiskData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve churn risk data.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `ChurnRiskData[]`
*   **`getProductPerformanceData(start: Date, end: Date): ProductPerformanceData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve product performance data.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `ProductPerformanceData[]`
*   **`getActivityEffectivenessData(start: Date, end: Date): ActivityEffectivenessData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve activity effectiveness data.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `ActivityEffectivenessData[]`
*   **`getWeeklyActivityData(start: Date, end: Date): WeeklyActivityData[]`**
    *   **Description**: (Stub Implementation) Placeholder function to retrieve weekly activity heatmap data.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `WeeklyActivityData[]`
*   **`getResponseTimeImpactData(start: Date, end: Date): ResponseTimeImpactData`**
    *   **Description**: Provides mock data for the impact of response time on conversions. In a real scenario, this would be calculated from actual interaction data.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `ResponseTimeImpactData` - Object containing response time brackets, average response time, conversion rate by hour, response time by stage, and average cycle time.
*   **`getDealSizeDistributionData(start: Date, end: Date): DealSizeDistributionData[]`**
    *   **Description**: Provides mock data for deal size distribution across predefined ranges.
    *   **Parameters**: `start: Date`, `end: Date`
    *   **Returns**: `DealSizeDistributionData[]` - Array of objects detailing deal size ranges and associated metrics (currently mocked to zeros).
*   **`getAllData(dateRange: DateRangeInput = '3m'): AllData`**
    *   **Description**: The main function to aggregate and prepare all necessary data for the dashboard based on the selected date range. It calculates core KPIs and calls other data retrieval functions.
    *   **Parameters**: 
        *   `dateRange`: `DateRangeInput` - The desired date range for the data. Defaults to '3m'.
    *   **Returns**: `AllData` - A comprehensive object containing all dashboard data, including KPIs and raw data.

#### `geminiService.ts` Functions

This module integrates with the Google Gemini AI model for generating insights.

*   **`generateInsights(data: AllData): Promise<string>`**
    *   **Description**: Sends a simplified version of the dashboard data to the Gemini AI model and requests actionable business insights in Portuguese.
    *   **Parameters**: 
        *   `data`: `AllData` - The current dashboard data.
    *   **Returns**: `Promise<string>` - A promise that resolves to a Markdown-formatted string containing the AI-generated insights.
    *   **Called Backend Ops**: Interacts with the Google Gemini API. Requires `process.env.API_KEY` to be set.

#### `qwenService.ts` Functions

This module provides a placeholder for integration with the Qwen AI model.

*   **`getQwenClient(): any`**
    *   **Description**: (Placeholder) Initializes a hypothetical Qwen SDK client. It checks for `process.env.QWEN_API_KEY`.
    *   **Parameters**: None.
    *   **Returns**: `any` - A placeholder Qwen client object with a `generate` method.
*   **`generateQwenInsights(data: AllData): Promise<string>`**
    *   **Description**: (Placeholder) Simulates sending dashboard data to a Qwen AI model to generate insights. This function is currently a placeholder and would require actual Qwen SDK integration.
    *   **Parameters**: 
        *   `data`: `AllData` - The current dashboard data.
    *   **Returns**: `Promise<string>` - A promise that resolves to a placeholder string indicating Qwen integration.
    *   **Called Backend Ops**: Intended to interact with the Qwen AI API. Requires `process.env.QWEN_API_KEY` to be set.

## Local Development

To run the Business Intelligence Dashboard locally, follow these steps:

**Prerequisites:**
*   Node.js (version 18 or higher recommended)

**Setup:**

1.  **Navigate to the project directory:**
    ```bash
    cd business-intelligence-dashboard
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure API Key:**
    *   Create a `.env.local` file in the `business-intelligence-dashboard` directory.
    *   Set your Google Gemini API key:
        ```
        GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        ```
    *   (Optional) If integrating with Qwen, set your Qwen API key:
        ```
        QWEN_API_KEY=YOUR_QWEN_API_KEY
        ```
4.  **Run the application:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:5173` (or another port if 5173 is in use).

**Note on Data Sources:**

The current version of the dashboard uses **mock data** generated within `services/processedData.ts` for its dimension and fact tables. This means the `.xlsx` files located in `datasets/` are **not** actively consumed by the frontend application in its current state.

For a production environment or to integrate with real data, a dedicated ETL (Extract, Transform, Load) pipeline would typically be required on a backend server. This pipeline would process raw data from sources like `.xlsx` files and load it into a database or data warehouse, which the `processedData.ts` module (or a similar data access layer) would then query via an API.