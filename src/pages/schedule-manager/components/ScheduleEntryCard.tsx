

import React, { useCallback } from 'react';
import { ScheduleEntry, Teacher, TeacherType, ClassType } from '../types';
import { 
    PencilIcon,
    UserGroupIcon,
    DumbbellIcon,
    MountainIcon,
    HeartPulseIcon,
    SparklesIcon,
    ClipboardIcon,
    UsersIcon,
    EyeIcon,
} from './icons';
import { CardLayout } from './ScheduleGrid';

const formatTime = (date: Date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

// Helper to map class types to their new styles and icons
const classTypeDetails = {
  [ClassType.CALISTENIA]: {
    Icon: DumbbellIcon,
    label: 'Calistenia',
    style: {
      bgColor: 'bg-calisthenics-green/5 dark:bg-calisthenics-green/10',
      headerBgColor: 'bg-calisthenics-green/10 dark:bg-calisthenics-green/20',
      borderColor: 'border-calisthenics-green',
      textColor: 'text-calisthenics-green',
    },
  },
  [ClassType.ESCALADA]: {
    Icon: MountainIcon,
    label: 'Escalada',
    style: {
      bgColor: 'bg-climbing-blue/5 dark:bg-climbing-blue/10',
      headerBgColor: 'bg-climbing-blue/10 dark:bg-climbing-blue/20',
      borderColor: 'border-climbing-blue',
      textColor: 'text-climbing-blue',
    },
  },
  [ClassType.FISIOTERAPIA]: {
    Icon: HeartPulseIcon,
    label: 'Fisioterapia',
    style: {
      bgColor: 'bg-physio-teal/5 dark:bg-physio-teal/10',
      headerBgColor: 'bg-physio-teal/10 dark:bg-physio-teal/20',
      borderColor: 'border-physio-teal',
      textColor: 'text-physio-teal',
    },
  },
  [ClassType.CALISTENIA_KIDS]: {
    Icon: SparklesIcon,
    label: 'Calistenia Kids',
    style: {
      bgColor: 'bg-kids-yellow/5 dark:bg-kids-yellow/10',
      headerBgColor: 'bg-kids-yellow/10 dark:bg-kids-yellow/20',
      borderColor: 'border-kids-yellow',
      textColor: 'text-kids-yellow',
    },
  },
    [ClassType.AULA_LIVRE]: {
    Icon: DumbbellIcon, // Using a generic icon for now
    label: 'Aula Livre',
    style: {
      bgColor: 'bg-purple-500/5 dark:bg-purple-500/10',
      headerBgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-500',
    },
  },
  [ClassType.PONTO]: {
    Icon: ClipboardIcon,
    label: 'Ponto Registrado',
    style: {
      bgColor: 'bg-unplanned-gray/5 dark:bg-unplanned-gray/10',
      headerBgColor: 'bg-unplanned-gray/10 dark:bg-unplanned-gray/20',
      borderColor: 'border-unplanned-gray',
      textColor: 'text-unplanned-gray',
    },
  },
  [ClassType.BOTH]: {
    Icon: UsersIcon,
    label: 'Calistenia & Escalada',
    style: {
      bgColor: 'bg-gradient-to-br from-both-start/5 to-both-end/5 dark:from-both-start/10 dark:to-both-end/10',
      headerBgColor: 'bg-gradient-to-br from-both-start/10 to-both-end/10 dark:from-both-start/20 dark:to-both-end/20',
      borderColor: 'border-lime-green', // A neutral, vibrant border for the gradient
      textColor: 'text-white', // Needs a solid text color to be readable
    },
  },
  [ClassType.SUPERVISAO_LIVRE]: {
    Icon: EyeIcon,
    label: 'Supervisão',
    style: {
      bgColor: 'bg-purple-600/5 dark:bg-purple-600/10',
      headerBgColor: 'bg-purple-600/10 dark:bg-purple-600/20',
      borderColor: 'border-purple-600',
      textColor: 'text-purple-600',
    },
  },
};

const ScheduleEntryCard: React.FC<{
  entry: ScheduleEntry;
  getTeachersByIds: (ids:string[]) => Teacher[];
  onEdit: (entry: ScheduleEntry) => void;
  onEditTime: (entry: ScheduleEntry, target: HTMLElement) => void;
  layout: CardLayout;
  isHighlighted: boolean;
}> = ({ entry, getTeachersByIds, onEdit, onEditTime, layout, isHighlighted }) => {
  const teachers = getTeachersByIds(entry.teacherIds);
  if (teachers.length === 0) return null;

  const startHour = entry.startTime.getHours();
  const startMinute = entry.startTime.getMinutes();
  const durationInMinutes = (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60);
  
  const top = ((startHour - 6) * 60 + startMinute) / 15 * 1.25;
  let height = (durationInMinutes / 15) * 1.25;
  if (height < 3.5) height = 3.5; // Minimum height for readability

  const details = classTypeDetails[entry.isUnplanned ? ClassType.PONTO : entry.classType];
  const { Icon, label, style: cardStyle } = details;

  const borderStyle = teachers[0].type === TeacherType.TITULAR ? 'border-solid' : 'border-dotted';
  const isShortCard = height < 4.5;
  const highlightClass = isHighlighted ? 'ring-2 ring-lime-green ring-offset-2 dark:ring-offset-army-olive scale-[1.03]' : 'shadow-sm';

  const handleEditTimeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onEditTime(entry, e.currentTarget);
  }, [onEditTime, entry]);

  const handleCardClick = useCallback(() => {
      if (entry.isUnplanned) return; // Do not open edit modal for unplanned entries
      onEdit(entry);
  }, [onEdit, entry]);
  
  const teacherDisplay = teachers.map(t => t.name.split(' ')[0]).join(', ');
  const CardIcon = teachers.length > 1 ? UsersIcon : Icon;
  const isClickable = !entry.isUnplanned;

  return (
    <div
      onClick={handleCardClick}
      className={`absolute rounded-lg border-l-4 ${cardStyle.bgColor} ${cardStyle.borderColor} ${borderStyle} text-gray-800 dark:text-gray-200 text-left overflow-hidden flex flex-col group transition-all duration-200 ${isClickable ? 'hover:shadow-lg dark:hover:shadow-lime-green/10 focus-within:shadow-lg focus-within:scale-[1.02] hover:scale-[1.02] cursor-pointer' : 'cursor-default'} ${highlightClass}`}
      style={{ 
        top: `${top}rem`, 
        height: `${height}rem`,
        left: layout.left,
        width: layout.width,
        zIndex: isHighlighted ? layout.zIndex + 100 : layout.zIndex,
      }}
      role={isClickable ? "button" : "region"}
      aria-label={`${isClickable ? 'Editar' : ''} ${label} de ${teacherDisplay}`}
    >
      <div className={`p-2 w-full h-full flex flex-col justify-between ${cardStyle.headerBgColor}`}>
        {/* Card Content */}
        <div>
          <div className="flex justify-between items-start">
            <div className={`flex items-center gap-1.5 ${cardStyle.textColor}`}>
              <CardIcon className="w-4 h-4 flex-shrink-0" />
              <p className="font-bold text-sm truncate text-gray-900 dark:text-white">{label}</p>
            </div>
            {!entry.isUnplanned && (
                <button
                    onClick={handleEditTimeClick}
                    className="p-1 -mr-1 -mt-1 rounded-full opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity hover:bg-black/10 dark:hover:bg-white/10"
                    aria-label="Editar horário"
                >
                    <PencilIcon className="h-3.5 w-3.5" />
                </button>
            )}
          </div>
          {!isShortCard && (
            <p className="text-xs truncate mt-1 text-gray-600 dark:text-gray-400">{teacherDisplay}</p>
          )}
        </div>

        <div className="flex justify-between items-end text-xs text-gray-600 dark:text-gray-400">
            <p className="font-mono">{formatTime(entry.startTime)}</p>
            {!entry.isUnplanned && entry.studentIds.length > 0 && (
                <div className="flex items-center gap-1">
                    <UserGroupIcon className="w-3.5 h-3.5" />
                    <span>{entry.studentIds.length}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ScheduleEntryCard);