import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { UserPerformanceData } from '../../types';
import { DimUsuario } from '../../services/processedData';

interface AdvancedPerformanceRadarChartProps {
  data: UserPerformanceData[];
}

const AdvancedPerformanceRadarChart: React.FC<AdvancedPerformanceRadarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">Dados de performance insuficientes.</div>;
  }
  
  const userNames = DimUsuario.map(u => u.nome);
  
  // Color palette for users
  const userColors = ['#B0D236', '#6F6C4B', '#858360', '#556B2F', '#353B37'];

  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((pld: any, index: number) => (
              <p key={index} style={{ color: pld.color }}>
                {`${pld.name}: ${pld.value.toFixed(1)}`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#BDB58A"/>
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#1E1E1E' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#858360' }}/>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#1E1E1E' }} />
          {userNames.map((userName, index) => (
            <Radar 
              key={userName}
              name={userName} 
              dataKey={userName} 
              stroke={userColors[index % userColors.length]} 
              fill={userColors[index % userColors.length]} 
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Performance Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-card p-4 rounded-lg border border-brand-border">
          <h4 className="text-text-main font-semibold mb-3">Ranking de Performance</h4>
          <div className="space-y-3">
            {userNames.map((userName, index) => {
              // Calculate average performance for this user
              const userData = data.map(item => item[userName] as number);
              const avgPerformance = userData.reduce((sum, value) => sum + value, 0) / userData.length;
              
              return (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: userColors[index % userColors.length] }}></div>
                  <div className="flex-1">
                    <p className="text-text-main font-medium">{userName}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${avgPerformance}%`, 
                          backgroundColor: userColors[index % userColors.length] 
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-text-main font-bold">{avgPerformance.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-surface-card p-4 rounded-lg border border-brand-border md:col-span-2">
          <h4 className="text-text-main font-semibold mb-3">Análise por Métrica</h4>
          <div className="grid grid-cols-2 gap-4">
            {data.map((metric, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <h5 className="text-text-main font-medium">{metric.subject}</h5>
                <div className="mt-2 space-y-2">
                  {userNames.map((userName, userIndex) => (
                    <div key={userIndex} className="flex justify-between">
                      <span className="text-text-muted text-sm">{userName}</span>
                      <span className="text-text-main font-medium">{(metric[userName] as number).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPerformanceRadarChart;