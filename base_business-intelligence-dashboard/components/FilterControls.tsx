import React from 'react';
import { DateRange, FilterState } from '../types';

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
}

const filterOptions: { label: string; value: DateRange }[] = [
  { label: 'Hoje', value: 'today' },
  { label: '7 Dias', value: '7d' },
  { label: '30 Dias', value: '30d' },
  { label: '90 Dias', value: '90d' },
  { label: '12 Meses', value: '12m' },
  { label: 'Todo Período', value: 'all' },
];

const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="mb-6 p-4 bg-surface-card rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-md">
      <h3 className="text-lg font-semibold text-text-main whitespace-nowrap">Filtrar por Período:</h3>
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => onFilterChange({ ...filters, dateRange: option.value })}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ease-in-out transform hover:scale-105 ${
              filters.dateRange === option.value
                ? 'bg-accent-primary text-text-on-accent shadow-lg'
                : 'bg-background-primary/50 text-text-main hover:bg-brand-border'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterControls;
