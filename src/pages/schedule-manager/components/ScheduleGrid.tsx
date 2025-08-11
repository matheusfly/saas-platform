
import React, { useState, useMemo, useCallback } from 'react';
import { ScheduleEntry, Teacher } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from './icons';
import TimeEditorPopover from './TimeEditorPopover';
import ScheduleEntryCard from './ScheduleEntryCard';

interface ScheduleGridProps {
  entries: ScheduleEntry[];
  teachers: Teacher[];
  getTeacherById: (id: string) => Teacher | undefined;
  getTeachersByIds: (ids: string[]) => Teacher[];
  onEditEntry: (entry: ScheduleEntry) => void;
  updateEntry: (entryId: string, updatedData: Partial<Omit<ScheduleEntry, 'id'>>) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  teacherFilter: string;
  setTeacherFilter: (id: string) => void;
}

type EditingTimeState = { entry: ScheduleEntry; target: HTMLElement } | null;

const timeSlots = Array.from({ length: 16 }, (_, i) => `${i + 6}:00`); // 6 AM to 9 PM

export interface CardLayout {
  width: string;
  left: string;
  zIndex: number;
}

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const newDate = new Date(d.setDate(diff));
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const processEntriesForLayout = (entries: ScheduleEntry[]): { entry: ScheduleEntry; layout: CardLayout }[] => {
    const sortedEntries = [...entries].sort((a, b) => {
        if (a.startTime.getTime() !== b.startTime.getTime()) {
            return a.startTime.getTime() - b.startTime.getTime();
        }
        return b.endTime.getTime() - a.endTime.getTime();
    });

    const entryLayouts: { entry: ScheduleEntry; col: number; totalCols: number }[] = [];

    for (const currentEntry of sortedEntries) {
        let col = 0;
        while (
            entryLayouts.some(
                (placedLayout) =>
                    placedLayout.col === col &&
                    currentEntry.startTime.getTime() < placedLayout.entry.endTime.getTime() &&
                    currentEntry.endTime.getTime() > placedLayout.entry.startTime.getTime()
            )
        ) {
            col++;
        }
        entryLayouts.push({ entry: currentEntry, col: col, totalCols: 1 });
    }
    
    for (const currentLayout of entryLayouts) {
        const overlapping = entryLayouts.filter(
            (otherLayout) =>
                currentLayout.entry.startTime.getTime() < otherLayout.entry.endTime.getTime() &&
                currentLayout.entry.endTime.getTime() > otherLayout.entry.startTime.getTime()
        );
        const maxCol = Math.max(...overlapping.map((e) => e.col));
        currentLayout.totalCols = maxCol + 1;
    }

    return entryLayouts.map(({ entry, col, totalCols }) => {
        const width = 100 / totalCols;
        return {
            entry,
            layout: {
                width: `calc(${width}% - 2px)`,
                left: `calc(${col * width}%)`,
                zIndex: col + 10,
            },
        };
    });
};


