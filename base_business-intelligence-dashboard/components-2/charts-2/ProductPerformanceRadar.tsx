import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ProductPerformanceData {
  subject: string;
  [key: string]: number | string;
}

interface ProductPerformanceRadarProps {
  data: ProductPerformanceData[];
  keys: string[];
}

const ProductPerformanceRadar: React.FC<ProductPerformanceRadarProps> = ({ data, keys }) => {
  // Get unique product categories from keys
  const productCategories = keys.filter(key => key !== 'subject');
  
  // Color palette for products
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((pld: any, index: number) => (
              <p key={index} style={{ color: pld.color }}>
                {pld.dataKey}: <span className="font-semibold">{pld.value.toFixed(2)}</span>
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
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        {productCategories.map((category, index) => (
          <Radar
            key={category}
            name={category}
            dataKey={category}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        ))}
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value) => <span className="text-text-main text-sm">{value}</span>}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default ProductPerformanceRadar;