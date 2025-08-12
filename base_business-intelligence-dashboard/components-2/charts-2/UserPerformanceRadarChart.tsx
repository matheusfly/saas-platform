import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { UserPerformanceData } from '../../types';
import { DimUsuario } from '../../services/processedData';

const userColors = ['#B0D236', '#6F6C4B', '#858360'];

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface-header border border-brand-border rounded-md shadow-lg">
                <p className="label text-text-on-dark font-bold">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color }}>
                        {`${pld.name}: ${pld.value.toFixed(1)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface Props {
  data: UserPerformanceData[];
}

const UserPerformanceRadarChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">Dados de performance insuficientes.</div>;
  }
  
  const userNames = DimUsuario.map(u => u.nome);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#BDB58A"/>
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#1E1E1E' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#858360' }}/>
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ color: '#1E1E1E' }} />
        {userNames.map((userName, index) => (
             <Radar 
                key={userName}
                name={userName} 
                dataKey={userName} 
                stroke={userColors[index % userColors.length]} 
                fill={userColors[index % userColors.length]} 
                fillOpacity={0.6} 
            />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default UserPerformanceRadarChart;
