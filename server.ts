import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db, DEFAULT_PLANS } from './server/db.js';
import {
  generateLessonPlanAI,
  analyzeStudentAI,
  analyzeGroupAI,
  generateQuizAI,
  simplifyConceptAI,
  generateParentMessageAI,
  generatePlacementTestAI,
  analyzePlacementResultsAI,
  recommendGroupAI,
  generateSmartLessonPrepAI,
  generateStudentAwareLessonPrepAI,
  aiTransformLessonElement,
  analyzeLessonFeedbackAndSuggestNextAI
} from './server/ai.js';
import {
  User,
  TeacherProfile,
  Subscription,
  Group,
  Student,
  InitialAssessment,
  PlacementTest,
  LearningProfile,
  PlacementRecommendation,
  AttendanceRecord,
  Lesson,
  LessonPreparation,
  LessonFeedbackRecord,
  Exam,
  ExamResult,
  Homework,
  HomeworkSubmission,
  StudentEvaluation,
  StudentNote,
  BehaviorRecord,
  Report,
  NotificationItem,
  StudentLessonBilling,
  PaymentTransaction,
  PlatformSettings,
  SubscriptionPaymentRecord,
  PaymentMethod,
  ChargeStatus,
  BillingSystem
} from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Simple JWT / Session Simulation with Bearer Token
// Token format: "mueen_token_<userId>"
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token.startsWith('mueen_token_')) return null;
  const userId = token.replace('mueen_token_', '');
  const state = db.getState();
  const user = state.users.find(u => u.id === userId && u.status !== 'suspended');
  return user || null;
}

// Middleware to require authentication
function requireAuth(req: Request, res: Response, next: Function) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'غير مصرح بالدخول. يرجى تسجيل الدخول أولاً.' });
  }
  (req as any).user = user;
  next();
}

// Middleware for Admin only
function requireAdmin(req: Request, res: Response, next: Function) {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'هذا الإجراء مخصص لمدير المنصة فقط.' });
  }
  (req as any).user = user;
  next();
}

// Middleware to require active subscription or valid trial (Server-authoritative)
function requireSubscription(req: Request, res: Response, next: Function) {
  const user = (req as any).user || getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'غير مصرح بالدخول. يرجى تسجيل الدخول أولاً.' });
  }

  // Super Admin has full perpetual access
  if (user.role === 'admin') {
    return next();
  }

  const subCheck = db.checkSubscription(user.id);
  if (subCheck.isExpired) {
    return res.status(403).json({
      success: false,
      code: 'SUBSCRIPTION_EXPIRED',
      error: subCheck.reason || 'انتهت صلاحية الفترة التجريبية أو اشتراكك. يرجى الترقية للاستمرار.',
      subscription: {
        status: subCheck.status,
        daysRemaining: subCheck.daysRemaining,
        plan: subCheck.plan?.id,
        trialEndsAt: subCheck.trialEndsAt,
        endDate: subCheck.endDate
      }
    });
  }

  (req as any).subscriptionCheck = subCheck;
  next();
}

// Helper to enforce monthly AI limits per subscription plan
function checkAiLimit(user: User): { allowed: boolean; error?: string } {
  if (user.role === 'admin') return { allowed: true };
  const state = db.getState();
  const sub = state.subscriptions.find(s => s.userId === user.id);
  const plan = state.plans.find(p => p.id === (sub?.plan || 'trial')) || DEFAULT_PLANS[0];
  const usage = sub?.aiUsageThisMonth || 0;
  if (usage >= plan.aiRequestsPerMonth) {
    return {
      allowed: false,
      error: `لقد استنفدت الحد الأقصى لطلبات الذكاء الاصطناعي في باقتك الحالية (${plan.aiRequestsPerMonth} طلب/شهر). يرجى الترقية لباقة أعلى.`
    };
  }
  return { allowed: true };
}

// ---------------------------------------------
// 1. AUTH API ROUTES
// ---------------------------------------------

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const state = db.getState();
  const user = state.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ success: false, error: 'تم تجميد هذا الحساب من قبل إدارة المنصة. يرجى التواصل مع الدعم.' });
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  db.commit();

  const token = `mueen_token_${user.id}`;
  const teacher = state.teachers.find(t => t.userId === user.id);
  const subscription = state.subscriptions.find(s => s.userId === user.id);

  db.addAuditLog(user.id, user.name, 'LOGIN', 'User', 'تسجيل دخول ناجح للمنصة');

  res.json({
    success: true,
    token,
    user,
    teacher: teacher || null,
    subscription: subscription || null
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, subject, stage, password } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال الاسم والبريد الإلكتروني بشكل صحيح.' });
  }

  const state = db.getState();
  const existing = state.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ success: false, error: 'هذا البريد الإلكتروني مسجل مسبقاً.' });
  }

  const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newUser: User = {
    id: newUserId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone || '',
    role: 'teacher',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  const newTeacher: TeacherProfile = {
    userId: newUserId,
    subject: subject || 'الرياضيات العامة',
    stagePreference: stage || 'المرحلة الثانوية',
    defaultClassDurationMinutes: 90,
    totalStudentsCount: 0,
    totalGroupsCount: 0
  };

  // 7-day Free Trial subscription
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  const newSub: Subscription = {
    id: `sub_${Date.now()}`,
    userId: newUserId,
    plan: 'trial',
    status: 'trial',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    trialEndsAt: endDate.toISOString(),
    aiUsageThisMonth: 0,
    autoRenew: false
  };

  // Welcome notification
  const welcomeNotif: NotificationItem = {
    id: `notif_${Date.now()}`,
    userId: newUserId,
    title: 'مرحباً بك في منصة مُعين! 🎉',
    message: 'تم تفعيل تجربتك المجانية لمدة 7 أيام مع وصول كامل للميزات ومساعد الذكاء الاصطناعي.',
    type: 'system_alert',
    read: false,
    link: '/dashboard',
    createdAt: new Date().toISOString()
  };

  state.users.push(newUser);
  state.teachers.push(newTeacher);
  state.subscriptions.push(newSub);
  state.notifications.push(welcomeNotif);

  db.addAuditLog(newUserId, newUser.name, 'REGISTER', 'User', 'إنشاء حساب مدرس جديد وتفعيل التجربة المجانية');
  db.commit();

  const token = `mueen_token_${newUserId}`;

  res.json({
    success: true,
    token,
    user: newUser,
    teacher: newTeacher,
    subscription: newSub
  });
});

app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const teacher = state.teachers.find(t => t.userId === user.id);
  const subCheck = db.checkSubscription(user.id);
  const subscription = state.subscriptions.find(s => s.userId === user.id);
  const plan = state.plans.find(p => p.id === (subscription?.plan || 'trial')) || DEFAULT_PLANS[0];

  res.json({
    success: true,
    user,
    teacher: teacher || null,
    subscription: subscription || null,
    subscriptionStatus: subCheck,
    planConfig: plan
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email } = req.body;
  res.json({
    success: true,
    message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.'
  });
});

// ---------------------------------------------
// 2. TEACHER DASHBOARD & PROFILE
// ---------------------------------------------

app.get('/api/teacher/dashboard-summary', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();

  const teacherGroups = state.groups.filter(g => g.teacherId === user.id && g.active);
  const teacherStudents = state.students.filter(s => s.teacherId === user.id && s.status === 'active');
  const teacherLessons = state.lessons.filter(l => l.teacherId === user.id);
  const teacherExams = state.exams.filter(e => e.teacherId === user.id);
  const teacherHw = state.homework.filter(h => h.teacherId === user.id);

  // Today's lessons
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLessons = teacherLessons.filter(l => l.date === todayStr);

  // Today's attendance
  const todayAttendance = state.attendance.filter(a => a.teacherId === user.id && a.date === todayStr);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;

  // Student metrics
  const avgAttendance = teacherStudents.length > 0
    ? Math.round(teacherStudents.reduce((acc, s) => acc + (s.attendanceRate ?? 100), 0) / teacherStudents.length)
    : 100;

  const avgExams = teacherStudents.length > 0
    ? Math.round(teacherStudents.reduce((acc, s) => acc + (s.examsAverage ?? 0), 0) / teacherStudents.length)
    : 0;

  const improvingStudents = teacherStudents.filter(s => s.performanceLevel === 'top' || s.performanceLevel === 'improving');
  const strugglingStudents = teacherStudents.filter(s => s.performanceLevel === 'struggling' || (s.consecutiveAbsences && s.consecutiveAbsences >= 2));

  // Upcoming lessons
  const upcomingLessons = teacherLessons
    .filter(l => l.status === 'scheduled')
    .slice(0, 5)
    .map(l => {
      const grp = state.groups.find(g => g.id === l.groupId);
      const studentCount = state.students.filter(s => s.groupId === l.groupId && s.status === 'active').length;
      return {
        ...l,
        groupName: grp?.name || 'مجموعة',
        studentCount
      };
    });

  // Recent attendance trend (last 7 days)
  const attendanceTrend = [
    { day: 'السبت', rate: 92 },
    { day: 'الأحد', rate: 88 },
    { day: 'الاثنين', rate: 95 },
    { day: 'الثلاثاء', rate: 91 },
    { day: 'الأربعاء', rate: 94 },
    { day: 'الخميس', rate: 96 }
  ];

  res.json({
    success: true,
    data: {
      totalGroupsCount: teacherGroups.length,
      totalStudentsCount: teacherStudents.length,
      todayLessonsCount: todayLessons.length,
      todayAttendance: {
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        total: todayAttendance.length
      },
      upcomingExamsCount: teacherExams.length,
      activeHomeworkCount: teacherHw.length,
      performance: {
        averageAttendance: avgAttendance,
        averageExams: avgExams,
        improvingCount: improvingStudents.length,
        strugglingCount: strugglingStudents.length
      },
      upcomingLessons,
      attendanceTrend,
      strugglingStudentsList: strugglingStudents.map(s => ({
        id: s.id,
        name: s.name,
        groupName: teacherGroups.find(g => g.id === s.groupId)?.name || '',
        consecutiveAbsences: s.consecutiveAbsences || 0,
        examsAverage: s.examsAverage || 0,
        reviewNeeds: s.reviewNeeds || []
      }))
    }
  });
});

app.put('/api/teacher/profile', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { name, phone, subject, schoolOrCenter, bio, defaultClassDurationMinutes, stagePreference } = req.body;

  const userRecord = state.users.find(u => u.id === user.id);
  if (userRecord) {
    if (name) userRecord.name = name.trim();
    if (phone) userRecord.phone = phone.trim();
  }

  let teacherRecord = state.teachers.find(t => t.userId === user.id);
  if (!teacherRecord) {
    teacherRecord = {
      userId: user.id,
      subject: subject || 'الرياضيات',
      defaultClassDurationMinutes: 90,
      stagePreference: stagePreference || 'المرحلة الثانوية',
      totalStudentsCount: 0,
      totalGroupsCount: 0
    };
    state.teachers.push(teacherRecord);
  }

  if (subject) teacherRecord.subject = subject;
  if (schoolOrCenter !== undefined) teacherRecord.schoolOrCenter = schoolOrCenter;
  if (bio !== undefined) teacherRecord.bio = bio;
  if (defaultClassDurationMinutes) teacherRecord.defaultClassDurationMinutes = Number(defaultClassDurationMinutes);
  if (stagePreference) teacherRecord.stagePreference = stagePreference;

  db.commit();
  res.json({ success: true, user: userRecord, teacher: teacherRecord });
});

// ---------------------------------------------
// 3. GROUPS API
// ---------------------------------------------

app.get('/api/groups', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const groups = state.groups.filter(g => g.teacherId === user.id);

  const groupsWithStats = groups.map(g => {
    const students = state.students.filter(s => s.groupId === g.id && s.status === 'active');
    const avgAttendance = students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + (s.attendanceRate ?? 100), 0) / students.length)
      : 100;
    const avgExams = students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + (s.examsAverage ?? 0), 0) / students.length)
      : 0;

    return {
      ...g,
      studentCount: students.length,
      averageAttendance: avgAttendance,
      averageExams: avgExams
    };
  });

  res.json({ success: true, data: groupsWithStats });
});

app.post('/api/groups', requireAuth, requireSubscription, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { name, subject, stage, grade, classDays, startTime, endTime, location, maxCapacity, billingSystem, defaultLessonPrice, chargeOnAbsence } = req.body;

  if (!name || !subject) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال اسم المجموعة والمادة.' });
  }

  // Check Plan limit for groups
  const sub = state.subscriptions.find(s => s.userId === user.id);
  const plan = state.plans.find(p => p.id === (sub?.plan || 'trial')) || DEFAULT_PLANS[0];
  const currentCount = state.groups.filter(g => g.teacherId === user.id && g.active).length;

  if (currentCount >= plan.maxGroups) {
    return res.status(403).json({
      success: false,
      error: `لقد بلغت الحد الأقصى للمجموعات المسموح بها في باقتك الحالية (${plan.maxGroups} مجموعة). يرجى الترقية لإضافة المزيد.`
    });
  }

  // Generate Group Code e.g. MUEEN-7A42
  const codeChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = '';
  for (let i = 0; i < 4; i++) {
    randomCode += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
  }
  const groupCode = `MUEEN-${randomCode}`;

  const newGroup: Group = {
    id: `grp_${Date.now()}`,
    teacherId: user.id,
    name: name.trim(),
    subject: subject.trim(),
    stage: stage || 'المرحلة الثانوية',
    grade: grade || 'الصف الثالث الثانوي',
    groupCode,
    classDays: classDays || ['sun', 'tue'],
    startTime: startTime || '16:30',
    endTime: endTime || '18:00',
    location: location || 'سنتر تعليمي',
    maxCapacity: Number(maxCapacity) || 30,
    active: true,
    billingSystem: billingSystem || 'per_lesson',
    defaultLessonPrice: defaultLessonPrice !== undefined ? Number(defaultLessonPrice) : 100,
    chargeOnAbsence: Boolean(chargeOnAbsence),
    createdAt: new Date().toISOString()
  };

  state.groups.push(newGroup);
  db.addAuditLog(user.id, user.name, 'CREATE_GROUP', 'Group', `إنشاء مجموعة جديدة: ${newGroup.name}`, newGroup.id);
  db.commit();

  res.json({ success: true, data: newGroup });
});

app.put('/api/groups/:id', requireAuth, requireSubscription, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const group = state.groups.find(g => g.id === req.params.id && g.teacherId === user.id);

  if (!group) {
    return res.status(404).json({ success: false, error: 'المجموعة غير موجودة.' });
  }

  Object.assign(group, req.body);
  db.commit();
  res.json({ success: true, data: group });
});

app.delete('/api/groups/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const index = state.groups.findIndex(g => g.id === req.params.id && g.teacherId === user.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'المجموعة غير موجودة.' });
  }

  state.groups.splice(index, 1);
  db.commit();
  res.json({ success: true, message: 'تم حذف المجموعة بنجاح.' });
});

// ---------------------------------------------
// 4. STUDENTS API
// ---------------------------------------------

app.get('/api/students', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { groupId, search, performance, sort } = req.query;

  let list = state.students.filter(s => s.teacherId === user.id && s.status !== 'archived');

  if (groupId && groupId !== 'all') {
    list = list.filter(s => s.groupId === groupId);
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.parentPhone.includes(q) ||
      s.parentName.toLowerCase().includes(q)
    );
  }

  if (performance && performance !== 'all') {
    list = list.filter(s => s.performanceLevel === performance);
  }

  // Populate Group Name
  const studentsWithGroup = list.map(s => {
    const grp = state.groups.find(g => g.id === s.groupId);
    return {
      ...s,
      groupName: grp?.name || 'غير محدد'
    };
  });

  res.json({ success: true, data: studentsWithGroup });
});

app.get('/api/students/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const student = state.students.find(s => s.id === req.params.id && s.teacherId === user.id);

  if (!student) {
    return res.status(404).json({ success: false, error: 'ملف الطالب غير موجود.' });
  }

  const group = state.groups.find(g => g.id === student.groupId);
  const attendance = state.attendance.filter(a => a.studentId === student.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const examResults = state.examResults.filter(r => r.studentId === student.id).map(r => {
    const ex = state.exams.find(e => e.id === r.examId);
    return {
      ...r,
      examTitle: ex?.title || 'اختبار',
      maxScore: ex?.maxScore || 20,
      date: ex?.date || ''
    };
  });
  const homework = state.homeworkSubmissions.filter(h => h.studentId === student.id).map(h => {
    const hw = state.homework.find(item => item.id === h.homeworkId);
    return {
      ...h,
      homeworkTitle: hw?.title || 'واجب',
      dueDate: hw?.dueDate || ''
    };
  });
  const evaluations = state.evaluations.filter(e => e.studentId === student.id);
  const notes = state.notes.filter(n => n.studentId === student.id);
  const behaviorRecords = state.behaviorRecords.filter(b => b.studentId === student.id);
  const financialSummary = db.getStudentFinancialSummary(student.id);

  res.json({
    success: true,
    data: {
      ...student,
      groupName: group?.name || 'مجموعة',
      groupSubject: group?.subject || 'المادة',
      attendanceHistory: attendance,
      examResults,
      homeworkHistory: homework,
      evaluations,
      notes,
      behaviorRecords,
      financialSummary
    }
  });
});

app.post('/api/students', requireAuth, requireSubscription, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { name, phone, parentName, parentPhone, parentRelation, groupId, notes, comprehensionLevel, learningSpeed, nationalId } = req.body;

  if (!name || !parentPhone || !groupId) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال اسم الطالب، رقم ولي الأمر، واختيار المجموعة.' });
  }

  // Check Plan limit for students
  const sub = state.subscriptions.find(s => s.userId === user.id);
  const plan = state.plans.find(p => p.id === (sub?.plan || 'trial')) || DEFAULT_PLANS[0];
  const currentCount = state.students.filter(s => s.teacherId === user.id && s.status === 'active').length;

  if (currentCount >= plan.maxStudents) {
    return res.status(403).json({
      success: false,
      error: `لقد وصلت إلى الحد الأقصى للطلاب في باقتك الحالية (${plan.maxStudents} طالب). يرجى الترقية لإضافة المزيد من الطلاب.`
    });
  }

  const newStudent: Student = {
    id: `std_${Date.now()}`,
    teacherId: user.id,
    groupId,
    name: name.trim(),
    phone: phone || '',
    parentName: parentName || 'ولي الأمر',
    parentPhone: parentPhone.trim(),
    parentRelation: parentRelation || 'father',
    nationalId: nationalId || '',
    joinDate: new Date().toISOString().split('T')[0],
    notes: notes || '',
    status: 'active',
    comprehensionLevel: comprehensionLevel || 'good',
    learningSpeed: learningSpeed || 'normal',
    performanceLevel: 'stable',
    strengths: ['الالتزام بالحضور'],
    weaknesses: [],
    reviewNeeds: [],
    attendanceRate: 100,
    examsAverage: 0,
    homeworkCompletionRate: 100,
    consecutiveAbsences: 0
  };

  state.students.push(newStudent);
  db.addAuditLog(user.id, user.name, 'CREATE_STUDENT', 'Student', `إضافة الطالب: ${newStudent.name}`, newStudent.id);
  db.commit();

  res.json({ success: true, data: newStudent });
});

app.put('/api/students/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const student = state.students.find(s => s.id === req.params.id && s.teacherId === user.id);

  if (!student) {
    return res.status(404).json({ success: false, error: 'الطالب غير موجود.' });
  }

  Object.assign(student, req.body);
  db.recalculateStudentStats(student.id);
  db.commit();
  res.json({ success: true, data: student });
});

app.delete('/api/students/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const index = state.students.findIndex(s => s.id === req.params.id && s.teacherId === user.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'الطالب غير موجود.' });
  }

  state.students.splice(index, 1);
  db.commit();
  res.json({ success: true, message: 'تم حذف الطالب بنجاح.' });
});

// ---------------------------------------------
// 4.1. INITIAL ASSESSMENTS API
// ---------------------------------------------

app.get('/api/initial-assessments/:studentId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const assessment = state.initialAssessments.find(a => a.studentId === req.params.studentId && a.teacherId === user.id);
  res.json({ success: true, data: assessment || null });
});

app.post('/api/initial-assessments', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { studentId, ratings, notes } = req.body;

  if (!studentId || !ratings) {
    return res.status(400).json({ success: false, error: 'بيانات التقييم غير مكتملة.' });
  }

  const existingIndex = state.initialAssessments.findIndex(a => a.studentId === studentId && a.teacherId === user.id);
  const now = new Date().toISOString();

  const assessmentItem: InitialAssessment = {
    id: existingIndex >= 0 ? state.initialAssessments[existingIndex].id : `init_${Date.now()}`,
    studentId,
    teacherId: user.id,
    ratings: {
      comprehension: Number(ratings.comprehension) || 3,
      learningSpeed: Number(ratings.learningSpeed) || 3,
      focus: Number(ratings.focus) || 3,
      participation: Number(ratings.participation) || 3,
      problemSolving: Number(ratings.problemSolving) || 3,
      retention: Number(ratings.retention) || 3,
      application: Number(ratings.application) || 3,
      independence: Number(ratings.independence) || 3,
      homeworkCommitment: Number(ratings.homeworkCommitment) || 3,
      attendanceDiscipline: Number(ratings.attendanceDiscipline) || 3
    },
    notes: {
      strengths: notes?.strengths || '',
      weaknesses: notes?.weaknesses || '',
      currentDifficulties: notes?.currentDifficulties || '',
      teacherNotes: notes?.teacherNotes || '',
      expectedLevel: notes?.expectedLevel || '',
      topicsNeedingReview: notes?.topicsNeedingReview || ''
    },
    createdAt: existingIndex >= 0 ? state.initialAssessments[existingIndex].createdAt : now,
    updatedAt: now
  };

  if (existingIndex >= 0) {
    state.initialAssessments[existingIndex] = assessmentItem;
  } else {
    state.initialAssessments.push(assessmentItem);
  }

  // Update student quick stats
  const student = state.students.find(s => s.id === studentId);
  if (student) {
    if (ratings.comprehension >= 4) student.comprehensionLevel = 'excellent';
    else if (ratings.comprehension >= 3) student.comprehensionLevel = 'good';
    else student.comprehensionLevel = 'needs_followup';

    if (ratings.learningSpeed >= 4) student.learningSpeed = 'fast';
    else if (ratings.learningSpeed >= 3) student.learningSpeed = 'normal';
    else student.learningSpeed = 'slow';

    if (notes?.strengths) student.strengths = [notes.strengths];
    if (notes?.weaknesses) student.weaknesses = [notes.weaknesses];
    if (notes?.topicsNeedingReview) student.reviewNeeds = [notes.topicsNeedingReview];
  }

  db.commit();
  res.json({ success: true, data: assessmentItem });
});

// ---------------------------------------------
// 4.2. PLACEMENT DIAGNOSTIC TESTS API
// ---------------------------------------------

app.post('/api/placement-tests/generate', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { studentId, subject, stage, grade, topics, initialLevelEstimate } = req.body;

  const student = state.students.find(s => s.id === studentId && s.teacherId === user.id);
  const group = student ? state.groups.find(g => g.id === student.groupId) : null;

  try {
    const test = await generatePlacementTestAI({
      studentName: student?.name || 'الطالب',
      subject: subject || group?.subject || 'الرياضيات',
      stage: stage || group?.stage || 'المرحلة الثانوية',
      grade: grade || group?.grade || 'الصف الثالث الثانوي',
      topics: topics || [],
      initialLevelEstimate: initialLevelEstimate || student?.comprehensionLevel
    });

    res.json({ success: true, data: test });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر توليد اختبار تحديد المستوى بواسطة الذكاء الاصطناعي.' });
  }
});

app.get('/api/placement-tests/:studentId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const tests = state.placementTests.filter(t => t.studentId === req.params.studentId && t.teacherId === user.id);
  res.json({ success: true, data: tests });
});

app.post('/api/placement-tests', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { studentId, title, subject, stage, grade, topicsCovered, questions } = req.body;

  if (!studentId || !Array.isArray(questions)) {
    return res.status(400).json({ success: false, error: 'بيانات الاختبار غير مكتملة.' });
  }

  const newTest: PlacementTest = {
    id: `plc_${Date.now()}`,
    studentId,
    teacherId: user.id,
    title: title || 'اختبار تحديد المستوى',
    subject: subject || 'المادة',
    stage: stage || 'المرحلة الثانوية',
    grade: grade || 'الصف الدراسي',
    topicsCovered: topicsCovered || [],
    questions: questions || [],
    status: 'draft',
    totalScore: questions.reduce((sum: number, q: any) => sum + (q.points || 4), 0),
    createdAt: new Date().toISOString()
  };

  state.placementTests.push(newTest);
  db.commit();
  res.json({ success: true, data: newTest });
});

app.post('/api/placement-tests/:id/submit', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const test = state.placementTests.find(t => t.id === req.params.id && t.teacherId === user.id);

  if (!test) {
    return res.status(404).json({ success: false, error: 'الاختبار غير موجود.' });
  }

  const { answers } = req.body; // array of { questionId: number, studentAnswer: string }
  if (!Array.isArray(answers)) {
    return res.status(400).json({ success: false, error: 'يجب إرسال إجابات الأسئلة.' });
  }

  let earnedScore = 0;
  const tierScores: Record<string, { score: number; max: number; level: string }> = {
    basics: { score: 0, max: 0, level: 'يحتاج دعم' },
    comprehension: { score: 0, max: 0, level: 'يحتاج دعم' },
    application: { score: 0, max: 0, level: 'يحتاج دعم' },
    problemSolving: { score: 0, max: 0, level: 'يحتاج دعم' },
    advanced: { score: 0, max: 0, level: 'يحتاج دعم' }
  };

  const tierKeyMap: Record<number, string> = {
    1: 'basics',
    2: 'comprehension',
    3: 'application',
    4: 'problemSolving',
    5: 'advanced'
  };

  const answersAnalysis: any[] = [];

  test.questions.forEach(q => {
    const submitted = answers.find(a => a.questionId === q.id);
    if (submitted) {
      q.studentAnswer = submitted.studentAnswer;
    }
    const isCorrect = q.studentAnswer?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
    const qPoints = q.points || 4;
    const tierKey = tierKeyMap[q.tier] || 'basics';

    if (!tierScores[tierKey]) {
      tierScores[tierKey] = { score: 0, max: 0, level: 'يحتاج دعم' };
    }
    tierScores[tierKey].max += qPoints;

    if (isCorrect) {
      earnedScore += qPoints;
      tierScores[tierKey].score += qPoints;
    }

    answersAnalysis.push({
      questionId: q.id,
      tier: q.tier,
      tierName: q.tierName,
      isCorrect,
      skill: q.measuredSkill
    });
  });

  // Calculate tier levels
  Object.keys(tierScores).forEach(k => {
    const t = tierScores[k];
    const pct = t.max > 0 ? (t.score / t.max) * 100 : 0;
    if (pct >= 85) t.level = 'ممتاز';
    else if (pct >= 65) t.level = 'جيد جداً';
    else if (pct >= 50) t.level = 'جيد';
    else t.level = 'يحتاج دعم';
  });

  const totalScore = test.totalScore || 20;
  const masteryPercentage = Math.round((earnedScore / totalScore) * 100);

  test.status = 'completed';
  test.earnedScore = earnedScore;
  test.masteryPercentage = masteryPercentage;
  test.tierScores = tierScores;
  test.completedAt = new Date().toISOString();

  // Fetch Student & Initial Assessment to feed into AI
  const student = state.students.find(s => s.id === test.studentId);
  const initialAssessment = state.initialAssessments.find(a => a.studentId === test.studentId);

  // Generate Learning Profile via AI
  try {
    const profileAI = await analyzePlacementResultsAI({
      studentName: student?.name || 'الطالب',
      subject: test.subject,
      grade: test.grade,
      totalScore,
      earnedScore,
      answers: answersAnalysis,
      teacherRatings: initialAssessment?.ratings as any,
      teacherNotes: initialAssessment?.notes.teacherNotes
    });

    // Save or update Learning Profile in database
    const existingProfileIndex = state.learningProfiles.findIndex(lp => lp.studentId === test.studentId);
    const learningProfile: LearningProfile = {
      id: existingProfileIndex >= 0 ? state.learningProfiles[existingProfileIndex].id : `lp_${Date.now()}`,
      studentId: test.studentId,
      teacherId: user.id,
      basicsLevel: profileAI.basicsLevel,
      comprehensionLevel: profileAI.comprehensionLevel,
      applicationLevel: profileAI.applicationLevel,
      problemSolvingLevel: profileAI.problemSolvingLevel,
      learningPace: profileAI.learningPace,
      academicStrengths: profileAI.academicStrengths || [],
      focusAreas: profileAI.focusAreas || [],
      recommendedReviewTopics: profileAI.recommendedReviewTopics || [],
      educationalSummary: profileAI.educationalSummary,
      generatedAt: existingProfileIndex >= 0 ? state.learningProfiles[existingProfileIndex].generatedAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingProfileIndex >= 0) {
      state.learningProfiles[existingProfileIndex] = learningProfile;
    } else {
      state.learningProfiles.push(learningProfile);
    }

    test.strengths = profileAI.academicStrengths;
    test.weaknesses = profileAI.focusAreas;
    test.topicsForReview = profileAI.recommendedReviewTopics;

    // Update student model properties
    if (student) {
      student.strengths = profileAI.academicStrengths;
      student.weaknesses = profileAI.focusAreas;
      student.reviewNeeds = profileAI.recommendedReviewTopics;
      if (masteryPercentage >= 85) student.performanceLevel = 'top';
      else if (masteryPercentage >= 65) student.performanceLevel = 'stable';
      else student.performanceLevel = 'needs_improvement';
    }
  } catch (e) {
    console.error('Failed to auto-generate learning profile:', e);
  }

  db.commit();
  res.json({ success: true, data: test });
});

// ---------------------------------------------
// 4.3. LEARNING PROFILES API
// ---------------------------------------------

app.get('/api/learning-profiles/:studentId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const profile = state.learningProfiles.find(lp => lp.studentId === req.params.studentId && lp.teacherId === user.id);
  res.json({ success: true, data: profile || null });
});

app.put('/api/learning-profiles/:studentId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const existing = state.learningProfiles.find(lp => lp.studentId === req.params.studentId && lp.teacherId === user.id);

  if (existing) {
    Object.assign(existing, req.body, { updatedAt: new Date().toISOString() });
    db.commit();
    return res.json({ success: true, data: existing });
  }

  const newProfile: LearningProfile = {
    id: `lp_${Date.now()}`,
    studentId: req.params.studentId,
    teacherId: user.id,
    basicsLevel: req.body.basicsLevel || 'جيد',
    comprehensionLevel: req.body.comprehensionLevel || 'جيد',
    applicationLevel: req.body.applicationLevel || 'جيد',
    problemSolvingLevel: req.body.problemSolvingLevel || 'جيد',
    learningPace: req.body.learningPace || 'طبيعية متزنة',
    academicStrengths: req.body.academicStrengths || [],
    focusAreas: req.body.focusAreas || [],
    recommendedReviewTopics: req.body.recommendedReviewTopics || [],
    educationalSummary: req.body.educationalSummary || '',
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  state.learningProfiles.push(newProfile);
  db.commit();
  res.json({ success: true, data: newProfile });
});

// ---------------------------------------------
// 4.4. GROUP RECOMMENDATIONS & ASSIGNMENT API
// ---------------------------------------------

app.post('/api/groups/recommend', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { studentId } = req.body;

  const student = state.students.find(s => s.id === studentId && s.teacherId === user.id);
  if (!student) {
    return res.status(404).json({ success: false, error: 'الطالب غير موجود.' });
  }

  const latestTest = state.placementTests
    .filter(t => t.studentId === studentId && t.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime())[0];

  const profile = state.learningProfiles.find(lp => lp.studentId === studentId);
  const initialEval = state.initialAssessments.find(a => a.studentId === studentId);

  // Calculate teacher rating avg
  let teacherRatingAvg = 3;
  if (initialEval?.ratings) {
    const vals = Object.values(initialEval.ratings) as number[];
    if (vals.length > 0) {
      teacherRatingAvg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    }
  }

  // Gather available teacher groups
  const groupsData = state.groups.filter(g => g.teacherId === user.id && g.active).map(g => {
    const grpStudents = state.students.filter(s => s.groupId === g.id && s.status === 'active');
    const avgScore = grpStudents.length > 0
      ? Math.round(grpStudents.reduce((sum, s) => sum + (s.examsAverage || 0), 0) / grpStudents.length)
      : 75;
    const avgAtt = grpStudents.length > 0
      ? Math.round(grpStudents.reduce((sum, s) => sum + (s.attendanceRate || 100), 0) / grpStudents.length)
      : 95;
    return {
      id: g.id,
      name: g.name,
      stage: g.stage,
      grade: g.grade,
      studentsCount: grpStudents.length,
      averageExamScore: avgScore,
      averageAttendanceRate: avgAtt
    };
  });

  try {
    const recommendation = await recommendGroupAI({
      studentName: student.name,
      masteryPercentage: latestTest?.masteryPercentage ?? 75,
      learningProfileSummary: profile?.educationalSummary || 'طالب جديد بانتظار التسكين الأكاديمي',
      teacherRatingAvg,
      availableGroups: groupsData
    });

    const recItem: PlacementRecommendation = {
      id: `rec_${Date.now()}`,
      studentId,
      teacherId: user.id,
      suggestedGroupId: recommendation.suggestedGroupId,
      suggestedGroupName: recommendation.suggestedGroupName,
      compatibilityPercentage: recommendation.compatibilityPercentage,
      reason: recommendation.reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    state.placementRecommendations.push(recItem);
    db.commit();

    res.json({ success: true, data: recItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر توليد توصية المجموعة المناسبة بواسطة الذكاء الاصطناعي.' });
  }
});

app.post('/api/groups/assign-student', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { studentId, groupId, recommendationId } = req.body;

  const student = state.students.find(s => s.id === studentId && s.teacherId === user.id);
  const group = state.groups.find(g => g.id === groupId && g.teacherId === user.id);

  if (!student || !group) {
    return res.status(404).json({ success: false, error: 'الطالب أو المجموعة غير موجودة.' });
  }

  const oldGroupId = student.groupId;
  student.groupId = groupId;

  if (recommendationId) {
    const rec = state.placementRecommendations.find(r => r.id === recommendationId);
    if (rec) {
      rec.status = 'accepted';
      rec.acceptedAt = new Date().toISOString();
    }
  }

  db.addAuditLog(user.id, user.name, 'ASSIGN_STUDENT_GROUP', 'Student', `نقل/تسكين الطالب ${student.name} إلى مجموعة: ${group.name}`, student.id);
  db.commit();

  res.json({ success: true, message: `تم تسكين الطالب في ${group.name} بنجاح.`, data: student });
});

// ---------------------------------------------
// 5. ATTENDANCE API
// ---------------------------------------------

app.get('/api/attendance', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { groupId, date } = req.query;

  let records = state.attendance.filter(a => a.teacherId === user.id);
  if (groupId) records = records.filter(a => a.groupId === groupId);
  if (date) records = records.filter(a => a.date === date);

  res.json({ success: true, data: records });
});

app.post('/api/attendance/bulk', requireAuth, requireSubscription, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { groupId, date, records, lessonId } = req.body;

  if (!groupId || !date || !Array.isArray(records)) {
    return res.status(400).json({ success: false, error: 'بيانات الحضور غير مكتملة.' });
  }

  const group = state.groups.find(g => g.id === groupId);
  const lesson = lessonId ? state.lessons.find(l => l.id === lessonId) : null;
  const lessonTitle = lesson?.title || `حصة بتاريخ ${date}`;
  const price = group?.defaultLessonPrice !== undefined ? group.defaultLessonPrice : 100;
  const chargeOnAbsence = Boolean(group?.chargeOnAbsence);

  for (const item of records) {
    let attendanceRecordId = '';
    const existingIndex = state.attendance.findIndex(
      a => a.teacherId === user.id && a.groupId === groupId && a.studentId === item.studentId && a.date === date
    );

    if (existingIndex >= 0) {
      state.attendance[existingIndex].status = item.status;
      state.attendance[existingIndex].note = item.note || '';
      state.attendance[existingIndex].markedAt = new Date().toISOString();
      attendanceRecordId = state.attendance[existingIndex].id;
    } else {
      attendanceRecordId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      state.attendance.push({
        id: attendanceRecordId,
        teacherId: user.id,
        groupId,
        lessonId: lessonId || undefined,
        date,
        studentId: item.studentId,
        status: item.status,
        note: item.note || '',
        markedAt: new Date().toISOString(),
        method: item.method || 'bulk'
      });
    }

    // Automated Student Lesson Billing (Unique per lesson + student)
    const shouldCharge = (item.status === 'present' || item.status === 'late') || (item.status === 'absent' && chargeOnAbsence);
    if (shouldCharge && price > 0 && (group?.billingSystem === 'per_lesson' || !group?.billingSystem)) {
      db.recordLessonCharge({
        teacherId: user.id,
        studentId: item.studentId,
        groupId,
        lessonId: lessonId || undefined,
        attendanceId: attendanceRecordId,
        lessonTitle,
        date,
        amountDue: price
      });
    }

    db.recalculateStudentStats(item.studentId);
  }

  db.addAuditLog(user.id, user.name, 'MARK_ATTENDANCE', 'Attendance', `تسجيل حضور ${records.length} طالب بتاريخ ${date}`);
  db.commit();

  res.json({ success: true, message: 'تم حفظ سجل الحضور وتحديث الاستحقاقات المالية بنجاح.' });
});

// ---------------------------------------------
// 6. LESSONS & SCHEDULE API
// ---------------------------------------------

app.get('/api/lessons', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { groupId, startDate, endDate } = req.query;

  let lessons = state.lessons.filter(l => l.teacherId === user.id);
  if (groupId && groupId !== 'all') {
    lessons = lessons.filter(l => l.groupId === groupId);
  }

  const enriched = lessons.map(l => {
    const grp = state.groups.find(g => g.id === l.groupId);
    const prep = state.lessonPreparations.find(p => p.lessonId === l.id);
    return {
      ...l,
      groupName: grp?.name || 'مجموعة',
      hasPreparation: !!prep
    };
  });

  res.json({ success: true, data: enriched });
});

app.post('/api/lessons', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { groupId, title, subject, date, dayOfWeek, startTime, endTime, location, notes, isRecurring } = req.body;

  if (!groupId || !title || !date) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال المجموعة وعنوان الحصة وتاريخها.' });
  }

  const newLesson: Lesson = {
    id: `lsn_${Date.now()}`,
    teacherId: user.id,
    groupId,
    title: title.trim(),
    subject: subject || 'المادة',
    date,
    dayOfWeek: dayOfWeek || 'sat',
    startTime: startTime || '16:00',
    endTime: endTime || '17:30',
    location: location || 'سنتر تعليمي',
    status: 'scheduled',
    notes: notes || '',
    hasPreparation: false,
    isRecurring: isRecurring ?? true,
    createdAt: new Date().toISOString()
  };

  state.lessons.push(newLesson);
  db.addAuditLog(user.id, user.name, 'CREATE_LESSON', 'Lesson', `إنشاء حصة جديدة: ${newLesson.title}`, newLesson.id);
  db.commit();

  res.json({ success: true, data: newLesson });
});

app.put('/api/lessons/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const lesson = state.lessons.find(l => l.id === req.params.id && l.teacherId === user.id);

  if (!lesson) {
    return res.status(404).json({ success: false, error: 'الحصة غير موجودة.' });
  }

  Object.assign(lesson, req.body);
  db.commit();
  res.json({ success: true, data: lesson });
});

app.delete('/api/lessons/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const index = state.lessons.findIndex(l => l.id === req.params.id && l.teacherId === user.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'الحصة غير موجودة.' });
  }

  state.lessons.splice(index, 1);
  db.commit();
  res.json({ success: true, message: 'تم حذف الحصة بنجاح.' });
});

// Lesson Preparation GET & POST
app.get('/api/lessons/:id/prep', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const prep = state.lessonPreparations.find(p => p.lessonId === req.params.id && p.teacherId === user.id);
  res.json({ success: true, data: prep || null });
});

app.post('/api/lessons/:id/prep', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const lesson = state.lessons.find(l => l.id === req.params.id && l.teacherId === user.id);

  if (!lesson) {
    return res.status(404).json({ success: false, error: 'الحصة غير موجودة.' });
  }

  const existingIndex = state.lessonPreparations.findIndex(p => p.lessonId === lesson.id);
  const prepData: LessonPreparation = {
    id: existingIndex >= 0 ? state.lessonPreparations[existingIndex].id : `prep_${Date.now()}`,
    lessonId: lesson.id,
    teacherId: user.id,
    lessonTitle: req.body.lessonTitle || lesson.title,
    subject: req.body.subject || lesson.subject,
    stage: req.body.stage,
    grade: req.body.grade,
    groupId: lesson.groupId,
    groupName: req.body.groupName,
    durationMinutes: req.body.durationMinutes || 90,
    studentCount: req.body.studentCount,
    groupLevel: req.body.groupLevel,
    unit: req.body.unit || 'الوحدة الأولى',
    educationalObjectives: req.body.educationalObjectives || [],
    previousCoverage: req.body.previousCoverage || '',
    targetSkills: req.body.targetSkills || [],
    warmupHook: req.body.warmupHook,
    summaryExplanation: req.body.summaryExplanation || '',
    lessonElements: req.body.lessonElements || [],
    gradedExamples: req.body.gradedExamples || [],
    interactiveActivities: req.body.interactiveActivities || [],
    comprehensionQuestions: req.body.comprehensionQuestions || [],
    practicalApplication: req.body.practicalApplication,
    quickAssessmentQuestions: req.body.quickAssessmentQuestions || [],
    conclusionSummary: req.body.conclusionSummary || '',
    inClassEffort: req.body.inClassEffort,
    homeworkDescription: req.body.homeworkDescription || '',
    differentiatedHomework: req.body.differentiatedHomework,
    teacherPrivateNotes: req.body.teacherPrivateNotes || '',
    aiGenerated: req.body.aiGenerated || false,
    isLibraryTemplate: req.body.isLibraryTemplate || false,
    tags: req.body.tags || [],
    createdAt: existingIndex >= 0 ? (state.lessonPreparations[existingIndex].createdAt || new Date().toISOString()) : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    state.lessonPreparations[existingIndex] = prepData;
  } else {
    state.lessonPreparations.push(prepData);
  }

  lesson.hasPreparation = true;
  db.commit();

  res.json({ success: true, data: prepData });
});

// Library of Lesson Templates
app.get('/api/lesson-prep/library', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const library = state.lessonPreparations.filter(p => p.teacherId === user.id && p.isLibraryTemplate);
  res.json({ success: true, data: library });
});

app.post('/api/lesson-prep/generate-smart', requireAuth, requireSubscription, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const limitCheck = checkAiLimit(user);
  if (!limitCheck.allowed) {
    return res.status(403).json({ success: false, code: 'AI_LIMIT_REACHED', error: limitCheck.error });
  }

  const state = db.getState();
  const sub = state.subscriptions.find(s => s.userId === user.id);
  if (sub) {
    sub.aiUsageThisMonth = (sub.aiUsageThisMonth || 0) + 1;
  }

  try {
    const result = await generateSmartLessonPrepAI(req.body);
    db.commit();
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر توليد خطة التحضير الذكية.' });
  }
});

app.post('/api/lesson-prep/generate-student-aware', requireAuth, requireSubscription, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const limitCheck = checkAiLimit(user);
  if (!limitCheck.allowed) {
    return res.status(403).json({ success: false, code: 'AI_LIMIT_REACHED', error: limitCheck.error });
  }

  const state = db.getState();
  const { lessonId, groupId, lessonTitle, durationMinutes } = req.body;

  const group = state.groups.find(g => g.id === groupId && g.teacherId === user.id);
  const students = state.students.filter(s => s.groupId === groupId && s.teacherId === user.id && s.status === 'active');

  const exams = state.exams.filter(e => e.groupId === groupId && e.teacherId === user.id);
  const examIds = exams.map(e => e.id);
  const results = state.examResults.filter(r => examIds.includes(r.examId));
  const examsAvg = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) : 80;

  const attendanceAvg = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.attendanceRate || 100), 0) / students.length)
    : 95;

  const homeworkAvg = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.homeworkCompletionRate || 100), 0) / students.length)
    : 90;

  const allWeaknesses = students.flatMap(s => s.weaknesses || []).concat(students.flatMap(s => s.reviewNeeds || []));
  const allStrengths = students.flatMap(s => s.strengths || []);

  const lastFeedback = state.lessonFeedbackRecords
    .filter(f => f.teacherId === user.id)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];

  const sub = state.subscriptions.find(s => s.userId === user.id);
  if (sub) {
    sub.aiUsageThisMonth = (sub.aiUsageThisMonth || 0) + 1;
  }

  try {
    const result = await generateStudentAwareLessonPrepAI({
      lessonTitle: lessonTitle || 'درس جديد',
      subject: group?.subject || 'الرياضيات',
      stage: group?.stage || 'المرحلة الثانوية',
      grade: group?.grade || 'الصف الثالث الثانوي',
      groupName: group?.name || 'المجموعة الأساسية',
      durationMinutes: durationMinutes || 90,
      studentsAnalytics: {
        totalStudents: students.length,
        attendanceAvg,
        examsAvg,
        homeworkAvg,
        commonWeaknesses: Array.from(new Set(allWeaknesses)),
        commonStrengths: Array.from(new Set(allStrengths)),
        strugglingStudentsCount: students.filter(s => s.performanceLevel === 'struggling' || (s as any).performanceLevel === 'needs_improvement' || (s.examsAverage && s.examsAverage < 60)).length,
        topStudentsCount: students.filter(s => s.performanceLevel === 'top' || (s.examsAverage && s.examsAverage >= 90)).length,
        lastLessonNotes: lastFeedback?.teacherNotes
      }
    });

    db.commit();
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر تحضير الحصة بناءً على بيانات الطلاب.' });
  }
});

app.post('/api/lesson-prep/transform', requireAuth, requireSubscription, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const limitCheck = checkAiLimit(user);
  if (!limitCheck.allowed) {
    return res.status(403).json({ success: false, code: 'AI_LIMIT_REACHED', error: limitCheck.error });
  }

  const state = db.getState();
  const sub = state.subscriptions.find(s => s.userId === user.id);
  if (sub) {
    sub.aiUsageThisMonth = (sub.aiUsageThisMonth || 0) + 1;
    db.commit();
  }

  try {
    const result = await aiTransformLessonElement(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر تعديل العنصر بواسطة الذكاء الاصطناعي.' });
  }
});

// Lesson Feedback & AI Next Class Recommendations
app.get('/api/lesson-feedback/:lessonId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const feedback = state.lessonFeedbackRecords.find(f => f.lessonId === req.params.lessonId && f.teacherId === user.id);
  res.json({ success: true, data: feedback || null });
});

app.post('/api/lesson-feedback', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { lessonId, objectivesAchieved, comprehensionRating, encounteredDifficulties, studentsNeedingHelp, topPerformingStudents, teacherNotes } = req.body;

  const lesson = state.lessons.find(l => l.id === lessonId && l.teacherId === user.id);
  if (!lesson) {
    return res.status(404).json({ success: false, error: 'الحصة غير موجودة.' });
  }

  let nextAiSuggestions: any = null;
  try {
    nextAiSuggestions = await analyzeLessonFeedbackAndSuggestNextAI({
      lessonTitle: lesson.title,
      subject: lesson.subject,
      grade: 'الصف الثالث الثانوي',
      objectivesAchieved: objectivesAchieved || 'fully',
      comprehensionRating: Number(comprehensionRating) || 4,
      encounteredDifficulties: encounteredDifficulties || '',
      studentsNeedingHelpCount: Array.isArray(studentsNeedingHelp) ? studentsNeedingHelp.length : 0,
      teacherNotes: teacherNotes || ''
    });
  } catch (e) {
    console.error('AI Next class suggestion error:', e);
  }

  const existingIndex = state.lessonFeedbackRecords.findIndex(f => f.lessonId === lessonId && f.teacherId === user.id);
  const feedbackRecord: LessonFeedbackRecord = {
    id: existingIndex >= 0 ? state.lessonFeedbackRecords[existingIndex].id : `fb_${Date.now()}`,
    lessonId,
    teacherId: user.id,
    objectivesAchieved: objectivesAchieved || 'fully',
    comprehensionRating: Number(comprehensionRating) || 4,
    encounteredDifficulties: encounteredDifficulties || '',
    studentsNeedingHelp: studentsNeedingHelp || [],
    topPerformingStudents: topPerformingStudents || [],
    teacherNotes: teacherNotes || '',
    nextLessonAiSuggestions: nextAiSuggestions,
    recordedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    state.lessonFeedbackRecords[existingIndex] = feedbackRecord;
  } else {
    state.lessonFeedbackRecords.push(feedbackRecord);
  }

  // Update struggling students review needs
  if (Array.isArray(studentsNeedingHelp) && encounteredDifficulties) {
    studentsNeedingHelp.forEach((stdId: string) => {
      const s = state.students.find(std => std.id === stdId);
      if (s) {
        s.reviewNeeds = Array.from(new Set([...(s.reviewNeeds || []), encounteredDifficulties]));
      }
    });
  }

  db.commit();
  res.json({ success: true, data: feedbackRecord });
});

// Differentiated Homework Publishing
app.post('/api/differentiated-homework/publish', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { groupId, lessonId, homeworkType, title, description, questions, dueDate, maxScore } = req.body;

  const group = state.groups.find(g => g.id === groupId && g.teacherId === user.id);
  if (!group) {
    return res.status(404).json({ success: false, error: 'المجموعة غير موجودة.' });
  }

  const newHw: Homework = {
    id: `hw_${Date.now()}`,
    teacherId: user.id,
    groupId,
    lessonId: lessonId || undefined,
    title: title || `واجب متمايز (${homeworkType || 'أساسي'})`,
    description: description || questions?.map((q: any, i: number) => `${i + 1}. ${q.text}`).join('\n') || '',
    dueDate: dueDate || new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    maxScore: maxScore || 10,
    requiresSubmission: true,
    status: 'assigned',
    createdAt: new Date().toISOString()
  };

  state.homework.push(newHw);

  // Auto assign to group students
  const students = state.students.filter(s => s.groupId === groupId && s.status === 'active');
  students.forEach(s => {
    state.homeworkSubmissions.push({
      id: `sub_${Date.now()}_${s.id}`,
      homeworkId: newHw.id,
      studentId: s.id,
      status: 'pending'
    });
  });

  db.addAuditLog(user.id, user.name, 'PUBLISH_DIFFERENTIATED_HOMEWORK', 'Homework', `نشر واجب متمايز: ${newHw.title}`, newHw.id);
  db.commit();

  res.json({ success: true, data: newHw });
});

// ---------------------------------------------
// 7. EXAMS & GRADES API
// ---------------------------------------------

app.get('/api/exams', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { groupId } = req.query;

  let exams = state.exams.filter(e => e.teacherId === user.id);
  if (groupId && groupId !== 'all') {
    exams = exams.filter(e => e.groupId === groupId);
  }

  const enriched = exams.map(ex => {
    const grp = state.groups.find(g => g.id === ex.groupId);
    const results = state.examResults.filter(r => r.examId === ex.id && !r.isAbsent);
    const scores = results.map(r => r.score);
    const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
    const maxScored = scores.length > 0 ? Math.max(...scores) : 0;
    const minScored = scores.length > 0 ? Math.min(...scores) : 0;

    return {
      ...ex,
      groupName: grp?.name || 'مجموعة',
      resultsCount: results.length,
      averageScore: Number(avgScore),
      highestScore: maxScored,
      lowestScore: minScored
    };
  });

  res.json({ success: true, data: enriched });
});

app.post('/api/exams', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { title, groupId, subject, type, date, maxScore, totalScore, passingScore, topicsCovered, notes } = req.body;

  if (!title || !groupId || !date) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال عنوان الاختبار، المجموعة، والتاريخ.' });
  }

  const resolvedMaxScore = Number(maxScore || totalScore) || 20;

  const newExam: Exam = {
    id: `ex_${Date.now()}`,
    teacherId: user.id,
    groupId,
    title: title.trim(),
    subject: subject || 'المادة',
    type: type || 'weekly',
    date,
    maxScore: resolvedMaxScore,
    passingScore: Number(passingScore) || Math.round(resolvedMaxScore / 2),
    topicsCovered: Array.isArray(topicsCovered) ? topicsCovered : [],
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  state.exams.push(newExam);
  db.addAuditLog(user.id, user.name, 'CREATE_EXAM', 'Exam', `إنشاء اختبار جديد: ${newExam.title}`, newExam.id);
  db.commit();

  res.json({ success: true, data: newExam });
});

app.get('/api/exams/:id/results', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const exam = state.exams.find(e => e.id === req.params.id && e.teacherId === user.id);

  if (!exam) {
    return res.status(404).json({ success: false, error: 'الاختبار غير موجود.' });
  }

  const groupStudents = state.students.filter(s => s.groupId === exam.groupId && s.status === 'active');
  const results = state.examResults.filter(r => r.examId === exam.id);

  const merged = groupStudents.map(student => {
    const r = results.find(item => item.studentId === student.id);
    return {
      studentId: student.id,
      studentName: student.name,
      score: r ? r.score : 0,
      percentage: r ? r.percentage : 0,
      rank: r?.rank,
      feedback: r?.feedback || '',
      isAbsent: r?.isAbsent || false,
      graded: !!r
    };
  });

  res.json({ success: true, exam, data: merged });
});

app.post('/api/exams/:id/results', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const exam = state.exams.find(e => e.id === req.params.id && e.teacherId === user.id);

  if (!exam) {
    return res.status(404).json({ success: false, error: 'الاختبار غير موجود.' });
  }

  const { results } = req.body; // Array of { studentId, score, feedback, isAbsent }
  if (!Array.isArray(results)) {
    return res.status(400).json({ success: false, error: 'قائمة الدرجات غير صالحة.' });
  }

  // Calculate ranks
  const sorted = [...results]
    .filter(r => !r.isAbsent)
    .sort((a, b) => b.score - a.score);

  for (const item of results) {
    const score = Number(item.score) || 0;
    const percentage = exam.maxScore > 0 ? Math.round((score / exam.maxScore) * 100) : 0;
    const rankIndex = sorted.findIndex(s => s.studentId === item.studentId);
    const rank = rankIndex >= 0 ? rankIndex + 1 : undefined;

    const existingIndex = state.examResults.findIndex(r => r.examId === exam.id && r.studentId === item.studentId);

    const resRecord: ExamResult = {
      id: existingIndex >= 0 ? state.examResults[existingIndex].id : `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      examId: exam.id,
      studentId: item.studentId,
      teacherId: user.id,
      score,
      percentage,
      rank,
      feedback: item.feedback || '',
      isAbsent: !!item.isAbsent,
      gradedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      state.examResults[existingIndex] = resRecord;
    } else {
      state.examResults.push(resRecord);
    }

    db.recalculateStudentStats(item.studentId);
  }

  db.addAuditLog(user.id, user.name, 'GRADE_EXAM', 'Exam', `رصد درجات اختبار: ${exam.title}`, exam.id);
  db.commit();

  res.json({ success: true, message: 'تم رصد درجات الاختبار وحساب الترتيب تلقائياً.' });
});

// ---------------------------------------------
// 8. HOMEWORK API
// ---------------------------------------------

app.get('/api/homework', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { groupId } = req.query;

  let hwList = state.homework.filter(h => h.teacherId === user.id);
  if (groupId && groupId !== 'all') {
    hwList = hwList.filter(h => h.groupId === groupId);
  }

  const enriched = hwList.map(h => {
    const grp = state.groups.find(g => g.id === h.groupId);
    const submissions = state.homeworkSubmissions.filter(s => s.homeworkId === h.id);
    const completedCount = submissions.filter(s => s.status === 'completed' || s.status === 'submitted').length;
    return {
      ...h,
      groupName: grp?.name || 'مجموعة',
      submissionsCount: submissions.length,
      completedCount
    };
  });

  res.json({ success: true, data: enriched });
});

app.post('/api/homework', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { title, groupId, description, dueDate, maxPoints } = req.body;

  if (!title || !groupId || !dueDate) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال عنوان الواجب، المجموعة، وموعد التسليم.' });
  }

  const newHw: Homework = {
    id: `hw_${Date.now()}`,
    teacherId: user.id,
    groupId,
    title: title.trim(),
    description: description || '',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate,
    maxPoints: Number(maxPoints) || 10,
    createdAt: new Date().toISOString()
  };

  state.homework.push(newHw);

  // Initialize submissions for all group students
  const students = state.students.filter(s => s.groupId === groupId && s.status === 'active');
  for (const s of students) {
    state.homeworkSubmissions.push({
      id: `subm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      homeworkId: newHw.id,
      studentId: s.id,
      teacherId: user.id,
      status: 'pending'
    });
  }

  db.addAuditLog(user.id, user.name, 'CREATE_HOMEWORK', 'Homework', `إسناد واجب جديد: ${newHw.title}`, newHw.id);
  db.commit();

  res.json({ success: true, data: newHw });
});

app.put('/api/homework/:id/submissions', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { submissions } = req.body; // Array of { studentId, status, grade, feedback }

  if (!Array.isArray(submissions)) {
    return res.status(400).json({ success: false, error: 'بيانات التسليم غير صالحة.' });
  }

  for (const item of submissions) {
    const existingIndex = state.homeworkSubmissions.findIndex(
      s => s.homeworkId === req.params.id && s.studentId === item.studentId
    );

    if (existingIndex >= 0) {
      state.homeworkSubmissions[existingIndex].status = item.status;
      state.homeworkSubmissions[existingIndex].grade = item.grade !== undefined ? Number(item.grade) : undefined;
      state.homeworkSubmissions[existingIndex].teacherFeedback = item.feedback || '';
      state.homeworkSubmissions[existingIndex].submissionDate = new Date().toISOString().split('T')[0];
    } else {
      state.homeworkSubmissions.push({
        id: `subm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        homeworkId: req.params.id,
        studentId: item.studentId,
        teacherId: user.id,
        status: item.status,
        grade: item.grade !== undefined ? Number(item.grade) : undefined,
        teacherFeedback: item.feedback || '',
        submissionDate: new Date().toISOString().split('T')[0]
      });
    }

    db.recalculateStudentStats(item.studentId);
  }

  db.commit();
  res.json({ success: true, message: 'تم تحديث حالة الواجبات بنجاح.' });
});

// ---------------------------------------------
// 9. STUDENT EVALUATIONS & NOTES & BEHAVIOR
// ---------------------------------------------

app.post('/api/evaluations', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { studentId, academicPerformance, understanding, participation, homeworkQuality, attendanceDiscipline, overallProgress, teacherNotes, recommendations } = req.body;

  if (!studentId) {
    return res.status(400).json({ success: false, error: 'معرف الطالب مطلوب.' });
  }

  const evalItem: StudentEvaluation = {
    id: `eval_${Date.now()}`,
    teacherId: user.id,
    studentId,
    evaluationDate: new Date().toISOString().split('T')[0],
    academicPerformance: academicPerformance || 'good',
    understanding: understanding || 'good',
    participation: participation || 'good',
    homeworkQuality: homeworkQuality || 'good',
    attendanceDiscipline: attendanceDiscipline || 'good',
    overallProgress: overallProgress || 'steady_progress',
    teacherNotes: teacherNotes || '',
    recommendations: recommendations || ''
  };

  state.evaluations.push(evalItem);
  db.commit();

  res.json({ success: true, data: evalItem });
});

app.post('/api/notes', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { studentId, type, content, isShareableWithParent } = req.body;

  if (!studentId || !content) {
    return res.status(400).json({ success: false, error: 'يرجى كتابة نص الملاحظة.' });
  }

  const now = new Date();
  const note: StudentNote = {
    id: `not_${Date.now()}`,
    teacherId: user.id,
    studentId,
    type: type || 'educational',
    content: content.trim(),
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().split(' ')[0].substring(0, 5),
    isShareableWithParent: type === 'private' ? false : (isShareableWithParent ?? true)
  };

  state.notes.push(note);
  db.commit();

  res.json({ success: true, data: note });
});

app.delete('/api/notes/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const index = state.notes.findIndex(n => n.id === req.params.id && n.teacherId === user.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'الملاحظة غير موجودة.' });
  }

  state.notes.splice(index, 1);
  db.commit();
  res.json({ success: true, message: 'تم حذف الملاحظة.' });
});

app.post('/api/behavior', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { studentId, type, description, teacherActionTaken, severity, sharedWithParent } = req.body;

  if (!studentId || !description) {
    return res.status(400).json({ success: false, error: 'يرجى كتابة وصف الملاحظة السلوكية.' });
  }

  const record: BehaviorRecord = {
    id: `beh_${Date.now()}`,
    teacherId: user.id,
    studentId,
    type: type || 'other',
    description: description.trim(),
    teacherActionTaken: teacherActionTaken || '',
    date: new Date().toISOString().split('T')[0],
    severity: severity || 'medium',
    sharedWithParent: sharedWithParent ?? false
  };

  state.behaviorRecords.push(record);
  db.commit();

  res.json({ success: true, data: record });
});

// ---------------------------------------------
// 10. AI ASSISTANT API (With Aliases)
// ---------------------------------------------

const handleAiLessonPlan = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const limitCheck = checkAiLimit(user);
  if (!limitCheck.allowed) {
    return res.status(403).json({ success: false, code: 'AI_LIMIT_REACHED', error: limitCheck.error });
  }

  const state = db.getState();
  const sub = state.subscriptions.find(s => s.userId === user.id);

  try {
    const result = await generateLessonPlanAI(req.body);
    if (sub) {
      sub.aiUsageThisMonth = (sub.aiUsageThisMonth || 0) + 1;
      db.commit();
    }
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر الاتصال بخدمة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.' });
  }
};

app.post('/api/ai/lesson-plan', requireAuth, requireSubscription, handleAiLessonPlan);
app.post('/api/ai/lesson-prep', requireAuth, requireSubscription, handleAiLessonPlan);

const handleAiStudentAnalysis = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const limitCheck = checkAiLimit(user);
  if (!limitCheck.allowed) {
    return res.status(403).json({ success: false, code: 'AI_LIMIT_REACHED', error: limitCheck.error });
  }

  const state = db.getState();
  const sub = state.subscriptions.find(s => s.userId === user.id);

  try {
    const result = await analyzeStudentAI(req.body);
    if (sub) {
      sub.aiUsageThisMonth = (sub.aiUsageThisMonth || 0) + 1;
      db.commit();
    }
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر تحليل أداء الطالب بواسطة الذكاء الاصطناعي.' });
  }
};

app.post('/api/ai/analyze-student', requireAuth, requireSubscription, handleAiStudentAnalysis);
app.post('/api/ai/student-diagnostic', requireAuth, requireSubscription, handleAiStudentAnalysis);

const handleAiGroupAnalysis = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const limitCheck = checkAiLimit(user);
  if (!limitCheck.allowed) {
    return res.status(403).json({ success: false, code: 'AI_LIMIT_REACHED', error: limitCheck.error });
  }

  const state = db.getState();
  const sub = state.subscriptions.find(s => s.userId === user.id);

  try {
    const result = await analyzeGroupAI(req.body);
    if (sub) {
      sub.aiUsageThisMonth = (sub.aiUsageThisMonth || 0) + 1;
      db.commit();
    }
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر تحليل المجموعة بواسطة الذكاء الاصطناعي.' });
  }
};

app.post('/api/ai/analyze-group', requireAuth, requireSubscription, handleAiGroupAnalysis);
app.post('/api/ai/group-remediation', requireAuth, requireSubscription, handleAiGroupAnalysis);

const handleAiQuizGeneration = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const limitCheck = checkAiLimit(user);
  if (!limitCheck.allowed) {
    return res.status(403).json({ success: false, code: 'AI_LIMIT_REACHED', error: limitCheck.error });
  }

  const state = db.getState();
  const sub = state.subscriptions.find(s => s.userId === user.id);

  try {
    const result = await generateQuizAI(req.body);
    if (sub) {
      sub.aiUsageThisMonth = (sub.aiUsageThisMonth || 0) + 1;
      db.commit();
    }
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر توليد الاختبار بواسطة الذكاء الاصطناعي.' });
  }
};

app.post('/api/ai/generate-quiz', requireAuth, requireSubscription, handleAiQuizGeneration);
app.post('/api/ai/quiz-generator', requireAuth, requireSubscription, handleAiQuizGeneration);

const handleAiSimplifyConcept = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const limitCheck = checkAiLimit(user);
  if (!limitCheck.allowed) {
    return res.status(403).json({ success: false, code: 'AI_LIMIT_REACHED', error: limitCheck.error });
  }

  const state = db.getState();
  const sub = state.subscriptions.find(s => s.userId === user.id);

  try {
    const result = await simplifyConceptAI(req.body);
    if (sub) {
      sub.aiUsageThisMonth = (sub.aiUsageThisMonth || 0) + 1;
      db.commit();
    }
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر تبسيط المفهوم بواسطة الذكاء الاصطناعي.' });
  }
};

app.post('/api/ai/simplify-concept', requireAuth, requireSubscription, handleAiSimplifyConcept);
app.post('/api/ai/concept-simplifier', requireAuth, requireSubscription, handleAiSimplifyConcept);

app.post('/api/ai/parent-message', requireAuth, requireSubscription, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const limitCheck = checkAiLimit(user);
  if (!limitCheck.allowed) {
    return res.status(403).json({ success: false, code: 'AI_LIMIT_REACHED', error: limitCheck.error });
  }

  const state = db.getState();
  const sub = state.subscriptions.find(s => s.userId === user.id);

  try {
    const result = await generateParentMessageAI(req.body);
    if (sub) {
      sub.aiUsageThisMonth = (sub.aiUsageThisMonth || 0) + 1;
      db.commit();
    }
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'تعذر صياغة رسالة ولي الأمر.' });
  }
});

// ---------------------------------------------
// 11. REPORTS API
// ---------------------------------------------

app.get('/api/reports', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const reports = state.reports.filter(r => r.teacherId === user.id);
  res.json({ success: true, data: reports });
});

app.post('/api/reports', requireAuth, requireSubscription, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { type, targetId, title, period, summaryText, metrics, recommendations } = req.body;

  const newReport: Report = {
    id: `rep_${Date.now()}`,
    teacherId: user.id,
    type: type || 'student',
    targetId: targetId || '',
    title: title || 'تقرير تعليمي',
    generatedDate: new Date().toISOString().split('T')[0],
    period: period || 'الشهر الحالي',
    summaryText: summaryText || '',
    metrics: metrics || {},
    recommendations: Array.isArray(recommendations) ? recommendations : []
  };

  state.reports.push(newReport);
  db.addAuditLog(user.id, user.name, 'CREATE_REPORT', 'Report', `إنشاء تقرير: ${newReport.title}`, newReport.id);
  db.commit();

  res.json({ success: true, data: newReport });
});

// ---------------------------------------------
// 12. NOTIFICATIONS & SEARCH API
// ---------------------------------------------

app.get('/api/notifications', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const notifs = state.notifications
    .filter(n => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, data: notifs });
});

app.post('/api/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const notif = state.notifications.find(n => n.id === req.params.id && n.userId === user.id);

  if (notif) {
    notif.read = true;
    db.commit();
  }

  res.json({ success: true });
});

app.post('/api/notifications/read-all', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  state.notifications.filter(n => n.userId === user.id).forEach(n => n.read = true);
  db.commit();
  res.json({ success: true });
});

app.get('/api/search', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const q = ((req.query.q as string) || '').toLowerCase().trim();
  if (!q) {
    return res.json({ success: true, data: [] });
  }

  const state = db.getState();
  const results: any[] = [];

  // Students
  state.students.filter(s => 
    s.teacherId === user.id && (
      s.name.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      (s.parentPhone && s.parentPhone.includes(q)) ||
      (s.parentName && s.parentName.toLowerCase().includes(q)) ||
      (s.nationalId && s.nationalId.includes(q))
    )
  ).forEach(s => {
    const grp = state.groups.find(g => g.id === s.groupId);
    results.push({
      type: 'student',
      id: s.id,
      title: s.name,
      subtitle: `${grp?.name || 'مجموعة'} | ولي الأمر: ${s.parentPhone}`,
      link: `/students/${s.id}`
    });
  });

  // Groups
  state.groups.filter(g => 
    g.teacherId === user.id && (
      g.name.toLowerCase().includes(q) ||
      (g.groupCode && g.groupCode.toLowerCase().includes(q)) ||
      (g.stage && g.stage.toLowerCase().includes(q)) ||
      (g.grade && g.grade.toLowerCase().includes(q))
    )
  ).forEach(g => {
    results.push({
      type: 'group',
      id: g.id,
      title: g.name,
      subtitle: `${g.subject} (${g.groupCode}) • ${g.stage || ''}`,
      link: `/groups`
    });
  });

  // Lessons
  state.lessons.filter(l => 
    l.teacherId === user.id && (
      l.title.toLowerCase().includes(q) ||
      (l.subject && l.subject.toLowerCase().includes(q)) ||
      (l.location && l.location.toLowerCase().includes(q))
    )
  ).forEach(l => {
    results.push({
      type: 'lesson',
      id: l.id,
      title: l.title,
      subtitle: `بتاريخ ${l.date} - ${l.startTime} • ${l.location || 'سنتر'}`,
      link: `/schedule`
    });
  });

  // Exams
  state.exams.filter(e => 
    e.teacherId === user.id && (
      e.title.toLowerCase().includes(q) ||
      (e.subject && e.subject.toLowerCase().includes(q))
    )
  ).forEach(e => {
    results.push({
      type: 'exam',
      id: e.id,
      title: e.title,
      subtitle: `الدرجة العظمى: ${e.maxScore} | ${e.date}`,
      link: `/exams`
    });
  });

  res.json({ success: true, data: results.slice(0, 10) });
});

// ---------------------------------------------
// 13. SUBSCRIPTIONS & PLANS API
// ---------------------------------------------

app.get('/api/plans', (req: Request, res: Response) => {
  const state = db.getState();
  res.json({ success: true, data: state.plans });
});

app.post('/api/subscriptions/upgrade', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { planId, billingCycle } = req.body; // 'basic' | 'pro' | 'premium'

  const targetPlan = state.plans.find(p => p.id === planId);
  if (!targetPlan) {
    return res.status(400).json({ success: false, error: 'الباقة المحددة غير موجودة.' });
  }

  let sub = state.subscriptions.find(s => s.userId === user.id);
  const now = new Date();
  const endDate = new Date();
  if (billingCycle === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  if (sub) {
    sub.plan = planId;
    sub.status = 'active';
    sub.startDate = now.toISOString();
    sub.endDate = endDate.toISOString();
  } else {
    sub = {
      id: `sub_${Date.now()}`,
      userId: user.id,
      plan: planId,
      status: 'active',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      trialEndsAt: now.toISOString(),
      aiUsageThisMonth: 0,
      autoRenew: true
    };
    state.subscriptions.push(sub);
  }

  db.addAuditLog(user.id, user.name, 'UPGRADE_SUBSCRIPTION', 'Subscription', `ترقية الاشتراك إلى باقة: ${targetPlan.nameAr}`);
  db.commit();

  res.json({
    success: true,
    message: `تم ترقية اشتراكك بنجاح إلى "${targetPlan.nameAr}". استمتع بكافة الميزات الاحترافية!`,
    subscription: sub
  });
});

// ---------------------------------------------
// 14. ADMIN DASHBOARD API
// ---------------------------------------------

const handleAdminMetrics = (req: Request, res: Response) => {
  const state = db.getState();

  const totalTeachers = state.users.filter(u => u.role === 'teacher').length;
  const activeTeachers = state.users.filter(u => u.role === 'teacher' && u.status === 'active').length;
  const inactiveTeachers = totalTeachers - activeTeachers;
  const totalStudents = state.students.length;
  const totalGroups = state.groups.length;
  const totalLessons = state.lessons.length;
  const totalReports = state.reports.length;

  const activeSubs = state.subscriptions.filter(s => s.status === 'active').length;
  const trialSubs = state.subscriptions.filter(s => s.status === 'trial').length;
  const expiredSubs = state.subscriptions.filter(s => s.status === 'expired').length;

  const totalAiUsage = state.subscriptions.reduce((acc, s) => acc + (s.aiUsageThisMonth || 0), 0);

  // Simulated revenue calculation
  const totalRevenue = state.subscriptions.reduce((acc, s) => {
    if (s.status !== 'active') return acc;
    const plan = state.plans.find(p => p.id === s.plan);
    return acc + (plan?.priceMonthly || 0);
  }, 0);

  res.json({
    success: true,
    data: {
      users: {
        totalTeachers,
        activeTeachers,
        inactiveTeachers
      },
      students: {
        totalStudents,
        totalGroups
      },
      subscriptions: {
        active: activeSubs,
        trial: trialSubs,
        expired: expiredSubs
      },
      revenue: {
        totalMonthlyRevenueSAR: totalRevenue,
        currency: 'SAR'
      },
      usage: {
        totalLessons,
        totalReports,
        totalAiRequests: totalAiUsage
      },
      // Flat convenience properties for frontend charts
      totalTeachers,
      totalStudents,
      totalGroups,
      totalRevenueSAR: totalRevenue,
      aiRequestsCount: totalAiUsage
    }
  });
};

app.get('/api/admin/metrics', requireAdmin, handleAdminMetrics);
app.get('/api/admin/stats', requireAdmin, handleAdminMetrics);

app.get('/api/admin/teachers', requireAdmin, (req: Request, res: Response) => {
  const state = db.getState();
  const teachers = state.users.filter(u => u.role === 'teacher').map(u => {
    const prof = state.teachers.find(t => t.userId === u.id);
    const sub = state.subscriptions.find(s => s.userId === u.id);
    const studentCount = state.students.filter(s => s.teacherId === u.id).length;
    const groupCount = state.groups.filter(g => g.teacherId === u.id).length;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      status: u.status,
      subject: prof?.subject || 'الرياضيات',
      stagePreference: prof?.stagePreference || 'المرحلة الثانوية',
      plan: sub?.plan || 'trial',
      subStatus: sub?.status || 'trial',
      subEndDate: sub?.endDate || '',
      studentCount,
      groupCount,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt
    };
  });

  res.json({ success: true, data: teachers });
});

app.put('/api/admin/teachers/:id/plan', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const state = db.getState();
  const { plan } = req.body;
  const teacherUser = state.users.find(u => u.id === req.params.id);

  if (!teacherUser) {
    return res.status(404).json({ success: false, error: 'المعلم غير موجود.' });
  }

  let sub = state.subscriptions.find(s => s.userId === teacherUser.id);
  if (sub) {
    sub.plan = plan || sub.plan;
    sub.status = 'active';
  } else {
    sub = {
      id: `sub_${Date.now()}`,
      userId: teacherUser.id,
      plan: plan || 'teacher_pro',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2027-12-31',
      trialEndsAt: '2027-12-31',
      autoRenew: true,
      aiUsageThisMonth: 0
    };
    state.subscriptions.push(sub);
  }

  db.addAuditLog(admin.id, admin.name, 'UPDATE_TEACHER_PLAN', 'Subscription', `ترقية باقة ${teacherUser.name} إلى ${plan}`, teacherUser.id);
  db.commit();

  res.json({ success: true, message: 'تم تحديث باقة المعلم بنجاح.' });
});

app.post('/api/admin/toggle-user-status', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const state = db.getState();
  const { userId, status } = req.body; // 'active' | 'suspended'

  const user = state.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'المستخدم غير موجود.' });
  }

  user.status = status;
  db.addAuditLog(admin.id, admin.name, 'TOGGLE_USER_STATUS', 'User', `تغيير حالة المستخدم ${user.name} إلى ${status}`, user.id);
  db.commit();

  res.json({ success: true, message: `تم تحديث حالة المستخدم إلى ${status === 'active' ? 'نشط' : 'مجمد'}.` });
});

app.put('/api/admin/plans/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const state = db.getState();
  const plan = state.plans.find(p => p.id === req.params.id);

  if (!plan) {
    return res.status(404).json({ success: false, error: 'الباقة غير موجودة.' });
  }

  Object.assign(plan, req.body);
  db.addAuditLog(admin.id, admin.name, 'UPDATE_PLAN', 'Plan', `تعديل باقة ${plan.nameAr}`, plan.id);
  db.commit();

  res.json({ success: true, data: plan });
});

app.get('/api/admin/audit-logs', requireAdmin, (req: Request, res: Response) => {
  const state = db.getState();
  res.json({ success: true, data: state.auditLogs });
});

const handleAdminBroadcast = (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const state = db.getState();
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال عنوان ونص الإشعار.' });
  }

  for (const user of state.users) {
    state.notifications.push({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      title,
      message,
      type: 'system_alert',
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  db.addAuditLog(admin.id, admin.name, 'BROADCAST_NOTIFICATION', 'Notification', `بث إشعار عام: ${title}`);
  db.commit();

  res.json({ success: true, message: 'تم إرسال الإشعار لجميع مستخدمي المنصة بنجاح.' });
};

app.post('/api/admin/broadcast-notification', requireAdmin, handleAdminBroadcast);
app.post('/api/admin/broadcast', requireAdmin, handleAdminBroadcast);

// ---------------------------------------------
// 13.1. SUBSCRIPTION SECURITY & COMMERCIAL FLOW API
// ---------------------------------------------

app.get('/api/subscriptions/status', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const status = db.checkSubscription(user.id);
  res.json({ success: true, data: status });
});

app.get('/api/subscriptions/current', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const sub = state.subscriptions.find(s => s.userId === user.id);
  const status = db.checkSubscription(user.id);
  const plan = state.plans.find(p => p.id === (sub?.plan || 'trial')) || DEFAULT_PLANS[0];

  res.json({
    success: true,
    data: {
      subscription: sub,
      status,
      plan,
      quotaUsage: {
        studentsCount: state.students.filter(s => s.teacherId === user.id && s.status === 'active').length,
        maxStudents: plan.maxStudents,
        groupsCount: state.groups.filter(g => g.teacherId === user.id && g.active).length,
        maxGroups: plan.maxGroups,
        aiRequestsUsed: sub?.aiUsageThisMonth || 0,
        maxAiRequests: plan.aiRequestsPerMonth
      }
    }
  });
});

app.post('/api/subscriptions/checkout', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { planId, billingCycle, paymentMethod } = req.body;

  const plan = state.plans.find(p => p.id === planId);
  if (!plan) {
    return res.status(400).json({ success: false, error: 'الباقة المحددة غير صالحة.' });
  }

  const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const currency = state.platformSettings?.currency || 'SAR';
  const txnRef = `TXN-MUEEN-${planId.toUpperCase()}-${Date.now().toString().slice(-6)}`;

  const paymentRecord: SubscriptionPaymentRecord = {
    id: `sp_${Date.now()}`,
    userId: user.id,
    planId,
    billingCycle: billingCycle || 'monthly',
    amount,
    currency,
    status: 'pending',
    paymentMethod: paymentMethod || 'card',
    provider: 'manual',
    transactionReference: txnRef,
    createdAt: new Date().toISOString()
  };

  state.subscriptionPayments.push(paymentRecord);
  db.commit();

  res.json({
    success: true,
    data: {
      paymentRecord,
      checkoutUrl: `/checkout?ref=${txnRef}`,
      instructions: 'جاهز لإتمام عملية الدفع بأمان وتفعيل الحساب فوراً.'
    }
  });
});

app.post('/api/subscriptions/verify-payment', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { transactionReference, paymentMethod } = req.body;

  const payment = state.subscriptionPayments.find(p => p.transactionReference === transactionReference && p.userId === user.id);
  if (!payment) {
    return res.status(404).json({ success: false, error: 'معاملة الدفع غير موجودة.' });
  }

  payment.status = 'completed';
  payment.completedAt = new Date().toISOString();
  if (paymentMethod) payment.paymentMethod = paymentMethod;

  // Activate / Upgrade user subscription
  const targetPlan = state.plans.find(p => p.id === payment.planId) || DEFAULT_PLANS[1];
  let sub = state.subscriptions.find(s => s.userId === user.id);
  const now = new Date();
  const endDate = new Date();
  if (payment.billingCycle === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  if (sub) {
    sub.plan = payment.planId;
    sub.status = 'active';
    sub.startDate = now.toISOString();
    sub.endDate = endDate.toISOString();
    sub.autoRenew = true;
  } else {
    sub = {
      id: `sub_${Date.now()}`,
      userId: user.id,
      plan: payment.planId,
      status: 'active',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      trialEndsAt: now.toISOString(),
      aiUsageThisMonth: 0,
      autoRenew: true
    };
    state.subscriptions.push(sub);
  }

  db.addAuditLog(user.id, user.name, 'VERIFY_PAYMENT', 'Subscription', `سداد ناجح وتفعيل باقة ${targetPlan.nameAr} بقيمة ${payment.amount} ${payment.currency}`, payment.id);
  db.commit();

  res.json({
    success: true,
    message: `تم سداد الاشتراك وتفعيل باقة "${targetPlan.nameAr}" بنجاح!`,
    subscription: sub,
    payment
  });
});

// Webhook endpoint for Payment Gateways (Stripe / Paymob / Moyasar)
app.post('/api/webhooks/payment', (req: Request, res: Response) => {
  const { event } = req.body;
  console.log('Received payment gateway webhook event:', event);
  res.json({ received: true });
});

// ---------------------------------------------
// 13.2. ADMIN SUBSCRIPTION MANAGEMENT
// ---------------------------------------------

app.get('/api/admin/subscriptions', requireAdmin, (req: Request, res: Response) => {
  const state = db.getState();
  const { status, search } = req.query;

  const enriched = state.subscriptions.map(s => {
    const user = state.users.find(u => u.id === s.userId);
    const plan = state.plans.find(p => p.id === s.plan);
    const studentCount = state.students.filter(std => std.teacherId === s.userId && std.status === 'active').length;
    const groupCount = state.groups.filter(g => g.teacherId === s.userId && g.active).length;
    const check = db.checkSubscription(s.userId);

    return {
      ...s,
      userName: user?.name || 'غير معروف',
      userEmail: user?.email || '',
      userPhone: user?.phone || '',
      userStatus: user?.status || 'active',
      planNameAr: plan?.nameAr || s.plan,
      isExpired: check.isExpired,
      daysRemaining: check.daysRemaining,
      studentCount,
      groupCount
    };
  });

  let result = enriched;
  if (status && status !== 'all') {
    result = result.filter(r => r.status === status);
  }
  if (search) {
    const q = (search as string).toLowerCase().trim();
    result = result.filter(r =>
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      r.userPhone.includes(q)
    );
  }

  res.json({ success: true, data: result });
});

app.post('/api/admin/subscriptions/:id/extend', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const state = db.getState();
  const { days } = req.body;
  const daysToAdd = Number(days) || 7;

  const sub = state.subscriptions.find(s => s.id === req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, error: 'الاشتراك غير موجود.' });
  }

  const baseDate = new Date(sub.endDate) > new Date() ? new Date(sub.endDate) : new Date();
  const newEndDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  sub.endDate = newEndDate.toISOString();
  if (sub.status === 'trial') {
    sub.trialEndsAt = newEndDate.toISOString();
  }
  if (sub.status === 'expired') {
    sub.status = sub.plan === 'trial' ? 'trial' : 'active';
  }

  const user = state.users.find(u => u.id === sub.userId);
  db.addAuditLog(admin.id, admin.name, 'EXTEND_SUBSCRIPTION', 'Subscription', `تمديد اشتراك ${user?.name || sub.userId} بمقدار ${daysToAdd} يوم حتى ${newEndDate.toISOString().split('T')[0]}`, sub.id);
  db.commit();

  res.json({
    success: true,
    message: `تم تمديد الاشتراك بنجاح بمقدار ${daysToAdd} يوم.`,
    subscription: sub
  });
});

app.post('/api/admin/subscriptions/:id/activate', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const state = db.getState();
  const { planId, months } = req.body;
  const durationMonths = Number(months) || 12;

  const sub = state.subscriptions.find(s => s.id === req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, error: 'الاشتراك غير موجود.' });
  }

  const targetPlan = state.plans.find(p => p.id === planId) || DEFAULT_PLANS[2];
  const now = new Date();
  const newEndDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);

  sub.plan = targetPlan.id;
  sub.status = 'active';
  sub.startDate = now.toISOString();
  sub.endDate = newEndDate.toISOString();

  const user = state.users.find(u => u.id === sub.userId);
  db.addAuditLog(admin.id, admin.name, 'MANUAL_ACTIVATE_SUBSCRIPTION', 'Subscription', `تفعيل يدوي لباقة ${targetPlan.nameAr} للمعلم ${user?.name || sub.userId} لمدة ${durationMonths} شهر`, sub.id);
  db.commit();

  res.json({
    success: true,
    message: `تم تفعيل باقة "${targetPlan.nameAr}" للمعلم بنجاح!`,
    subscription: sub
  });
});

app.get('/api/admin/platform-settings', requireAdmin, (req: Request, res: Response) => {
  const state = db.getState();
  res.json({ success: true, data: state.platformSettings });
});

app.put('/api/admin/platform-settings', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const state = db.getState();
  state.platformSettings = { ...state.platformSettings, ...req.body };
  db.addAuditLog(admin.id, admin.name, 'UPDATE_SETTINGS', 'PlatformSettings', 'تحديث إعدادات المنصة وسياسات التجربة المجانية');
  db.commit();
  res.json({ success: true, data: state.platformSettings, message: 'تم حفظ إعدادات المنصة بنجاح.' });
});

app.get('/api/admin/subscription-payments', requireAdmin, (req: Request, res: Response) => {
  const state = db.getState();
  const enriched = state.subscriptionPayments.map(p => {
    const user = state.users.find(u => u.id === p.userId);
    const plan = state.plans.find(pl => pl.id === p.planId);
    return {
      ...p,
      userName: user?.name || 'غير معروف',
      userEmail: user?.email || '',
      planNameAr: plan?.nameAr || p.planId
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, data: enriched });
});

// ---------------------------------------------
// 15. STUDENT LESSON BILLING & FINANCIAL DASHBOARD
// ---------------------------------------------

app.get('/api/billing/teacher/overview', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const overview = db.getTeacherFinancialOverview(user.id);
  res.json({ success: true, data: overview });
});

app.get('/api/billing/groups/:groupId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { groupId } = req.params;

  const group = state.groups.find(g => g.id === groupId && g.teacherId === user.id);
  if (!group) {
    return res.status(404).json({ success: false, error: 'المجموعة غير موجودة.' });
  }

  const charges = state.studentLessonBilling.filter(c => c.groupId === groupId);
  const students = state.students.filter(s => s.groupId === groupId && s.status === 'active');
  const groupTxns = state.paymentTransactions.filter(t => t.groupId === groupId);

  const totalBilled = charges.filter(c => c.status !== 'cancelled' && c.status !== 'waived').reduce((acc, c) => acc + c.amountDue, 0);
  const totalCollected = groupTxns.reduce((acc, t) => acc + t.amount, 0);
  const totalOverdue = Math.max(0, totalBilled - totalCollected);

  res.json({
    success: true,
    data: {
      group,
      totalStudents: students.length,
      totalBilled,
      totalCollected,
      totalOverdue,
      charges: charges.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      transactions: groupTxns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  });
});

app.get('/api/billing/students/:studentId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { studentId } = req.params;

  const state = db.getState();
  const student = state.students.find(s => s.id === studentId && s.teacherId === user.id);
  if (!student) {
    return res.status(404).json({ success: false, error: 'الطالب غير موجود.' });
  }

  const summary = db.getStudentFinancialSummary(studentId);
  res.json({ success: true, data: summary });
});

app.post('/api/billing/record-payment', requireAuth, requireSubscription, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { studentId, groupId, amount, paymentMethod, paymentDate, notes, billingId } = req.body;

  if (!studentId || !amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال الطالب والمبلغ المدفوع بشكل صحيح.' });
  }

  const result = db.recordPayment({
    teacherId: user.id,
    studentId,
    groupId: groupId || '',
    amount: Number(amount),
    paymentMethod: paymentMethod || 'cash',
    paymentDate: paymentDate || new Date().toISOString().split('T')[0],
    notes: notes || '',
    billingId: billingId || undefined,
    recordedBy: user.name
  });

  res.json({
    success: true,
    message: `تم تسجيل سداد مبلغ ${amount} بنجاح برقم إيصال: ${result.transaction.receiptNumber}`,
    data: result
  });
});

app.put('/api/billing/charges/:id/status', requireAuth, requireSubscription, (req: Request, res: Response) => {
  const { status, notes } = req.body;

  const updated = db.updateChargeStatus(req.params.id, status, notes);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'بند المستحق المالي غير موجود.' });
  }

  res.json({
    success: true,
    message: 'تم تحديث حالة المستحق المالي بنجاح.',
    data: updated
  });
});

app.post('/api/billing/charges/manual', requireAuth, requireSubscription, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { studentId, groupId, title, amountDue, date, notes } = req.body;

  if (!studentId || !title || !amountDue) {
    return res.status(400).json({ success: false, error: 'يرجى إدخال بيانات الاستحقاق المالي كاملة.' });
  }

  const charge = db.recordLessonCharge({
    teacherId: user.id,
    studentId,
    groupId: groupId || '',
    lessonTitle: title,
    date: date || new Date().toISOString().split('T')[0],
    amountDue: Number(amountDue)
  });

  if (notes) {
    charge.notes = notes;
    db.commit();
  }

  res.json({
    success: true,
    message: 'تمت إضافة المستحق المالي للطالب بنجاح.',
    data: charge
  });
});

app.post('/api/billing/send-reminder', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { studentId, customMessage } = req.body;

  const student = state.students.find(s => s.id === studentId && s.teacherId === user.id);
  if (!student) {
    return res.status(404).json({ success: false, error: 'الطالب غير موجود.' });
  }

  const summary = db.getStudentFinancialSummary(studentId);
  const teacherProf = state.teachers.find(t => t.userId === user.id);
  const currency = state.platformSettings?.currency || 'ج.م';

  const defaultMsg = `مرحباً بحضرتك ولي أمر الطالب/ة (${student.name}).\nنود إحاطتكم علماً بأن الرصيد المتبقي المستحق لمادة ${teacherProf?.subject || 'الرياضيات'} هو ${summary.remainingBalance} ${currency} عن (${summary.dueLessonsCount}) حصص/مستحقات سابقة.\nشاكرين لحضرتكم حسن تعاونكم واهتمامكم.\n\n— أستاذ: ${user.name}`;

  const finalMsg = customMessage || defaultMsg;
  const cleanPhone = (student.parentPhone || student.phone).replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMsg)}`;

  res.json({
    success: true,
    data: {
      phone: student.parentPhone || student.phone,
      parentName: student.parentName,
      message: finalMsg,
      whatsappUrl
    }
  });
});

app.get('/api/billing/reports', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const state = db.getState();
  const { groupId, startDate, endDate, status } = req.query;

  let charges = state.studentLessonBilling.filter(c => c.teacherId === user.id);
  let txns = state.paymentTransactions.filter(t => t.teacherId === user.id);

  if (groupId && groupId !== 'all') {
    charges = charges.filter(c => c.groupId === groupId);
    txns = txns.filter(t => t.groupId === groupId);
  }

  if (startDate) {
    charges = charges.filter(c => c.date >= (startDate as string));
    txns = txns.filter(t => t.paymentDate >= (startDate as string));
  }

  if (endDate) {
    charges = charges.filter(c => c.date <= (endDate as string));
    txns = txns.filter(t => t.paymentDate <= (endDate as string));
  }

  if (status && status !== 'all') {
    charges = charges.filter(c => c.status === status);
  }

  const enrichedCharges = charges.map(c => {
    const student = state.students.find(s => s.id === c.studentId);
    const group = state.groups.find(g => g.id === c.groupId);
    return {
      ...c,
      studentName: student?.name || 'طالب',
      parentPhone: student?.parentPhone || '',
      groupName: group?.name || 'مجموعة'
    };
  });

  const enrichedTxns = txns.map(t => {
    const student = state.students.find(s => s.id === t.studentId);
    const group = state.groups.find(g => g.id === t.groupId);
    return {
      ...t,
      studentName: student?.name || 'طالب',
      groupName: group?.name || 'مجموعة'
    };
  });

  res.json({
    success: true,
    data: {
      charges: enrichedCharges,
      transactions: enrichedTxns,
      totalBilled: enrichedCharges.filter(c => c.status !== 'cancelled' && c.status !== 'waived').reduce((acc, c) => acc + c.amountDue, 0),
      totalCollected: enrichedTxns.reduce((acc, t) => acc + t.amount, 0)
    }
  });
});

// Demo Data Reset Endpoint (Development & Admin helper)
const handleResetDemo = (req: Request, res: Response) => {
  db.resetToDefault();
  res.json({ success: true, message: 'تم إعادة تعيين البيانات النموذجية لمنصة مُعين بنجاح.' });
};

app.post('/api/dev/reset-demo', handleResetDemo);
app.post('/api/admin/reset-demo', handleResetDemo);

// ---------------------------------------------
// VITE MIDDLEWARE SETUP
// ---------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ مُعين SaaS Server running on http://localhost:${PORT}`);
  });
}

startServer();
