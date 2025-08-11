import React from 'react';
import { Teacher, WorkLog } from '../types';
import { ClockIcon } from './icons';

interface WorkLogPanelProps {
  teachers: Teacher[];
  workLogs: WorkLog[];
  onCheckIn: (teacherId: string, date: Date) => void;
  onCheckOut: (logId: string, date: Date) => void;
  onAddManualLog: (teacher: Teacher) => void;
  onEditManualLog: (teacher: Teacher, log: WorkLog) => void;
}

const TimeDuration: React.FC<{ startTime: Date }> = ({ startTime }) => {
    const [duration, setDuration] = React.useState('');

    React.useEffect(() => {
        const calculateDuration = () => {
            const diff = new Date().getTime() - startTime.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setDuration(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        };
        
        calculateDuration();
        const intervalId = setInterval(calculateDuration, 1000);

        return () => clearInterval(intervalId);
    }, [startTime]);

    return <span className="text-sm font-mono">{duration}</span>;
};

const WorkLogPanel: React.FC<WorkLogPanelProps> = ({ teachers, workLogs, onCheckIn, onCheckOut, onAddManualLog, onEditManualLog }) => {

  const getTeacherStatus = (teacherId: string) => {
    const lastLog = workLogs
      .filter(log => log.teacherId === teacherId)
      .sort((a, b) => b.checkIn.getTime() - a.checkIn.getTime())[0];
    
    if (lastLog && !lastLog.checkOut) {
      return { status: 'Checked In', log: lastLog };
    }
    return { status: 'Checked Out', log: null };
  };

  return (
    <div className="bg-white dark:bg-army-olive p-6 rounded-2xl shadow-lg transition-colors duration-300 h-full">
      <div className="flex items-center mb-6">
        <ClockIcon className="h-8 w-8 text-lime-green mr-3" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Controle de Ponto</h2>
      </div>
      <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
        {teachers.map(teacher => {
          const { status, log } = getTeacherStatus(teacher.id);
          const isCheckedIn = status === 'Checked In';

          return (
            <div key={teacher.id} className="flex items-center justify-between bg-gray-100 dark:bg-charcoal-black/50 p-3 rounded-lg">
              <div className="flex items-center">
                <span className={`h-3 w-3 rounded-full mr-3 ${isCheckedIn ? 'bg-lime-green animate-pulse' : 'bg-gray-400'}`}></span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{teacher.name}</p>
                  <p className={`text-xs ${isCheckedIn ? 'text-lime-green' : 'text-gray-500 dark:text-sage'}`}>
                    {isCheckedIn && log ? <TimeDuration startTime={log.checkIn} /> : 'Checked Out'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                  {isCheckedIn && log ? (
                  <>
                      <button
                          onClick={() => onCheckOut(log.id, new Date())}
                          className="bg-red-500/20 text-red-500 font-bold px-4 py-1.5 rounded-lg hover:bg-red-500/30 transition-all duration-200 text-sm"
                      >
                          Check-out
                      </button>
                      <button
                          onClick={() => onEditManualLog(teacher, log)}
                           className="bg-gray-200 dark:bg-army-olive-light/70 text-gray-800 dark:text-gray-200 font-bold px-4 py-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-army-olive-light transition-all duration-200 text-sm"
                      >
                         Manual
                      </button>
                  </>
                  ) : (
                  <>
                      <button
                          onClick={() => onCheckIn(teacher.id, new Date())}
                          className="bg-lime-green text-charcoal-black font-bold px-4 py-1.5 rounded-lg hover:brightness-110 transition-all duration-200 text-sm"
                      >
                          Check-in
                      </button>
                      <button
                          onClick={() => onAddManualLog(teacher)}
                          className="bg-gray-200 dark:bg-army-olive-light/70 text-gray-800 dark:text-gray-200 font-bold px-4 py-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-army-olive-light transition-all duration-200 text-sm"
                      >
                         Manual
                      </button>
                  </>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkLogPanel;