import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts';

interface ActivityData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface ActivityTypeDistributionProps {
  data: ActivityData[];
  title: string;
}

const ActivityTypeDistribution: React.FC<ActivityTypeDistributionProps> = ({ data, title }) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-surface-header border border-brand-border rounded-md shadow-lg">
          <p className="font-bold text-text-on-dark">{data.name}</p>
          <p className="text-text-on-dark">Atividades: {data.value.toLocaleString()}</p>
          <p className="text-text-on-dark">Percentual: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Calculate total for center label
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          labelLine={true}
          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-text-main text-xl font-bold">
                      {total.toLocaleString()}
                    </tspan>
                    <tspan x={viewBox.cx} y={viewBox.cy + 20} className="fill-text-main text-sm">
                      Total
                    </tspan>
                  </text>
                );
              }
              return null;
            }}
          />
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          formatter={(value, entry, index) => (
            <span className="text-text-main">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ActivityTypeDistribution;