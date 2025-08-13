import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { SalesRankingData } from '../../types';

const currencyFormatter = (value: number) => `R$${(value / 1000).toFixed(0)}k`;

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
                <p className="label text-text-on-dark font-bold">{label}</p>
                <p className="intro text-text-on-dark">{`Receita: ${payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
            </div>
        );
    }
    return null;
};

interface Props {
  data: SalesRankingData[];
}

const SalesRankingChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
        <XAxis dataKey="user" stroke="#858360" />
        <YAxis stroke="#858360" tickFormatter={currencyFormatter}>
           <Label value="Receita (R$)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#858360' }} />
        </YAxis>
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(176, 210, 54, 0.2)' }} />
        <Bar dataKey="revenue" fill="#B0D236" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalesRankingChart;
