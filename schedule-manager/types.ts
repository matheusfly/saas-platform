export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

export enum TeacherType {
  TITULAR = 'Titular',
  AUXILIAR = 'Auxiliar',
}

export enum ClassType {
    CALISTENIA = 'Calistenia',
    ESCALADA = 'Escalada',
    BOTH = 'Ambos',
    PONTO = 'Ponto',
    CALISTENIA_KIDS = 'Calistenia Kids',
    FISIOTERAPIA = 'Fisioterapia',
    AULA_LIVRE = 'Aula Livre',
}

export interface Teacher {
  id: string;
  name: string;
  type: TeacherType;
  contractedHours: number;
}

export interface Student {
  id: string;
  name: string;
}

export interface ScheduleEntry {
  id: string;
  teacherIds: string[];
  studentIds: string[];
  startTime: Date;
  endTime: Date;
  day: number; // 0 for Sunday, 1 for Monday, etc.
  classType: ClassType;
  workLogId?: string;
  isUnplanned?: boolean;
  // New fields for advanced class creation
  capacity?: number;
  isRecurring?: boolean;
  notes?: string;
  considerHolidays?: boolean;
}

export interface WorkLog {
  id: string;
  teacherId: string;
  checkIn: Date;
  checkOut?: Date;
}

export interface Workload {
  teacherId: string;
  workedHours: number;
  contractedHours: number;
  overtime: number;
  deficit: number;
}

export interface PriorityList {
    titulares: string[]; // Teacher IDs
    auxiliares: string[]; // Teacher IDs
}

export interface ShiftRoster {
    morning: string[]; // Teacher IDs
    afternoon: string[]; // Teacher IDs
}

export interface Announcement {
    id: string;
    message: string;
    date: Date;
}