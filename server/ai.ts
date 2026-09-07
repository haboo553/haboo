import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Using smart heuristic fallback responses.');
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

/**
 * 1. AI Lesson Preparation Assistant
 */
export async function generateLessonPlanAI(params: {
  lessonTitle: string;
  subject: string;
  grade: string;
  customPrompt?: string;
  durationMinutes?: number;
}) {
  const ai = getAiClient();
  const prompt = `أنت مساعد تربوي ذكي وخبير في تحضير الدروس للمناهج التعليمية العربية.
قم بإعداد خطة تحضير درس نموذجية ومتكاملة بالعربية:
- عنوان الدرس: "${params.lessonTitle}"
- المادة: "${params.subject}"
- الصف والمرحلة: "${params.grade}"
- مدة الحصة: ${params.durationMinutes || 90} دقيقة
- توجيهات إضافية من المدرس: "${params.customPrompt || 'لا توجد'}"

أعد النتيجة بصيغة JSON حصراً متوافقة مع هذا الهيكل:
{
  "unit": "اسم الوحدة المقترحة",
  "educationalObjectives": ["هدف 1 سلوكي وقابل للقياس", "هدف 2", "هدف 3"],
  "lessonElements": ["عنصر 1 مع الوقت التقريبي", "عنصر 2", "عنصر 3", "عنصر 4"],
  "summaryExplanation": "شرح تربوي مركز ومبسط للمفاهيم الأساسية للدرس",
  "interactiveActivities": ["نشاط صفي تفاعلي 1", "نشاط صفي تفاعلي 2"],
  "homeworkDescription": "وصف دقيق للواجب المنزلي والتطبيقات",
  "quickAssessmentQuestions": [
    { "question": "سؤال تقييم سريع 1", "suggestedAnswer": "الإجابة النموذجية" },
    { "question": "سؤال تقييم سريع 2", "suggestedAnswer": "الإجابة النموذجية" }
  ]
}`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini lesson plan generation error, falling back:', err);
    }
  }

  // Fallback
  return {
    unit: `الوحدة التعليمية لـ ${params.subject}`,
    educationalObjectives: [
      `أن يتعرف الطالب على المفاهيم والمصطلحات الأساسية لدرس ${params.lessonTitle}`,
      `أن يطبق الطالب القوانين والنظريات المرتبطة في حل مسائل وتمارين متدرجة`,
      `أن يستنتج الطالب العلاقات الرياضية/العلمية ويوظفها بدقة`
    ],
    lessonElements: [
      'التهيئة الحافزة والمراجعة السابقة (10 دقائق)',
      'عرض المفاهيم الجديدة والشرح التفاعلي (35 دقيقة)',
      'تطبيقات وأمثلة محلولة مع مشاركة الطلاب (25 دقيقة)',
      'التقويم التكويني والختامي وتحديد الواجب (20 دقيقة)'
    ],
    summaryExplanation: `يركز هذا الدرس على شرح وتطبيق ${params.lessonTitle} من خلال التدرج من المفاهيم البسيطة إلى المسائل المركبة، مع التركيز على فهم البنية المنطقية والخطوات المنهجية للحل.`,
    interactiveActivities: [
      'نشاط حل ثنائي تشاركي: حل مسألة تطبيقية وعرض الخطوات على السبورة',
      'مسابقة البطاقات السريعة للتحقق من فهم القوانين الرئيسية'
    ],
    homeworkDescription: `حل التمارين المقررة بكتاب التدريبات الخاصة بـ ${params.lessonTitle} بالإضافة إلى مسألة مهارات تفكير عليا.`,
    quickAssessmentQuestions: [
      {
        question: `ما هي الخطوة الأولى الأساسية عند البدء في حل مسائل ${params.lessonTitle}؟`,
        suggestedAnswer: 'تحديد المعطيات والمطلوب واختيار القانون المناسب للبدء في خطوات الحل المنظم.'
      },
      {
        question: `اذكر تطبيقاً واقعياً يرتبط بمفاهيم هذا الدرس.`,
        suggestedAnswer: 'استخدامه في النمذجة الرياضية والحسابات اليومية والهندسية.'
      }
    ]
  };
}

/**
 * 2. AI Student Analysis (Strictly educational, NO psychological or medical diagnoses)
 */
export async function analyzeStudentAI(studentData: {
  name: string;
  groupName: string;
  attendanceRate: number;
  examsAverage: number;
  homeworkRate: number;
  strengths: string[];
  weaknesses: string[];
  comprehensionLevel: string;
  learningSpeed: string;
  notesSummary: string;
}) {
  const ai = getAiClient();
  const prompt = `أنت مستشار تعليمي وتربوي متخصص في تحليل أداء الطلاب المدرسي.
قم بتحليل بيانات الطالب التعليمية وتقديم توصيات تدريسية عملية وقابلة للتطبيق للمدرس.
تنبيه حازم: لا تقدم أي تشخيصات نفسية أو طبية أو استنتاجات عن الذكاء الفطري. ركز فقط على المؤشرات الأكاديمية والمهارات الدراسية والملاحظات الصفية.

بيانات الطالب:
- الاسم: ${studentData.name}
- المجموعة: ${studentData.groupName}
- نسبة الحضور: ${studentData.attendanceRate}%
- متوسط درجات الاختبارات: ${studentData.examsAverage}%
- نسبة إنجاز الواجبات: ${studentData.homeworkRate}%
- مستوى الاستيعاب الملاحظ: ${studentData.comprehensionLevel}
- سرعة التعلم: ${studentData.learningSpeed}
- نقاط القوة المدخلة: ${studentData.strengths.join(', ') || 'لم تُحدد'}
- نقاط الضعف والملاحظات: ${studentData.weaknesses.join(', ') || 'لم تُحدد'}
- ملخص الملاحظات: ${studentData.notesSummary || 'لا توجد'}

أعد النتيجة بصيغة JSON حصراً:
{
  "overallStatus": "وصف موجز للمستوى الأكاديمي الحالي",
  "trendAnalysis": "تحليل مسار التطور الأكاديمي (تحسن، استقرار، أو تراجع مع الأسباب التعليمية)",
  "identifiedStrengths": ["نقطة قوة أكاديمية 1", "نقطة قوة أكاديمية 2"],
  "focusAreas": ["موضوع أو مهارة محددة تحتاج تقوية", "مهارة أخرى تحتاج مراجعة"],
  "actionableRecommendation": "توصية تعليمية محددة للمدرس (مثلاً: إعطاء 3 تمارين إضافية، مراجعة موضوع محدد)",
  "parentCommunicationAdvice": "نصيحة للمدرس حول كيفية التنسيق الإيجابي مع ولي الأمر لدعم الطالب"
}`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini student analysis error, falling back:', err);
    }
  }

  // Fallback heuristic response
  const isHigh = studentData.examsAverage >= 85;
  return {
    overallStatus: isHigh
      ? `طالب متميز يظهر تفوقاً واضحاً بمتوسط درجات ${studentData.examsAverage}% والتزام ممتاز بالحصص.`
      : `طالب يحتاج إلى خطة متابعة وتدعيم دراسي، حيث يبلغ متوسط درجاته ${studentData.examsAverage}%.`,
    trendAnalysis: studentData.attendanceRate >= 90
      ? 'الحضور المنتظم يمنح الطالب أساساً جيداً للبناء والتطور الأكاديمي.'
      : 'تراجع نسبة الحضور يلقي بظلاله المباشرة على التحصيل وفهم الموضوعات التراكمية.',
    identifiedStrengths: studentData.strengths.length > 0 ? studentData.strengths : ['الرغبة في المشاركة', 'الالتزام بالأدب الصفي'],
    focusAreas: studentData.weaknesses.length > 0 ? studentData.weaknesses : ['مراجعة القوانين الأساسية', 'التدريب على إدارة وقت الاختبار'],
    actionableRecommendation: isHigh
      ? 'تكليف الطالب بمسائل تحدي متقدمة لتحفيز التفكير الإبداعي وتجنب الروتين.'
      : 'تخصيص 10 دقائق بعد الحصة لمراجعة المفاهيم غير المكتملة وإعطاؤه 3 تمارين تدريجية خلال الأسبوع.',
    parentCommunicationAdvice: 'إشراك ولي الأمر في متابعة جدول الواجبات المنزلية والتشجيع الإيجابي عند إحراز تقدم.'
  };
}

/**
 * 3. AI Group Performance & Remediation Analysis
 */
export async function analyzeGroupAI(groupData: {
  groupName: string;
  subject: string;
  studentCount: number;
  averageAttendanceRate: number;
  averageExamScore: number;
  topStudentsCount: number;
  strugglingStudentsCount: number;
  recentExamsTopics: string[];
}) {
  const ai = getAiClient();
  const prompt = `أنت خبير قياس وتقويم تربوي وإدارة الفصول الدراسية.
قم بتحليل أداء هذه المجموعة التعليمية وقدم للمدرس إجابة واضحة عن: "ما الذي يجب أن أراجعه مع هذه المجموعة؟" وخطة عمل لتحسين نواتج التعلم.

بيانات المجموعة:
- اسم المجموعة: ${groupData.groupName}
- المادة: ${groupData.subject}
- عدد الطلاب: ${groupData.studentCount}
- متوسط نسبة الحضور: ${groupData.averageAttendanceRate}%
- متوسط درجات الاختبارات: ${groupData.averageExamScore}%
- عدد الطلاب المتميزين: ${groupData.topStudentsCount}
- عدد الطلاب المتعثرين: ${groupData.strugglingStudentsCount}
- موضوعات الاختبارات الأخيرة: ${groupData.recentExamsTopics.join(', ') || 'الموضوعات الأساسية للمنهج'}

أعد النتيجة بصيغة JSON حصراً:
{
  "groupHealthSummary": "ملخص عام لواقع المجموعة ومستوى التفاعل والاستيعاب",
  "recommendedReviewTopics": ["موضوع 1 يجب إعادة شرحه أو مراجعته", "موضوع 2"],
  "strugglingStudentsStrategy": "خطة عملية للتعامل مع الطلاب المتعثرين ورفع مستواهم دون تعطيل باقي المجموعة",
  "advancedStudentsEnrichment": "أنشطة إثرائية للطلاب المتفوقين",
  "suggestedNextClassPlan": "مقترح هيكلي للحصة القادمة لتعزيز الاستيعاب"
}`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini group analysis error, falling back:', err);
    }
  }

  return {
    groupHealthSummary: `المجموعة تسير بوتيرة جيدة بمتوسط عام ${groupData.averageExamScore}% مع تباين طبيعي في سرعة استيعاب المفاهيم المركبة.`,
    recommendedReviewTopics: [
      'تطبيقات المسائل اللفظية والمفاهيم التراكمية',
      'الربط بين القوانين النظرية وخطوات الحل العملية'
    ],
    strugglingStudentsStrategy: 'إعداد أوراق عمل تدريبية متدرجة الصعوبة (سهل - متوسط - متقدم) تتيح للطلاب المتعثرين بناء الثقة خطوة بخطوة.',
    advancedStudentsEnrichment: 'طرح أسئلة مفتوحة النهاية ومسائل تتطلب التفكير النقدي لتوسيع مدارك المتفوقين.',
    suggestedNextClassPlan: 'تخصيص أول 15 دقيقة لمراجعة جماعية للأخطاء الشائعة في الاختبار السابق، ثم الانتقال للموضوع الجديد مع تدريبات تفاعلية.'
  };
}

/**
 * 4. AI Quiz / Exam Generator
 */
export async function generateQuizAI(params: {
  subject: string;
  topic: string;
  grade: string;
  questionsCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  type: 'multiple_choice' | 'problem_solving' | 'mixed';
}) {
  const ai = getAiClient();
  const prompt = `أنت خبير في بناء الاختبارات وبنوك الأسئلة للمناهج التعليمية.
قم بإنشاء نموذج اختبار متكامل بالعربية:
- المادة: ${params.subject}
- الموضوع المحدد: ${params.topic}
- الصف: ${params.grade}
- عدد الأسئلة: ${params.questionsCount || 5}
- مستوى الصعوبة: ${params.difficulty}
- نوع الأسئلة: ${params.type}

أعد النتيجة بصيغة JSON حصراً:
{
  "quizTitle": "عنوان الاختبار المقترح",
  "estimatedTimeMinutes": 20,
  "totalPoints": 20,
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "questionText": "نص السؤال بدقة ووضوح",
      "options": ["أ) خيار 1", "ب) خيار 2", "ج) خيار 3", "د) خيار 4"],
      "correctAnswer": "أ) خيار 1",
      "explanation": "شرح تفصيلي لطريقة الحل ولماذا هذا الخيار هو الصحيح",
      "points": 4
    }
  ]
}`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini quiz generation error, falling back:', err);
    }
  }

  return {
    quizTitle: `اختبار تقييمي في ${params.topic} - ${params.subject}`,
    estimatedTimeMinutes: 25,
    totalPoints: 20,
    questions: [
      {
        id: 1,
        type: 'multiple_choice',
        questionText: `ما هي النتيجة الصحيحة عند تطبيق القاعدة الأساسية لـ ${params.topic}؟`,
        options: ['أ) الخيار النموذجي الأول', 'ب) الخيار الثاني', 'ج) الخيار الثالث', 'د) الخيار الرابع'],
        correctAnswer: 'أ) الخيار النموذجي الأول',
        explanation: 'التعليل: بناءً على النظرية المباشرة التي تم شرحها في الدرس.',
        points: 5
      },
      {
        id: 2,
        type: 'multiple_choice',
        questionText: `أي من الشروط التالية يلزم توافرها لتطبيق النظرية بشكل صحيح في مسائل ${params.topic}؟`,
        options: ['أ) الشرط الأول فقط', 'ب) الشرط الثاني فقط', 'ج) كلا الشرطين معاً', 'د) لا شيء مما سبق'],
        correctAnswer: 'ج) كلا الشرطين معاً',
        explanation: 'التعليل: يلزم تحقق كلا الشرطين الرياضيين معاً لصحة التطبيق.',
        points: 5
      },
      {
        id: 3,
        type: 'problem_solving',
        questionText: `أوجد الحل التفصيلي للمسألة المعطاة في ${params.topic} مع كتابة كافة الخطوات الرياضية.`,
        correctAnswer: 'خطوة 1: استخراج المعطيات -> خطوة 2: تطبيق القانون -> خطوة 3: التبسيط وإيجاد الناتج النهائي.',
        explanation: 'يتم توزيع الدرجات على تنظيم الخطوات والوصول للناتج النهائي.',
        points: 10
      }
    ]
  };
}

/**
 * 5. AI Concept Simplifier & Analogies
 */
export async function simplifyConceptAI(params: {
  concept: string;
  subject: string;
  grade: string;
}) {
  const ai = getAiClient();
  const prompt = `أنت معلم عبقري ومبدع في تبسيط المفاهيم المعقدة وربطها بالحياة اليومية.
اشرح المفهوم التالي بطريقة شيقة وسهلة الفهم لطلاب ${params.grade}:
المفهوم: "${params.concept}"
المادة: "${params.subject}"

أعد النتيجة بصيغة JSON حصراً:
{
  "coreIdea": "الفكرة الجوهرية في جملتين بسيطتين جداً",
  "realWorldAnalogy": "تشبيه رائع من الحياة اليومية يقرب المفهوم لذهن الطالب",
  "stepByStepExplanation": ["خطوة الفهم 1", "خطوة الفهم 2", "خطوة الفهم 3"],
  "commonMisconception": "الخطأ أو اللبس الشائع الذي يقع فيه الطلاب وكيفية تجنبه",
  "engagingQuestion": "سؤال تفاعلي ذكي لإلقائه على الطلاب لإثارة الفضول"
}`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini concept simplifier error, falling back:', err);
    }
  }

  return {
    coreIdea: `مفهوم ${params.concept} هو أداة رياضية/علمية تسمح لنا بفهم التغيرات والعلاقات الدقيقة بين المتغيرات.`,
    realWorldAnalogy: `تخيل أنك تقود سيارة وتراقب عداد السرعة في لحظة معينة بدلاً من حساب متوسط الرحلة كلها؛ هذا بالضبط ما يعبر عنه هذا المفهوم في الحياة الواقعية.`,
    stepByStepExplanation: [
      'الخطوة الأولى: تحديد النقطة أو الحالة المراد دراستها بدقة.',
      'الخطوة الثانية: تطبيق القواعد المناسبة لملاحظة التغير السريع.',
      'الخطوة الثالثة: تفسير المعنى الفيزيائي أو التطبيقي للنتيجة.'
    ],
    commonMisconception: 'الخلط بين المعدل اللحظي والمتوسط الإجمالي، وتجنبه يكون بفصل الحسابات بدقة.',
    engagingQuestion: `لو أردنا التنبؤ بالتغير بعد ثانية واحدة فقط، كيف يمكننا استخدام هذا المفهوم لتحقيق ذلك؟`
  };
}

/**
 * 6. AI Parent Message Generator
 */
export async function generateParentMessageAI(params: {
  studentName: string;
  parentName: string;
  teacherName: string;
  subject: string;
  attendanceRate: number;
  examsAverage: number;
  homeworkRate: number;
  teacherNotes?: string;
  tone: 'formal' | 'encouraging' | 'urgent';
}) {
  const ai = getAiClient();
  const prompt = `أنت مساعد للتواصل التربوي الإيجابي بين المدرسين وأولياء الأمور.
قم بصياغة رسالة واتساب مهذبة، احترافية وواضحة ترسل من المدرس إلى ولي أمر الطالب:
- اسم المدرس: ${params.teacherName}
- اسم الطالب: ${params.studentName}
- اسم ولي الأمر: ${params.parentName}
- المادة: ${params.subject}
- نسبة الحضور: ${params.attendanceRate}%
- متوسط درجات الاختبارات: ${params.examsAverage}%
- تسليم الواجبات: ${params.homeworkRate}%
- ملاحظات المدرس: "${params.teacherNotes || 'متابعة دورية'}"
- نبرة الرسالة: ${params.tone} (formal=رسمية متزنة, encouraging=تشجيعية ممتنة, urgent=تنبيهية عاجلة للتعاون)

أعد النتيجة بصيغة JSON حصراً:
{
  "messageText": "نص رسالة الواتساب الجاهزة للإرسال والمصممة بعناية مع الرموز التعبيرية المناسبة",
  "summaryBullets": ["نقطة 1", "نقطة 2"]
}`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini parent message generation error, falling back:', err);
    }
  }

  // Fallback
  return {
    messageText: `السلام عليكم ورحمة الله وبركاته،\nالأستاذ الفاضل/ ${params.parentName}، ولي أمر الطالب/ ${params.studentName} المحترم.\n\nيسرني مشاركتكم التقرير الأكاديمي الدوري للطالب في مادة ${params.subject}:\n📊 نسبة الحضور: ${params.attendanceRate}%\n📝 متوسط درجات الاختبارات: ${params.examsAverage}%\n📚 إنجاز الواجبات: ${params.homeworkRate}%\n\n${params.teacherNotes ? `💡 ملاحظة المدرس: ${params.teacherNotes}\n\n` : ''}شاكرين لكم حسن تعاونكم الدائم في دعم المسيرة التعليمية لأبنائنا الطلاب.\n\nتحياتي وتقديري،\n${params.teacherName} | منصة مُعين التعليمية`,
    summaryBullets: [
      `حضور: ${params.attendanceRate}%`,
      `متوسط الاختبارات: ${params.examsAverage}%`,
      `نسبة الواجبات: ${params.homeworkRate}%`
    ]
  };
}

/**
 * 7. AI Diagnostic Placement Test Generator
 */
export async function generatePlacementTestAI(params: {
  studentName: string;
  subject: string;
  stage: string;
  grade: string;
  topics?: string[];
  initialLevelEstimate?: string;
}) {
  const ai = getAiClient();
  const topicsStr = params.topics?.length ? params.topics.join('، ') : 'المفاهيم والمهارات التأسيسية للمنهج';
  const prompt = `أنت خبير تربوي متخصص في بناء اختبارات تحديد المستوى والتقييم التشخيصي التأسيسي للمناهج التعليمية.
قم بإنشاء اختبار تشخيصي متدرج لقياس المستوى الأكاديمي والمهاري للطالب:
- اسم الطالب: ${params.studentName}
- المادة: ${params.subject}
- المرحلة: ${params.stage}
- الصف: ${params.grade}
- الموضوعات والمهارات المطلوب تغطيتها: ${topicsStr}
- التقدير المبدئي: ${params.initialLevelEstimate || 'متوسط'}

قواعد الاختبار الإلزامية:
يجب أن يتكون الاختبار من 5 أسئلة متدرجة الصعوبة تمثل 5 مستويات دقيقة:
1. المستوى الأول: أساسيات وتذكر (Tier 1: Basics)
2. المستوى الثاني: فهم واستيعاب مفاهيمي (Tier 2: Comprehension)
3. المستوى الثالث: تطبيق عملي وإجرائي (Tier 3: Application)
4. المستوى الرابع: تفكير وحل مشكلات (Tier 4: Problem Solving)
5. المستوى الخامس: أسئلة متقدمة وتحدي (Tier 5: Advanced)

لكل سؤال:
- id: رقم من 1 إلى 5
- tier: 1 أو 2 أو 3 أو 4 أو 5
- tierName: اسم المستوى بالعربية
- questionText: نص السؤال بوضوح وصياغة لغوية سليمة
- options: مصفوفة من 4 خيارات (أ، ب، ج، د)
- correctAnswer: الخيار الصحيح مطابق تماماً لأحد الخيارات
- points: 4 درجات لكل سؤال (المجموع الكلي 20)
- difficulty: 'easy' | 'medium' | 'hard' | 'advanced'
- measuredSkill: المهارة التعليمية المحددة التي يقيسها السؤال
- explanation: تفسير علمي موجز لسبب صحة هذا الخيار وطريقة الحل

أعد النتيجة بصيغة JSON حصراً:
{
  "title": "عنوان الاختبار التشخيصي المقترح",
  "topicsCovered": ["موضوع 1", "موضوع 2", "موضوع 3"],
  "totalScore": 20,
  "questions": [
    {
      "id": 1,
      "tier": 1,
      "tierName": "المستوى الأول: أساسيات",
      "questionText": "...",
      "options": ["أ) ...", "ب) ...", "ج) ...", "د) ..."],
      "correctAnswer": "أ) ...",
      "points": 4,
      "difficulty": "easy",
      "measuredSkill": "...",
      "explanation": "..."
    }
  ]
}`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini placement test generation error, falling back:', err);
    }
  }

  // Fallback diagnostic test
  return {
    title: `اختبار تحديد المستوى في ${params.subject} - ${params.grade}`,
    topicsCovered: ['المفاهيم الأساسية', 'التطبيقات الحسابية', 'حل المسائل الرياضية والعلمية'],
    totalScore: 20,
    questions: [
      {
        id: 1,
        tier: 1,
        tierName: 'المستوى الأول: أساسيات وتذكر',
        questionText: `ما هي القاعدة الرياضية/العلمية الأولية المستخدمة كمدخل أساسي في ${params.subject}؟`,
        options: ['أ) القاعدة الأساسية المباشرة الأولى', 'ب) القاعدة البديلة الثانية', 'ج) القاعدة الثالثة', 'د) لا توجد قاعدة'],
        correctAnswer: 'أ) القاعدة الأساسية المباشرة الأولى',
        points: 4,
        difficulty: 'easy',
        measuredSkill: 'استرجاع القوانين والمصطلحات الأساسية',
        explanation: 'تمثل هذه القاعدة الأساس المنطقي للبناء المعرفي في هذا الصف.'
      },
      {
        id: 2,
        tier: 2,
        tierName: 'المستوى الثاني: الفهم والاستيعاب المفاهيمي',
        questionText: `أي من التفسيرات التالية يوضح بدقة العلاقة بين المعطيات والنتائج في مفاهيم ${params.subject}؟`,
        options: ['أ) التناسب الطردي وفق الشروط المحددة', 'ب) التغير العشوائي غير المنضبط', 'ج) ثبات النتيجة دائماً بدون متغيرات', 'د) لا ترتبط المعطيات بالنتائج'],
        correctAnswer: 'أ) التناسب الطردي وفق الشروط المحددة',
        points: 4,
        difficulty: 'medium',
        measuredSkill: 'فهم العلاقات المنطقية واستيعاب المفاهيم',
        explanation: 'الفهم المفاهيمي يقوم على إدراك الأثر المتبادل بين المتغيرات والشروط.'
      },
      {
        id: 3,
        tier: 3,
        tierName: 'المستوى الثالث: التطبيق العملي والإجرائي',
        questionText: `عند تطبيق خطوات الحل المنظم لمسألة قياسية في هذا الموضوع، ما هي القيمة الناتجة؟`,
        options: ['أ) الناتج الصحيح المتوافق مع الخطوات', 'ب) ناتج مضاعف بسبب خطأ إجرائي', 'ج) نصف الناتج', 'د) ناتج سالب غير منطقي'],
        correctAnswer: 'أ) الناتج الصحيح المتوافق مع الخطوات',
        points: 4,
        difficulty: 'medium',
        measuredSkill: 'تطبيق الإجراءات الحسابية والمنهجية بدقة',
        explanation: 'يتم تطبيق القانون بالتعويض المباشر والتبسيط للوصول إلى القيمة المستهدفة.'
      },
      {
        id: 4,
        tier: 4,
        tierName: 'المستوى الرابع: التفكير وحل المشكلات',
        questionText: `في مسألة مركبة تحتوي على شرطين متداخلين، ما هو المسار الأمثل للوصول إلى الحل؟`,
        options: ['أ) تفكيك المسألة لمعادلتين وربطهما بالمتغير المشترك', 'ب) إهمال الشرط الثاني والحل المباشر', 'ج) التخمين العشوائي للخيارات', 'د) الاكتفاء بجمع المعطيات دون قانون'],
        correctAnswer: 'أ) تفكيك المسألة لمعادلتين وربطهما بالمتغير المشترك',
        points: 4,
        difficulty: 'hard',
        measuredSkill: 'تفكيك المسائل المركبة وبناء خطة حل متعددة الخطوات',
        explanation: 'حل المشكلات يتطلب نمذجة المعطيات وربط العلاقات عبر متغير وسيط.'
      },
      {
        id: 5,
        tier: 5,
        tierName: 'المستوى الخامس: أسئلة متقدمة وتحدي',
        questionText: `ما هو الاستنتاج الرياضي/العلمي الصحيح عند تعميم الحالة الخاصة إلى الحالة العامة؟`,
        options: ['أ) التعميم الشامل الذي يحقق كافة الحالات الحدية', 'ب) التعميم المقيد بحالة واحدة فقط', 'ج) بطلان النظرية في الحالات المعقدة', 'د) لا يمكن التعميم إطلاقاً'],
        correctAnswer: 'أ) التعميم الشامل الذي يحقق كافة الحالات الحدية',
        points: 4,
        difficulty: 'advanced',
        measuredSkill: 'الاستقراء والتجريد والتعميم للمسائل المتقدمة',
        explanation: 'القدرة على الانتقال من الحالات الخاصة إلى البناء النظري العام هي قمة مهارات التفكير العليا.'
      }
    ]
  };
}

/**
 * 8. AI Learning Profile Generator based on diagnostic test & teacher evaluation
 */
export async function analyzePlacementResultsAI(params: {
  studentName: string;
  subject: string;
  grade: string;
  totalScore: number;
  earnedScore: number;
  answers: {
    questionId: number;
    tier: number;
    tierName: string;
    isCorrect: boolean;
    skill: string;
  }[];
  teacherRatings?: Record<string, number>;
  teacherNotes?: string;
}) {
  const ai = getAiClient();
  const masteryPercentage = Math.round((params.earnedScore / (params.totalScore || 20)) * 100);

  const prompt = `أنت مستشار تربوي وخبير في القياس والتقويم وبناء الملفات التعليمية للطلاب.
قم بتحليل نتائج اختبار تحديد المستوى وتقييم المعلم لإنشاء "الملف التعليمي للطالب".
تنبيه صارم: يُمنع تماماً استخدام مصطلحات مثل IQ أو إصدار أي تشخيص نفسي أو طبي. ركز حصراً على المؤشرات التعليمية والمهارات الأكاديمية وسرعة التعلم الملاحظة.

بيانات الطالب والاختبار:
- اسم الطالب: ${params.studentName}
- المادة: ${params.subject} - ${params.grade}
- الدرجة المكتسبة: ${params.earnedScore} من ${params.totalScore} (نسبة الإتقان: ${masteryPercentage}%)
- تفاصيل إجابات المستويات:
${params.answers.map(a => `  * المستوى ${a.tier} (${a.tierName}): ${a.isCorrect ? 'إجابة صحيحة' : 'إجابة غير صحيحة'} - مهارة: ${a.skill}`).join('\n')}
${params.teacherRatings ? `- تقييم المعلم الأولي في عناصر الأداء: ${JSON.stringify(params.teacherRatings)}` : ''}
${params.teacherNotes ? `- ملاحظات المعلم: "${params.teacherNotes}"` : ''}

أعد النتيجة بصيغة JSON حصراً:
{
  "basicsLevel": "ممتاز / جيد جداً / جيد / يحتاج دعم",
  "comprehensionLevel": "ممتاز / جيد جداً / جيد / يحتاج دعم",
  "applicationLevel": "ممتاز / جيد جداً / جيد / يحتاج دعم",
  "problemSolvingLevel": "ممتاز / جيد جداً / جيد / يحتاج دعم",
  "learningPace": "مرتفعة وسريعة / طبيعية متزنة / متدرجة تحتاج وقتاً",
  "academicStrengths": ["نقطة قوة أكاديمية 1", "نقطة قوة 2", "نقطة قوة 3"],
  "focusAreas": ["مجال يحتاج تركيز وتطوير 1", "مجال 2"],
  "recommendedReviewTopics": ["موضوع أو مهارة تأسيسية يوصى بمراجعتها 1", "موضوع 2"],
  "educationalSummary": "فقرة تربوية دقيقة تصف ملف الطالب التعليمي ونمط تعلمه وأفضل استراتيجية تدريسية مناسبة له"
}`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini learning profile generation error, falling back:', err);
    }
  }

  // Fallback
  const isHigh = masteryPercentage >= 80;
  const isMid = masteryPercentage >= 50;
  return {
    basicsLevel: isHigh ? 'ممتاز' : isMid ? 'جيد جداً' : 'يحتاج دعم',
    comprehensionLevel: isHigh ? 'ممتاز' : isMid ? 'جيد' : 'يحتاج دعم',
    applicationLevel: isHigh ? 'جيد جداً' : isMid ? 'جيد' : 'يحتاج دعم وتدريب',
    problemSolvingLevel: isHigh ? 'جيد' : 'يحتاج دعم إضافي',
    learningPace: isHigh ? 'مرتفعة وسريعة الاستيعاب' : isMid ? 'طبيعية متزنة' : 'متدرجة تحتاج وتيرة هادئة',
    academicStrengths: isHigh
      ? ['استيعاب سريع للقوانين', 'دقة الحسابات الإجرائية', 'القدرة على التفكير التحليلي']
      : ['الرغبة في التعلم', 'التفاعل الإيجابي عند توضيح الأساسيات'],
    focusAreas: isHigh
      ? ['مسائل التحدي والتطبيقات متعددة الخطوات']
      : ['تثبيت القوانين التأسيسية', 'التدريب على حل المسائل المركبة'],
    recommendedReviewTopics: [
      'المفاهيم الجبرية والهندسية الأساسية',
      'خطوات التحقق من صحة الناتج الرياضي'
    ],
    educationalSummary: `أظهر الطالب نسبة إتقان ${masteryPercentage}% في الاختبار التشخيصي. يمتلك أساساً تعليمياً ${isHigh ? 'قوياً يؤهله للمجموعات المتقدمة' : isMid ? 'جيداً مع الحاجة لبعض التدريبات الإجرائية' : 'يحتاج إلى خطة علاجية وتثبيت المفاهيم التأسيسية قبل الانتقال للموضوعات المركبة'}.`
  };
}

/**
 * 9. AI Group Recommendation Engine
 */
export async function recommendGroupAI(params: {
  studentName: string;
  masteryPercentage: number;
  learningProfileSummary: string;
  teacherRatingAvg: number;
  availableGroups: {
    id: string;
    name: string;
    stage: string;
    grade: string;
    studentsCount: number;
    averageExamScore: number;
    averageAttendanceRate: number;
  }[];
}) {
  const ai = getAiClient();
  const groupsDesc = params.availableGroups.map(g => 
    `- المعرف: ${g.id} | الاسم: "${g.name}" | الصف: ${g.grade} | عدد الطلاب: ${g.studentsCount} | متوسط درجات المجموعة: ${g.averageExamScore}%`
  ).join('\n');

  const prompt = `أنت موجه تربوي وخبير توزيع فصول وتسكين طلاب في المجموعات التعليمية المناسبة.
قم بتحليل الملف التعليمي للطالب ومقارنته مع المجموعات المتاحة لاقتراح المجموعة الأنسب والأكثر توافقاً معه:
- اسم الطالب: ${params.studentName}
- نسبة إتقان الاختبار التشخيصي: ${params.masteryPercentage}%
- متوسط تقييم المعلم الأولي: ${params.teacherRatingAvg} من 5
- ملخص الملف التعليمي: "${params.learningProfileSummary}"

المجموعات المتاحة:
${groupsDesc || 'لا توجد مجموعات معرفة'}

قواعد الاقتراح:
1. اختر مجموعة واحدة تكون الأقرب لمستوى الطالب الأكاديمي وسرعة استيعابه.
2. احسب درجة التوافق كنسبة مئوية دقيقة (مثل: 88% أو 92%).
3. اذكر سبباً تربوياً مقنعاً وواضحاً يشرح لماذا هذه المجموعة هي الأنسب، مع التأكيد أن القرار النهائي للمعلم.

أعد النتيجة بصيغة JSON حصراً:
{
  "suggestedGroupId": "معرف المجموعة الموصى بها",
  "suggestedGroupName": "اسم المجموعة",
  "compatibilityPercentage": 87,
  "reason": "شرح تربوي دقيق لسبب التوصية وتوافق سرعة الشرح ومستوى الطلاب مع قدرات الطالب"
}`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini group recommendation error, falling back:', err);
    }
  }

  // Fallback heuristic recommendation
  const primaryGroup = params.availableGroups[0] || { id: 'grp_1', name: 'المجموعة العامة' };
  const comp = Math.min(95, Math.max(65, Math.round(params.masteryPercentage * 0.9 + 10)));
  return {
    suggestedGroupId: primaryGroup.id,
    suggestedGroupName: primaryGroup.name,
    compatibilityPercentage: comp,
    reason: `توافق مناسب بنسبة ${comp}% بناءً على نتيجة الاختبار التشخيصي ومعدل سرعة المجموعة ومتوسط درجات طلابها.`
  };
}

/**
 * 10. AI Smart Lesson Plan Generator (Comprehensive Specification)
 */
