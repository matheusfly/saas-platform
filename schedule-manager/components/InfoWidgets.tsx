import React, { useState, useEffect, useMemo } from 'react';
import { PriorityList, ShiftRoster, Announcement, Teacher, TeacherType } from '../types';
import { ListBulletIcon, UserGroupIcon, MegaphoneIcon, XIcon, PlusIcon, PencilIcon, CheckIcon } from './icons';

interface InfoWidgetsProps {
    teachers: Teacher[];
    priorityList: PriorityList;
    shiftRoster: ShiftRoster;
    announcements: Announcement[];
    addAnnouncement: (message: string) => void;
    deleteAnnouncement: (id: string) => void;
    updatePriorityList: (list: PriorityList) => void;
    updateShiftRoster: (roster: ShiftRoster) => void;
}

const InfoCard: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode, className?: string }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-gray-100 dark:bg-charcoal-black/50 p-4 rounded-lg h-full flex flex-col ${className}`}>
        <div className="flex items-center mb-3">
            {icon}
            <h3 className="font-bold text-gray-800 dark:text-white ml-2">{title}</h3>
        </div>
        <div className="flex-grow">{children}</div>
    </div>
);

const AnnouncementsWidget: React.FC<{
    announcements: Announcement[];
    onAdd: (message: string) => void;
    onDelete: (id: string) => void;
}> = ({ announcements, onAdd, onDelete }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleAdd = () => {
        if (newMessage.trim()) {
            onAdd(newMessage.trim());
            setNewMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow space-y-2 text-sm text-gray-800 dark:text-gray-300 overflow-y-auto pr-2 max-h-48">
                {announcements.length > 0 ? announcements.map(ann => (
                    <div key={ann.id} className="group flex justify-between items-start gap-2">
                        <p className="flex-grow break-words">
                            - {ann.message} 
                            <span className="text-xs text-gray-400 dark:text-sage/80 ml-1.5 whitespace-nowrap">
                                ({ann.date.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})})
                            </span>
                        </p>
                        <button 
                            onClick={() => onDelete(ann.id)}
                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-red-500 hover:text-red-700 dark:hover:text-red-400 p-0.5 rounded-full"
                            aria-label={`Excluir aviso: ${ann.message}`}
                        >
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                )) : (
                    <p className="text-sm text-gray-500 dark:text-sage text-center py-4">Nenhum aviso.</p>
                )}
            </div>
            <div className="flex-shrink-0 flex gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-khaki-border/20">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Novo aviso..."
                    className="flex-grow w-full p-2 text-sm rounded-lg bg-white dark:bg-army-olive-light border-2 border-transparent focus:border-lime-green focus:ring-0 transition-colors duration-200 text-gray-800 dark:text-gray-200"
                />
                <button
                    onClick={handleAdd}
                    className="p-2 bg-lime-green text-charcoal-black rounded-lg hover:brightness-110 transition-all active:scale-95"
                    aria-label="Adicionar novo aviso"
                >
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};


const MultiSelect: React.FC<{
    options: Teacher[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}> = ({ options, selectedIds, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        onChange(selected);
    };

    return (
        <select
            multiple
            value={selectedIds}
            onChange={handleChange}
            className="w-full p-2 rounded-lg h-32 bg-white dark:bg-army-olive-light border-2 border-gray-300 dark:border-khaki-border/50 focus:border-lime-green focus:ring-0 transition-colors duration-200 text-gray-800 dark:text-gray-200"
        >
            {options.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
    );
};


const InfoWidgets: React.FC<InfoWidgetsProps> = ({ 
    teachers, 
    priorityList, 
    shiftRoster, 
    announcements, 
    addAnnouncement, 
    deleteAnnouncement,
    updatePriorityList,
    updateShiftRoster
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localPriorities, setLocalPriorities] = useState(priorityList);
    const [localShifts, setLocalShifts] = useState(shiftRoster);

    useEffect(() => {
        if (!isEditing) {
            setLocalPriorities(priorityList);
            setLocalShifts(shiftRoster);
        }
    }, [isEditing, priorityList, shiftRoster]);
    
    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'N/A';

    const handleSave = () => {
        updatePriorityList(localPriorities);
        updateShiftRoster(localShifts);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

  return (
    <div className="bg-white dark:bg-army-olive p-4 rounded-2xl shadow-lg h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Informações</h2>
            {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-lime-green p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors">
                    <PencilIcon className="h-4 w-4" />
                    Editar
                </button>
            ) : (
                <div className="flex items-center gap-2">
                    <button onClick={handleCancel} className="text-sm font-semibold text-gray-800 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-army-olive-light transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 text-sm font-semibold bg-lime-green text-charcoal-black p-2 rounded-lg hover:brightness-110 transition-all">
                        <CheckIcon className="h-4 w-4" />
                        Salvar
                    </button>
                </div>
            )}
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
            <InfoCard title="Prioridades" icon={<ListBulletIcon className="h-5 w-5 text-lime-green" />}>
                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="font-semibold text-sm text-gray-500 dark:text-sage mb-1 block">Titulares</label>
                            <MultiSelect options={teachers} selectedIds={localPriorities.titulares} onChange={(ids) => setLocalPriorities(p => ({...p, titulares: ids}))} />
                        </div>
                        <div>
                            <label className="font-semibold text-sm text-gray-500 dark:text-sage mb-1 block">Auxiliares</label>
                             <MultiSelect options={teachers} selectedIds={localPriorities.auxiliares} onChange={(ids) => setLocalPriorities(p => ({...p, auxiliares: ids}))} />
                        </div>
                         <p className="text-xs text-gray-500 dark:text-sage mt-1">Segure Ctrl/Cmd para selecionar múltiplos.</p>
                    </div>
                ) : (
                    <>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-500 dark:text-sage mb-1">Titulares</h4>
                            <p className="text-sm text-gray-800 dark:text-gray-300">{priorityList.titulares.map(getTeacherName).join(', ') || 'Nenhum'}</p>
                        </div>
                        <div className="mt-2">
                            <h4 className="font-semibold text-sm text-gray-500 dark:text-sage mb-1">Auxiliares</h4>
                            <p className="text-sm text-gray-800 dark:text-gray-300">{priorityList.auxiliares.map(getTeacherName).join(', ') || 'Nenhum'}</p>
                        </div>
                    </>
                )}
            </InfoCard>

            <InfoCard title="Equipes de Turno" icon={<UserGroupIcon className="h-5 w-5 text-lime-green" />}>
                 {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="font-semibold text-sm text-gray-500 dark:text-sage mb-1 block">Manhã</label>
                            <MultiSelect options={teachers} selectedIds={localShifts.morning} onChange={(ids) => setLocalShifts(s => ({...s, morning: ids}))} />
                        </div>
                        <div>
                            <label className="font-semibold text-sm text-gray-500 dark:text-sage mb-1 block">Tarde</label>
                            <MultiSelect options={teachers} selectedIds={localShifts.afternoon} onChange={(ids) => setLocalShifts(s => ({...s, afternoon: ids}))} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-sage mt-1">Segure Ctrl/Cmd para selecionar múltiplos.</p>
                    </div>
                ) : (
                    <>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-500 dark:text-sage mb-1">Manhã</h4>
                            <p className="text-sm text-gray-800 dark:text-gray-300">{shiftRoster.morning.map(getTeacherName).join(', ') || 'Nenhum'}</p>
                        </div>
                        <div className="mt-2">
                            <h4 className="font-semibold text-sm text-gray-500 dark:text-sage mb-1">Tarde</h4>
                            <p className="text-sm text-gray-800 dark:text-gray-300">{shiftRoster.afternoon.map(getTeacherName).join(', ') || 'Nenhum'}</p>
                        </div>
                    </>
                )}
            </InfoCard>

            <InfoCard title="Avisos" icon={<MegaphoneIcon className="h-5 w-5 text-lime-green" />} className="md:col-span-2">
                <AnnouncementsWidget
                    announcements={announcements}
                    onAdd={addAnnouncement}
                    onDelete={deleteAnnouncement}
                />
            </InfoCard>
        </div>
    </div>
  );
};

export default InfoWidgets;