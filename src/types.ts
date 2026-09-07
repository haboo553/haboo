export type Role = 'teacher' | 'admin' | 'supervisor' | 'parent' | 'student';

export type PlanType = 'trial' | 'basic' | 'pro' | 'premium';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
}

export interface TeacherProfile {
  userId: string;
  subject: string;
  schoolOrCenter?: string;
  bio?: string;
  defaultClassDurationMinutes: number;
  stagePreference: string;
  totalStudentsCount: number;
  totalGroupsCount: number;
}

export interface PlanConfig {
  id: PlanType;
  nameAr: string;
  nameEn: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxStudents: number;
  maxGroups: number;
  aiRequestsPerMonth: number;
  features: {
    aiLessonAssistant: boolean;
    aiStudentAnalysis: boolean;
    aiGroupAnalysis: boolean;
    pdfExport: boolean;
    excelExport: boolean;
    whatsappIntegration: boolean;
    customBranding: boolean;
    qrAttendance: boolean;
    unlimitedReports: boolean;
    prioritySupport: boolean;
  };
}

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'suspended' | 'cancelled';

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  trialStartedAt?: string;
  trialEndsAt?: string;
  aiUsageThisMonth: number;
  autoRenew: boolean;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  paymentMethod?: string;
  notes?: string;
}

export interface SubscriptionCheckResult {
  isExpired: boolean;
  status: SubscriptionStatus;
  daysRemaining: number;
  plan: PlanConfig;
  canWrite: boolean;
  trialEndsAt?: string;
  endDate?: string;
  reason?: string;
  canUseAi?: boolean;
}

export type BillingSystem = 'per_lesson' | 'monthly' | 'custom';

export interface Group {
  id: string;
  teacherId: string;
  name: string;
  subject: string;
  stage: string; // e.g., 'المرحلة الثانوية'
  grade: string; // e.g., 'الصف الثالث الثانوي'
  groupCode: string; // e.g., 'MUEEN-7A42'
  classDays: ('sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri')[];
  startTime: string; // '16:00'
  endTime: string; // '17:30'
  location: string; // 'قاعة أ / سنتر النجاح' or 'أونلاين'
  maxCapacity: number;
  active: boolean;
  createdAt: string;
  // Billing settings
  billingSystem?: BillingSystem; // default 'per_lesson'
  defaultLessonPrice?: number; // e.g. 100
  chargeOnAbsence?: boolean; // whether absence incurs a charge (default false)
}

export interface Student {
  id: string;
  teacherId: string;
  groupId: string;
  name: string;
  age?: number;
  stage?: string; // e.g. المرحلة الثانوية
  grade?: string; // e.g. الصف الثالث الثانوي
  subject?: string;
  schoolName?: string;
  studentNumber?: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentRelation?: 'father' | 'mother' | 'guardian';
  email?: string;
  nationalId?: string;
  joinDate: string;
  avatarUrl?: string;
  notes?: string;
  status: 'active' | 'suspended' | 'archived';
  
  // Observable educational indicators (no IQ metrics)
  comprehensionLevel?: 'excellent' | 'good' | 'average' | 'needs_reinforcement' | 'needs_followup' | 'high' | 'medium' | 'needs_support' | string;
  learningSpeed?: 'fast' | 'normal' | 'paced' | 'slow' | 'needs_time' | string;
  performanceLevel?: 'top' | 'improving' | 'stable' | 'struggling' | 'needs_improvement' | string;
  strengths?: string[];
  weaknesses?: string[];
  reviewNeeds?: string[];
  
  // Calculated metrics
  attendanceRate?: number;
  examsAverage?: number;
  homeworkCompletionRate?: number;
  consecutiveAbsences?: number;
  lastActivityAt?: string;
}

// ---------------------------------------------
// 1. Initial Assessment & Learning Profile Types
// ---------------------------------------------

export interface InitialAssessmentRatings {
  comprehension: number; // الفهم والاستيعاب (1-5)
  learningSpeed: number; // سرعة التعلم (1-5)
  focus: number; // التركيز (1-5)
  participation: number; // المشاركة (1-5)
  problemSolving: number; // حل المشكلات (1-5)
  retention: number; // تذكر المعلومات (1-5)
  application: number; // تطبيق المعلومات (1-5)
  independence: number; // العمل باستقلالية (1-5)
  homeworkCommitment: number; // الالتزام بالواجب (1-5)
  attendanceDiscipline: number; // الحضور والانضباط (1-5)
}

export interface InitialAssessment {
  id: string;
  studentId: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  ratings: InitialAssessmentRatings;
  notes: {
    strengths: string;
    weaknesses: string;
    currentDifficulties: string;
    teacherNotes: string;
    expectedLevel: string;
    topicsNeedingReview: string;
  };
}

export interface PlacementQuestion {
  id: number;
  tier: 1 | 2 | 3 | 4 | 5; // 1: أساسيات, 2: فهم, 3: تطبيق, 4: حل مشكلات, 5: أسئلة متقدمة
  tierName: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  studentAnswer?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced';
  measuredSkill: string;
  explanation: string;
}

export interface PlacementTest {
  id: string;
  studentId: string;
  teacherId: string;
  title: string;
  subject: string;
  stage?: string;
  grade?: string;
  topicsCovered?: string[];
  questions: PlacementQuestion[];
  status: 'draft' | 'completed';
  totalScore: number;
  earnedScore?: number;
  masteryPercentage?: number;
  tierScores?: any;
  strengths?: string[];
  weaknesses?: string[];
  topicsForReview?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface LearningProfile {
  id: string;
  studentId: string;
  teacherId: string;
  basicsLevel: string; // e.g. "جيد جداً"
  comprehensionLevel: string; // e.g. "ممتاز"
  applicationLevel: string; // e.g. "جيد"
  problemSolvingLevel: string; // e.g. "يحتاج دعم"
  learningPace: string; // e.g. "مرتفعة"
  academicStrengths: string[];
  focusAreas: string[];
  recommendedReviewTopics: string[];
  educationalSummary: string;
  generatedAt: string;
  updatedAt: string;
}

export interface PlacementRecommendation {
  id: string;
  studentId: string;
  teacherId: string;
  suggestedGroupId: string;
  suggestedGroupName: string;
  compatibilityPercentage: number; // e.g. 87
  reason: string;
  status: 'pending' | 'accepted' | 'dismissed';
  createdAt: string;
  acceptedAt?: string;
}

// ---------------------------------------------
// 2. Smart Lesson Preparation & Differentiated HW
// ---------------------------------------------

export interface InClassEffortTask {
  taskName?: string;
  durationMinutes?: number;
  instructions?: string;
  description?: string;
  studentRequirement?: string;
  expectedTimeMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  evaluationMethod?: string;
}

export interface GradedExampleItem {
  tier?: number;
  tierName?: string;
  level?: 'easy' | 'medium' | 'advanced';
  title?: string;
  exampleText?: string;
  problem?: string;
  solutionSummary?: string;
  solution?: string;
}

export interface DifferentiatedHomeworkQuestion {
  number?: number;
  text: string;
  type?: 'direct' | 'applied' | 'thinking';
  points?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
}

export interface DifferentiatedHomeworkSet {
  remedial: DifferentiatedHomeworkQuestion[];
  core: DifferentiatedHomeworkQuestion[];
  advanced: DifferentiatedHomeworkQuestion[];
}

export interface DifferentiatedHomeworkItem {
  id?: string;
  type?: 'remedial' | 'core' | 'advanced'; // علاجي / أساسي / متقدم
  title?: string;
  targetAudience?: string;
  questions?: DifferentiatedHomeworkQuestion[];
  estimatedTimeMinutes?: number;
  dueDate?: string;
}

export interface LessonPreparation {
  id: string;
  lessonId?: string;
  teacherId: string;
  lessonTitle: string;
  subject: string;
  stage?: string;
  grade?: string;
  groupId?: string;
  groupName?: string;
  durationMinutes?: number;
  studentCount?: number;
  groupLevel?: string;
  
  // Lesson Info & Objectives
  unit?: string;
  educationalObjectives?: string[];
  previousCoverage?: string;
  targetSkills?: string[];
  
  // Core Sections
  warmupHook?: any;
  summaryExplanation?: string;
  lessonElements?: string[];
  gradedExamples?: GradedExampleItem[];
  interactiveActivities?: string[];
  comprehensionQuestions?: any[];
  practicalApplication?: {
    exercises?: string[];
  };
  quickAssessmentQuestions?: {
    question: string;
    suggestedAnswer: string;
  }[];
  inClassEffort?: InClassEffortTask;
  conclusionSummary?: string;
  homeworkDescription?: string;
  differentiatedHomework?: any;
  teacherPrivateNotes?: string;
  aiGenerated?: boolean;
  isLibraryTemplate?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LessonFeedbackRecord {
  id: string;
  lessonId: string;
  teacherId: string;
  objectivesAchieved: 'fully' | 'partially' | 'not_achieved';
  comprehensionRating: number; // 1-5
  encounteredDifficulties: string;
  studentsNeedingHelp: string[]; // student names or IDs
  topPerformingStudents: string[]; // student names or IDs
  teacherNotes: string;
  nextLessonAiSuggestions?: {
    topicsToReview: string[];
    topicsToReexplain: string[];
    skillsToDevelop: string[];
    suggestedNextObjectives: string[];
    suggestedHomework: string;
  };
  recordedAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  groupId: string;
  lessonId?: string;
  date: string; // 'YYYY-MM-DD'
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  markedAt: string;
  method: 'manual' | 'qr' | 'bulk';
}

export interface Lesson {
  id: string;
  teacherId: string;
  groupId: string;
  title: string;
  subject: string;
  date: string; // 'YYYY-MM-DD'
  dayOfWeek: 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
  startTime: string;
  endTime: string;
  location: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  hasPreparation: boolean;
  isRecurring: boolean;
  createdAt: string;
}

export type ExamType = 'weekly' | 'monthly' | 'midterm' | 'trial' | 'custom';

export interface Exam {
  id: string;
  teacherId: string;
  groupId: string;
  title: string;
  subject: string;
  type: ExamType;
  date: string;
  maxScore: number;
  passingScore: number;
  topicsCovered?: string[];
  notes?: string;
  createdAt: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  teacherId: string;
  score: number;
  percentage: number;
  rank?: number;
  feedback?: string;
  isAbsent?: boolean;
  gradedAt: string;
}

export interface Homework {
  id: string;
  teacherId: string;
  groupId: string;
  lessonId?: string;
  title: string;
  description: string;
  assignedDate?: string;
  dueDate: string;
  maxPoints?: number;
  maxScore?: number;
  requiresSubmission?: boolean;
  status?: string;
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  teacherId?: string;
  status: 'pending' | 'submitted' | 'late' | 'completed';
  grade?: number;
  teacherFeedback?: string;
  submissionDate?: string;
}

export type EvaluationLevel = 'excellent' | 'very_good' | 'good' | 'needs_improvement';

export interface StudentEvaluation {
  id: string;
  teacherId: string;
  studentId: string;
  evaluationDate: string;
  academicPerformance: EvaluationLevel;
  understanding: EvaluationLevel;
  participation: EvaluationLevel;
  homeworkQuality: EvaluationLevel;
  attendanceDiscipline: EvaluationLevel;
  overallProgress: 'rapid_progress' | 'steady_progress' | 'stable' | 'regressing';
  teacherNotes: string;
  recommendations: string;
}

export interface StudentNote {
  id: string;
  teacherId: string;
  studentId: string;
  type: 'educational' | 'behavioral' | 'private';
  content: string;
  date: string;
  time: string;
  isShareableWithParent: boolean;
}

export interface BehaviorRecord {
  id: string;
  teacherId: string;
  studentId: string;
  type: 'tardiness' | 'missing_homework' | 'phone_usage' | 'missing_tools' | 'disruption' | 'positive_attitude' | 'other';
  description: string;
  teacherActionTaken?: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
  sharedWithParent: boolean;
}

export interface Report {
  id: string;
  teacherId: string;
  type: 'student' | 'group' | 'monthly';
  targetId: string; // studentId or groupId
  title: string;
  generatedDate: string;
  period: string; // e.g., 'سبتمبر 2026'
  summaryText: string;
  metrics: Record<string, any>;
  recommendations: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'lesson_alert' | 'absence_alert' | 'exam_alert' | 'homework_alert' | 'subscription_alert' | 'system_alert';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface GlobalSearchResult {
  type: 'student' | 'group' | 'lesson' | 'exam';
  id: string;
  title: string;
  subtitle: string;
  extraInfo?: string;
}

// ---------------------------------------------
// 3. Billing, Payment Ledger & Financial Types
// ---------------------------------------------

export type ChargeStatus = 'paid' | 'unpaid' | 'partial' | 'waived' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'e_wallet' | 'other';

export interface StudentLessonBilling {
  id: string;
  teacherId: string;
  studentId: string;
  groupId: string;
  lessonId?: string;
  attendanceId?: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  amountDue: number;
  amountPaid: number;
  balance: number; // amountDue - amountPaid
  status: ChargeStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  teacherId: string;
  studentId: string;
  groupId: string;
  billingId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  notes?: string;
  receiptNumber: string;
  recordedBy: string;
  createdAt: string;
  isPendingSync?: boolean;
}

export interface StudentFinancialSummary {
  studentId: string;
  studentName: string;
  groupName: string;
  totalLessons: number;
  dueLessonsCount: number;
  paidLessonsCount: number;
  totalAmountDue: number;
  totalAmountPaid: number;
  remainingBalance: number;
  charges: StudentLessonBilling[];
  transactions: PaymentTransaction[];
}

export interface TeacherFinancialOverview {
  totalAmountDue: number;
  totalAmountPaid: number;
  totalRemainingOverdue: number;
  overdueStudentsCount: number;
  incomeToday: number;
  incomeThisWeek: number;
  incomeThisMonth: number;
  totalChargesCount: number;
  overdueStudentsList: Array<{
    studentId: string;
    studentName: string;
    groupName: string;
    groupId: string;
    parentPhone: string;
    parentName?: string;
    overdueAmount: number;
    unpaidLessonsCount: number;
  }>;
}

export interface PlatformSettings {
  defaultTrialDays: number;
  currency: string;
  paymentGatewayEnabled: boolean;
  webhookSecret?: string;
  supportContact: {
    whatsapp: string;
    email: string;
    phone: string;
  };
}

export interface SubscriptionPaymentRecord {
  id: string;
  userId: string;
  planId: PlanType;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'e_wallet' | 'manual_admin';
  provider: 'paymob' | 'stripe' | 'hyperpay' | 'manual';
  transactionReference: string;
  createdAt: string;
  completedAt?: string;
}

