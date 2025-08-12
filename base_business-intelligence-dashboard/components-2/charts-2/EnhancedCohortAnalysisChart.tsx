import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CohortData } from '../../types';

interface EnhancedCohortAnalysisChartProps {
  data: CohortData[];
}

const EnhancedCohortAnalysisChart: React.FC<EnhancedCohortAnalysisChartProps> = ({ data }) => {
  // Transform data for bar chart visualization
  const transformedData = data.map(cohort => {
    // Get the first 6 months of data for each cohort
    const monthsData = cohort.values.slice(0, 6);
    
    // Create an object with month keys
    const monthValues: { [key: string]: number } = {};
    monthsData.forEach((monthData, index) => {
      monthValues[`Mês ${index}`] = monthData.percentage;
    });
    
    return {
      cohort: cohort.cohort,
      size: cohort.size,
      ...monthValues
    };
  });

  // Get month keys for the chart
  const monthKeys = Array.from({ length: 6 }, (_, i) => `Mês ${i}`);

  // Color palette for months
  const colors = ['#B0D236', '#858360', '#6F6C4B', '#556B2F', '#353B37', '#1E1E1E'];

  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg mb-2">{label}</p>
          <p className="text-text-on-dark text-sm mb-2">Tamanho do grupo: {payload[0].payload.size} clientes</p>
          <div className="space-y-1">
            {payload.map((pld: any, index: number) => (
              <p key={index} style={{ color: pld.fill }}>
                {`${pld.dataKey}: ${pld.value.toFixed(1)}%`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={transformedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          barCategoryGap="20%"
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
            formatter={(value) => <span className="text-text-main text-sm">{value}</span>}
          />
          {monthKeys.map((key, index) => (
            <Bar 
              key={key} 
              dataKey={key} 
              name={key} 
              fill={colors[index % colors.length]} 
              stackId="a" 
              barSize={20}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      
      {/* Cohort Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-card p-4 rounded-lg border border-brand-border">
          <h4 className="text-text-main font-semibold mb-2">Média de Retenção (Mês 1)</h4>
          <p className="text-2xl font-bold text-text-main">
            {data.length > 0 
              ? `${((data.reduce((sum, cohort) => sum + (cohort.values[1]?.percentage || 0), 0) / data.length) || 0).toFixed(1)}%`
              : '0%'}
          </p>
          <p className="text-text-muted text-sm">Taxa média de retenção no primeiro mês</p>
        </div>
        
        <div className="bg-surface-card p-4 rounded-lg border border-brand-border">
          <h4 className="text-text-main font-semibold mb-2">Cohort Mais Retentivo</h4>
          <p className="text-2xl font-bold text-text-main">
            {data.length > 0 
              ? data.reduce((max, cohort) => 
                  (cohort.values[2]?.percentage || 0) > (max.values[2]?.percentage || 0) ? cohort : max, data[0]
                ).cohort
              : 'N/A'}
          </p>
          <p className="text-text-muted text-sm">Maior taxa de retenção no terceiro mês</p>
        </div>
        
        <div className="bg-surface-card p-4 rounded-lg border border-brand-border">
          <h4 className="text-text-main font-semibold mb-2">Churn Médio</h4>
          <p className="text-2xl font-bold text-text-main">
            {data.length > 0 
              ? `${(100 - ((data.reduce((sum, cohort) => sum + (cohort.values[2]?.percentage || 0), 0) / data.length) || 0)).toFixed(1)}%`
              : '0%'}
          </p>
          <p className="text-text-muted text-sm">Perda média de clientes até o terceiro mês</p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCohortAnalysisChart;