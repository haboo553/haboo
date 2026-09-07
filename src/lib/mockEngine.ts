import { getDatabaseState, saveDatabaseState } from './mockDatabase.js';
import {
  User,
  TeacherProfile,
  Subscription,
  Group,
  Student,
  AttendanceRecord,
  Lesson,
  LessonPreparation,
  Exam,
  Homework,
  StudentEvaluation,
  PaymentTransaction,
  StudentLessonBilling
} from '../types.js';

// Helper to extract user ID from bearer token
function getUserIdFromToken(token?: string | null): string | null {
  if (!token) return null;
  const clean = token.replace('Bearer ', '').trim();
  if (clean.startsWith('mueen_token_')) {
    return clean.replace('mueen_token_', '');
  }
  return null;
}

// Client-side AI Generator for mock mode
function generateMockAiResponse(endpoint: string, body: any): any {
  if (endpoint.includes('lesson-plan') || endpoint.includes('smart-prep')) {
    const topic = body.topic || body.lessonTitle || 'الدرس النموذجي';
    const grade = body.grade || 'المرحلة الثانوية';
    const subject = body.subject || 'الرياضيات';

    return {
      success: true,
      data: {
        title: `خطة درس متكاملة: ${topic}`,
        grade,
        subject,
        durationMinutes: 90,
        behavioralObjectives: [
          `أن يتعرف الطالب على المفاهيم الجوهرية لـ ${topic} بدقة علمية.`,
          `أن يطبق الطالب القوانين والنظريات في حل تمارين تطبيقية متدرجة.`,
          `أن يربط الطالب بين مفاهيم الدرس والتطبيقات الحياتية المعاصرة.`
        ],
        warmupActivity: {
          title: 'العصف الذهني وسؤال التحدي التمهيدي',
          durationMinutes: 10,
          description: `سؤال استهلالي تفاعلي يثير التفكير المنطقي ويربط المعارف السابقة بموضوع ${topic}.`
        },
        directInstruction: {
          title: 'الشرح التفاعلي وتدرج المفاهيم',
          durationMinutes: 35,
          steps: [
            'المدخل النظري واستنتاج القاعدة الأساسية مع الطلاب خطوة بخطوة.',
            'نمذجة حل مثال رئيسي وتوضيح استراتيجية الحل.',
            'مناقشة الأخطاء الشائعة والتحذير من الوقوع فيها.'
          ]
        },
        differentiatedActivities: [
          {
            level: 'الطلاب المتفوقين',
            tasks: ['حل مسألة ربط مركبة تتطلب خطوتين أو أكثر.']
          },
          {
            level: 'الطلاب المتوسطين',
            tasks: ['تطبيق مباشر لقوانين الدرس مع التحقق من النتيجة.']
          },
          {
            level: 'الطلاب الذين يحتاجون لدعم',
            tasks: ['حل أسئلة إرشادية بمساعدة بطاقات القوانين.']
          }
        ],
        formativeAssessment: [
          'سؤال تفاعلي سريع بنهاية كل فكرة رئيسية للتأكد من استيعاب 100% من القاعة.',
          'استخدام أسلوب بطاقات الإجابة السريعة لمتابعة كافة مستويات الطلاب.'
        ],
        homeworkSuggestion: 'حل التمارين الفردية من 1 إلى 5 في كراسة الواجب + مسألة التحدي الأسبوعية.'
      }
    };
  }

  if (endpoint.includes('quiz')) {
    const topic = body.topic || 'اختبار تقييمي';
    return {
      success: true,
      data: {
        title: `اختبار قصير: ${topic}`,
        durationMinutes: 20,
        totalScore: 20,
        questions: [
          {
            id: 1,
            type: 'multiple_choice',
            question: `ما هو المفهوم الأساسي المرتبط بـ ${topic}؟`,
            options: ['الخيار الصحيح (أ)', 'الخيار التجريبي (ب)', 'الخيار المقارن (ج)', 'الخيار البديل (د)'],
            correctAnswer: 'الخيار الصحيح (أ)',
            explanation: 'التعليل الرياضي/العلمي يستند للقاعدة المباشرة المعطاة في الشرح.',
            score: 5
          },
          {
            id: 2,
            type: 'multiple_choice',
            question: `عند تطبيق شروط المسألة، ما القيمة الناتجة؟`,
            options: ['12', '24', '36', '48'],
            correctAnswer: '24',
            explanation: 'بالتعويض المباشر في العلاقة الرياضية ينتج 24.',
            score: 5
          },
          {
            id: 3,
            type: 'problem_solving',
            question: `حل المسألة التالية موضحاً خطوات الحل كاملة.`,
            sampleAnswer: 'كتابة المعطيات، تحديد القانون المناسب، التعويض وحساب الناتج مع التمييز.',
            score: 10
          }
        ]
      }
    };
  }

  if (endpoint.includes('simplify-concept')) {
    const concept = body.concept || 'المفهوم المطلوب';
    return {
      success: true,
      data: {
        concept,
        analogy: `تخيل أن ${concept} يعمل تماماً كشبكة توزيع مياه في مدينة حديثة، حيث يتم التوجيه بدقة متناهية.`,
        simplifiedExplanation: `${concept} هو ببساطة طريقة رياضية/علمية للتعامل مع التغيرات السريعة وحساب القيم بدقة دون تعقيد.`,
        realLifeApplication: 'يُستخدم هذا المفهوم مباشرة في برمجة ألعاب الفيديو، تصميم المباني، وحساب مسارات الأقمار الصناعية.',
        memoryHook: 'تذكر دائماً: القاعدة = الخطوة الأولى + التعويض المنظم.'
      }
    };
  }

  if (endpoint.includes('student-diagnostic') || endpoint.includes('diagnostic')) {
    return {
      success: true,
      data: {
        overallStatus: 'أداء أكاديمي واعد مع بعض مجالات التحسين',
        keyStrengths: [
          'التزام ممتاز بنسب الحضور والغياب',
          'التفاعل الإيجابي أثناء المناقشات الصفية',
          'دقة حل المسائل المباشرة'
        ],
        weaknessAreas: [
          'التردد في حل المسائل المركبة التي تحتوي على أكثر من خطوة',
          'الحاجة لتعزيز سرعة الحل أثناء الامتحانات الموقوتة'
        ],
        suggestedPlan: [
          'إعطاء الطالب ورقة عمل تدريبية ذات مستويات متدرجة',
          'جلسة دعم مدتها 15 دقيقة لمراجعة النقاط غير المفهومة',
          'تشجيع الطالب ومنحه مسألة تميز لتحفيزه'
        ],
        parentNote: 'مستوى الطالب جيد ومبشر، ومع المتابعة المنزلية المستمرة سيحقق العلامة الكاملة بإذن الله.'
      }
    };
  }

  if (endpoint.includes('remediation')) {
    return {
      success: true,
      data: {
        remediationPlan: 'خطة دعم ومعالجة الفجوات التعليمية للمجموعة',
        focusTopics: [
          'إعادة شرح جزئية المسائل التطبيقية',
          'تدريب عملي على حل نماذج الاختبارات'
        ],
        suggestedActivities: [
          'العمل في مجموعات ثنائية (طالب متميز مع طالب يحتاج دعم)',
          'تخصيص الربع ساعة الأولى من الحصة القادمة لاختبار قصير تنشيطي'
        ]
      }
    };
  }

  if (endpoint.includes('parent-message')) {
    const studentName = body.studentName || 'الطالب';
    return {
      success: true,
      data: {
        message: `السلام عليكم ورحمة الله وبركاته،\nولي أمر الطالب المحترم / ${studentName}،\nتحية طيبة وبعد،\nنود إحاطتكم علماً بأن الطالب يظهر التزاماً ممتازاً في الحصص الدراسية، ونثمن حرصكم الدائم على متابعته.\nمع خالص التحيات والتقدير،\nمعلم المادة - منصة مُعين التعليمية`
      }
    };
  }

  return {
    success: true,
    data: {
      generatedText: 'تمت معالجة الطلب بالذكاء الاصطناعي بنجاح.',
      timestamp: new Date().toISOString()
    }
  };
}

// The Master In-Browser Mock API Handler
export function handleMockApiRequest(
  endpoint: string,
  options: RequestInit = {}
): { success: boolean; [key: string]: any } {
  const method = (options.method || 'GET').toUpperCase();
  const urlParts = endpoint.split('?');
  const path = urlParts[0].replace(/^\/api/, '').replace(/^\//, '');
  const queryString = urlParts[1] || '';
  const searchParams = new URLSearchParams(queryString);

  let body: any = {};
  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  }

  const token = (options.headers as any)?.['Authorization'] || (options.headers as any)?.['authorization'];
  const userId = getUserIdFromToken(token);

  const state = getDatabaseState();
  const defaultTeacher = state.teachers[0] || {
    userId: 'usr_teacher_demo_1',
    subject: 'الرياضيات والفيزياء',
    schoolOrCenter: 'أكاديمية الرواد النموذجية'
  };

  // 1. AUTHENTICATION
  if (path === 'auth/login') {
    const { email, password } = body;
    const user = state.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    
    // Allow login if user found, or fallback to demo teacher
    const targetUser = user || (email?.includes('admin') ? state.users.find(u => u.role === 'admin') : state.users.find(u => u.role === 'teacher')) || state.users[0];
    
    if (!targetUser) {
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    }

    const teacher = state.teachers.find(t => t.userId === targetUser.id) || defaultTeacher;
    const subscription = state.subscriptions.find(s => s.userId === targetUser.id) || state.subscriptions[0];
    const planConfig = state.plans.find(p => p.id === subscription?.plan) || state.plans[1];

    const token = `mueen_token_${targetUser.id}`;
    return {
      success: true,
      token,
      user: targetUser,
      teacher,
      subscription,
      planConfig
    };
  }

  if (path === 'auth/register') {
    const newId = `usr_${Date.now()}`;
    const newUser: User = {
      id: newId,
      name: body.name || 'معلم جديد',
      email: body.email || `teacher_${Date.now()}@mueen.com`,
      phone: body.phone || '+966500000000',
      role: 'teacher',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const newTeacher: TeacherProfile = {
      userId: newId,
      subject: body.subject || 'الرياضيات',
      schoolOrCenter: body.schoolOrCenter || 'معلم حر',
      bio: 'معلم جديد على منصة مُعين',
      defaultClassDurationMinutes: 90,
      stagePreference: body.stage || 'المرحلة الثانوية',
      totalStudentsCount: 0,
      totalGroupsCount: 0
    };

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      userId: newId,
      plan: 'trial',
      status: 'trial',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      aiUsageThisMonth: 0,
      autoRenew: false
    };

    state.users.push(newUser);
    state.teachers.push(newTeacher);
    state.subscriptions.push(newSub);
    saveDatabaseState(state);

    const token = `mueen_token_${newId}`;
    return {
      success: true,
      token,
      user: newUser,
      teacher: newTeacher,
      subscription: newSub,
      planConfig: state.plans[0]
    };
  }

  if (path === 'auth/me') {
    const activeUserId = userId || state.users[0].id;
    const user = state.users.find(u => u.id === activeUserId) || state.users[0];
    const teacher = state.teachers.find(t => t.userId === user.id) || defaultTeacher;
    const subscription = state.subscriptions.find(s => s.userId === user.id) || state.subscriptions[0];
    const planConfig = state.plans.find(p => p.id === subscription?.plan) || state.plans[1];

    const subscriptionStatus = {
      hasAccess: true,
      isExpired: false,
      daysRemaining: 45,
      plan: subscription?.plan || 'pro',
      status: subscription?.status || 'active'
    };

    return {
      success: true,
      user,
      teacher,
      subscription,
      subscriptionStatus,
      planConfig
    };
  }

  if (path === 'auth/logout') {
    return { success: true };
  }

  // 2. GROUPS
  if (path === 'groups') {
    if (method === 'GET') {
      return { success: true, data: state.groups };
    }
    if (method === 'POST') {
      const newGroup: Group = {
        id: `grp_${Date.now()}`,
        teacherId: userId || defaultTeacher.userId,
        name: body.name || 'مجموعة جديدة',
        subject: body.subject || defaultTeacher.subject,
        stage: body.stage || 'المرحلة الثانوية',
        grade: body.grade || 'الصف الأول الثانوي',
        groupCode: `MUEEN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        classDays: body.classDays || ['sun', 'tue'],
        startTime: body.startTime || '16:00',
        endTime: body.endTime || '17:30',
        location: body.location || 'قاعة 1',
        maxCapacity: Number(body.maxCapacity) || 25,
        active: true,
        createdAt: new Date().toISOString()
      };
      state.groups.push(newGroup);
      saveDatabaseState(state);
      return { success: true, data: newGroup };
    }
  }

  if (path.startsWith('groups/')) {
    const groupId = path.split('/')[1];
    if (method === 'PUT') {
      const idx = state.groups.findIndex(g => g.id === groupId);
      if (idx !== -1) {
        state.groups[idx] = { ...state.groups[idx], ...body };
        saveDatabaseState(state);
        return { success: true, data: state.groups[idx] };
      }
    }
    if (method === 'DELETE') {
      state.groups = state.groups.filter(g => g.id !== groupId);
      saveDatabaseState(state);
      return { success: true };
    }
  }

  // 3. STUDENTS
  if (path === 'students') {
    if (method === 'GET') {
      let result = state.students;
      const groupId = searchParams.get('groupId');
      const search = searchParams.get('search');
      if (groupId && groupId !== 'all') {
        result = result.filter(s => s.groupId === groupId);
      }
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(s => s.name.toLowerCase().includes(q) || s.phone.includes(q));
      }
      return { success: true, data: result };
    }
    if (method === 'POST') {
      const newStudent: Student = {
        id: `std_${Date.now()}`,
        teacherId: userId || defaultTeacher.userId,
        groupId: body.groupId || state.groups[0]?.id || 'grp_1',
        name: body.name || 'طالب جديد',
        phone: body.phone || '+966500000000',
        parentName: body.parentName || 'ولي أمر الطالب',
        parentPhone: body.parentPhone || '+966500000000',
        parentRelation: body.parentRelation || 'father',
        email: body.email || `std_${Date.now()}@example.com`,
        joinDate: new Date().toISOString().split('T')[0],
        notes: body.notes || '',
        status: 'active',
        comprehensionLevel: body.comprehensionLevel || 'good',
        learningSpeed: body.learningSpeed || 'normal',
        performanceLevel: 'average',
        strengths: ['الالتزام بالحضور'],
        weaknesses: [],
        reviewNeeds: [],
        attendanceRate: 100,
        examsAverage: 85,
        homeworkCompletionRate: 100,
        consecutiveAbsences: 0
      };
      state.students.push(newStudent);
      saveDatabaseState(state);
      return { success: true, data: newStudent };
    }
  }

  if (path.startsWith('students/')) {
    const studentId = path.split('/')[1];
    if (method === 'GET') {
      const student = state.students.find(s => s.id === studentId);
      if (!student) return { success: false, error: 'الطالب غير موجود.' };
      const att = state.attendance.filter(a => a.studentId === studentId);
      const ex = state.examResults.filter(e => e.studentId === studentId);
      const hw = state.homeworkSubmissions.filter(h => h.studentId === studentId);
      const notes = state.notes.filter(n => n.studentId === studentId);
      return {
        success: true,
        data: student,
        student,
        attendance: att,
        exams: ex,
        homework: hw,
        notes
      };
    }
    if (method === 'PUT') {
      const idx = state.students.findIndex(s => s.id === studentId);
      if (idx !== -1) {
        state.students[idx] = { ...state.students[idx], ...body };
        saveDatabaseState(state);
        return { success: true, data: state.students[idx] };
      }
    }
    if (method === 'DELETE') {
      state.students = state.students.filter(s => s.id !== studentId);
      saveDatabaseState(state);
      return { success: true };
    }
  }

  // 4. ATTENDANCE
  if (path === 'attendance') {
    if (method === 'GET') {
      let result = state.attendance;
      const groupId = searchParams.get('groupId');
      const date = searchParams.get('date');
      if (groupId) result = result.filter(a => a.groupId === groupId);
      if (date) result = result.filter(a => a.date === date);
      return { success: true, data: result };
    }
    if (method === 'POST') {
      const { groupId, date, records } = body;
      if (Array.isArray(records)) {
        records.forEach((rec: any) => {
          const existingIdx = state.attendance.findIndex(
            a => a.groupId === groupId && a.studentId === rec.studentId && a.date === date
          );
          const attRecord: AttendanceRecord = {
            id: `att_${Date.now()}_${rec.studentId}`,
            teacherId: userId || defaultTeacher.userId,
            groupId,
            studentId: rec.studentId,
            date: date || new Date().toISOString().split('T')[0],
            status: rec.status || 'present',
            markedAt: new Date().toISOString(),
            method: 'manual',
            note: rec.note || ''
          };
          if (existingIdx !== -1) {
            state.attendance[existingIdx] = attRecord;
          } else {
            state.attendance.push(attRecord);
          }
        });
        saveDatabaseState(state);
      }
      return { success: true, message: 'تم حفظ سجل الحضور بنجاح.' };
    }
  }

  // 5. LESSONS & PREPARATIONS
  if (path === 'lessons') {
    if (method === 'GET') {
      let result = state.lessons;
      const groupId = searchParams.get('groupId');
      if (groupId) result = result.filter(l => l.groupId === groupId);
      return { success: true, data: result };
    }
    if (method === 'POST') {
      const newLesson: Lesson = {
        id: `les_${Date.now()}`,
        teacherId: userId || defaultTeacher.userId,
        groupId: body.groupId || state.groups[0]?.id || 'grp_1',
        title: body.title || 'درس جديد',
        subject: body.subject || defaultTeacher.subject,
        date: body.date || new Date().toISOString().split('T')[0],
        dayOfWeek: 'sun',
        startTime: body.startTime || '16:30',
        endTime: body.endTime || '18:00',
        location: body.location || 'قاعة 101',
        status: body.status || 'scheduled',
        hasPreparation: false,
        isRecurring: false,
        createdAt: new Date().toISOString()
      };
      state.lessons.push(newLesson);
      saveDatabaseState(state);
      return { success: true, data: newLesson };
    }
  }

  if (path === 'lessons/preparations') {
    if (method === 'GET') {
      return { success: true, data: state.lessonPreparations };
    }
    if (method === 'POST') {
      const newPrep: LessonPreparation = {
        id: `prep_${Date.now()}`,
        lessonId: body.lessonId || `les_${Date.now()}`,
        teacherId: userId || defaultTeacher.userId,
        lessonTitle: body.title || body.lessonTitle || 'تحضير درس',
        subject: body.subject || defaultTeacher.subject,
        stage: body.stage || 'المرحلة الثانوية',
        grade: body.grade || 'الصف الأول الثانوي',
        educationalObjectives: body.behavioralObjectives || [],
        createdAt: new Date().toISOString()
      };
      state.lessonPreparations.push(newPrep);
      saveDatabaseState(state);
      return { success: true, data: newPrep };
    }
  }

  // 6. EXAMS & RESULTS
  if (path === 'exams') {
    if (method === 'GET') {
      return { success: true, data: state.exams };
    }
    if (method === 'POST') {
      const newExam: Exam = {
        id: `ex_${Date.now()}`,
        teacherId: userId || defaultTeacher.userId,
        groupId: body.groupId || state.groups[0]?.id || 'grp_1',
        title: body.title || 'اختبار جديد',
        subject: body.subject || defaultTeacher.subject,
        date: body.date || new Date().toISOString().split('T')[0],
        maxScore: Number(body.maxScore) || 20,
        passingScore: Number(body.passingScore) || 10,
        type: body.type || 'weekly',
        topicsCovered: body.topicsCovered || [],
        createdAt: new Date().toISOString()
      };
      state.exams.push(newExam);
      saveDatabaseState(state);
      return { success: true, data: newExam };
    }
  }

  if (path.includes('exams/') && path.includes('/results')) {
    return { success: true, message: 'تم حفظ درجات الاختبار بنجاح.' };
  }

  // 7. HOMEWORK & SUBMISSIONS
  if (path === 'homework') {
    if (method === 'GET') {
      return { success: true, data: state.homework };
    }
    if (method === 'POST') {
      const newHw: Homework = {
        id: `hw_${Date.now()}`,
        teacherId: userId || defaultTeacher.userId,
        groupId: body.groupId || state.groups[0]?.id || 'grp_1',
        title: body.title || 'واجب جديد',
        description: body.description || '',
        dueDate: body.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxScore: Number(body.maxScore) || 10,
        createdAt: new Date().toISOString()
      };
      state.homework.push(newHw);
      saveDatabaseState(state);
      return { success: true, data: newHw };
    }
  }

  // 8. EVALUATIONS & NOTES
  if (path === 'evaluations') {
    if (method === 'GET') {
      return { success: true, data: state.evaluations };
    }
    if (method === 'POST') {
      const newEval: StudentEvaluation = {
        id: `ev_${Date.now()}`,
        studentId: body.studentId,
        teacherId: userId || defaultTeacher.userId,
        evaluationDate: new Date().toISOString().split('T')[0],
        academicPerformance: 'very_good',
        understanding: 'very_good',
        participation: 'good',
        homeworkQuality: 'very_good',
        attendanceDiscipline: 'excellent',
        overallProgress: 'steady_progress',
        teacherNotes: body.notes || '',
        recommendations: 'مواصلة المتابعة والتدريب'
      };
      state.evaluations.push(newEval);
      saveDatabaseState(state);
      return { success: true, data: newEval };
    }
  }

  // 9. FINANCIAL & BILLING
  if (path === 'billing/teacher/overview') {
    const charges = state.studentLessonBilling;
    const payments = state.paymentTransactions;
    const totalRevenue = charges.reduce((acc, c) => acc + (c.amountDue || 0), 0);
    const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalPending = Math.max(0, totalRevenue - totalCollected);

    return {
      success: true,
      data: {
        totalRevenue: totalRevenue || 5400,
        totalCollected: totalCollected || 4800,
        totalPending: totalPending || 600,
        totalOverdue: 200,
        collectionRate: totalRevenue ? Math.round((totalCollected / totalRevenue) * 100) : 89,
        activeStudentsCount: state.students.length,
        recentTransactions: payments.slice(-5).reverse(),
        groupBreakdown: state.groups.map(g => ({
          groupId: g.id,
          groupName: g.name,
          totalAmount: 1800,
          collectedAmount: 1600,
          pendingAmount: 200
        }))
      }
    };
  }

  if (path.startsWith('billing/students/')) {
    const studentId = path.split('/')[2];
    const charges = state.studentLessonBilling.filter(b => b.studentId === studentId);
    const payments = state.paymentTransactions.filter(p => p.studentId === studentId);
    const totalCharged = charges.reduce((acc, c) => acc + (c.amountDue || 0), 0) || 400;
    const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0) || 300;
    const balance = totalCharged - totalPaid;

    return {
      success: true,
      data: {
        studentId,
        totalCharged,
        totalPaid,
        balance,
        status: balance <= 0 ? 'paid' : balance < totalCharged ? 'partially_paid' : 'pending',
        charges: charges.length ? charges : [
          {
            id: `bil_${studentId}_1`,
            studentId,
            groupId: 'grp_1',
            title: 'اشتراك شهر سبتمبر',
            amountDue: 400,
            amountPaid: totalPaid,
            status: balance <= 0 ? 'paid' : 'partially_paid',
            dueDate: '2026-09-30'
          }
        ],
        payments
      }
    };
  }

  if (path === 'billing/record-payment') {
    const newTxn: PaymentTransaction = {
      id: `txn_${Date.now()}`,
      teacherId: userId || defaultTeacher.userId,
      studentId: body.studentId,
      groupId: body.groupId || state.groups[0]?.id || 'grp_1',
      billingId: body.billingId || `bil_${Date.now()}`,
      amount: Number(body.amount) || 100,
      paymentMethod: body.paymentMethod || 'cash',
      paymentDate: body.paymentDate || new Date().toISOString().split('T')[0],
      notes: body.notes || 'سداد دفعة',
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      recordedBy: 'أ. أحمد الشناوي',
      createdAt: new Date().toISOString()
    };
    state.paymentTransactions.push(newTxn);
    saveDatabaseState(state);
    return { success: true, data: newTxn, message: 'تم تسجيل الدفعة بنجاح.' };
  }

  if (path === 'billing/charges/manual') {
    const amount = Number(body.amountDue) || 100;
    const newCharge: StudentLessonBilling = {
      id: `bil_${Date.now()}`,
      teacherId: userId || defaultTeacher.userId,
      studentId: body.studentId,
      groupId: body.groupId || state.groups[0]?.id || 'grp_1',
      title: body.title || 'حصة تدريسية إضافية',
      date: body.date || new Date().toISOString().split('T')[0],
      amountDue: amount,
      amountPaid: 0,
      balance: amount,
      status: 'unpaid',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.studentLessonBilling.push(newCharge);
    saveDatabaseState(state);
    return { success: true, data: newCharge, message: 'تم إنشاء المطالبة المالية بنجاح.' };
  }

  if (path.includes('billing/charges/') && path.includes('/status')) {
    const chargeId = path.split('/')[2];
    const idx = state.studentLessonBilling.findIndex(c => c.id === chargeId);
    if (idx !== -1) {
      state.studentLessonBilling[idx].status = body.status || 'paid';
      saveDatabaseState(state);
      return { success: true, data: state.studentLessonBilling[idx] };
    }
    return { success: true };
  }

  if (path === 'billing/send-reminder') {
    const student = state.students.find(s => s.id === body.studentId) || state.students[0];
    const phone = student?.parentPhone || student?.phone || '966500000000';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = body.customMessage || `السلام عليكم ورحمة الله، نود تذكيركم بمستحقات الحصص الدراسية للطالب ${student?.name || ''}. شاكرين حسن تعاونكم.`;
    const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    return { success: true, message, whatsappLink };
  }

  // 10. SUBSCRIPTIONS & COMMERCIAL
  if (path === 'subscriptions/status') {
    return {
      success: true,
      hasAccess: true,
      isExpired: false,
      daysRemaining: 45,
      plan: 'pro',
      status: 'active'
    };
  }

  if (path === 'subscriptions/current') {
    const sub = state.subscriptions.find(s => s.userId === userId) || state.subscriptions[0];
    const plan = state.plans.find(p => p.id === sub?.plan) || state.plans[1];
    return { success: true, subscription: sub, planConfig: plan };
  }

  if (path === 'subscriptions/checkout') {
    const targetUserId = userId || defaultTeacher.userId;
    const planId = body.planId || 'pro';
    const subIdx = state.subscriptions.findIndex(s => s.userId === targetUserId);
    const updatedSub: Subscription = {
      id: `sub_${Date.now()}`,
      userId: targetUserId,
      plan: planId as any,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      aiUsageThisMonth: 0,
      autoRenew: true
    };
    if (subIdx !== -1) {
      state.subscriptions[subIdx] = updatedSub;
    } else {
      state.subscriptions.push(updatedSub);
    }
    saveDatabaseState(state);
    return { success: true, subscription: updatedSub, message: 'تم تفعيل الاشتراك وترقية الحساب بنجاح!' };
  }

  // 11. ADMIN
  if (path === 'admin/subscriptions') {
    const subs = state.subscriptions.map(s => {
      const user = state.users.find(u => u.id === s.userId);
      const plan = state.plans.find(p => p.id === s.plan);
      return {
        ...s,
        userName: user?.name || 'مدرس',
        userEmail: user?.email || '',
        planNameAr: plan?.nameAr || s.plan
      };
    });
    return { success: true, data: subs };
  }

  if (path.includes('admin/subscriptions/') && path.includes('/extend')) {
    return { success: true, message: 'تم تمديد الاشتراك بنجاح.' };
  }

  if (path.includes('admin/subscriptions/') && path.includes('/activate')) {
    return { success: true, message: 'تم تفعيل الاشتراك بنجاح.' };
  }

  if (path === 'admin/subscription-payments') {
    return { success: true, data: state.subscriptionPayments };
  }

  if (path === 'admin/platform-settings') {
    if (method === 'GET') {
      return { success: true, data: state.platformSettings };
    }
    if (method === 'PUT') {
      state.platformSettings = { ...state.platformSettings, ...body };
      saveDatabaseState(state);
      return { success: true, data: state.platformSettings, message: 'تم تحديث إعدادات المنصة.' };
    }
  }

  if (path === 'admin/teachers') {
    const teachersData = state.teachers.map(t => {
      const u = state.users.find(user => user.id === t.userId);
      const sub = state.subscriptions.find(s => s.userId === t.userId);
      return {
        ...t,
        name: u?.name || 'مدرس',
        email: u?.email || '',
        phone: u?.phone || '',
        status: u?.status || 'active',
        plan: sub?.plan || 'trial',
        subscriptionStatus: sub?.status || 'active'
      };
    });
    return { success: true, data: teachersData };
  }

  if (path === 'admin/audit-logs') {
    return { success: true, data: state.auditLogs };
  }

  // 12. AI ASSISTANT ROUTES
  if (path.startsWith('ai/')) {
    return generateMockAiResponse(path, body);
  }

  // 13. NOTIFICATIONS
  if (path === 'notifications') {
    return { success: true, data: state.notifications };
  }

  // Fallback default
  return {
    success: true,
    data: [],
    message: 'تمت العملية بنجاح.'
  };
}
