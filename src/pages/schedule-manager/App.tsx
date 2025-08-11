
import React, { useState, useEffect, useCallback } from 'react';
import { useSchedule } from './hooks/useSchedule';
import { useToast } from './hooks/useToast';
import Dashboard from './components/Dashboard';
import ScheduleGrid from './components/ScheduleGrid';
import Modal from './components/Modal';
import ClassForm from './components/ScheduleForm';
import WorkLogPanel from './components/WorkLogPanel';
import InfoWidgets from './components/InfoWidgets';
import { CalendarIcon, SunIcon, MoonIcon, RectangleStackIcon, CalendarDaysIcon, TableCellsIcon, PlusIcon } from './components/icons';
import { ScheduleEntry, Teacher, WorkLog } from './types';
import WorkLogForm from './components/WorkLogForm';
import DataTableView from './components/DataTableView';

type View = 'dashboard' | 'schedule';

const App: React.FC = () => {
  const {
    teachers,
    students,
    schedule,
    workloadData,
    addEntry,
    updateEntry,
    deleteEntry,
    getTeacherById,
    getTeachersByIds,
    workLogs,
    checkIn,
    checkOut,
    addManualWorkLog,
    updateManualWorkLog,
    priorityList,
    shiftRoster,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    updatePriorityList,
    updateShiftRoster,
    isLoading,
    error,
  } = useSchedule();
  
  const addToast = useToast();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [view, setView] = useState<View>('dashboard');
  
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  
  const [isWorkLogModalOpen, setIsWorkLogModalOpen] = useState(false);
  const [editingWorkLog, setEditingWorkLog] = useState<WorkLog | null>(null);
  const [logFormTeacher, setLogFormTeacher] = useState<Teacher | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date('2025-08-11T12:00:00'));
  const [teacherFilter, setTeacherFilter] = useState<string>('all');
  
  const [isDataTableViewVisible, setIsDataTableViewVisible] = useState(false);


  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleOpenNewClass = () => {
    setEditingEntry(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditModal = useCallback((entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setIsClassModalOpen(true);
  }, []);

  const handleCloseClassModal = () => {
    setIsClassModalOpen(false);
    setEditingEntry(null);
  };

  const handleSaveEntry = async (data: Omit<ScheduleEntry, 'id'>, id?: string) => {
    try {
      if (id) {
        await updateEntry(id, data);
        addToast({ type: 'success', message: 'Aula atualizada com sucesso!' });
      } else {
        await addEntry(data);
        addToast({ type: 'success', message: 'Nova aula criada com sucesso!' });
      }
      handleCloseClassModal();
    } catch (err) {
      addToast({ type: 'error', message: `Erro ao salvar: ${(err as Error).message}` });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
        await deleteEntry(id);
        addToast({ type: 'success', message: 'Aula excluída com sucesso!' });
        handleCloseClassModal();
    } catch (err) {
        addToast({ type: 'error', message: `Erro ao excluir: ${(err as Error).message}` });
    }
  };
  
  const handleOpenAddWorkLog = (teacher: Teacher) => {
      setLogFormTeacher(teacher);
      setEditingWorkLog(null);
      setIsWorkLogModalOpen(true);
  };
  
  const handleOpenEditWorkLog = (teacher: Teacher, log: WorkLog) => {
      setLogFormTeacher(teacher);
      setEditingWorkLog(log);
      setIsWorkLogModalOpen(true);
  };

  const handleCloseWorkLogModal = () => {
      setIsWorkLogModalOpen(false);
      setEditingWorkLog(null);
      setLogFormTeacher(null);
  };

  const handleSaveWorkLog = async (data: { teacherId: string; checkIn: Date; checkOut: Date }, logId?: string) => {
    try {
      if (logId) {
          await updateManualWorkLog(logId, data);
          addToast({ type: 'success', message: 'Registro de ponto atualizado!' });
      } else {
          await addManualWorkLog(data);
          addToast({ type: 'success', message: 'Registro de ponto adicionado!' });
      }
      handleCloseWorkLogModal();
    } catch (err) {
       addToast({ type: 'error', message: `Erro ao salvar registro: ${(err as Error).message}` });
    }
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-charcoal-black">
          <div className="text-center">
              <CalendarIcon className="h-16 w-16 text-lime-green animate-bounce mx-auto" />
              <p className="text-xl font-semibold mt-4">Carregando dados...</p>
          </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-charcoal-black">
          <div className="text-center bg-red-100 dark:bg-red-900/30 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Oops! Algo deu errado.</h2>
              <p className="text-red-500 dark:text-red-300 mt-2">{error}</p>
              <button 
                  onClick={() => window.location.reload()}
                  className="mt-6 bg-lime-green text-charcoal-black font-bold px-6 py-2 rounded-lg hover:brightness-110 transition-transform duration-200 active:scale-95"
              >
                  Tentar Novamente
              </button>
          </div>
      </div>
    );
  }

  if (isDataTableViewVisible) {
    return (
      <DataTableView
        schedule={schedule}
        workLogs={workLogs}
        teachers={teachers}
        students={students}
        onBack={() => setIsDataTableViewVisible(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal-black text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <CalendarIcon className="h-10 w-10 text-lime-green mr-4" />
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Gestor de Grade Horária</h1>
                <p className="text-gray-500 dark:text-sage">Otimize o planejamento e a performance da sua equipe.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-200 dark:bg-army-olive p-1 rounded-full">
              <button onClick={() => setView('dashboard')} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view === 'dashboard' ? 'bg-white dark:bg-charcoal-black text-gray-900 dark:text-white shadow' : 'text-gray-500 dark:text-sage hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <RectangleStackIcon className="h-5 w-5" />
                Dashboard
              </button>
               <button onClick={() => setView('schedule')} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view === 'schedule' ? 'bg-white dark:bg-charcoal-black text-gray-900 dark:text-white shadow' : 'text-gray-500 dark:text-sage hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <CalendarDaysIcon className="h-5 w-5" />
                Grade
              </button>
            </div>

            <div className="flex items-center gap-2">
                {view === 'schedule' && (
                    <button
                        onClick={handleOpenNewClass}
                        className="flex items-center gap-2 bg-lime-green text-charcoal-black font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all duration-200 active:scale-95"
                    >
                        <PlusIcon className="h-5 w-5"/>
                        <span>Nova Turma</span>
                    </button>
                )}
                 <button
                    onClick={() => setIsDataTableViewVisible(true)}
                    className="p-2 rounded-full text-gray-500 dark:text-lime-green bg-gray-200 dark:bg-army-olive hover:bg-gray-300 dark:hover:bg-army-olive-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-charcoal-black focus:ring-lime-green transition-colors duration-200"
                    aria-label="View Data Tables"
                >
                    <TableCellsIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-gray-500 dark:text-lime-green bg-gray-200 dark:bg-army-olive hover:bg-gray-300 dark:hover:bg-army-olive-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-charcoal-black focus:ring-lime-green transition-colors duration-200"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-6 w-6" />
                  ) : (
                    <MoonIcon className="h-6 w-6" />
                  )}
                </button>
            </div>
          </div>
        </header>

        <main>
          {view === 'dashboard' && (
            <>
              <Dashboard workloadData={workloadData} teachers={teachers} />
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                <div className="lg:col-span-3">
                  <WorkLogPanel
                    teachers={teachers}
                    workLogs={workLogs}
                    onCheckIn={checkIn}
                    onCheckOut={checkOut}
                    onAddManualLog={handleOpenAddWorkLog}
                    onEditManualLog={handleOpenEditWorkLog}
                  />
                </div>
                <div className="lg:col-span-2">
                  <InfoWidgets 
                    teachers={teachers}
                    priorityList={priorityList}
                    shiftRoster={shiftRoster}
                    announcements={announcements}
                    addAnnouncement={addAnnouncement}
                    deleteAnnouncement={deleteAnnouncement}
                    updatePriorityList={updatePriorityList}
                    updateShiftRoster={updateShiftRoster}
                  />
                </div>
              </div>
            </>
          )}

          {view === 'schedule' && (
             <ScheduleGrid 
                entries={schedule} 
                getTeacherById={getTeacherById} 
                getTeachersByIds={getTeachersByIds}
                onEditEntry={handleOpenEditModal}
                updateEntry={updateEntry}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                teachers={teachers}
                teacherFilter={teacherFilter}
                setTeacherFilter={setTeacherFilter}
              />
          )}
        </main>
        
        <footer className="text-center mt-12 py-6 text-sm text-gray-500 dark:text-khaki-border border-t border-gray-200 dark:border-khaki-border/20">
          <p>Desenvolvido com React, TypeScript e Tailwind CSS.</p>
        </footer>
      </div>
      
      <Modal 
        isOpen={isClassModalOpen} 
        onClose={handleCloseClassModal}
        title={editingEntry ? 'Editar Aula' : 'Nova Aula'}
      >
        <ClassForm
          entry={editingEntry}
          teachers={teachers}
          onSave={handleSaveEntry}
          onCancel={handleCloseClassModal}
          onDelete={handleDeleteEntry}
        />
      </Modal>
      <Modal 
        isOpen={isWorkLogModalOpen} 
        onClose={handleCloseWorkLogModal}
        title={editingWorkLog ? `Editar Registro de ${logFormTeacher?.name}` : `Adicionar Registro para ${logFormTeacher?.name}`}
      >
        {logFormTeacher && (
            <WorkLogForm
                teacher={logFormTeacher}
                logToUpdate={editingWorkLog}
                onSave={handleSaveWorkLog}
                onCancel={handleCloseWorkLogModal}
            />
        )}
      </Modal>
    </div>
  );
};

export default App;
