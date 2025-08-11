import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid, Label } from 'recharts';
import { FunnelDropOffData } from '../../types';

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const percentage = data.total > 0 ? (data.dropped / data.total * 100).toFixed(1) : 0;
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
                <p className="label text-text-on-dark font-bold">{label}</p>
                <p className="intro text-text-on-dark">{`Perdidos: ${data.dropped} (${percentage}%)`}</p>
            </div>
        );
    }
    return null;
};

interface Props {
  data: FunnelDropOffData[];
}

const FunnelDropOffChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 50, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" horizontal={false} />
        <XAxis type="number" stroke="#858360">
            <Label value="Nº de Leads Perdidos" offset={-10} position="insideBottom" fill="#858360" />
        </XAxis>
        <YAxis 
            type="category" 
            dataKey="stage" 
            stroke="#858360" 
            width={120} 
            tick={{ fontSize: 11 }}
            interval={0}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(217, 83, 79, 0.2)' }}/>
        <Bar dataKey="dropped" name="Perdidos" fill="#D9534F">
            <LabelList dataKey="dropped" position="right" style={{ fill: '#1E1E1E' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FunnelDropOffChart;
