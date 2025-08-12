import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { CheckInData } from '../../types';

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
               {payload.map((pld, index) => (
                    <div key={index}>
                        <p className="label text-text-on-dark">{`Frequência: ${pld.payload.frequency}`}</p>
                        <p className="label text-text-on-dark">{`Valor Pago: R$ ${pld.payload.valuePaid.toLocaleString('pt-BR')}`}</p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const currencyFormatter = (value: number) => `R$${value.toLocaleString('pt-BR')}`;

interface Props {
  data: CheckInData[];
}

const CheckInChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
        <CartesianGrid stroke="#BDB58A" />
        <XAxis type="number" dataKey="frequency" name="Frequência (Check-ins)" stroke="#858360" tickCount={10}>
            <Label value="Frequência de Check-ins" offset={-25} position="insideBottom" fill="#858360" />
        </XAxis>
        <YAxis type="number" dataKey="valuePaid" name="Valor Pago (R$)" stroke="#858360" tickFormatter={currencyFormatter} tickCount={8}>
            <Label value="Valor Pago Total (R$)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#858360' }} />
        </YAxis>
        <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Clientes" data={data} fill="#B0D236" opacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default CheckInChart;
