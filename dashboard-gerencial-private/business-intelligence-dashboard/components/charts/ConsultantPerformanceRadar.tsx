import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ConsultantMetric {
  subject: string;
  [key: string]: number | string;
}

interface ConsultantPerformanceRadarProps {
  data: ConsultantMetric[];
}

const ConsultantPerformanceRadar: React.FC<ConsultantPerformanceRadarProps> = ({ data }) => {
  // Get consultant names (dynamic keys)
  const consultantNames = Object.keys(data[0] || {}).filter(key => key !== 'subject');
  
  // Color palette for consultants
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-surface-header border border-brand-border rounded-md shadow-lg">
          <p className="font-bold text-text-on-dark">{payload[0].payload.subject}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color }}>
              {`${pld.dataKey}: ${pld.value.toFixed(1)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#1E1E1E' }} />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          tick={{ fill: '#1E1E1E' }}
          tickFormatter={(value) => `${value}%`}
        />
        {consultantNames.map((name, index) => (
          <Radar
            key={name}
            name={name}
            dataKey={name}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        ))}
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value) => <span className="text-text-main">{value}</span>}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default ConsultantPerformanceRadar;