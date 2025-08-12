import React from 'react';
import { Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ProductivityData {
  day: string;
  hour: number;
  value: number;
}

interface ProductivityHeatmapProps {
  data: ProductivityData[];
}

const ProductivityHeatmap: React.FC<ProductivityHeatmapProps> = ({ data }) => {
  // Get unique days and hours for axes
  const days = Array.from(new Set(data.map(d => d.day))).sort();
  const hours = Array.from(new Set(data.map(d => d.hour))).sort((a, b) => Number(a) - Number(b));

  // Color scale function
  const getColor = (value: number) => {
    if (value >= 80) return '#B0D236'; // High productivity
    if (value >= 60) return '#82ca9d'; // Medium-high productivity
    if (value >= 40) return '#FFD166'; // Medium productivity
    if (value >= 20) return '#FF9A76'; // Low productivity
    return '#EF476F'; // Very low productivity
  };

  // Custom tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-surface-header border border-brand-border rounded-md shadow-lg">
          <p className="font-bold text-text-on-dark">{data.day}, {data.hour}:00</p>
          <p className="text-text-on-dark">Produtividade: {data.value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <div className="flex flex-col h-full">
        <div className="overflow-auto flex-grow">
          <svg width="100%" height="100%" viewBox={`0 0 ${hours.length * 40 + 80} ${days.length * 40 + 80}`}>
            {/* X Axis - Hours */}
            <g transform="translate(80, 40)">
              {hours.map((hour, index) => (
                <text
                  key={index}
                  x={index * 40 + 20}
                  y={-10}
                  textAnchor="middle"
                  fill="#1E1E1E"
                  fontSize="12"
                >
                  {hour}:00
                </text>
              ))}
            </g>

            {/* Y Axis - Days */}
            <g transform="translate(80, 40)">
              {days.map((day, index) => (
                <text
                  key={index}
                  x={-10}
                  y={index * 40 + 25}
                  textAnchor="end"
                  fill="#1E1E1E"
                  fontSize="12"
                >
                  {day}
                </text>
              ))}
            </g>

            {/* Heatmap cells */}
            <g transform="translate(80, 40)">
              {data.map((cell, index) => {
                const xIndex = hours.indexOf(cell.hour);
                const yIndex = days.indexOf(cell.day);
                
                if (xIndex === -1 || yIndex === -1) return null;
                
                return (
                  <g key={index}>
                    <rect
                      x={xIndex * 40}
                      y={yIndex * 40}
                      width="35"
                      height="35"
                      fill={getColor(cell.value)}
                      stroke="#fff"
                      strokeWidth="1"
                    />
                    <text
                      x={xIndex * 40 + 17.5}
                      y={yIndex * 40 + 22.5}
                      textAnchor="middle"
                      fill="#1E1E1E"
                      fontSize="10"
                    >
                      {cell.value}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Color legend */}
            <g transform="translate(20, 40)">
              <text x="0" y="-10" fill="#1E1E1E" fontSize="12">Produtividade (%)</text>
              <rect x="0" y="0" width="20" height="20" fill="#B0D236" />
              <text x="25" y="15" fill="#1E1E1E" fontSize="10">80-100%</text>
              <rect x="0" y="25" width="20" height="20" fill="#82ca9d" />
              <text x="25" y="40" fill="#1E1E1E" fontSize="10">60-79%</text>
              <rect x="0" y="50" width="20" height="20" fill="#FFD166" />
              <text x="25" y="65" fill="#1E1E1E" fontSize="10">40-59%</text>
              <rect x="0" y="75" width="20" height="20" fill="#FF9A76" />
              <text x="25" y="90" fill="#1E1E1E" fontSize="10">20-39%</text>
              <rect x="0" y="100" width="20" height="20" fill="#EF476F" />
              <text x="25" y="115" fill="#1E1E1E" fontSize="10">0-19%</text>
            </g>
          </svg>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default ProductivityHeatmap;