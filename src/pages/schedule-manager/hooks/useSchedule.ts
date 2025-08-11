
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Teacher, Student, ScheduleEntry, Workload, WorkLog, PriorityList, ShiftRoster, Announcement } from '../types';
import { api } from '../services/api';

export const useSchedule = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [priorityList, setPriorityList] = useState<PriorityList>({ titulares: [], auxiliares: [] });
  const [shiftRoster, setShiftRoster] = useState<ShiftRoster>({ morning: [], afternoon: [] });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetchInitialData();
        setTeachers(data.teachers);
        setStudents(data.students);
        setSchedule(data.schedule);
        setWorkLogs(data.workLogs);
        setPriorityList(data.priorityList);
        setShiftRoster(data.shiftRoster);
        setAnnouncements(data.announcements);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for live duration tracking
    return () => clearInterval(timer);
  }, []);

  const workloadData = useMemo<Workload[]>(() => {
    if (isLoading) return [];
    return teachers.map(teacher => {
      const workedHours = workLogs
        .filter(log => log.teacherId === teacher.id)
        .reduce((total, log) => {
          // If the session is active (no checkout), use the current time for calculation.
          const endTime = log.checkOut ? log.checkOut.getTime() : currentTime.getTime();
          const duration = (endTime - log.checkIn.getTime()) / (1000 * 60 * 60);
          return total + duration;
        }, 0);

      const overtime = Math.max(0, workedHours - teacher.contractedHours);
      const deficit = Math.max(0, teacher.contractedHours - workedHours);

      return {
        teacherId: teacher.id,
        workedHours: parseFloat(workedHours.toFixed(2)),
        contractedHours: teacher.contractedHours,
        overtime: parseFloat(overtime.toFixed(2)),
        deficit: parseFloat(deficit.toFixed(2)),
      };
    });
  }, [workLogs, teachers, isLoading, currentTime]);

  const addEntry = useCallback(async (entryData: Omit<ScheduleEntry, 'id'>) => {
    const newEntry = await api.addEntry(entryData);
    setSchedule(prev => [...prev, newEntry]);
    return newEntry;
  }, []);
  
  const updateEntry = useCallback(async (entryId: string, updatedData: Partial<Omit<ScheduleEntry, 'id'>>) => {
    const updatedEntry = await api.updateEntry(entryId, updatedData);
    setSchedule(prev => prev.map(e => e.id === entryId ? updatedEntry : e));
  }, []);

  const deleteEntry = useCallback(async (entryId: string) => {
    await api.deleteEntry(entryId);
    setSchedule(prev => prev.filter(entry => entry.id !== entryId));
  }, []);

  const checkIn = useCallback(async (teacherId: string, checkInTime: Date) => {
    const { newLog, updatedEntry } = await api.checkIn(teacherId, checkInTime);
    setWorkLogs(prev => [...prev, newLog]);
    if (updatedEntry) {
        // This handles both linking a planned entry and creating an unplanned one
        const isNewEntry = !schedule.some(e => e.id === updatedEntry.id);
        if (isNewEntry) {
            setSchedule(prev => [...prev, updatedEntry]);
        } else {
            setSchedule(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
        }
    }
  }, [schedule]);
  
  const checkOut = useCallback(async (logId: string, checkOutTime: Date) => {
    const { updatedLog, updatedEntry } = await api.checkOut(logId, checkOutTime);
    setWorkLogs(prev => prev.map(log => log.id === logId ? updatedLog : log));
    if (updatedEntry) {
        setSchedule(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    }
  }, []);

  const addManualWorkLog = useCallback(async (data: { teacherId: string; checkIn: Date; checkOut: Date }) => {
    const { newLog, newEntry } = await api.addManualWorkLog(data);
    setWorkLogs(prev => [...prev, newLog]);
    setSchedule(prev => [...prev, newEntry]);
  }, []);

  const updateManualWorkLog = useCallback(async (logId: string, data: { checkIn: Date; checkOut: Date }) => {
    const { updatedLog, updatedEntry } = await api.updateManualWorkLog(logId, data);
    setWorkLogs(prev => prev.map(log => log.id === logId ? updatedLog : log));
    if (updatedEntry) {
        setSchedule(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    }
  }, []);

  const addAnnouncement = useCallback(async (message: string) => {
      const newAnnouncement = await api.addAnnouncement(message);
      setAnnouncements(prev => [newAnnouncement, ...prev]);
  }, []);

  const deleteAnnouncement = useCallback(async (announcementId: string) => {
      await api.deleteAnnouncement(announcementId);
      setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
  }, []);
  
  const updatePriorityList = useCallback(async (newList: PriorityList) => {
    const updatedList = await api.updatePriorityList(newList);
    setPriorityList(updatedList);
  }, []);
  
  const updateShiftRoster = useCallback(async (newRoster: ShiftRoster) => {
    const updatedRoster = await api.updateShiftRoster(newRoster);
    setShiftRoster(updatedRoster);
  }, []);

  const getTeacherById = useCallback((id: string) => teachers.find(t => t.id === id), [teachers]);
  const getTeachersByIds = useCallback((ids: string[]) => teachers.filter(t => ids.includes(t.id)), [teachers]);
  const getStudentById = useCallback((id: string) => students.find(s => s.id === id), [students]);

  return { 
      teachers, 
      students, 
      schedule, 
      workloadData,
      addEntry,
      updateEntry, 
      deleteEntry, 
      getTeacherById, 
      getTeachersByIds,
      getStudentById,
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
    };
};
