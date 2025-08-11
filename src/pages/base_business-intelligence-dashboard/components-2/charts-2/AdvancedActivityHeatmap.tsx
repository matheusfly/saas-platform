import React, { useState } from 'react';

interface ActivityData {
  day: string;
  hour: number;
  value: number;
  activities: number;
}

interface AdvancedActivityHeatmapProps {
  data: ActivityData[];
  onCellClick?: (data: ActivityData) => void;
}

const AdvancedActivityHeatmap: React.FC<AdvancedActivityHeatmapProps> = ({ 
  data, 
  onCellClick 
}) => {
  const [selectedCell, setSelectedCell] = useState<ActivityData | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'activity'>('heatmap');

  // Get unique days and hours for axes
  const days = Array.from(new Set(data.map(d => d.day))).sort();
  const hours = Array.from(new Set(data.map(d => d.hour))).sort((a, b) => Number(a) - Number(b));

  // Color scale function for heatmap
  const getHeatmapColor = (value: number) => {
    if (value >= 80) return 'bg-green-500'; // High productivity
    if (value >= 60) return 'bg-green-400'; // Medium-high productivity
    if (value >= 40) return 'bg-yellow-400'; // Medium productivity
    if (value >= 20) return 'bg-orange-400'; // Low productivity
    return 'bg-red-400'; // Very low productivity
  };

  // Color scale function for activity count
  const getActivityColor = (activities: number) => {
    const maxActivities = Math.max(...data.map(d => d.activities));
    const intensity = Math.min(1, activities / maxActivities);
    
    if (intensity >= 0.8) return 'bg-blue-700';
    if (intensity >= 0.6) return 'bg-blue-500';
    if (intensity >= 0.4) return 'bg-blue-400';
    if (intensity >= 0.2) return 'bg-blue-300';
    return 'bg-blue-100';
  };

  // Handle cell click
  const handleCellClick = (cell: ActivityData) => {
    setSelectedCell(cell);
    if (onCellClick) {
      onCellClick(cell);
    }
  };

  // Get color class based on view mode
  const getColorClass = (cell: ActivityData) => {
    return viewMode === 'heatmap' 
      ? getHeatmapColor(cell.value) 
      : getActivityColor(cell.activities);
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'heatmap' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setViewMode('heatmap')}
          >
            Produtividade
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'activity' 
                ? 'bg-accent-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setViewMode('activity')}
          >
            Atividades
          </button>
        </div>
        
        {selectedCell && (
          <div className="ml-auto bg-surface-card p-3 rounded-lg border border-brand-border">
            <p className="font-semibold text-text-main">
              {selectedCell.day}, {selectedCell.hour}:00
            </p>
            <div className="flex gap-4 mt-1">
              <span className="text-text-muted text-sm">
                Produtividade: <span className="font-medium">{selectedCell.value}%</span>
              </span>
              <span className="text-text-muted text-sm">
                Atividades: <span className="font-medium">{selectedCell.activities}</span>
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Heatmap Container */}
      <div className="flex-grow overflow-auto">
        <div className="min-w-max">
          <svg 
            width={hours.length * 45 + 100} 
            height={days.length * 45 + 80}
            className="block"
          >
            {/* X Axis - Hours */}
            <g transform="translate(100, 40)">
              {hours.map((hour, index) => (
                <text
                  key={index}
                  x={index * 45 + 22.5}
                  y={-10}
                  textAnchor="middle"
                  fill="#1E1E1E"
                  fontSize="12"
                  fontWeight="500"
                >
                  {hour}:00
                </text>
              ))}
            </g>

            {/* Y Axis - Days */}
            <g transform="translate(100, 40)">
              {days.map((day, index) => (
                <text
                  key={index}
                  x={-10}
                  y={index * 45 + 27.5}
                  textAnchor="end"
                  fill="#1E1E1E"
                  fontSize="12"
                  fontWeight="500"
                >
                  {day}
                </text>
              ))}
            </g>

            {/* Heatmap cells */}
            <g transform="translate(100, 40)">
              {data.map((cell, index) => {
                const xIndex = hours.indexOf(cell.hour);
                const yIndex = days.indexOf(cell.day);
                
                if (xIndex === -1 || yIndex === -1) return null;
                
                return (
                  <g key={index}>
                    <rect
                      x={xIndex * 45}
                      y={yIndex * 45}
                      width="40"
                      height="40"
                      className={`${getColorClass(cell)} cursor-pointer transition-all duration-200 hover:opacity-80`}
                      stroke="#fff"
                      strokeWidth="1"
                      onClick={() => handleCellClick(cell)}
                    />
                    <text
                      x={xIndex * 45 + 20}
                      y={yIndex * 45 + 20}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize="10"
                      fontWeight="600"
                      className="pointer-events-none select-none"
                    >
                      {viewMode === 'heatmap' ? cell.value : cell.activities}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Color legend */}
            <g transform="translate(20, 40)">
              <text x="0" y="-10" fill="#1E1E1E" fontSize="12" fontWeight="600">
                {viewMode === 'heatmap' ? 'Produtividade (%)' : 'Atividades'}
              </text>
              {viewMode === 'heatmap' ? (
                <>
                  <rect x="0" y="0" width="20" height="20" className="fill-green-500" />
                  <text x="25" y="15" fill="#1E1E1E" fontSize="10">80-100%</text>
                  <rect x="0" y="25" width="20" height="20" className="fill-green-400" />
                  <text x="25" y="40" fill="#1E1E1E" fontSize="10">60-79%</text>
                  <rect x="0" y="50" width="20" height="20" className="fill-yellow-400" />
                  <text x="25" y="65" fill="#1E1E1E" fontSize="10">40-59%</text>
                  <rect x="0" y="75" width="20" height="20" className="fill-orange-400" />
                  <text x="25" y="90" fill="#1E1E1E" fontSize="10">20-39%</text>
                  <rect x="0" y="100" width="20" height="20" className="fill-red-400" />
                  <text x="25" y="115" fill="#1E1E1E" fontSize="10">0-19%</text>
                </>
              ) : (
                <>
                  <rect x="0" y="0" width="20" height="20" className="fill-blue-700" />
                  <text x="25" y="15" fill="#1E1E1E" fontSize="10">Muitas</text>
                  <rect x="0" y="25" width="20" height="20" className="fill-blue-500" />
                  <text x="25" y="40" fill="#1E1E1E" fontSize="10">Alta</text>
                  <rect x="0" y="50" width="20" height="20" className="fill-blue-400" />
                  <text x="25" y="65" fill="#1E1E1E" fontSize="10">Média</text>
                  <rect x="0" y="75" width="20" height="20" className="fill-blue-300" />
                  <text x="25" y="90" fill="#1E1E1E" fontSize="10">Baixa</text>
                  <rect x="0" y="100" width="20" height="20" className="fill-blue-100" />
                  <text x="25" y="115" fill="#1E1E1E" fontSize="10">Mínima</text>
                </>
              )}
            </g>
          </svg>
        </div>
      </div>
      
      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <h4 className="text-green-800 font-semibold">Melhor Horário</h4>
          <p className="text-green-600 text-sm mt-1">
            {data.reduce((max, item) => item.value > max.value ? item : max, data[0]).hour}:00
          </p>
          <p className="text-green-600 text-xs">
            {data.reduce((max, item) => item.value > max.value ? item : max, data[0]).value.toFixed(1)}% de produtividade
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <h4 className="text-blue-800 font-semibold">Dia Mais Ativo</h4>
          <p className="text-blue-600 text-sm mt-1">
            {days.reduce((maxDay, day) => {
              const dayTotal = data
                .filter(item => item.day === day)
                .reduce((sum, item) => sum + item.activities, 0);
              const maxDayTotal = data
                .filter(item => item.day === maxDay)
                .reduce((sum, item) => sum + item.activities, 0);
              return dayTotal > maxDayTotal ? day : maxDay;
            }, days[0])}
          </p>
          <p className="text-blue-600 text-xs">
            Mais atividades registradas
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <h4 className="text-purple-800 font-semibold">Média Semanal</h4>
          <p className="text-purple-600 text-sm mt-1">
            {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(1)}%
          </p>
          <p className="text-purple-600 text-xs">
            Produtividade média
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedActivityHeatmap;