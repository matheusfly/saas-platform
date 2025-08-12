import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { RevenueExpenseData } from '../../types';

const currencyFormatter = (value: number) => {
  if (Math.abs(value) >= 1_000_000) {
    return `R$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `R$${(value / 1000).toFixed(0)}k`;
  }
  return `R$${value}`;
};

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
                <p className="label text-text-on-dark font-bold">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color || pld.stroke }}>
                        {`${pld.name}: ${pld.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};


interface Props {
  data: RevenueExpenseData[];
}

const RevenueExpenseChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
        <XAxis dataKey="date" stroke="#858360" />
        <YAxis stroke="#858360" tickFormatter={currencyFormatter}>
           <Label value="Valor (R$)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#858360' }} />
        </YAxis>
        <Tooltip content={<ChartTooltip />}/>
        <Legend wrapperStyle={{ color: '#1E1E1E' }} />
        <Bar dataKey="revenue" name="Receita" fill="#B0D236" />
        <Bar dataKey="expenses" name="Despesa" fill="#D9534F" />
        <Line type="monotone" dataKey="net" name="Líquido" stroke="#1E1E1E" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default RevenueExpenseChart;
