
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

const schedulePattern: Record<string, { time: string; type: ClassType; teacher: string }[]> = {
  // Monday
  "1": [
    { time: "06:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "07:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "08:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "09:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "10:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "11:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "15:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "16:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "17:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "18:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "19:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "20:00", type: ClassType.BOTH, teacher: 't1' },
  ],
  // Tuesday
  "2": [
    { time: "06:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "07:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "08:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "09:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "10:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "11:00", type: ClassType.ESCALADA, teacher: 't1' },
    { time: "11:00", type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    { time: "15:00", type: ClassType.ESCALADA, teacher: 't1' },
    { time: "15:00", type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    { time: "16:00", type: ClassType.BOTH, teacher: 't7' },
    { time: "17:00", type: ClassType.BOTH, teacher: 't7' },
    { time: "18:00", type: ClassType.BOTH, teacher: 't7' },
    { time: "19:00", type: ClassType.BOTH, teacher: 't7' },
    { time: "20:00", type: ClassType.BOTH, teacher: 't7' },
  ],
  // Wednesday
  "3": [
    { time: "06:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "07:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "08:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "09:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "10:00", type: ClassType.FISIOTERAPIA, teacher: 't9' },
    { time: "10:00", type: ClassType.ESCALADA, teacher: 't1' },
    { time: "11:00", type: ClassType.ESCALADA, teacher: 't1' },
    { time: "11:00", type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    { time: "15:00", type: ClassType.ESCALADA, teacher: 't1' },
    { time: "15:00", type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    { time: "16:00", type: ClassType.CALISTENIA, teacher: 't1' },
    { time: "16:00", type: ClassType.ESCALADA, teacher: 't7' },
    { time: "17:00", type: ClassType.CALISTENIA, teacher: 't1' },
    { time: "17:00", type: ClassType.ESCALADA, teacher: 't7' },
    { time: "18:00", type: ClassType.BOTH, teacher: 't6' },
    { time: "19:00", type: ClassType.BOTH, teacher: 't6' },
    { time: "20:00", type: ClassType.BOTH, teacher: 't6' },
  ],
  // Thursday
  "4": [
    { time: "06:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "07:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "08:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "09:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "10:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "11:00", type: ClassType.ESCALADA, teacher: 't1' },
    { time: "11:00", type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    { time: "15:00", type: ClassType.ESCALADA, teacher: 't1' },
    { time: "15:00", type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    { time: "16:00", type: ClassType.BOTH, teacher: 't7' },
    { time: "17:00", type: ClassType.BOTH, teacher: 't6' },
    { time: "18:00", type: ClassType.BOTH, teacher: 't6' },
    { time: "19:00", type: ClassType.BOTH, teacher: 't6' },
    { time: "20:00", type: ClassType.BOTH, teacher: 't6' },
  ],
  // Friday
  "5": [
    { time: "06:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "07:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "08:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "09:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "10:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "11:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "15:00", type: ClassType.ESCALADA, teacher: 't1' },
    { time: "15:00", type: ClassType.CALISTENIA_KIDS, teacher: 't1' },
    { time: "16:00", type: ClassType.BOTH, teacher: 't7' },
    { time: "17:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "18:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "19:00", type: ClassType.BOTH, teacher: 't1' },
    { time: "20:00", type: ClassType.BOTH, teacher: 't1' },
  ],
};


let shiftRoster: ShiftRoster = {
    morning: ['t3', 't2'], // Roni, Wallace
    afternoon: ['t5', 't8'], // Marçal, Russo
};

let scheduleEntries: ScheduleEntry[] = [];
let entryIdCounter = 1;

for (const dayStr in schedulePattern) {
    const day = parseInt(dayStr, 10);
    const daySchedule = schedulePattern[dayStr];
    for (const classInfo of daySchedule) {
        const [hour, minute] = classInfo.time.split(':').map(Number);
        const { type, teacher } = classInfo;
        
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

// Add supervision entries for Horário Livre
const supervisionTeachers = shiftRoster.afternoon;
if (supervisionTeachers.length > 0) {
    for (let day = 1; day <= 5; day++) { // Monday to Friday
        const startTime = getDayDate(day, 12, 0);
        const endTime = getDayDate(day, 15, 0);
        
        scheduleEntries.push({
            id: `supervision-${day}`,
            teacherIds: supervisionTeachers,
            studentIds: [],
            startTime,
            endTime,
            day,
            classType: ClassType.SUPERVISAO_LIVRE,
            isRecurring: true,
            capacity: 0,
            notes: 'Supervisão de equipamentos e salão durante o horário livre.',
        });
    }
}


let workLogs: WorkLog[] = [];

let priorityList: PriorityList = {
    titulares: ['t1', 't4', 't6', 't7', 't9'], 
    auxiliares: [],
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
    await delay(10);
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
        !entry.workLogId && // Can only link to an un-linked entry
        checkInTime >= entry.startTime &&
        checkInTime < entry.endTime
    );
    
    let updatedEntry: ScheduleEntry | null = null;
    if (overlappingEntry) {
        // Link existing entry
        scheduleEntries = scheduleEntries.map(entry => {
            if (entry.id === overlappingEntry.id) {
                updatedEntry = { ...entry, workLogId: newLogId };
                return updatedEntry;
            }
            return entry;
        });
    } else {
        // Create new unplanned entry
        updatedEntry = {
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
        scheduleEntries.push(updatedEntry);
    }
    return { newLog, updatedEntry };
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

    let updatedEntry: ScheduleEntry | null = null;
    scheduleEntries = scheduleEntries.map(entry => {
        if (entry.workLogId === logId && entry.isUnplanned) {
            // Only update the end time for unplanned entries to reflect actual work duration
            if (checkOutTime > entry.startTime) {
                 updatedEntry = { ...entry, endTime: checkOutTime };
                 return updatedEntry;
            }
        }
        return entry;
    });

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
      
    let updatedEntry: ScheduleEntry | null = null;
    scheduleEntries = scheduleEntries.map(entry => {
        if (entry.workLogId === logId) {
            updatedEntry = { ...entry, startTime: checkIn, endTime: checkOut };
            return updatedEntry;
        }
        return entry;
    });

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
