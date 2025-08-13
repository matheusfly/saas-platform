import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Label } from 'recharts';
import { LtvData } from '../../types';

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
                <p className="label text-text-on-dark font-bold">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: '#B0D236' }}>
                        {`LTV: R$ ${pld.value.toLocaleString('pt-BR')}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const currencyFormatter = (value: number) => `R$${(value/1000)}k`;


interface Props {
  data: LtvData[];
}

const LtvPermanenceChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        layout="vertical"
        margin={{ top: 5, right: 60, left: 120, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A"/>
        <XAxis type="number" stroke="#858360" tickFormatter={currencyFormatter}>
          <Label value="LTV (R$)" offset={-10} position="insideBottom" fill="#858360" />
        </XAxis>
        <YAxis 
          type="category" 
          dataKey="tier" 
          stroke="#858360" 
          tick={{ fontSize: 12 }} 
          width={180}
          interval={0}
        />
        <Tooltip content={<ChartTooltip />} cursor={{fill: 'rgba(176, 210, 54, 0.2)'}}/>
        <Bar dataKey="ltv" name="LTV (R$)" fill="#B0D236">
            <LabelList dataKey="ltv" position="right" style={{ fill: '#1E1E1E' }} formatter={(value: number) => `R$${value.toLocaleString('pt-BR')}`} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LtvPermanenceChart;
