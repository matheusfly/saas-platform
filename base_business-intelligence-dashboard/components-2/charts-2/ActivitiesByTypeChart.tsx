import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ActivitiesByTypeData } from '../../types';

const COLORS = ['#B0D236', '#858360', '#6F6C4B'];

const ChartTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
                <p className="label text-text-on-dark font-bold">{`${payload[0].name}: ${payload[0].value} (${payload[0].payload.percent}%)`}</p>
            </div>
        );
    }
    return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};


interface Props {
  data: ActivitiesByTypeData[];
}

const ActivitiesByTypeChart: React.FC<Props> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const dataWithPercent = data.map(item => ({
        ...item,
        percent: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0,
    }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={dataWithPercent}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={120}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />}/>
        <Legend wrapperStyle={{ color: '#1E1E1E' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ActivitiesByTypeChart;
