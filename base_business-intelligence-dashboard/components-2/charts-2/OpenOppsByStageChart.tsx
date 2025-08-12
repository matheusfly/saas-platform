import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { OpenOppsByStageData } from '../../types';

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
                <p className="label text-text-on-dark font-bold">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.fill }}>
                        {`Quantidade: ${pld.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface Props {
  data: OpenOppsByStageData[];
}

const OpenOppsByStageChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis type="number" hide />
        <YAxis 
          dataKey="stage" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#1E1E1E' }}
          width={150}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(176, 210, 54, 0.2)' }}/>
        <Bar dataKey="value" fill="#B0D236" barSize={30}>
           <LabelList dataKey="value" position="right" style={{ fill: '#1E1E1E' }}/>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OpenOppsByStageChart;
