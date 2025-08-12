import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LtvData } from '../../types';

interface CustomerSegmentationChartProps {
  data: LtvData[];
}

interface SegmentationDataPoint {
  segment: string;
  ltv: number;
  customerCount: number;
  color: string;
}

const CustomerSegmentationChart: React.FC<CustomerSegmentationChartProps> = ({ data }) => {
  // Transform LTV data into segmentation data points
  const segmentationData: SegmentationDataPoint[] = data.map((item, index) => {
    // Generate mock customer counts based on LTV (higher LTV = fewer but more valuable customers)
    const customerCount = Math.max(10, 1000 - (item.ltv / 10));
    
    // Assign colors based on LTV value
    let color = '#858360'; // Default color
    if (item.ltv > 1000) color = '#B0D236'; // High value
    else if (item.ltv > 500) color = '#6F6C4B'; // Medium-high value
    else if (item.ltv > 200) color = '#556B2F'; // Medium value
    else color = '#353B37'; // Lower value
    
    return {
      segment: item.tier,
      ltv: item.ltv,
      customerCount,
      color
    };
  });

  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 bg-surface-header border border-brand-border rounded-lg shadow-xl">
          <p className="font-bold text-text-on-dark text-lg mb-2">{data.segment}</p>
          <div className="space-y-1">
            <p className="text-text-on-dark">
              LTV: <span className="font-semibold">R$ {data.ltv.toLocaleString('pt-BR')}</span>
            </p>
            <p className="text-text-on-dark">
              Clientes: <span className="font-semibold">{data.customerCount.toLocaleString('pt-BR')}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid stroke="#BDB58A" />
          <XAxis 
            type="number" 
            dataKey="customerCount" 
            name="Clientes" 
            stroke="#858360"
            tick={{ fill: '#1E1E1E' }}
            label={{ 
              value: 'Número de Clientes', 
              position: 'insideBottom', 
              offset: -10, 
              fill: '#858360' 
            }}
          />
          <YAxis 
            type="number" 
            dataKey="ltv" 
            name="LTV" 
            stroke="#858360"
            tick={{ fill: '#1E1E1E' }}
            tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
            label={{ 
              value: 'Valor do Cliente (LTV)', 
              angle: -90, 
              position: 'insideLeft', 
              fill: '#858360' 
            }}
          />
          <ZAxis range={[100, 1000]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend 
            formatter={(value) => <span className="text-text-main text-sm">Segmentos</span>}
          />
          <Scatter 
            name="Segmentos de Cliente" 
            data={segmentationData} 
            fill="#8884d8"
          >
            {segmentationData.map((entry, index) => (
              <circle 
                key={`circle-${index}`} 
                r={Math.sqrt(entry.customerCount) / 2} 
                fill={entry.color} 
                stroke="#fff" 
                strokeWidth={1}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Segmentation Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-card p-4 rounded-lg border border-brand-border">
          <h4 className="text-text-main font-semibold mb-3">Segmentos por Valor</h4>
          <div className="space-y-3">
            {segmentationData
              .sort((a, b) => b.ltv - a.ltv)
              .map((segment, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3" 
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-text-main font-medium">{segment.segment}</p>
                    <p className="text-text-muted text-sm">LTV: R$ {segment.ltv.toLocaleString('pt-BR')}</p>
                  </div>
                  <span className="text-text-main font-bold">{segment.customerCount}</span>
                </div>
              ))
            }
          </div>
        </div>
        
        <div className="bg-surface-card p-4 rounded-lg border border-brand-border">
          <h4 className="text-text-main font-semibold mb-3">Distribuição de Valor</h4>
          <div className="space-y-3">
            <div>
              <p className="text-text-main font-medium">Alto Valor</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500" 
                  style={{ 
                    width: `${(segmentationData.filter(s => s.ltv > 1000).length / segmentationData.length) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="text-text-muted text-sm mt-1">
                {segmentationData.filter(s => s.ltv > 1000).length} segmentos
              </p>
            </div>
            
            <div>
              <p className="text-text-main font-medium">Médio Valor</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-yellow-500" 
                  style={{ 
                    width: `${(segmentationData.filter(s => s.ltv >= 500 && s.ltv <= 1000).length / segmentationData.length) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="text-text-muted text-sm mt-1">
                {segmentationData.filter(s => s.ltv >= 500 && s.ltv <= 1000).length} segmentos
              </p>
            </div>
            
            <div>
              <p className="text-text-main font-medium">Baixo Valor</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-red-500" 
                  style={{ 
                    width: `${(segmentationData.filter(s => s.ltv < 500).length / segmentationData.length) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="text-text-muted text-sm mt-1">
                {segmentationData.filter(s => s.ltv < 500).length} segmentos
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-card p-4 rounded-lg border border-brand-border">
          <h4 className="text-text-main font-semibold mb-3">Recomendações</h4>
          <ul className="space-y-2 text-text-main text-sm">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Focar em retenção de clientes de alto valor</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span>Identificar oportunidades em segmentos médios</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              <span>Desenvolver estratégias de upsell para todos os segmentos</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentationChart;