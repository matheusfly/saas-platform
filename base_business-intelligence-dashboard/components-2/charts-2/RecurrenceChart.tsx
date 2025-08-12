import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { RecurrenceData } from '../../types';

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
                <p className="label text-text-on-dark font-bold">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.fill }}>
                        {`${pld.name}: ${pld.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface Props {
  data: RecurrenceData[];
}

const RecurrenceChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
        <XAxis dataKey="month" stroke="#858360"/>
        <YAxis stroke="#858360">
            <Label value="Número de Pagamentos" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#858360' }} />
        </YAxis>
        <Tooltip content={<ChartTooltip />} cursor={{fill: 'rgba(176, 210, 54, 0.2)'}}/>
        <Legend wrapperStyle={{ color: '#1E1E1E' }}/>
        <Bar dataKey="success" name="Sucesso" stackId="a" fill="#B0D236" />
        <Bar dataKey="failed" name="Falha" stackId="a" fill="#D9534F" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RecurrenceChart;
