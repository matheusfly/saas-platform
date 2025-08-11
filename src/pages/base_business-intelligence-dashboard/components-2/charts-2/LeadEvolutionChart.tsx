import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { LeadEvolutionData } from '../../types';

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
                <p className="label text-text-on-dark font-bold">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color }}>
                        {`${pld.name}: ${pld.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface Props {
  data: LeadEvolutionData[];
}

const LeadEvolutionChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
        <XAxis dataKey="date" stroke="#858360" />
        <YAxis stroke="#858360" tickCount={8}>
            <Label value="Quantidade" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#858360' }} />
        </YAxis>
        <Tooltip content={<ChartTooltip />}/>
        <Legend wrapperStyle={{ color: '#1E1E1E' }} />
        <Line type="monotone" dataKey="leads" name="Novos Leads" stroke="#B0D236" strokeWidth={2} />
        <Line type="monotone" dataKey="conversions" name="Conversões" stroke="#1E1E1E" strokeWidth={2} />
        <Line type="monotone" dataKey="cancellations" name="Cancelamentos" stroke="#D9534F" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LeadEvolutionChart;
