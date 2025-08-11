import React, { useState, useEffect } from 'react';
import { Teacher, ScheduleEntry, ClassType } from '../types';
import { TrashIcon, PlusIcon, InformationCircleIcon, ClockIcon, CalendarIcon, RectangleStackIcon, UsersIcon, CalendarDaysIcon, UserGroupIcon, ClipboardIcon, QuestionMarkCircleIcon } from './icons';
import WheelTimePickerPopover from './WheelTimePickerPopover';
import CalendarPopover from './CalendarPopover';
import InfoPopover from './InfoPopover';

interface ClassFormProps {
  entry: ScheduleEntry | null; // null for creating, object for editing
  teachers: Teacher[];
  onSave: (data: Omit<ScheduleEntry, 'id'>, id?: string) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const weekDays = [
  { short: 'D', long: 'Domingo', value: 0 },
  { short: 'S', long: 'Segunda', value: 1 },
  { short: 'T', long: 'Terça', value: 2 },
  { short: 'Q', long: 'Quarta', value: 3 },
  { short: 'Q', long: 'Quinta', value: 4 },
  { short: 'S', long: 'Sexta', value: 5 },
  { short: 'S', long: 'Sábado', value: 6 },
];

const infoTexts = {
    classType: "Define a modalidade da aula (ex: Calistenia, Escalada). A cor do card na grade será baseada neste tipo.",
    capacity: "Define o número máximo de alunos que podem se inscrever nesta aula.",
    isRecurring: "Escolha 'Recorrente' para aulas que se repetem semanalmente. Escolha 'Aula Única' para um evento que acontece apenas uma vez.",
    repeatType: "Define a frequência da recorrência. Atualmente, apenas 'Semanalmente' está disponível.",
    day: "Para aulas recorrentes, selecione o dia fixo da semana em que a aula ocorrerá.",
    startDate: "Para aulas únicas, selecione a data exata em que o evento acontecerá.",
    startTime: "Define o horário em que a aula começa. A duração é fixada em 1 hora.",
    considerHolidays: "Se marcado, o sistema não irá gerar esta aula em datas que são feriados nacionais.",
    teacherIds: "Selecione um ou mais professores para ministrar esta aula. Pode selecionar múltiplos.",
    notes: "Um campo opcional para adicionar qualquer nota ou detalhe importante sobre a aula."
};

const ClassForm: React.FC<ClassFormProps> = ({ 
    entry, 
    teachers, 
    onSave, 
    onCancel, 
    onDelete,
}) => {
  const [formData, setFormData] = useState({
    classType: entry?.classType || ClassType.AULA_LIVRE,
    capacity: entry?.capacity || 3,
    isRecurring: entry?.isRecurring ?? true,
    repeatType: 'weekly',
    startDate: entry?.startTime || new Date(),
    day: entry?.day ?? new Date().getDay(),
    startTime: entry?.startTime || new Date(),
    considerHolidays: entry?.considerHolidays || false,
    teacherIds: entry?.teacherIds || [],
    notes: entry?.notes || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [activePopover, setActivePopover] = useState<'date' | 'time' | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [infoPopover, setInfoPopover] = useState<{ anchor: HTMLElement; content: string } | null>(null);

  useEffect(() => {
    if (entry) {
        setFormData({
            classType: entry.classType,
            capacity: entry.capacity || 3,
            isRecurring: entry.isRecurring ?? true,
            repeatType: 'weekly',
            startDate: entry.startTime,
            day: entry.day,
            startTime: entry.startTime,
            considerHolidays: entry.considerHolidays || false,
            teacherIds: entry.teacherIds,
            notes: entry.notes || '',
        });
    }
    setIsConfirmingDelete(false);
    setErrors({});
  }, [entry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    if (type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
    }
    if (name === 'capacity') {
        processedValue = parseInt(value, 10);
    }
     if (name === 'isRecurring') {
        processedValue = value === 'true';
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}));
    }
  };
  
  const handleDayToggle = (dayValue: number) => {
    setFormData(prev => ({ ...prev, day: dayValue }));
  };

  const handleTeacherToggle = (teacherId: string) => {
    setFormData(prev => {
        const newTeacherIds = prev.teacherIds.includes(teacherId)
            ? prev.teacherIds.filter(id => id !== teacherId)
            : [...prev.teacherIds, teacherId];
        return { ...prev, teacherIds: newTeacherIds };
    });
     if (errors.teacherIds) {
        setErrors(prev => ({...prev, teacherIds: ''}));
    }
  };

  const handleOpenPopover = (popover: 'date' | 'time', e: React.MouseEvent<HTMLButtonElement>) => {
    setPopoverAnchor(e.currentTarget);
    setActivePopover(popover);
  };
  
  const handleDateChange = (newDate: Date) => {
    setFormData(prev => ({ ...prev, startDate: newDate, day: newDate.getDay() }));
    setActivePopover(null);
  };
  
  const handleTimeChange = (newTime: Date) => {
    setFormData(prev => ({...prev, startTime: newTime }));
    setActivePopover(null);
  };
  
  const handleShowInfo = (anchor: HTMLElement, content: string) => {
    setInfoPopover({ anchor, content });
  };
  
  const handleHideInfo = () => {
    setInfoPopover(null);
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (formData.teacherIds.length === 0) newErrors.teacherIds = "Selecione pelo menos um professor.";
    if (!formData.startTime) newErrors.startTime = "Horário de início é obrigatório.";
    if (formData.capacity <= 0) newErrors.capacity = "Vagas deve ser um número positivo.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmingDelete) return;
    if (!validate()) return;
    
    const finalStartTime = new Date(formData.startDate);
    finalStartTime.setHours(formData.startTime.getHours(), formData.startTime.getMinutes(), 0, 0);

    // Assuming 1-hour duration for now
    const finalEndTime = new Date(finalStartTime.getTime() + 60 * 60 * 1000);

    const saveData: Omit<ScheduleEntry, 'id'> = {
        classType: formData.classType,
        capacity: formData.capacity,
        isRecurring: formData.isRecurring,
        startTime: finalStartTime,
        endTime: finalEndTime,
        day: formData.isRecurring ? formData.day : finalStartTime.getDay(),
        considerHolidays: formData.considerHolidays,
        teacherIds: formData.teacherIds,
        studentIds: entry?.studentIds || [], // Not managed in this form, preserve existing
        notes: formData.notes,
    };

    onSave(saveData, entry?.id);
  };
  
  const handleDeleteClick = () => {
    if (onDelete && entry) {
        if (isConfirmingDelete) {
            onDelete(entry.id);
        } else {
            setIsConfirmingDelete(true);
        }
    }
  };

  const baseInputClasses = "w-full p-3 rounded-lg bg-gray-100 dark:bg-charcoal-black border-2 border-transparent focus:border-lime-green focus:ring-0 transition-colors duration-200 text-gray-800 dark:text-gray-200";
  const errorBorderClasses = "border-red-500 dark:border-red-500";
  const iconButtonClasses = "absolute left-3 top-1/2 -translate-y-1/2 z-10 p-1 text-gray-400 dark:text-sage hover:text-lime-green dark:hover:text-lime-green transition-colors";
  const iconClasses = "h-5 w-5";

  return (
    <>
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        {/* Row 1: Turma & Vagas */}
        <div className="grid grid-cols-2 gap-4">
            <div className="relative">
                <button type="button" onMouseEnter={(e) => handleShowInfo(e.currentTarget, infoTexts.classType)} onMouseLeave={handleHideInfo} className={iconButtonClasses} aria-label="Info sobre Tipo de Turma"><RectangleStackIcon className={iconClasses} /></button>
                <select name="classType" value={formData.classType} onChange={handleChange} className={`${baseInputClasses} pl-12`}>
                    {Object.values(ClassType).filter(t => t !== ClassType.PONTO && t !== ClassType.SUPERVISAO_LIVRE).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <div className="relative">
                <button type="button" onMouseEnter={(e) => handleShowInfo(e.currentTarget, infoTexts.capacity)} onMouseLeave={handleHideInfo} className={iconButtonClasses} aria-label="Info sobre Vagas"><UsersIcon className={iconClasses} /></button>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className={`${baseInputClasses} pl-12 ${errors.capacity ? errorBorderClasses : ''}`} placeholder="Vagas" />
            </div>
        </div>
        {errors.capacity && <p className="text-red-500 text-xs -mt-2 ml-2">{errors.capacity}</p>}

        {/* Row 2: Tipo de Aula & Repetir */}
        <div className="grid grid-cols-2 gap-4">
            <div className="relative">
                <button type="button" onMouseEnter={(e) => handleShowInfo(e.currentTarget, infoTexts.isRecurring)} onMouseLeave={handleHideInfo} className={iconButtonClasses} aria-label="Info sobre Recorrência"><CalendarDaysIcon className={iconClasses} /></button>
                <select name="isRecurring" value={String(formData.isRecurring)} onChange={handleChange} className={`${baseInputClasses} pl-12`}>
                    <option value="true">Recorrente</option>
                    <option value="false">Aula Única</option>
                </select>
            </div>
             <div className="relative">
                <button type="button" onMouseEnter={(e) => handleShowInfo(e.currentTarget, infoTexts.repeatType)} onMouseLeave={handleHideInfo} className={iconButtonClasses} aria-label="Info sobre Frequência de Repetição"><CalendarDaysIcon className={iconClasses} /></button>
                <select name="repeatType" value={formData.repeatType} disabled={!formData.isRecurring} onChange={handleChange} className={`${baseInputClasses} pl-12 disabled:opacity-50`}>
                    <option value="weekly">Semanalmente</option>
                </select>
            </div>
        </div>

        {/* Row 3: Data de Início & Dia da Semana / Horário */}
        <div className="grid grid-cols-2 gap-4">
          {formData.isRecurring ? (
              <div onMouseEnter={(e) => handleShowInfo(e.currentTarget, infoTexts.day)} onMouseLeave={handleHideInfo}>
                  <label className="block text-sm font-medium text-gray-500 dark:text-sage mb-1">Dia da semana</label>
                  <div className="flex justify-between items-center bg-gray-100 dark:bg-charcoal-black p-1 rounded-lg">
                      {weekDays.slice(1,6).map(day => ( // Only Mon-Fri
                          <button type="button" key={day.value} onClick={() => handleDayToggle(day.value)} className={`flex-1 p-2 text-sm font-bold rounded-md transition-colors ${formData.day === day.value ? 'bg-lime-green text-charcoal-black' : 'text-gray-500 dark:text-sage hover:bg-gray-200 dark:hover:bg-army-olive-light'}`}>
                              {day.short}
                          </button>
                      ))}
                  </div>
              </div>
          ) : (
              <div>
                 <label className="block text-sm font-medium text-gray-500 dark:text-sage mb-1">Data da aula</label>
                 <button type="button" onClick={(e) => handleOpenPopover('date', e)} className="relative w-full text-left" onMouseEnter={(e) => handleShowInfo(e.currentTarget, infoTexts.startDate)} onMouseLeave={handleHideInfo}>
                     <CalendarIcon className={`${iconClasses} absolute left-3 top-1/2 -translate-y-1/2`} />
                     <span className={`${baseInputClasses} block pl-12`}>{formData.startDate.toLocaleDateString('pt-BR')}</span>
                 </button>
              </div>
          )}

          <div>
             <label className="block text-sm font-medium text-gray-500 dark:text-sage mb-1">Horário de início</label>
             <button type="button" onClick={(e) => handleOpenPopover('time', e)} className={`relative w-full text-left ${errors.startTime ? errorBorderClasses : ''}`} onMouseEnter={(e) => handleShowInfo(e.currentTarget, infoTexts.startTime)} onMouseLeave={handleHideInfo}>
                 <ClockIcon className={`${iconClasses} absolute left-3 top-1/2 -translate-y-1/2`} />
                 <span className={`${baseInputClasses} block pl-12`}>{formData.startTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
             </button>
          </div>
        </div>

         {/* Feriados Checkbox */}
        <div className="flex items-center" onMouseEnter={(e) => handleShowInfo(e.currentTarget, infoTexts.considerHolidays)} onMouseLeave={handleHideInfo}>
            <input type="checkbox" id="considerHolidays" name="considerHolidays" checked={formData.considerHolidays} onChange={handleChange} className="h-4 w-4 rounded bg-gray-200 dark:bg-charcoal-black border-gray-300 dark:border-khaki-border text-lime-green focus:ring-lime-green" />
            <label htmlFor="considerHolidays" className="ml-2 text-sm text-gray-600 dark:text-gray-300">Considerar as datas de feriado para agendamento.</label>
        </div>

        {/* Professores */}
        <div onMouseEnter={(e) => handleShowInfo(e.currentTarget, infoTexts.teacherIds)} onMouseLeave={handleHideInfo}>
            <label className="block text-sm font-medium text-gray-500 dark:text-sage mb-1">Professores</label>
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 p-2 rounded-lg bg-gray-100 dark:bg-charcoal-black ${errors.teacherIds ? errorBorderClasses : ''}`}>
                {teachers.map(teacher => (
                    <button type="button" key={teacher.id} onClick={() => handleTeacherToggle(teacher.id)} className={`p-2 text-sm font-semibold rounded-md transition-colors text-left ${formData.teacherIds.includes(teacher.id) ? 'bg-lime-green text-charcoal-black' : 'text-gray-800 dark:text-gray-200 bg-white dark:bg-army-olive hover:bg-gray-200 dark:hover:bg-army-olive-light'}`}>
                        {teacher.name}
                    </button>
                ))}
            </div>
             {errors.teacherIds && <p className="text-red-500 text-xs mt-1 ml-1">{errors.teacherIds}</p>}
        </div>

        {/* Observações */}
        <div className="relative" onMouseEnter={(e) => handleShowInfo(e.currentTarget, infoTexts.notes)} onMouseLeave={handleHideInfo}>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-500 dark:text-sage mb-1">Observações (Opcional)</label>
            <ClipboardIcon className={`${iconClasses} absolute left-3 top-10`} />
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className={`${baseInputClasses} pl-12`}></textarea>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
         <div>
            {onDelete && entry && !isConfirmingDelete && (
                <button type="button" onClick={handleDeleteClick} className="flex items-center gap-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 font-semibold px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200">
                    <TrashIcon className="h-5 w-5" />
                    Excluir
                </button>
            )}
         </div>
         <div className="flex gap-4">
            {isConfirmingDelete ? (
                <>
                    <span className="text-sm font-bold self-center text-red-500 dark:text-red-400">Tem certeza?</span>
                    <button type="button" onClick={() => setIsConfirmingDelete(false)} className="px-6 py-2 rounded-lg text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors duration-200">
                        Não
                    </button>
                    <button type="button" onClick={handleDeleteClick} className="bg-red-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 active:scale-95">
                        Sim, Excluir
                    </button>
                </>
            ) : (
                <>
                    <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors duration-200">
                        Cancelar
                    </button>
                    <button type="submit" className="bg-lime-green text-charcoal-black font-bold px-6 py-2 rounded-lg hover:brightness-110 transition-transform duration-200 active:scale-95">
                        {entry ? 'Salvar Alterações' : 'Criar Aula'}
                    </button>
                </>
            )}
         </div>
      </div>
    </form>
     {activePopover === 'date' && (
        <CalendarPopover
            anchorEl={popoverAnchor}
            value={formData.startDate}
            onChange={handleDateChange}
            onClose={() => setActivePopover(null)}
        />
    )}
    {activePopover === 'time' && (
        <WheelTimePickerPopover
            anchorEl={popoverAnchor}
            value={formData.startTime}
            onSave={handleTimeChange}
            onClose={() => setActivePopover(null)}
        />
    )}
    {infoPopover && (
        <InfoPopover
            anchorEl={infoPopover.anchor}
            content={infoPopover.content}
        />
    )}
    </>
  );
};

export default ClassForm;