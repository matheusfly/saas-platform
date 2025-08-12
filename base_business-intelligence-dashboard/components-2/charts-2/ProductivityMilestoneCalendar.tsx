import React, { useState } from 'react';

interface CalendarDay {
  date: string;
  day: number;
  productivity: number;
  milestone: string | null;
  isWeekend: boolean;
}

interface ProductivityMilestoneCalendarProps {
  data: CalendarDay[];
  onDayClick?: (day: CalendarDay) => void;
}

const ProductivityMilestoneCalendar: React.FC<ProductivityMilestoneCalendarProps> = ({ 
  data, 
  onDayClick 
}) => {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Group data by weeks
  const getWeeks = () => {
    const weeks = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    let week = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      week.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = data.find(d => d.date === dateStr) || {
        date: dateStr,
        day,
        productivity: 0,
        milestone: null,
        isWeekend: new Date(currentYear, currentMonth, day).getDay() === 0 || 
                  new Date(currentYear, currentMonth, day).getDay() === 6
      };
      
      week.push(dayData);
      
      // If we've reached the end of the week or the end of the month
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    // Add empty cells for days after the last day of the month
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }
    
    return weeks;
  };

  const weeks = getWeeks();

  // Color scale for productivity
  const getDayColor = (productivity: number) => {
    if (productivity >= 90) return 'bg-green-500';
    if (productivity >= 75) return 'bg-green-400';
    if (productivity >= 60) return 'bg-yellow-400';
    if (productivity >= 40) return 'bg-orange-400';
    if (productivity > 0) return 'bg-red-400';
    return 'bg-gray-200';
  };

  // Handle day click
  const handleDayClick = (day: CalendarDay | null) => {
    if (day) {
      setSelectedDay(day);
      if (onDayClick) {
        onDayClick(day);
      }
    }
  };

  // Navigate months
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Get month name
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="h-full w-full">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-text-main">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        
        <button 
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map((day, dayIndex) => (
                <div 
                  key={`${weekIndex}-${dayIndex}`}
                  className={`min-h-20 p-1 border border-gray-100 ${
                    day?.isWeekend ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  {day ? (
                    <div 
                      className={`h-full rounded cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedDay?.date === day.date 
                          ? 'ring-2 ring-blue-500' 
                          : ''
                      }`}
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${
                          day.isWeekend ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                          {day.day}
                        </span>
                        {day.milestone && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      
                      <div className="mt-1 flex justify-center">
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            getDayColor(day.productivity)
                          }`}
                        >
                          {day.productivity > 0 ? day.productivity : ''}
                        </div>
                      </div>
                      
                      {day.milestone && (
                        <div className="mt-1 text-xs text-blue-600 font-medium truncate">
                          {day.milestone}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full"></div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Day Detail Panel */}
      {selectedDay && (
        <div className="mt-6 bg-surface-card p-4 rounded-lg border border-brand-border">
          <h4 className="text-text-main font-semibold mb-3">
            Detalhes do Dia: {selectedDay.date}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-blue-800 text-sm font-medium">Produtividade</p>
              <p className="text-blue-600 text-xl font-bold">{selectedDay.productivity}%</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-green-800 text-sm font-medium">Status</p>
              <p className="text-green-600 text-xl font-bold">
                {selectedDay.productivity >= 80 ? 'Excelente' : 
                 selectedDay.productivity >= 60 ? 'Bom' : 
                 selectedDay.productivity >= 40 ? 'Regular' : 'Baixo'}
              </p>
            </div>
            
            {selectedDay.milestone && (
              <div className="col-span-2 bg-purple-50 p-3 rounded border border-purple-200">
                <p className="text-purple-800 text-sm font-medium">Marco Alcançado</p>
                <p className="text-purple-600 font-medium">{selectedDay.milestone}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Calendar Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <h4 className="text-blue-800 font-semibold">Dias Produtivos</h4>
          <p className="text-blue-600 text-xl font-bold mt-1">
            {data.filter(d => d.productivity >= 75).length}
          </p>
          <p className="text-blue-600 text-xs">Acima de 75% de produtividade</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <h4 className="text-green-800 font-semibold">Marcos Alcançados</h4>
          <p className="text-green-600 text-xl font-bold mt-1">
            {data.filter(d => d.milestone).length}
          </p>
          <p className="text-green-600 text-xs">Objetivos importantes</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <h4 className="text-purple-800 font-semibold">Média Mensal</h4>
          <p className="text-purple-600 text-xl font-bold mt-1">
            {(data.reduce((sum, d) => sum + d.productivity, 0) / data.length || 0).toFixed(1)}%
          </p>
          <p className="text-purple-600 text-xs">Produtividade média</p>
        </div>
      </div>
    </div>
  );
};

export default ProductivityMilestoneCalendar;