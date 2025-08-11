import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
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

const NewLostWonChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
        <defs>
          <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B0D236" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#B0D236" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1E1E1E" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#1E1E1E" stopOpacity={0}/>
          </linearGradient>
           <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D9534F" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#D9534F" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" />
        <XAxis dataKey="date" stroke="#858360" />
        <YAxis stroke="#858360" tickCount={8}>
            <Label value="Quantidade" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#858360' }} />
        </YAxis>
        <Tooltip content={<ChartTooltip />}/>
        <Legend wrapperStyle={{ color: '#1E1E1E' }} />
        <Area type="monotone" dataKey="leads" name="Novos" color="#B0D236" stroke="#B0D236" fill="url(#colorNew)" strokeWidth={2} />
        <Area type="monotone" dataKey="conversions" name="Ganhos" color="#1E1E1E" stroke="#1E1E1E" fill="url(#colorWon)" strokeWidth={2} />
        <Area type="monotone" dataKey="cancellations" name="Perdidos" color="#D9534F" stroke="#D9534F" fill="url(#colorLost)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default NewLostWonChart;
