import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock the ResponsiveContainer to prevent errors in tests
vi.mock('recharts', async () => {
    const originalModule = await vi.importActual('recharts');
    return {
        ...originalModule,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
    };
});

// extends Vitest's expect method with methods from react-testing-library
// and clears up the DOM after each test
afterEach(() => {
  cleanup();
});