const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
    entries, 
    teachers,
    getTeacherById, 
    getTeachersByIds,
    onEditEntry, 
    updateEntry, 
    currentDate, 
    setCurrentDate,
    teacherFilter,
    setTeacherFilter,
}) => {
  const displayDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const [editingTime, setEditingTime] = useState<EditingTimeState>(null);
  const [highlightedTeacherId, setHighlightedTeacherId] = useState<string | null>(null);

  const weekStart = getWeekStart(currentDate);
  
  const generatedEntries = useMemo(() => {
    const currentWeekStart = getWeekStart(currentDate);

    // 'entries' prop is our base pattern. We regenerate the schedule for the current week.
    return entries.map(patternEntry => {
        const newEntryDate = new Date(currentWeekStart);
        newEntryDate.setDate(currentWeekStart.getDate() + (patternEntry.day - 1));

        const newStartTime = new Date(newEntryDate.getFullYear(), newEntryDate.getMonth(), newEntryDate.getDate(), patternEntry.startTime.getHours(), patternEntry.startTime.getMinutes(), 0, 0);
        const newEndTime = new Date(newEntryDate.getFullYear(), newEntryDate.getMonth(), newEntryDate.getDate(), patternEntry.endTime.getHours(), patternEntry.endTime.getMinutes(), 0, 0);
        
        if (newEndTime.getTime() <= newStartTime.getTime()) {
            newEndTime.setDate(newEndTime.getDate() + 1);
        }

        return {
            ...patternEntry,
            startTime: newStartTime,
            endTime: newEndTime,
        };
    });
  }, [entries, currentDate]);
  
  const weeklyWorkload = useMemo(() => {
    return teachers.map(teacher => {
        const scheduledHours = generatedEntries.reduce((total, entry) => {
            if (entry.teacherIds.includes(teacher.id)) {
                const duration = (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60);
                return total + duration;
            }
            return total;
        }, 0);
        return {
            teacherId: teacher.id,
            name: teacher.name,
            contractedHours: teacher.contractedHours,
            scheduledHours: scheduledHours,
        };
    });
  }, [teachers, generatedEntries]);

  // Memoize layout calculations for performance
  const entriesByDay = useMemo(() => {
    const map = new Map<number, { entry: ScheduleEntry; layout: CardLayout }[]>();
    for (let i = 1; i <= 5; i++) {
        let entriesForDay = generatedEntries.filter(e => e.day === i);
        if (teacherFilter !== 'all') {
            entriesForDay = entriesForDay.filter(e => e.teacherIds.includes(teacherFilter));
        }
        const laidOutEntries = processEntriesForLayout(entriesForDay);
        map.set(i, laidOutEntries);
    }
    return map;
  }, [generatedEntries, teacherFilter]);

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateRange = (start: Date): string => {
    const end = new Date(start);
    end.setDate(end.getDate() + 4);
    
    const startOptions: Intl.DateTimeFormatOptions = { day: 'numeric' };
    const endOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

    if (start.getMonth() !== end.getMonth()) {
        startOptions.month = 'long';
    }

    if (start.getFullYear() !== end.getFullYear()) {
        startOptions.year = 'numeric';
    }
    
    const startStr = start.toLocaleDateString('pt-BR', startOptions);
    const endStr = end.toLocaleDateString('pt-BR', endOptions);

    return `${startStr} - ${endStr}`;
  };

  const handleSaveTime = (entryId: string, newTimes: { startTime: Date; endTime: Date }) => {
    const patternEntry = entries.find(e => e.id === entryId);
    if (!patternEntry) return;

    const newPatternStartTime = new Date(patternEntry.startTime);
    newPatternStartTime.setHours(newTimes.startTime.getHours(), newTimes.startTime.getMinutes(), 0, 0);

    const newPatternEndTime = new Date(patternEntry.endTime);
    newPatternEndTime.setHours(newTimes.endTime.getHours(), newTimes.endTime.getMinutes(), 0, 0);
    
    if (newPatternEndTime.getTime() <= newPatternStartTime.getTime()) {
      newPatternEndTime.setDate(newPatternEndTime.getDate() + 1);
    }

    updateEntry(entryId, { startTime: newPatternStartTime, endTime: newPatternEndTime });
    setEditingTime(null);
  };
  
  const handleEditTime = useCallback((entry: ScheduleEntry, target: HTMLElement) => {
    setEditingTime({ entry, target });
  }, []);
  
  return (
    <>
      {/* Teacher Workload Summary in its own card */}
      <div className="bg-white dark:bg-army-olive p-4 sm:p-6 rounded-2xl shadow-lg transition-colors duration-300 mb-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Planejamento de Horas Contratadas</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
          {weeklyWorkload.map(wl => {
            const percentage = wl.contractedHours > 0 ? (wl.scheduledHours / wl.contractedHours) * 100 : 0;
            const difference = wl.scheduledHours - wl.contractedHours;
            const isOver = difference > 0;
            return (
              <div 
                key={wl.teacherId}
                onClick={() => setHighlightedTeacherId(highlightedTeacherId === wl.teacherId ? null : wl.teacherId)}
                className={`flex-shrink-0 w-64 p-3 rounded-lg cursor-pointer transition-all duration-200 ${highlightedTeacherId === wl.teacherId ? 'bg-lime-green/20 ring-2 ring-lime-green' : 'bg-gray-100 dark:bg-charcoal-black/50 hover:bg-gray-200 dark:hover:bg-charcoal-black'}`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <p className="font-bold text-gray-900 dark:text-white truncate">{wl.name}</p>
                  <p className={`font-bold text-sm ${isOver ? 'text-red-500' : 'text-green-500'}`}>
                    {difference.toFixed(1)}h
                  </p>
                </div>
                <div className="w-full bg-gray-300 dark:bg-army-olive-light rounded-full h-2.5">
                  <div 
                    className={`${isOver ? 'bg-red-500' : 'bg-lime-green'} h-2.5 rounded-full`} 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-right mt-1 text-gray-500 dark:text-sage">
                  {wl.scheduledHours.toFixed(1)}h / {wl.contractedHours}h
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* The actual schedule grid in its own card */}
      <div className="relative bg-white dark:bg-army-olive p-4 sm:p-6 rounded-2xl shadow-lg transition-colors duration-300 flex flex-col">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Grade Horária Semanal</h2>
          
          <div className="flex items-center gap-2 sm:gap-4 order-last sm:order-none w-full sm:w-auto justify-center">
            <button onClick={handlePreviousWeek} aria-label="Semana anterior" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors">
              <ChevronLeftIcon className="h-6 w-6 text-gray-500 dark:text-gray-400"/>
            </button>
            <div className="flex items-center">
              <button onClick={handleToday} className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 dark:bg-charcoal-black hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors">
                  Hoje
              </button>
              <div className="font-semibold text-sm sm:text-base text-center text-gray-900 dark:text-white whitespace-nowrap ml-4">
                  {formatDateRange(weekStart)}
              </div>
            </div>
            <button onClick={handleNextWeek} aria-label="Próxima semana" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors">
              <ChevronRightIcon className="h-6 w-6 text-gray-500 dark:text-gray-400"/>
            </button>
          </div>
          
          <div className="relative w-full sm:w-auto min-w-[200px]">
            <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
            <select 
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 dark:bg-charcoal-black hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors appearance-none focus:ring-2 focus:ring-lime-green focus:outline-none"
            >
              <option value="all">Filtrar por professor...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 flex-grow schedule-grid-container">
          <div className="min-w-[70rem] xl:min-w-full">
            <div className="grid grid-cols-[4rem_repeat(5,1fr)] text-center font-bold text-gray-500 dark:text-sage">
              <div></div>
              {displayDays.map(day => <div key={day} className="p-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-[4rem_repeat(5,1fr)] h-[80rem] pb-20">
              {/* Time column */}
              <div className="text-right pr-2 text-xs text-gray-500 dark:text-sage">
                {timeSlots.map(time => (
                  <div key={time} className="h-20 flex items-start justify-end pt-1 border-r border-gray-200 dark:border-khaki-border/60">
                    {time}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {displayDays.map((day, dayIndex) => {
                const actualDayIndex = dayIndex + 1;
                const laidOutEntries = entriesByDay.get(actualDayIndex) || [];

                return (
                  <div key={actualDayIndex} className="relative border-r border-gray-200 dark:border-khaki-border/60 px-1">
                    {timeSlots.map((_, timeIndex) => (
                      <div key={timeIndex} className="h-20 border-t border-gray-200 dark:border-khaki-border/60"></div>
                    ))}

                    {laidOutEntries.map(({ entry, layout }) => (
                      <ScheduleEntryCard 
                        key={`${entry.id}-${entry.startTime.toISOString()}`} 
                        entry={entry} 
                        getTeachersByIds={getTeachersByIds} 
                        onEdit={onEditEntry} 
                        onEditTime={handleEditTime}
                        layout={layout}
                        isHighlighted={highlightedTeacherId ? entry.teacherIds.includes(highlightedTeacherId) : false}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {editingTime && (
          <TimeEditorPopover
            editingTime={editingTime}
            onClose={() => setEditingTime(null)}
            onSave={handleSaveTime}
          />
        )}
      </div>
    </>
  );
};

export default ScheduleGrid;
