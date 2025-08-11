import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, LabelList } from 'recharts';

interface ProductivityStoryData {
  date: string;
  productivity: number;
  tasksCompleted: number;
  hoursWorked: number;
  efficiency: number;
  benchmark: number;
  storyPoint: string;
  storyHighlight: boolean;
}

interface ProductivityStoryTimelineProps {
  data: ProductivityStoryData[];
}

const ProductivityStoryTimeline: React.FC<ProductivityStoryTimelineProps> = ({ data }) => {
  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = data.find(d => d.date === label);
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl max-w-xs">
          <p className="font-bold text-text-on-dark text-lg mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-text-on-dark">Produtividade: <span className="font-semibold">{payload[0].value.toFixed(1)}%</span></p>
            <p className="text-text-on-dark">Tarefas: <span className="font-semibold">{payload[1].value}</span></p>
            <p className="text-text-on-dark">Horas: <span className="font-semibold">{payload[2].value}h</span></p>
            <p className="text-text-on-dark">Eficiência: <span className="font-semibold">{payload[3].value.toFixed(1)}%</span></p>
          </div>
          {dataPoint?.storyPoint && (
            <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-blue-800 text-sm font-medium">Destaque: {dataPoint.storyPoint}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#1E1E1E', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#1E1E1E', fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#1E1E1E', fontSize: 12 }}
            domain={[0, Math.max(...data.map(d => d.tasksCompleted)) * 1.2]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => <span className="text-text-main text-sm">{value}</span>}
          />
          <ReferenceLine y={0} stroke="#000" />
          
          {/* Benchmark line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="benchmark"
            name="Benchmark"
            stroke="#ff6b6b"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
          
          {/* Productivity line with story highlights */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="productivity"
            name="Produtividade"
            stroke="#8884d8"
            strokeWidth={3}
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (payload.storyHighlight) {
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={6} fill="#8884d8" stroke="#fff" strokeWidth={2} />
                    <circle cx={cx} cy={cy} r={10} fill="#8884d8" fillOpacity={0.3} />
                  </g>
                );
              }
              return <circle cx={cx} cy={cy} r={4} fill="#8884d8" />;
            }}
            activeDot={{ r: 8 }}
          />
          
          {/* Tasks bar */}
          <Bar 
            yAxisId="right"
            dataKey="tasksCompleted" 
            name="Tarefas Concluídas" 
            fill="#82ca9d" 
            radius={[4, 4, 0, 0]}
            opacity={0.7}
          />
          
          {/* Efficiency line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="efficiency"
            name="Eficiência"
            stroke="#ffc658"
            strokeWidth={2}
            strokeDasharray="3 3"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Story Narrative */}
      <div className="mt-6 bg-surface-card p-4 rounded-lg border border-brand-border">
        <h4 className="text-text-main font-semibold mb-3">Narrativa de Produtividade</h4>
        <div className="space-y-3">
          {data.filter(d => d.storyPoint).map((point, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
              <div className="ml-3">
                <p className="text-text-main font-medium">{point.date}</p>
                <p className="text-text-muted text-sm">{point.storyPoint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductivityStoryTimeline;