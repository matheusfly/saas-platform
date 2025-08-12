
import { Teacher, Student, ScheduleEntry, WorkLog, PriorityList, ShiftRoster, Announcement, TeacherType, ClassType } from '../types';

// --- MOCK DATABASE ---
// All data and mutation logic is encapsulated here.
// In a real app, this would be a database accessed via API calls.

const getDayDate = (dayOfWeek: number, hour: number, minute: number = 0) => {
    const baseDate = new Date('2025-08-11T00:00:00'); // This is a Monday
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + (dayOfWeek - 1));
    targetDate.setHours(hour, minute, 0, 0);
    return targetDate;
}

let teachers: Teacher[] = [
  { id: 't1', name: 'Vitor V R Araújo', type: TeacherType.TITULAR, contractedHours: 40 },
  { id: 't2', name: 'Wallace', type: TeacherType.AUXILIAR, contractedHours: 30 },
  { id: 't3', name: 'Roni', type: TeacherType.TITULAR, contractedHours: 35 },
  { id: 't4', name: 'GUTO', type: TeacherType.TITULAR, contractedHours: 40 },
  { id: 't5', name: 'Marçal', type: TeacherType.AUXILIAR, contractedHours: 20 },
  { id: 't6', name: 'Herval Junior', type: TeacherType.TITULAR, contractedHours: 25 },
  { id: 't7', name: 'Yuriy G N Oliveira', type: TeacherType.TITULAR, contractedHours: 20 },
  { id: 't8', name: 'Russo', type: TeacherType.AUXILIAR, contractedHours: 15 },
  { id: 't9', name: 'Mateus Fernandes', type: TeacherType.TITULAR, contractedHours: 10 },
];

let students: Student[] = [
  { id: 's1', name: 'Ana Pereira' },
  { id: 's2', name: 'Bruno Gomes' },
  { id: 's3', name: 'Clara Dias' },
  { id: 's4', name: 'Daniel Martins' },
  { id: 's5', name: 'Eduarda Faria' },
  { id: 's6', name: 'Fábio Rocha' },
];

