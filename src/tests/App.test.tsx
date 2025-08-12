import { render, screen } from '@testing-library/react';
import App from '../../base_business-intelligence-dashboard/App';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../base_business-intelligence-dashboard/services/apiClient', () => ({
  fetchDataFromApi: vi.fn(() => Promise.resolve({
    // Provide mock data that matches the AllData type
    kpis: {
      averageLtv: 0,
      newClientCount: 0,
      conversionRate: 0,
      totalRevenue: 0,
      customerSatisfaction: 0,
      netPromoterScore: 0,
      averageClientLifespan: 0,
      monthlyChurnRate: 0,
      dataQualityScore: 0,
      roi: 0,
    },
    funnel: [],
    leadEvolution: [],
    cashFlow: [],
    ltv: [],
    recurrence: [],
    checkIn: [],
    cohort: [],
    salesFunnelData: [],
    customerAcquisitionData: [],
    revenueByMonthData: [],
    productPerformanceData: [],
    customerLifetimeValueData: [],
    salesByRegionData: [],
    marketingCampaignPerformanceData: [],
    customerSatisfactionData: [],
    socialMediaEngagementData: [],
    websiteTrafficData: [],
    employeePerformanceData: [],
    projectManagementData: [],
    inventoryManagementData: [],
    supplyChainData: [],
  })),
}));

describe('App', () => {
  it('renders the main application container', async () => {
    render(<App />);
    // Use findByRole to wait for the element to appear after data fetching is mocked
    const mainContainer = await screen.findByRole('main');
    expect(mainContainer).toBeInTheDocument();
  });
});