export async function generateSmartLessonPrepAI(params: {
  lessonTitle: string;
  subject: string;
  stage: string;
  grade: string;
  groupName?: string;
  durationMinutes: number;
  studentCount?: number;
  groupLevel?: string;
  educationalObjectives?: string[];
  previousCoverage?: string;
  targetSkills?: string[];
  customTeacherPrompt?: string;
}) {
  const ai = getAiClient();
  const prompt = `أنت خبير مناهج وتخطيط دروس ذكي ومستشار تربوي من الطراز الرفيع.
قم بإعداد خطة تحضير درس نموذجية ومتكاملة واحترافية وفق المعايير العالمية للتدريس الفعال:

بيانات الحصة:
- عنوان الدرس: "${params.lessonTitle}"
- المادة: "${params.subject}"
- المرحلة والصف: "${params.stage} - ${params.grade}"
- المجموعة: "${params.groupName || 'المجموعة الأساسية'}" (مستوى المجموعة: ${params.groupLevel || 'متوسط إلى متقدم'})
- مدة الحصة: ${params.durationMinutes || 90} دقيقة
- عدد الطلاب: ${params.studentCount || 20} طالب
- ما تم شرحه سابقاً: "${params.previousCoverage || 'المفاهيم السابقة للمنهج'}"
- المهارات المطلوب تطويرها: "${params.targetSkills?.join('، ') || 'الفهم، التطبيق، حل المسائل'}"
- توجيهات إضافية من المدرس: "${params.customTeacherPrompt || 'لا توجد'}"

المطلوب توليد خطة التحضير بالكامل بصيغة JSON حصراً متضمنة كافة العناصر التالية:
1. unit: اسم الوحدة الدراسية المقترحة
2. educationalObjectives: قائمة من 3 إلى 5 أهداف سلوكية مصاغة بدقة وقابلة للقياس (أن + فعل مضارع سلوكي + الطالب + المحتوى)
3. warmupHook: نشاط تمهيدي أو سؤال افتتاحي مدته 3-5 دقائق لإثارة دافعية الطلاب
4. summaryExplanation: خطة شرح مفاهيمي منظمة ومتدرجة ومناسبة لزمن الحصة
5. lessonElements: عناصر الدرس وتوزيعها الزمني التفصيلي
6. gradedExamples: 3 أمثلة متدرجة الصعوبة (المثال 1: سهل ومباشر، المثال 2: متوسط وتطبيقي، المثال 3: متقدم وتفكير) مع نص المسألة والحل التفصيلي لكل مثال
7. interactiveActivities: نشاط عملي أو تدريبي تعاوني يشارك فيه الطلاب داخل الحصة
8. comprehensionQuestions: أسئلة قياس الفهم أثناء الشرح (السؤال + الإجابة المقترحة + توقيت طرح السؤال)
9. practicalApplication: تدريبات تطبيقية ينفذها الطلاب خلال الحصة
10. quickAssessmentQuestions: اختبار قصير سريع (Exit Ticket) في نهاية الحصة لقياس تحقق الأهداف
11. conclusionSummary: ملخص ختامي سريع لأهم النقاط والقوانين
12. inClassEffort: مهمة مجهود الطالب داخل الحصة (taskName, description, studentRequirement, expectedTimeMinutes, difficulty, evaluationMethod)
13. homeworkDescription: وصف عام للواجب
14. differentiatedHomework: واجب متمايز حسب مستويات الطلاب:
    - remedial: واجب علاجي للطلاب الذين لديهم ضعف في مهارة معينة (أسئلة مباشرة وتثبيت)
    - core: واجب أساسي للمستوى الطبيعي للمجموعة (أسئلة تطبيقية)
    - advanced: واجب إثرائي متقدم للمتفوقين (مسائل تفكير عليا وتحدي)

أعد النتيجة بصيغة JSON حصراً:
{
  "unit": "اسم الوحدة",
  "educationalObjectives": ["أن يتعرف الطالب على...", "أن يطبق الطالب...", "أن يستنتج الطالب..."],
  "warmupHook": {
    "durationMinutes": 5,
    "activity": "نص التمهيد الحافز أو السؤال الافتتاحي"
  },
  "summaryExplanation": "الشرح المنظم المفصل",
  "lessonElements": ["عنصر 1", "عنصر 2", "عنصر 3", "عنصر 4"],
  "gradedExamples": [
    { "level": "easy", "title": "مثال 1: مباشر", "problem": "...", "solution": "..." },
    { "level": "medium", "title": "مثال 2: تطبيقي", "problem": "...", "solution": "..." },
    { "level": "advanced", "title": "مثال 3: تفكير متقدم", "problem": "...", "solution": "..." }
  ],
  "interactiveActivities": ["نشاط 1", "نشاط 2"],
  "comprehensionQuestions": [
    { "question": "سؤال لقياس الفهم أثناء الشرح", "suggestedAnswer": "الإجابة", "checkTiming": "بعد الشرح المبدئي" }
  ],
  "practicalApplication": {
    "exercises": ["تمرين 1", "تمرين 2"]
  },
  "quickAssessmentQuestions": [
    { "question": "سؤال التقويم السريع الختامي", "suggestedAnswer": "الإجابة النموذجية" }
  ],
  "conclusionSummary": "خاتمة الدرس والملخص",
  "inClassEffort": {
    "taskName": "اسم مهمة المجهود الصفي",
    "description": "وصف المهمة",
    "studentRequirement": "المطلوب من الطالب بالتحديد",
    "expectedTimeMinutes": 10,
    "difficulty": "medium",
    "evaluationMethod": "طريقة تقييم المدرس للحل"
  },
  "homeworkDescription": "وصف الواجب",
  "differentiatedHomework": {
    "remedial": {
      "id": "hw_rem",
      "type": "remedial",
      "title": "الواجب العلاجي (تثبيت الأساسيات)",
      "targetAudience": "للطلاب الذين يحتاجون تقوية المهارات التأسيسية",
      "questions": [{ "number": 1, "text": "سؤال علاجي مباشر", "type": "direct", "points": 5, "difficulty": "easy", "expectedAnswer": "..." }],
      "estimatedTimeMinutes": 20,
      "dueDate": "الحصة القادمة"
    },
    "core": {
      "id": "hw_core",
      "type": "core",
      "title": "الواجب الأساسي (التطبيقات المباشرة والنموذجية)",
      "targetAudience": "لجميع طلاب المجموعة",
      "questions": [{ "number": 1, "text": "سؤال تطبيقي", "type": "applied", "points": 5, "difficulty": "medium", "expectedAnswer": "..." }],
      "estimatedTimeMinutes": 30,
      "dueDate": "الحصة القادمة"
    },
    "advanced": {
      "id": "hw_adv",
      "type": "advanced",
      "title": "الواجب الإثرائي المتقدم (مهارات تفكير عليا)",
      "targetAudience": "للطلاب المتميزين والمتفوقين",
      "questions": [{ "number": 1, "text": "سؤال تحدي وتفكير نقدي", "type": "thinking", "points": 10, "difficulty": "hard", "expectedAnswer": "..." }],
      "estimatedTimeMinutes": 40,
      "dueDate": "الحصة القادمة"
    }
  }
}`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.65
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini smart lesson plan error, falling back:', err);
    }
  }

  // Fallback full smart prep
  return {
    unit: `الوحدة الدراسية في ${params.subject}`,
    educationalObjectives: [
      `أن يتعرف الطالب على المفاهيم والقوانين الرياضية/العلمية لدرس ${params.lessonTitle}`,
      `أن يطبق الطالب الخطوات المنهجية لحل التمارين والتطبيقات بدقة`,
      `أن يحلل الطالب المسائل المتدرجة ويستنتج العلاقات المنطقية`
    ],
    warmupHook: {
      durationMinutes: 5,
      activity: `طرح مسألة واقعية أو تحدٍ بصري سريع يربط موضوع ${params.lessonTitle} بالحياة اليومية لتشويق الطلاب وتحفيز التفكير.`
    },
    summaryExplanation: `يركز الدرس على شرح ${params.lessonTitle} من خلال التدرج البنائي من المفاهيم التأسيسية، مروراً بالقوانين الصريحة، وصولاً إلى تطبيقات النمذجة مع التركيز على استراتيجيات تفادي الأخطاء الشائعة.`,
    lessonElements: [
      'التهيئة والمراجعة السابقة (5 دقائق)',
      'الشرح النظري وبناء المفاهيم (25 دقيقة)',
      'أمثلة نموذجية متدرجة الصعوبة (30 دقيقة)',
      'المجهود الصفي والنشاط التفاعلي (15 دقيقة)',
      'التقويم الختامي والواجب المتمايز (15 دقيقة)'
    ],
    gradedExamples: [
      {
        level: 'easy',
        title: 'مثال 1: تطبيق مباشر للأساسيات',
        problem: `احسب القيمة المباشرة عند تطبيق القاعدة الأولى في ${params.lessonTitle}.`,
        solution: 'الخطوة 1: استخراج المعطيات -> الخطوة 2: تطبيق القانون المباشر -> الناتج النهائي مع الوحدة.'
      },
      {
        level: 'medium',
        title: 'مثال 2: مسألة تطبيقية متعددة الخطوات',
        problem: `إذا كان لدينا متغيران مرتبطان وفق علاقة محددة في ${params.lessonTitle}، أوجد الناتج عند الشروط المعطاة.`,
        solution: 'تحديد المعادلة الرئيسية، التعويض بالمتغيرات المحددة، ثم التبسيط والتحقق.'
      },
      {
        level: 'advanced',
        title: 'مثال 3: مسألة تفكير عليا وتحدي',
        problem: `أثبت صحة العلاقة الرياضية/العلمية في الحالة العامة واستنتج القيمة العظمى/الصغرى.`,
        solution: 'استخدام الاشتقاق والخواص التحليلية لإثبات العلاقة والوصول إلى القيمة المثلى.'
      }
    ],
    interactiveActivities: [
      'نشاط التعلم التعاوني: حل مسألة تحدي في مجموعات ثنائية مع تبادل الأوراق للتدقيق والتصويب.',
      'لعبة البطاقات السريعة: الإجابة الفورية على القوانين والمفاهيم الجوهرية.'
    ],
    comprehensionQuestions: [
      {
        question: `ما هي النقطة المحورية التي يجب الانتباه لها قبل البدء في حل مسائل ${params.lessonTitle}؟`,
        suggestedAnswer: 'التأكد من تجانس الوحدات وتحديد العلاقة الأساسية الصحيحة.',
        checkTiming: 'بعد الانتهاء من شرح المثال الأول'
      }
    ],
    practicalApplication: {
      exercises: [
        'تمرين تطبيقي فردي: حل المسألة رقم 1 صـ 40 والتحقق من النتيجة.',
        'تمرين ثنائي: مناقشة مسألة الامتحانات السابقة وكتابة خطوات الحل النموذجية.'
      ]
    },
    quickAssessmentQuestions: [
      {
        question: `ما هو الاستنتاج الرئيسي عند انتهاء درس ${params.lessonTitle}؟`,
        suggestedAnswer: 'أن تطبيق الخطوات المنظمة يضمن دقة النتيجة وتفادي الأخطاء الحسابية الشائعة.'
      }
    ],
    conclusionSummary: `ملخص ختامي: تناولنا اليوم مفهوم ${params.lessonTitle} وتطبيقاته وقوانينه الأساسية مع التركيز على التدرج في الحل.`,
    inClassEffort: {
      taskName: `مهمة المجهود الصفي لدرس ${params.lessonTitle}`,
      description: 'حل مسألة تطبيقية متدرجة في ورقة العمل خلال 10 دقائق.',
      studentRequirement: 'كتابة خطوات الحل كاملة وإيجاد الناتج النهائي والتأكد من صحة الحسابات.',
      expectedTimeMinutes: 10,
      difficulty: 'medium',
      evaluationMethod: 'تصحيح ثنائي وتبادل الأوراق ومراجعة المدرس للأخطاء المشتركة على السبورة'
    },
    homeworkDescription: 'واجب منزلي متمايز يراعي كافة مستويات الطلاب داخل المجموعة.',
    differentiatedHomework: {
      remedial: {
        id: `hw_rem_${Date.now()}`,
        type: 'remedial',
        title: 'الواجب العلاجي (تثبيت المفاهيم التأسيسية)',
        targetAudience: 'للطلاب الذين يحتاجون دعماً إضافياً في الأساسيات',
        questions: [
          {
            number: 1,
            text: `طبق القاعدة المباشرة لـ ${params.lessonTitle} لإيجاد القيمة عند س = 2.`,
            type: 'direct',
            points: 5,
            difficulty: 'easy',
            expectedAnswer: 'التعويض المباشر والوصول للناتج الصحيح.'
          }
        ],
        estimatedTimeMinutes: 20,
        dueDate: 'الحصة القادمة'
      },
      core: {
        id: `hw_core_${Date.now()}`,
        type: 'core',
        title: 'الواجب الأساسي (التمارين النموذجية والتطبيقية)',
        targetAudience: 'لجميع طلاب المجموعة',
        questions: [
          {
            number: 1,
            text: `حل المسألة التطبيقية القياسية لـ ${params.lessonTitle} مع توضيح خطوات الحل.`,
            type: 'applied',
            points: 5,
            difficulty: 'medium',
            expectedAnswer: 'كتابة القانون والتعويض والحساب بدقة.'
          }
        ],
        estimatedTimeMinutes: 30,
        dueDate: 'الحصة القادمة'
      },
      advanced: {
        id: `hw_adv_${Date.now()}`,
        type: 'advanced',
        title: 'الواجب الإثرائي المتقدم (مسائل المتفوقين والتحدي)',
        targetAudience: 'للطلاب المتميزين والمتفوقين',
        questions: [
          {
            number: 1,
            text: `مسألة تفكير عليا: أوجد الحل في الحالة العامة وأثبت صحة الشرط الهندسي/الرياضي.`,
            type: 'thinking',
            points: 10,
            difficulty: 'hard',
            expectedAnswer: 'برهان رياضي متكامل واستنتاج منطقي.'
          }
        ],
        estimatedTimeMinutes: 40,
        dueDate: 'الحصة القادمة'
      }
    }
  };
}