const schedulePattern: Record<string, Record<string, { type: ClassType; teacher: string }>> = {
  // Monday
  "1": {
    "06:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "06:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "07:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "07:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "08:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "08:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "09:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "09:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "10:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "10:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "11:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "11:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "15:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "15:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "16:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "16:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "17:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "17:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "18:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "18:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "19:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "19:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "20:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "20:10": { type: ClassType.ESCALADA, teacher: 't1' },
  },
  // Tuesday
  "2": {
    "06:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "06:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "07:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "07:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "08:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "08:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "09:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "09:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "10:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "10:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "11:00": { type: ClassType.ESCALADA, teacher: 't1' }, "11:10": { type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    "15:00": { type: ClassType.ESCALADA, teacher: 't1' }, "15:10": { type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    "16:00": { type: ClassType.CALISTENIA, teacher: 't7' }, "16:10": { type: ClassType.ESCALADA, teacher: 't7' },
    "17:00": { type: ClassType.CALISTENIA, teacher: 't7' }, "17:10": { type: ClassType.ESCALADA, teacher: 't7' },
    "18:00": { type: ClassType.CALISTENIA, teacher: 't7' }, "18:10": { type: ClassType.ESCALADA, teacher: 't7' },
    "19:00": { type: ClassType.CALISTENIA, teacher: 't7' }, "19:10": { type: ClassType.ESCALADA, teacher: 't7' },
    "20:00": { type: ClassType.CALISTENIA, teacher: 't7' }, "20:10": { type: ClassType.ESCALADA, teacher: 't7' },
  },
  // Wednesday
  "3": {
    "06:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "06:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "07:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "07:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "08:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "08:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "09:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "09:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "10:00": { type: ClassType.FISIOTERAPIA, teacher: 't9' }, "10:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "11:00": { type: ClassType.ESCALADA, teacher: 't1' }, "11:10": { type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    "15:00": { type: ClassType.ESCALADA, teacher: 't1' }, "15:10": { type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    "16:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "16:10": { type: ClassType.ESCALADA, teacher: 't7' },
    "17:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "17:10": { type: ClassType.ESCALADA, teacher: 't7' },
    "18:00": { type: ClassType.CALISTENIA, teacher: 't6' }, "18:10": { type: ClassType.ESCALADA, teacher: 't6' },
    "19:00": { type: ClassType.CALISTENIA, teacher: 't6' }, "19:10": { type: ClassType.ESCALADA, teacher: 't6' },
    "20:00": { type: ClassType.CALISTENIA, teacher: 't6' }, "20:10": { type: ClassType.ESCALADA, teacher: 't6' },
  },
  // Thursday
  "4": {
    "06:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "06:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "07:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "07:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "08:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "08:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "09:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "09:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "10:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "10:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "11:00": { type: ClassType.ESCALADA, teacher: 't1' }, "11:10": { type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    "15:00": { type: ClassType.ESCALADA, teacher: 't1' }, "15:10": { type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    "16:00": { type: ClassType.CALISTENIA, teacher: 't7' }, "16:10": { type: ClassType.ESCALADA, teacher: 't7' },
    "17:00": { type: ClassType.CALISTENIA, teacher: 't6' }, "17:10": { type: ClassType.ESCALADA, teacher: 't6' },
    "18:00": { type: ClassType.CALISTENIA, teacher: 't6' }, "18:10": { type: ClassType.ESCALADA, teacher: 't6' },
    "19:00": { type: ClassType.CALISTENIA, teacher: 't6' }, "19:10": { type: ClassType.ESCALADA, teacher: 't6' },
    "20:00": { type: ClassType.CALISTENIA, teacher: 't6' }, "20:10": { type: ClassType.ESCALADA, teacher: 't6' },
  },
  // Friday
  "5": {
    "06:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "06:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "07:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "07:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "08:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "08:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "09:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "09:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "10:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "10:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "11:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "11:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "15:00": { type: ClassType.ESCALADA, teacher: 't1' }, "15:10": { type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    "16:00": { type: ClassType.CALISTENIA, teacher: 't7' }, "16:10": { type: ClassType.ESCALADA, teacher: 't7' },
    "17:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "17:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "18:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "18:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "19:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "19:10": { type: ClassType.ESCALADA, teacher: 't1' },
    "20:00": { type: ClassType.CALISTENIA, teacher: 't1' }, "20:10": { type: ClassType.ESCALADA, teacher: 't1' },
  },
};

let scheduleEntries: ScheduleEntry[] = [];
let entryIdCounter = 1;

for (const dayStr in schedulePattern) {
    const day = parseInt(dayStr, 10);
    const daySchedule = schedulePattern[dayStr];
    for (const timeStr in daySchedule) {
        const [hour, minute] = timeStr.split(':').map(Number);
        const { type, teacher } = daySchedule[timeStr];
        
        const startTime = getDayDate(day, hour, minute);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1-hour duration

        scheduleEntries.push({
            id: `e${entryIdCounter++}`,
            teacherIds: [teacher],
            studentIds: [], // Empty for the pattern
            startTime,
            endTime,
            day,
            classType: type,
            isRecurring: true,
            capacity: 10
        });
    }
}


let workLogs: WorkLog[] = [];

let priorityList: PriorityList = {
    titulares: ['t1', 't4', 't6', 't7', 't9'], 
    auxiliares: [],
};

let shiftRoster: ShiftRoster = {
    morning: ['t3', 't2'], // Roni, Wallace
    afternoon: ['t5', 't8'], // Marçal, Russo
};

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

let announcements: Announcement[] = [
    { id: 'a1', message: 'HERVAL IRÁ INCORPORAR DIA 06/01', date: yesterday },
    { id: 'a2', message: 'Manutenção dos equipamentos na sexta-feira à tarde.', date: new Date() },
];


// --- API SIMULATION ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  async fetchInitialData() {
    await delay(800);
    // if (Math.random() > 0.8) throw new Error("Falha ao carregar dados!");
    return {
      teachers: [...teachers],
      students: [...students],
      schedule: [...scheduleEntries],
      workLogs: [...workLogs],
      priorityList: { ...priorityList },
      shiftRoster: { ...shiftRoster },
      announcements: [...announcements],
    };
  },
  
  async addEntry(entryData: Omit<ScheduleEntry, 'id'>) {
    await delay(100);
    const newEntry: ScheduleEntry = {
        ...entryData,
        id: `e${Date.now()}`,
    };
    scheduleEntries.push(newEntry);
    return newEntry;
  },

  async updateEntry(entryId: string, updatedData: Partial<Omit<ScheduleEntry, 'id'>>) {
    await delay(100);
    let updatedEntry: ScheduleEntry | null = null;
    scheduleEntries = scheduleEntries.map(entry => {
      if (entry.id === entryId) {
        updatedEntry = {
          ...entry,
          ...updatedData,
          day: updatedData.startTime ? updatedData.startTime.getDay() : entry.day,
        };
        return updatedEntry;
      }
      return entry;
    });
    if (!updatedEntry) throw new Error("Entry not found");
    return updatedEntry;
  },
  
  async deleteEntry(entryId: string) {
    await delay(200);
    scheduleEntries = scheduleEntries.filter(entry => entry.id !== entryId);
    return entryId;
  },

  async checkIn(teacherId: string, checkInTime: Date) {
    await delay(150);
    const newLogId = `wl${Date.now()}`;
    const newLog: WorkLog = {
      id: newLogId,
      teacherId,
      checkIn: checkInTime,
    };
    workLogs.push(newLog);

    const overlappingEntry = scheduleEntries.find(entry => 
        entry.teacherIds.includes(teacherId) &&
        checkInTime >= entry.startTime &&
        checkInTime <= entry.endTime
    );
    
    let newEntry: ScheduleEntry | null = null;
    if (overlappingEntry) {
        // Link existing entry
        overlappingEntry.workLogId = newLogId;
    } else {
        // Create new unplanned entry
        newEntry = {
            id: `ue-${newLogId}`,
            teacherIds: [teacherId],
            studentIds: [],
            startTime: checkInTime,
            endTime: new Date(checkInTime.getTime() + 60 * 60 * 1000), // Default 1 hour
            day: checkInTime.getDay(),
            classType: ClassType.PONTO,
            isUnplanned: true,
            workLogId: newLogId,
        };
        scheduleEntries.push(newEntry);
    }
    return { newLog, newEntry };
  },
  
  async checkOut(logId: string, checkOutTime: Date) {
    await delay(150);
    let updatedLog: WorkLog | undefined;
    workLogs = workLogs.map(log => {
      if (log.id === logId) {
        updatedLog = { ...log, checkOut: checkOutTime };
        return updatedLog;
      }
      return log;
    });
    if (!updatedLog) throw new Error("Log not found");

    const linkedEntry = scheduleEntries.find(entry => entry.workLogId === logId);
    let updatedEntry: ScheduleEntry | undefined;
    if (linkedEntry) {
        const checkInTime = workLogs.find(l => l.id === logId)?.checkIn || linkedEntry.startTime;
        if (checkOutTime > checkInTime) {
            linkedEntry.endTime = checkOutTime;
            updatedEntry = linkedEntry;
        }
    }
    return { updatedLog, updatedEntry };
  },

  async addManualWorkLog(data: { teacherId: string; checkIn: Date; checkOut: Date }) {
    await delay(200);
    const { teacherId, checkIn, checkOut } = data;
    const newLogId = `wl${Date.now()}`;
    const newLog: WorkLog = {
        id: newLogId,
        teacherId,
        checkIn,
        checkOut,
    };
    workLogs.push(newLog);

    const newEntry: ScheduleEntry = {
        id: `ue-${newLogId}`,
        teacherIds: [teacherId],
        studentIds: [],
        startTime: checkIn,
        endTime: checkOut,
        day: checkIn.getDay(),
        classType: ClassType.PONTO,
        isUnplanned: true,
        workLogId: newLogId,
    };
    scheduleEntries.push(newEntry);
    return { newLog, newEntry };
  },
  
  async updateManualWorkLog(logId: string, data: { checkIn: Date; checkOut: Date }) {
    await delay(200);
    const { checkIn, checkOut } = data;
    
    let updatedLog: WorkLog | undefined;
    workLogs = workLogs.map(log => 
      log.id === logId ? (updatedLog = { ...log, checkIn, checkOut }) : log
    );
    if (!updatedLog) throw new Error("Log not found");
      
    let updatedEntry: ScheduleEntry | undefined;
    const linkedEntry = scheduleEntries.find(entry => entry.workLogId === logId);
    if (linkedEntry) {
        linkedEntry.startTime = checkIn;
        linkedEntry.endTime = checkOut;
        updatedEntry = linkedEntry;
    }
    return { updatedLog, updatedEntry };
  },

  async addAnnouncement(message: string) {
    await delay(100);
    const newAnnouncement: Announcement = {
        id: `a${Date.now()}`,
        message,
        date: new Date(),
    };
    announcements.push(newAnnouncement);
    return newAnnouncement;
  },

  async deleteAnnouncement(announcementId: string) {
    await delay(100);
    announcements = announcements.filter(ann => ann.id !== announcementId);
    return announcementId;
  },
  
  async updatePriorityList(newList: PriorityList) {
    await delay(100);
    priorityList = newList;
    return { ...priorityList };
  },
  
  async updateShiftRoster(newRoster: ShiftRoster) {
    await delay(100);
    shiftRoster = newRoster;
    return { ...shiftRoster };
  },
};