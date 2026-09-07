import { initialData } from './initialData';
import {
  User,
  TeacherProfile,
  PlanConfig,
  Subscription,
  Group,
  Student,
  AttendanceRecord,
  Lesson,
  LessonPreparation,
  Exam,
  ExamResult,
  Homework,
  HomeworkSubmission,
  StudentEvaluation,
  StudentNote,
  Report,
  NotificationItem,
  AuditLog,
  StudentLessonBilling,
  PaymentTransaction,
  PlatformSettings,
  SubscriptionPaymentRecord
} from '../types.js';

export interface DatabaseState {
  users: User[];
  teachers: TeacherProfile[];
  plans: PlanConfig[];
  subscriptions: Subscription[];
  groups: Group[];
  students: Student[];
  attendance: AttendanceRecord[];
  lessons: Lesson[];
  lessonPreparations: LessonPreparation[];
  exams: Exam[];
  examResults: ExamResult[];
  homework: Homework[];
  homeworkSubmissions: HomeworkSubmission[];
  evaluations: StudentEvaluation[];
  notes: StudentNote[];
  reports: Report[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  studentLessonBilling: StudentLessonBilling[];
  paymentTransactions: PaymentTransaction[];
  platformSettings: PlatformSettings;
  subscriptionPayments: SubscriptionPaymentRecord[];
}

const STORAGE_KEY = 'mueen_data_store_v1';

export function getDatabaseState(): DatabaseState {
  if (typeof window === 'undefined') {
    return initialData as unknown as DatabaseState;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const state = initialData as unknown as DatabaseState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database from localStorage:', err);
    return initialData as unknown as DatabaseState;
  }
}

export function saveDatabaseState(state: DatabaseState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving database to localStorage:', err);
  }
}

export function resetDatabaseState(): DatabaseState {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
  return initialData as unknown as DatabaseState;
}
