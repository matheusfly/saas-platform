import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { CashFlowData } from '../../types';

const currencyFormatter = (value: number) => {
  if (value >= 1_000_000) {
    return `R$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
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
                    <p key={index} style={{ color: pld.stroke }}>
                        {`${pld.name}: ${pld.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface Props {
  data: CashFlowData[];
}

const CashFlowChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
        <defs>
          <linearGradient id="colorDinheiro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B0D236" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#B0D236" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorPix" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6F6C4B" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#6F6C4B" stopOpacity={0}/>
          </linearGradient>
           <linearGradient id="colorCartao" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#858360" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#858360" stopOpacity={0}/>
          </linearGradient>
           <linearGradient id="colorBoleto" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#353B37" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#353B37" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
        <XAxis dataKey="date" stroke="#858360" />
        <YAxis stroke="#858360" tickFormatter={currencyFormatter}>
           <Label value="Valor (R$)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#858360' }} />
        </YAxis>
        <Tooltip content={<ChartTooltip />}/>
        <Legend wrapperStyle={{ color: '#1E1E1E' }} />
        <Area type="monotone" dataKey="dinheiro" name="Dinheiro" stackId="1" stroke="#B0D236" fill="url(#colorDinheiro)" />
        <Area type="monotone" dataKey="pix" name="Pix" stackId="1" stroke="#6F6C4B" fill="url(#colorPix)" />
        <Area type="monotone" dataKey="cartao" name="Cartão" stackId="1" stroke="#858360" fill="url(#colorCartao)" />
        <Area type="monotone" dataKey="boleto" name="Boleto" stackId="1" stroke="#353B37" fill="url(#colorBoleto)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CashFlowChart;
