import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid, Label } from 'recharts';
import { OppsTimeSinceUpdateData } from '../../types';

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
                <p className="label text-text-on-dark font-bold">{`${label}`}</p>
                 <p className="intro text-text-on-dark">{`Oportunidades: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

interface Props {
  data: OppsTimeSinceUpdateData[];
}

const TimeSinceUpdateChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 50, left: 50, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#BDB58A" horizontal={false} />
        <XAxis type="number" stroke="#858360">
            <Label value="Nº de Oportunidades" offset={-10} position="insideBottom" fill="#858360" />
        </XAxis>
        <YAxis type="category" dataKey="category" stroke="#858360" width={80}/>
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(176, 210, 54, 0.2)' }}/>
        <Bar dataKey="value" fill="#6F6C4B">
            <LabelList dataKey="value" position="right" style={{ fill: '#1E1E1E' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TimeSinceUpdateChart;