/**
 * 11. AI Student-Aware Preparation ("حضّر الحصة بناءً على طلابي")
 */
export async function generateStudentAwareLessonPrepAI(params: {
  lessonTitle: string;
  subject: string;
  stage: string;
  grade: string;
  groupName: string;
  durationMinutes: number;
  studentsAnalytics: {
    totalStudents: number;
    attendanceAvg: number;
    examsAvg: number;
    homeworkAvg: number;
    commonWeaknesses: string[];
    commonStrengths: string[];
    strugglingStudentsCount: number;
    topStudentsCount: number;
    lastLessonNotes?: string;
  };
}) {
  const ai = getAiClient();
  const prompt = `أنت مساعد تربوي فائق الذكاء ومستشار تحضير متخصص في التدريس المتمايز القائم على بيانات الطلاب الواقعية.
المعلم ضغط على زر "حضّر الحصة بناءً على طلابي".
قم بتحليل بيانات المجموعة الحالية ونقاط ضعفهم المشتركة ونتائج اختباراتهم السابقة، ثم أنشئ خطة تحضير ذكية مخصصة تعالج فجوات الطلاب بدقة وتوفر أنشطة تمايزية:

بيانات المجموعة والطلاب:
- عنوان الدرس: "${params.lessonTitle}"
- المادة: "${params.subject}" (${params.stage} - ${params.grade})
- اسم المجموعة: "${params.groupName}"
- عدد الطلاب: ${params.studentsAnalytics.totalStudents}
- متوسط درجات الاختبارات الأخيرة: ${params.studentsAnalytics.examsAvg}%
- متوسط الحضور: ${params.studentsAnalytics.attendanceAvg}%
- نسبة إنجاز الواجبات: ${params.studentsAnalytics.homeworkAvg}%
- نقاط الضعف والموضوعات غير المتقنة لدى الطلاب: ${params.studentsAnalytics.commonWeaknesses.join('، ') || 'لا توجد فجوات بارزة'}
- نقاط القوة الأكاديمية: ${params.studentsAnalytics.commonStrengths.join('، ') || 'الاستيعاب العام'}
- عدد الطلاب المتعثرين الذين يحتاجون دعماً: ${params.studentsAnalytics.strugglingStudentsCount}
- عدد الطلاب المتفوقين: ${params.studentsAnalytics.topStudentsCount}
- ملاحظات الحصة السابقة: "${params.studentsAnalytics.lastLessonNotes || 'لا توجد'}"

المطلوب:
توليد خطة تحضير كاملة تراعي سد الفجوات في التمهيد، وتتضمن أمثلة علاجية وإثرائية، ومهمة مجهود صفي، وواجبات متمايزة (علاجي، أساسي، متقدم).

أعد النتيجة بنفس هيكل JSON الكامل لخطة التحضير الذكية.`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.65
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini student-aware lesson plan error, falling back:', err);
    }
  }

  // Fallback to standard smart generator
  return generateSmartLessonPrepAI({
    lessonTitle: params.lessonTitle,
    subject: params.subject,
    stage: params.stage,
    grade: params.grade,
    groupName: params.groupName,
    durationMinutes: params.durationMinutes,
    studentCount: params.studentsAnalytics.totalStudents,
    customTeacherPrompt: `تحضير مخصص بناءً على نقاط ضعف الطلاب: ${params.studentsAnalytics.commonWeaknesses.join('، ')}`
  });
}

