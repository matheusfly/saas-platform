import { getAllData } from './dataService';
import type { AllData } from './dataService';
import type { FilterState } from '../types';

// Simulate network latency to mimic a real API call
const API_LATENCY = 500; // 0.5 seconds

/**
 * Fetches all dashboard data from the API.
 * This is an abstraction layer. Currently, it calls the mock data service,
 * but in a production environment, this would make a real HTTP request.
 * @param filters The current dashboard filters.
 * @returns A promise that resolves to the AllData object.
 */
export const fetchDataFromApi = (filters: FilterState): Promise<AllData> => {
  console.log('Fetching data via API client with filters:', filters);
  
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const data = await getAllData(filters);
        // Simulate a random failure to test error handling
        if (Math.random() < 0.05) { // 5% chance of failure
          throw new Error("Simulated network error.");
        }
        resolve(data);
      } catch (error) {
        console.error("API Client Error:", error);
        reject(new Error("Failed to retrieve data from the service."));
      }
    }, API_LATENCY);
  });
};
