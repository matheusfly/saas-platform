import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CohortValue {
  month: number;
  percentage: number;
}

interface CohortData {
  cohort: string;
  size: number;
  values: CohortValue[];
}

interface FixedClientRetentionHeatmapProps {
  data: CohortData[];
}

// Helper function to process cohort data for bar chart
const processCohortData = (rawData: CohortData[]) => {
  // Validate input data
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return [];
  }

  // Process each cohort
  return rawData
    .filter(cohort => 
      cohort && 
      typeof cohort.cohort === 'string' && 
      cohort.cohort.trim() !== '' &&
      Array.isArray(cohort.values)
    )
    .map(cohort => {
      // Create a data object for this cohort
      const cohortData: { [key: string]: string | number } = {
        cohort: cohort.cohort,
        size: cohort.size || 0
      };

      // Add retention values for each month (up to 12 months)
      for (let i = 0; i < 12; i++) {
        const value = cohort.values.find(v => v.month === i);
        cohortData[`M${i}`] = value ? Math.max(0, Math.min(100, value.percentage)) : 0;
      }

      return cohortData;
    });
};

const FixedClientRetentionHeatmap: React.FC<FixedClientRetentionHeatmapProps> = ({ data }) => {
  // Process the data
  const processedData = processCohortData(data);

  // Handle empty data case
  if (processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center text-text-muted">
          <p className="font-medium">No retention data available</p>
          <p className="text-sm mt-1">Insufficient data to display retention analysis</p>
        </div>
      </div>
    );
  }

  // Get month keys for the chart
  const monthKeys = Array.from({ length: 12 }, (_, i) => `M${i}`);

  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((pld: any, index: number) => (
              <p key={index} style={{ color: pld.fill }}>
                {`Mês ${pld.dataKey.replace('M', '')}: ${pld.value.toFixed(1)}%`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={processedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        barCategoryGap="15%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis 
          dataKey="cohort" 
          tick={{ fill: '#1E1E1E', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tick={{ fill: '#1E1E1E', fontSize: 12 }}
          tickFormatter={(value) => `${value}%`}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value) => <span className="text-text-main text-sm">{`Mês ${value.replace('M', '')}`}</span>}
        />
        {monthKeys.map((key, index) => (
          <Bar 
            key={key} 
            dataKey={key} 
            name={`Mês ${index}`} 
            fill={`hsl(${120 - index * 8}, 70%, 60%)`} 
            stackId="a" 
            barSize={20}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FixedClientRetentionHeatmap;