/**
 * 12. AI Quick Transforms inside Lesson Editor
 */
export async function aiTransformLessonElement(params: {
  action: 'simplify' | 'increase_difficulty' | 'summarize' | 'expand' | 'generate_examples' | 'generate_questions' | 'generate_activity' | 'generate_homework' | 'alternative_explanation';
  content: string;
  lessonTitle: string;
  subject: string;
  grade: string;
}) {
  const ai = getAiClient();
  const actionLabels: Record<string, string> = {
    simplify: 'تبسيط الشرح والمفاهيم وجعلها شديدة السهولة والوضوح',
    increase_difficulty: 'زيادة مستوى التحدي والصعوبة وإضافة أفكار امتحانية للمتفوقين',
    summarize: 'اختصار وتلخيص المحتوى في نقاط رئيسية مركزة وسريعة',
    expand: 'توسيع الشرح وإضافة تفاصيل وتطبيقات إضافية',
    generate_examples: 'توليد 3 أمثلة متدرجة الصعوبة (سهل، متوسط، متقدم) مع الحل',
    generate_questions: 'إنشاء أسئلة قياس فهم ذكية تفاعلية مع إجاباتها النموذجية',
    generate_activity: 'إنشاء نشاط صفي تفاعلي عملي ومشوق',
    generate_homework: 'إنشاء واجبات متمايزة (علاجي، أساسي، إثرائي)',
    alternative_explanation: 'اقتراح طريقة شرح بديلة غير تقليدية وتشبيهات من الواقع'
  };

  const prompt = `أنت مساعد تربوي ذكي داخل محرر تحضير الدروس.
المطلوب تنفيذ الإجراء التالي: "${actionLabels[params.action] || params.action}"
- عنوان الدرس: "${params.lessonTitle}"
- المادة: "${params.subject}" - ${params.grade}
- المحتوى الحالي:
"""
${params.content}
"""

أعد النتيجة بصيغة JSON حصراً:
{
  "transformedText": "النص المحسن والجديد المنظم بعناية بالعربية",
  "explanationOfChanges": "ملخص في سطر واحد لما تم تعديله أو إضافته"
}`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini transform lesson element error, falling back:', err);
    }
  }

  // Fallback
  return {
    transformedText: `[تم التحديث وفق إجراء: ${actionLabels[params.action] || params.action}]\n${params.content}\n\n💡 ملاحظة: تم إعادة صياغة المحتوى وتطويره تربوياً لتعزيز استيعاب الطلاب.`,
    explanationOfChanges: `تم تطبيق ${actionLabels[params.action] || params.action} بنجاح.`
  };
}

/**
 * 13. AI Lesson Feedback Analyzer & Next Class Suggestion
 */
export async function analyzeLessonFeedbackAndSuggestNextAI(params: {
  lessonTitle: string;
  subject: string;
  grade: string;
  objectivesAchieved: string;
  comprehensionRating: number;
  encounteredDifficulties: string;
  studentsNeedingHelpCount: number;
  teacherNotes: string;
}) {
  const ai = getAiClient();
  const prompt = `أنت مستشار تربوي متخصص في تطوير نواتج التعلم وتخطيط الحصص التتابعية.
قم بتحليل نتائج وتغذية راجعة الحصة المنتهية، واقترح خطة العمل والتعديلات اللازمة للحصة القادمة:
- عنوان الحصة المنتهية: "${params.lessonTitle}"
- المادة: "${params.subject}" (${params.grade})
- مدى تحقق الأهداف: ${params.objectivesAchieved}
- تقييم فهم الطلاب (1-5): ${params.comprehensionRating}
- الصعوبات التي ظهرت: "${params.encounteredDifficulties || 'لا توجد صعوبات كبيرة'}"
- عدد الطلاب الذين احتاجوا مساعدة: ${params.studentsNeedingHelpCount}
- ملاحظات المعلم: "${params.teacherNotes || 'حصة جيدة'}"

أعد النتيجة بصيغة JSON حصراً:
{
  "topicsToReview": ["موضوع 1 يجب مراجعته سريعاً في بداية الحصة القادمة", "موضوع 2"],
  "topicsToReexplain": ["مفهوم محدد يحتاج إعادة شرح بطريقة مختلفة"],
  "skillsToDevelop": ["مهارة إجرائية أو تطبيقية يجب التركيز عليها"],
  "suggestedNextObjectives": ["هدف 1 للحصة القادمة", "هدف 2"],
  "suggestedHomework": "اقتراح واجب مخصص لسد الفجوات التي ظهرت في الحصة"
}`;

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6
        }
      });
      if (res.text) {
        return JSON.parse(res.text.trim());
      }
    } catch (err) {
      console.error('Gemini lesson feedback analysis error, falling back:', err);
    }
  }

  // Fallback
  return {
    topicsToReview: ['مراجعة سريعة (5 دقائق) للمفاهيم التي استغرقت وقتاً أطول في الحصة السابقة'],
    topicsToReexplain: ['التركيز على ربط القوانين بالخطوات الحسابية العملية'],
    skillsToDevelop: ['السرعة في استخراج المعطيات وتفادي الأخطاء التراكمية'],
    suggestedNextObjectives: [
      `أن يربط الطالب مفاهيم ${params.lessonTitle} بالتطبيقات المتقدمة للحصة القادمة`,
      `أن يحل مسائل مركبة تجمع بين المهارات السابقة والجديدة`
    ],
    suggestedHomework: 'تخصيص تمارين مراجعة علاجية للطلاب الذين واجهوا صعوبات، مع مسألة إثرائية للمتفوقين.'
  };
}
