import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid, Label } from 'recharts';
import { OppsByOriginData } from '../../types';

const currencyFormatter = (value: number) => `R$${(value/1000).toFixed(0)}k`;

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
                <p className="label text-text-on-dark font-bold">{`${label}`}</p>
                <p className="intro text-text-on-dark">{`Valor: ${payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
            </div>
        );
    }
    return null;
};

interface Props {
  data: OppsByOriginData[];
}

const OppsByOriginChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" horizontal={false} />
        <XAxis type="number" stroke="#858360" tickFormatter={currencyFormatter}>
            <Label value="Valor Total (R$)" offset={-10} position="insideBottom" fill="#858360" />
        </XAxis>
        <YAxis type="category" dataKey="origin" stroke="#858360" width={100} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(176, 210, 54, 0.2)' }}/>
        <Bar dataKey="value" fill="#858360">
            <LabelList dataKey="value" position="right" style={{ fill: '#1E1E1E' }} formatter={(value: number) => `R$${value.toLocaleString('pt-BR')}`} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OppsByOriginChart;
