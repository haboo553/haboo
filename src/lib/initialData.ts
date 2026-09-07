export const initialData = {
  "users": [
    {
      "id": "usr_teacher_demo_1",
      "name": "أ. أحمد الشناوي",
      "email": "teacher@mueen.com",
      "phone": "+966501234567",
      "role": "teacher",
      "status": "active",
      "createdAt": "2026-08-01T08:00:00Z",
      "lastLoginAt": "2026-09-07T19:07:37.289Z"
    },
    {
      "id": "usr_admin_master_1",
      "name": "مدير منصة مُعين",
      "email": "admin@mueen.com",
      "phone": "+966509999999",
      "role": "admin",
      "status": "active",
      "createdAt": "2026-01-01T00:00:00Z",
      "lastLoginAt": "2026-09-07T19:08:05.777Z"
    }
  ],
  "teachers": [
    {
      "userId": "usr_teacher_demo_1",
      "subject": "الرياضيات والفيزياء",
      "schoolOrCenter": "أكاديمية الرواد النموذجية",
      "bio": "معلم أول لمادة الرياضيات للثانوية العامة والمرحلة المتوسطة بخبرة 12 عامًا",
      "defaultClassDurationMinutes": 90,
      "stagePreference": "المرحلة الثانوية",
      "totalStudentsCount": 18,
      "totalGroupsCount": 3
    }
  ],
  "plans": [
    {
      "id": "trial",
      "nameAr": "تجربة مجانية",
      "nameEn": "Free Trial",
      "priceMonthly": 0,
      "priceYearly": 0,
      "currency": "SAR",
      "maxStudents": 25,
      "maxGroups": 3,
      "aiRequestsPerMonth": 30,
      "features": {
        "aiLessonAssistant": true,
        "aiStudentAnalysis": true,
        "aiGroupAnalysis": false,
        "pdfExport": true,
        "excelExport": true,
        "whatsappIntegration": true,
        "customBranding": false,
        "qrAttendance": true,
        "unlimitedReports": false,
        "prioritySupport": false
      }
    },
    {
      "id": "basic",
      "nameAr": "الباقة الأساسية",
      "nameEn": "Basic Plan",
      "priceMonthly": 79,
      "priceYearly": 790,
      "currency": "SAR",
      "maxStudents": 80,
      "maxGroups": 6,
      "aiRequestsPerMonth": 100,
      "features": {
        "aiLessonAssistant": true,
        "aiStudentAnalysis": true,
        "aiGroupAnalysis": false,
        "pdfExport": true,
        "excelExport": true,
        "whatsappIntegration": true,
        "customBranding": false,
        "qrAttendance": true,
        "unlimitedReports": true,
        "prioritySupport": false
      }
    },
    {
      "id": "pro",
      "nameAr": "الباقة الاحترافية",
      "nameEn": "Pro Plan",
      "priceMonthly": 149,
      "priceYearly": 1490,
      "currency": "SAR",
      "maxStudents": 250,
      "maxGroups": 15,
      "aiRequestsPerMonth": 500,
      "features": {
        "aiLessonAssistant": true,
        "aiStudentAnalysis": true,
        "aiGroupAnalysis": true,
        "pdfExport": true,
        "excelExport": true,
        "whatsappIntegration": true,
        "customBranding": true,
        "qrAttendance": true,
        "unlimitedReports": true,
        "prioritySupport": true
      }
    },
    {
      "id": "premium",
      "nameAr": "باقة النخبة والمراكز",
      "nameEn": "Premium Plan",
      "priceMonthly": 299,
      "priceYearly": 2990,
      "currency": "SAR",
      "maxStudents": 9999,
      "maxGroups": 9999,
      "aiRequestsPerMonth": 2000,
      "features": {
        "aiLessonAssistant": true,
        "aiStudentAnalysis": true,
        "aiGroupAnalysis": true,
        "pdfExport": true,
        "excelExport": true,
        "whatsappIntegration": true,
        "customBranding": true,
        "qrAttendance": true,
        "unlimitedReports": true,
        "prioritySupport": true
      }
    }
  ],
  "subscriptions": [
    {
      "id": "sub_demo_1",
      "userId": "usr_teacher_demo_1",
      "plan": "pro",
      "status": "active",
      "startDate": "2026-08-15T00:00:00Z",
      "endDate": "2026-11-15T00:00:00Z",
      "trialEndsAt": "2026-08-22T00:00:00Z",
      "aiUsageThisMonth": 42,
      "autoRenew": true
    }
  ],
  "groups": [
    {
      "id": "grp_1",
      "teacherId": "usr_teacher_demo_1",
      "name": "مجموعة العباقرة - 3 ثانوي (أ)",
      "subject": "رياضيات بحتة وتفاضل",
      "stage": "المرحلة الثانوية",
      "grade": "الصف الثالث الثانوي",
      "groupCode": "MUEEN-9X42",
      "classDays": [
        "sun",
        "tue",
        "thu"
      ],
      "startTime": "16:30",
      "endTime": "18:00",
      "location": "سنتر الفرسان - قاعة 101",
      "maxCapacity": 25,
      "active": true,
      "createdAt": "2026-08-10T10:00:00Z"
    },
    {
      "id": "grp_2",
      "teacherId": "usr_teacher_demo_1",
      "name": "مجموعة النخبة - 2 ثانوي (ب)",
      "subject": "جبر وتفاضل وحساب مثلثات",
      "stage": "المرحلة الثانوية",
      "grade": "الصف الثاني الثانوي",
      "groupCode": "MUEEN-4K88",
      "classDays": [
        "mon",
        "wed"
      ],
      "startTime": "18:15",
      "endTime": "19:45",
      "location": "قاعة البث التفاعلي - أونلاين",
      "maxCapacity": 20,
      "active": true,
      "createdAt": "2026-08-12T11:00:00Z"
    },
    {
      "id": "grp_3",
      "teacherId": "usr_teacher_demo_1",
      "name": "مجموعة المتميزين - 1 ثانوي (ج)",
      "subject": "رياضيات عامة",
      "stage": "المرحلة الثانوية",
      "grade": "الصف الأول الثانوي",
      "groupCode": "MUEEN-2Z19",
      "classDays": [
        "sat",
        "tue"
      ],
      "startTime": "15:00",
      "endTime": "16:30",
      "location": "معهد التفوق التعليمي",
      "maxCapacity": 30,
      "active": true,
      "createdAt": "2026-08-14T09:00:00Z"
    }
  ],
  "students": [
    {
      "id": "std_1",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "name": "محمد أحمد المنشاوي",
      "phone": "+966541112233",
      "parentName": "أحمد المنشاوي",
      "parentPhone": "+966549991122",
      "parentRelation": "father",
      "email": "mohamed.menshawy@example.com",
      "joinDate": "2026-08-15",
      "notes": "طالب مجتهد وسريع البديهة في المسائل الهندسية",
      "status": "active",
      "comprehensionLevel": "excellent",
      "learningSpeed": "fast",
      "performanceLevel": "top",
      "strengths": [
        "التفكير المنطقي",
        "سرعة حل مسائل التكامل",
        "المشاركة الفعالة"
      ],
      "weaknesses": [
        "التسرع في قراءة المعطيات في بعض الأحيان"
      ],
      "reviewNeeds": [
        "مسائل التطبيقات الهندسية على المشتقات"
      ],
      "attendanceRate": 95,
      "examsAverage": 92,
      "homeworkCompletionRate": 90,
      "consecutiveAbsences": 0
    },
    {
      "id": "std_2",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "name": "عبدالرحمن خالد العتيبي",
      "phone": "+966552223344",
      "parentName": "خالد العتيبي",
      "parentPhone": "+966558882233",
      "parentRelation": "father",
      "email": "abdulrahman.otaibi@example.com",
      "joinDate": "2026-08-15",
      "notes": "يحتاج تركيز إضافي على حفظ قوانين الدوال المثلثية",
      "status": "active",
      "comprehensionLevel": "average",
      "learningSpeed": "paced",
      "performanceLevel": "struggling",
      "strengths": [
        "الالتزام بالحضور والأدب العالي"
      ],
      "weaknesses": [
        "صعوبة في ربط المفاهيم الجبرية المركبة",
        "التردد في طرح الأسئلة"
      ],
      "reviewNeeds": [
        "أساسيات حساب المثلثات",
        "إعادة حل تمارين المشتقة الأولى"
      ],
      "attendanceRate": 75,
      "examsAverage": 64,
      "homeworkCompletionRate": 60,
      "consecutiveAbsences": 2
    },
    {
      "id": "std_3",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "name": "سارة طارق الغامدي",
      "phone": "+966563334455",
      "parentName": "منى عبدالكريم",
      "parentPhone": "+966567773344",
      "parentRelation": "mother",
      "email": "sara.ghamdi@example.com",
      "joinDate": "2026-08-16",
      "notes": "متميزة جدًا وتقدم ملخصات ممتازة لزملائها",
      "status": "active",
      "comprehensionLevel": "excellent",
      "learningSpeed": "fast",
      "performanceLevel": "top",
      "strengths": [
        "الدقة الحسابية",
        "تنظيم خطوات الحل",
        "حل المسائل غير النمطية"
      ],
      "weaknesses": [],
      "reviewNeeds": [
        "مسائل المستويات العليا في الهندسة الفراغية"
      ],
      "attendanceRate": 100,
      "examsAverage": 98,
      "homeworkCompletionRate": 100,
      "consecutiveAbsences": 0
    },
    {
      "id": "std_4",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "name": "يوسف حسام الدين",
      "phone": "+966574445566",
      "parentName": "حسام الدين فؤاد",
      "parentPhone": "+966576664455",
      "parentRelation": "father",
      "email": "youssef.hossam@example.com",
      "joinDate": "2026-08-18",
      "notes": "مستواه يتحسن باطراد مع المتابعة المستمرة",
      "status": "active",
      "comprehensionLevel": "good",
      "learningSpeed": "normal",
      "performanceLevel": "improving",
      "strengths": [
        "الرغبة القوية في التعلم",
        "تسليم الواجبات في موعدها"
      ],
      "weaknesses": [
        "إجراء العمليات الجبرية الطويلة بدون تدقيق"
      ],
      "reviewNeeds": [
        "قواعد التوزيع والتبسيط الجبري"
      ],
      "attendanceRate": 90,
      "examsAverage": 82,
      "homeworkCompletionRate": 85,
      "consecutiveAbsences": 0
    },
    {
      "id": "std_5",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_2",
      "name": "زياد فيصل القحطاني",
      "phone": "+966585556677",
      "parentName": "فيصل القحطاني",
      "parentPhone": "+966585559900",
      "parentRelation": "father",
      "joinDate": "2026-08-20",
      "status": "active",
      "comprehensionLevel": "good",
      "learningSpeed": "normal",
      "performanceLevel": "stable",
      "strengths": [
        "المشاركة في المناقشات الصفية"
      ],
      "weaknesses": [
        "الغياب في بعض الحصص المسائية"
      ],
      "reviewNeeds": [
        "حل متباينات القيمة المطلقة"
      ],
      "attendanceRate": 80,
      "examsAverage": 78,
      "homeworkCompletionRate": 75,
      "consecutiveAbsences": 0
    },
    {
      "id": "std_6",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_2",
      "name": "ريم إبراهيم السبيعي",
      "phone": "+966596667788",
      "parentName": "إبراهيم السبيعي",
      "parentPhone": "+966594448899",
      "parentRelation": "father",
      "joinDate": "2026-08-20",
      "status": "active",
      "comprehensionLevel": "excellent",
      "learningSpeed": "fast",
      "performanceLevel": "top",
      "strengths": [
        "الاستيعاب المباشر للنظريات"
      ],
      "weaknesses": [],
      "reviewNeeds": [],
      "attendanceRate": 100,
      "examsAverage": 94,
      "homeworkCompletionRate": 95,
      "consecutiveAbsences": 0
    }
  ],
  "initialAssessments": [
    {
      "id": "init_1",
      "studentId": "std_1",
      "teacherId": "usr_teacher_demo_1",
      "createdAt": "2026-08-16T10:00:00Z",
      "updatedAt": "2026-08-16T10:00:00Z",
      "ratings": {
        "comprehension": 5,
        "learningSpeed": 5,
        "focus": 5,
        "participation": 4,
        "problemSolving": 5,
        "retention": 5,
        "application": 5,
        "independence": 5,
        "homeworkCommitment": 5,
        "attendanceDiscipline": 5
      },
      "notes": {
        "strengths": "سرعة بديهة عالية، استيعاب سريع للقوانين الرياضية، دقة في الحسابات",
        "weaknesses": "التسرع أحياناً في قراءة المعطيات الطويلة",
        "currentDifficulties": "لا توجد صعوبات جوهرية",
        "teacherNotes": "طالب متميز جداً ومرشح لأعلى المراتب بالثانوية العامة",
        "expectedLevel": "متفوق (A+)",
        "topicsNeedingReview": "مسائل التحدي والتطبيقات الفيزيائية المتقدمة"
      }
    },
    {
      "id": "init_2",
      "studentId": "std_2",
      "teacherId": "usr_teacher_demo_1",
      "createdAt": "2026-08-16T11:00:00Z",
      "updatedAt": "2026-08-16T11:00:00Z",
      "ratings": {
        "comprehension": 3,
        "learningSpeed": 2,
        "focus": 2,
        "participation": 3,
        "problemSolving": 2,
        "retention": 3,
        "application": 3,
        "independence": 2,
        "homeworkCommitment": 2,
        "attendanceDiscipline": 2
      },
      "notes": {
        "strengths": "الاستجابة الجيدة عند الشرح الفردي وتفكيك المسائل لخطوات بسيطة",
        "weaknesses": "تشتت الانتباه والغياب المتكرر وتراكم الدروس",
        "currentDifficulties": "صعوبة في ربط المفاهيم السابقة بالتطبيقات الحالية",
        "teacherNotes": "يحتاج إلى خطة متابعة حثيثة وتواصل دوري مع ولي الأمر لضبط الحضور",
        "expectedLevel": "متوسط يحتاج دعم",
        "topicsNeedingReview": "أساسيات التحليل وقوانين المثلثات والاشتقاق الأساسي"
      }
    }
  ],
  "placementTests": [
    {
      "id": "plc_1",
      "studentId": "std_1",
      "teacherId": "usr_teacher_demo_1",
      "title": "اختبار تحديد المستوى للرياضيات - المرحلة الثانوية",
      "subject": "رياضيات بحتة",
      "stage": "المرحلة الثانوية",
      "grade": "الصف الثالث الثانوي",
      "topicsCovered": [
        "الجبر وحل المعادلات",
        "الهندسة والتحليل",
        "حساب المثلثات",
        "مقدمة التفاضل"
      ],
      "questions": [
        {
          "id": 1,
          "tier": 1,
          "tierName": "المستوى الأول: أساسيات",
          "questionText": "ما هي مشتقة الدالة د(س) = 5س³ - 2س + 7 ؟",
          "options": [
            "أ) 15س² - 2",
            "ب) 15س² + 7",
            "ج) 5س² - 2",
            "د) 15س³ - 2"
          ],
          "correctAnswer": "أ) 15س² - 2",
          "studentAnswer": "أ) 15س² - 2",
          "points": 4,
          "difficulty": "easy",
          "measuredSkill": "قواعد الاشتقاق لكثيرات الحدود",
          "explanation": "مشتقة س³ هي 3س² (ضرب 5 = 15س²)، ومشتقة -2س هي -2، والثابت 7 مشتقته صفر."
        },
        {
          "id": 2,
          "tier": 2,
          "tierName": "المستوى الثاني: الفهم والاستيعاب",
          "questionText": "إذا كان ميل المماس لمنحنى دالة عند س = 2 يساوي صفر، فماذا يعني ذلك هندسياً؟",
          "options": [
            "أ) المماس يوازي محور السينات (أفقي)",
            "ب) المماس يوازي محور الصادات (رأسي)",
            "ج) الدالة غير متصلة عند س=2",
            "د) المنحنى يقطع المحور الصادي"
          ],
          "correctAnswer": "أ) المماس يوازي محور السينات (أفقي)",
          "studentAnswer": "أ) المماس يوازي محور السينات (أفقي)",
          "points": 4,
          "difficulty": "easy",
          "measuredSkill": "التفسير الهندسي للمشتقة الأولى",
          "explanation": "ميل المماس = صفر يعني أن المماس خط مستقيم أفقي موازٍ لمحور السينات."
        },
        {
          "id": 3,
          "tier": 3,
          "tierName": "المستوى الثالث: التطبيق العملي",
          "questionText": "أوجد معادلة المماس لمنحنى ص = س² + 3 عند النقطة (1، 4):",
          "options": [
            "أ) ص = 2س + 2",
            "ب) ص = 2س + 4",
            "ج) ص = س + 3",
            "د) ص = 4س"
          ],
          "correctAnswer": "أ) ص = 2س + 2",
          "studentAnswer": "أ) ص = 2س + 2",
          "points": 4,
          "difficulty": "medium",
          "measuredSkill": "إيجاد معادلة المماس لمنحنى دالة تربيعية",
          "explanation": "المشتقة صَ = 2س. عند س = 1، الميل م = 2. معادلة المماس: ص - 4 = 2(س - 1) => ص = 2س + 2."
        },
        {
          "id": 4,
          "tier": 4,
          "tierName": "المستوى الرابع: التفكير وحل المشكلات",
          "questionText": "جسيم يتحرك في خط مستقيم وفق العلاقة ف(ن) = ن³ - 6ن² + 9ن. متى يسكن الجسيم لحظياً؟",
          "options": [
            "أ) عند ن = 1 ثانية ون = 3 ثوانٍ",
            "ب) عند ن = 2 ثانية فقط",
            "ج) عند ن = 0 ثانية",
            "د) عند ن = 3 ثوانٍ فقط"
          ],
          "correctAnswer": "أ) عند ن = 1 ثانية ون = 3 ثوانٍ",
          "studentAnswer": "أ) عند ن = 1 ثانية ون = 3 ثوانٍ",
          "points": 4,
          "difficulty": "hard",
          "measuredSkill": "التطبيقات الفيزيائية للمشتقة (السرعة اللحظية)",
          "explanation": "السرعة ع(ن) = فَ(ن) = 3ن² - 12ن + 9. بوضع ع(ن) = 0: 3(ن² - 4ن + 3) = 0 => (ن - 1)(ن - 3) = 0 => ن = 1 أو ن = 3."
        },
        {
          "id": 5,
          "tier": 5,
          "tierName": "المستوى الخامس: أسئلة متقدمة وتحدي",
          "questionText": "إذا كانت د(س) دالة قابلة للاشتقاق وتحقق د(س + ص) = د(س) · د(ص) لكل س، ص وكان دَ(0) = 2، فما قيمة دَ(س)؟",
          "options": [
            "أ) 2 د(س)",
            "ب) [د(س)]²",
            "ج) د(2س)",
            "د) 0"
          ],
          "correctAnswer": "أ) 2 د(س)",
          "studentAnswer": "أ) 2 د(س)",
          "points": 4,
          "difficulty": "advanced",
          "measuredSkill": "تعريف المشتقة بالرموز والخواص الدالية المتقدمة",
          "explanation": "باستخدام تعريف المشتقة دَ(س) = نهاية [د(س+هـ) - د(س)] / هـ = د(س) · نهاية [د(هـ) - 1] / هـ = د(س) · دَ(0) = 2 د(س)."
        }
      ],
      "status": "completed",
      "totalScore": 20,
      "earnedScore": 20,
      "masteryPercentage": 100,
      "tierScores": {
        "basics": {
          "score": 4,
          "max": 4,
          "level": "ممتاز"
        },
        "comprehension": {
          "score": 4,
          "max": 4,
          "level": "ممتاز"
        },
        "application": {
          "score": 4,
          "max": 4,
          "level": "ممتاز"
        },
        "problemSolving": {
          "score": 4,
          "max": 4,
          "level": "ممتاز"
        },
        "advanced": {
          "score": 4,
          "max": 4,
          "level": "ممتاز"
        }
      },
      "strengths": [
        "إتقان شامل للأساسيات والقوانين",
        "قدرة عالية على النمذجة الرياضية",
        "حل مسائل التفكير المجرد"
      ],
      "weaknesses": [],
      "topicsForReview": [
        "مسائل القطوع المخروطية المركبة"
      ],
      "createdAt": "2026-08-16T12:00:00Z",
      "completedAt": "2026-08-16T12:25:00Z"
    }
  ],
  "learningProfiles": [
    {
      "id": "lp_1",
      "studentId": "std_1",
      "teacherId": "usr_teacher_demo_1",
      "basicsLevel": "ممتاز",
      "comprehensionLevel": "ممتاز",
      "applicationLevel": "ممتاز",
      "problemSolvingLevel": "ممتاز",
      "learningPace": "مرتفعة جداً وسريعة الاستيعاب",
      "academicStrengths": [
        "البنية المنطقية الرياضية",
        "سرعة إيجاد الحلول البديلة",
        "الالتزام والتركيز المستمر"
      ],
      "focusAreas": [
        "مسائل التحدي الأولمبية ومسائل القدرات المتقدمة"
      ],
      "recommendedReviewTopics": [
        "تطبيقات القيم العظمى والصغرى المفتوحة"
      ],
      "educationalSummary": "يتمتع الطالب بملف تعليمي استثنائي وأداء أكاديمي متفوق في كافة محاور الرياضيات. يستجيب بسرعة للأنشطة الإثرائية ولديه دافعية ذاتية ممتازة.",
      "generatedAt": "2026-08-16T12:30:00Z",
      "updatedAt": "2026-08-16T12:30:00Z"
    }
  ],
  "placementRecommendations": [
    {
      "id": "rec_1",
      "studentId": "std_1",
      "teacherId": "usr_teacher_demo_1",
      "suggestedGroupId": "grp_1",
      "suggestedGroupName": "مجموعة العباقرة - 3 ثانوي (أ)",
      "compatibilityPercentage": 96,
      "reason": "توافق ممتاز بين المستوى المتقدم للطالب ومعدل سرعة الشرح وعمق مسائل مجموعة العباقرة.",
      "status": "accepted",
      "createdAt": "2026-08-16T12:35:00Z"
    }
  ],
  "attendance": [
    {
      "id": "att_1",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "date": "2026-08-30",
      "studentId": "std_1",
      "status": "present",
      "markedAt": "2026-08-30T16:35:00Z",
      "method": "manual"
    },
    {
      "id": "att_2",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "date": "2026-08-30",
      "studentId": "std_2",
      "status": "absent",
      "note": "لم يحضر بدون عذر مسبق",
      "markedAt": "2026-08-30T16:35:00Z",
      "method": "manual"
    },
    {
      "id": "att_3",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "date": "2026-08-30",
      "studentId": "std_3",
      "status": "present",
      "markedAt": "2026-08-30T16:35:00Z",
      "method": "manual"
    },
    {
      "id": "att_4",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "date": "2026-08-30",
      "studentId": "std_4",
      "status": "late",
      "note": "تأخر 15 دقيقة بسبب الازدحام",
      "markedAt": "2026-08-30T16:45:00Z",
      "method": "manual"
    },
    {
      "id": "att_5",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "date": "2026-09-01",
      "studentId": "std_1",
      "status": "present",
      "markedAt": "2026-09-01T16:35:00Z",
      "method": "manual"
    },
    {
      "id": "att_6",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "date": "2026-09-01",
      "studentId": "std_2",
      "status": "absent",
      "note": "تكرار الغياب للمرة الثانية على التوالي",
      "markedAt": "2026-09-01T16:35:00Z",
      "method": "manual"
    },
    {
      "id": "att_7",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "date": "2026-09-01",
      "studentId": "std_3",
      "status": "present",
      "markedAt": "2026-09-01T16:35:00Z",
      "method": "manual"
    },
    {
      "id": "att_8",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "date": "2026-09-01",
      "studentId": "std_4",
      "status": "present",
      "markedAt": "2026-09-01T16:35:00Z",
      "method": "manual"
    }
  ],
  "lessons": [
    {
      "id": "lsn_1",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "title": "قواعد الاشتقاق المتقدمة والاشتقاق الضمني",
      "subject": "تفاضل وتكامل",
      "date": "2026-09-02",
      "dayOfWeek": "wed",
      "startTime": "16:30",
      "endTime": "18:00",
      "location": "سنتر الفرسان - قاعة 101",
      "status": "scheduled",
      "notes": "التركيز على إيجاد معادلة المماس والعمودي للمنحنيات",
      "hasPreparation": true,
      "isRecurring": true,
      "createdAt": "2026-08-25T10:00:00Z"
    },
    {
      "id": "lsn_2",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_2",
      "title": "الدوال المثلثية للزوايا المنتسبة والقوانين الأساسية",
      "subject": "حساب مثلثات",
      "date": "2026-09-02",
      "dayOfWeek": "wed",
      "startTime": "18:15",
      "endTime": "19:45",
      "location": "قاعة البث التفاعلي - أونلاين",
      "status": "scheduled",
      "notes": "شرح دائرة الوحدة وتطبيقاتها",
      "hasPreparation": true,
      "isRecurring": true,
      "createdAt": "2026-08-25T10:00:00Z"
    },
    {
      "id": "lsn_3",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_3",
      "title": "تحديد نوع جذري المعادلة التربيعية والمميز",
      "subject": "جبر",
      "date": "2026-09-03",
      "dayOfWeek": "thu",
      "startTime": "15:00",
      "endTime": "16:30",
      "location": "معهد التفوق التعليمي",
      "status": "scheduled",
      "notes": "حل 10 مسائل تدريبية مع الطلاب",
      "hasPreparation": false,
      "isRecurring": true,
      "createdAt": "2026-08-26T10:00:00Z"
    },
    {
      "id": "lsn_4",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "title": "المعدلات الزمنية المرتبطة - الجزء الأول",
      "subject": "تفاضل وتكامل",
      "date": "2026-09-04",
      "dayOfWeek": "fri",
      "startTime": "16:30",
      "endTime": "18:00",
      "location": "سنتر الفرسان - قاعة 101",
      "status": "scheduled",
      "notes": "مسائل السلم والمخروط والظل",
      "hasPreparation": false,
      "isRecurring": true,
      "createdAt": "2026-08-26T10:00:00Z"
    }
  ],
  "lessonPreparations": [
    {
      "id": "prep_1",
      "lessonId": "lsn_1",
      "teacherId": "usr_teacher_demo_1",
      "lessonTitle": "قواعد الاشتقاق المتقدمة والاشتقاق الضمني",
      "subject": "رياضيات بحتة وتفاضل",
      "stage": "المرحلة الثانوية",
      "grade": "الصف الثالث الثانوي",
      "groupId": "grp_1",
      "groupName": "مجموعة العباقرة - 3 ثانوي (أ)",
      "durationMinutes": 90,
      "studentCount": 4,
      "groupLevel": "متقدم",
      "unit": "الوحدة الأولى: التفاضل والتكامل وتطبيقاته",
      "educationalObjectives": [
        "أن يتقن الطالب اشتقاق الدوال المركبة باستخدام قاعدة السلسلة",
        "أن يطبق الطالب تقنية الاشتقاق الضمني على العلاقات غير الصريحة",
        "أن يستنتج الطالب معادلة المماس والعمودي عند نقطة معطاة بدقة"
      ],
      "previousCoverage": "قواعد اشتقاق الدوال المثلثية والدوال كثيرة الحدود",
      "targetSkills": [
        "الاشتقاق الضمني",
        "إيجاد ميل المماس والعمودي",
        "النمذجة الرياضية"
      ],
      "warmupHook": {
        "durationMinutes": 5,
        "activity": "سؤال افتتاحي سريع على السبورة: كيف نشتق العلاقة س² + ص² = 25 إذا تعذر فصل ص؟"
      },
      "summaryExplanation": "الاشتقاق الضمني يُستخدم عندما يصعب أو يتعذر فصل المتغير التابع y عن المتغير المستقل x. نقوم باشتقاق طرفي المعادلة بالنسبة إلى x مع مراعاة أن مشتقة y هي dy/dx، ثم نجمع الحدود التي تحتوي على dy/dx في طرف وباقي الحدود في الطرف الآخر لإيجاد المشتقة بدلالة المتغيرين.",
      "lessonElements": [
        "التهيئة والمراجعة السابقة (5 دقائق)",
        "الشرح المفاهيمي وبناء القاعدة (25 دقيقة)",
        "أمثلة متدرجة وتطبيقات امتحانية (30 دقيقة)",
        "المجهود الصفي والنشاط التفاعلي (15 دقيقة)",
        "التقويم السريع وتكليف الواجبات المتمايزة (15 دقيقة)"
      ],
      "gradedExamples": [
        {
          "level": "easy",
          "title": "المستوى السهل: اشتقاق صريح مباشر",
          "problem": "أوجد دَ(س) للدالة د(س) = (2س³ + 1)⁴",
          "solution": "باستخدام قاعدة السلسلة: دَ(س) = 4(2س³ + 1)³ × (6س²) = 24س²(2س³ + 1)³"
        },
        {
          "level": "medium",
          "title": "المستوى المتوسط: اشتقاق ضمني لدائرة",
          "problem": "أوجد dy/dx للمنحنى x² + y² = 100 عند النقطة (6, 8)",
          "solution": "باشتقاق الطرفين: 2x + 2y(dy/dx) = 0 => dy/dx = -x/y = -6/8 = -0.75"
        },
        {
          "level": "advanced",
          "title": "المستوى المتقدم: اشتقاق ضمني لحاصل ضرب ومماس",
          "problem": "إذا كان x² y + xy² = 6، فأوجد معادلة المماس للمنحنى عند النقطة (1, 2)",
          "solution": "باشتقاق الطرفين بالنسبة لـ x: (2xy + x² y') + (y² + 2xy y') = 0 => y'(x² + 2xy) = -(2xy + y²) => بالتعويض: y'(1 + 4) = -(4 + 4) => y' = -8/5. معادلة المماس: y - 2 = -8/5(x - 1)"
        }
      ],
      "interactiveActivities": [
        "مسابقة البطاقات السريعة: إيجاد ميل المماس لمنحنى الدائرة x² + y² = 25 عند (3, 4)",
        "تحدي \"اكتشف الخطأ\": عرض حل به خطأ شائع في تطبيق قاعدة السلسلة وتصحيحه"
      ],
      "comprehensionQuestions": [
        {
          "question": "لماذا نضرب بـ (dy/dx) عند اشتقاق أي حد يحتوي على y بالنسبة إلى x؟",
          "suggestedAnswer": "لأن y دالة في المتغير x، وبحسب قاعدة السلسلة فإن مشتقة f(y) بالنسبة إلى x هي f'(y) · y'.",
          "checkTiming": "أثناء الشرح بعد المثال الأول"
        },
        {
          "question": "ما العلاقة الهندسية بين ميل المماس وميل العمودي عند نفس النقطة؟",
          "suggestedAnswer": "حاصل ضرب ميلهما يساوي -1 (أي ميل العمودي هو مقلوب ميل المماس بعكس الإشارة بشرط ألا يكون أي منهما صفراً).",
          "checkTiming": "قبل حل المثال المتقدم"
        }
      ],
      "practicalApplication": {
        "exercises": [
          "تمرين 1: أوجد ميل المماس للمنحنى س³ + ص³ = 3س ص عند (2، 1)",
          "تمرين 2: أثبت أن المماس للمنحنى ص = جذر(س) عند النقطة (4، 2) يقطع محور السينات في النقطة (-4، 0)"
        ]
      },
      "quickAssessmentQuestions": [
        {
          "question": "إذا كان x² + y² = 100، فما قيمة dy/dx عند النقطة (6, 8)؟",
          "suggestedAnswer": "dy/dx = -x/y = -6/8 = -0.75"
        },
        {
          "question": "ما هو ميل العمودي لمنحنى دالة إذا كان ميل المماس يساوي 2/3؟",
          "suggestedAnswer": "ميل العمودي = -3/2"
        }
      ],
      "conclusionSummary": "الاشتقاق الضمني أداة قوية للتعامل مع المنحنيات الهندسية المعقدة، والخطوة الذهبية هي جمع حدود المشتقة في طرف وأخذها كعامل مشترك.",
      "inClassEffort": {
        "taskName": "مهمة حل المسألة المركبة وتحديد ميل المماس",
        "description": "تطبيق مباشر خلال 10 دقائق لحساب ميل المماس لمنحنى قطوع ضمني ومقارنة الحل مع الزميل.",
        "studentRequirement": "كتابة خطوات الاشتقاق بالتفصيل واستخراج قيمة الميل وإيجاد نقطة التقاطع مع محور الصادات.",
        "expectedTimeMinutes": 10,
        "difficulty": "medium",
        "evaluationMethod": "تقييم فوري بالتدقيق الثنائي بين الطلاب وتأكيد المدرس"
      },
      "homeworkDescription": "واجب متدرج الصعوبة يغطي الأساسيات ومسائل التحدي الامتحانية.",
      "differentiatedHomework": {
        "remedial": {
          "id": "hw_diff_rem_1",
          "type": "remedial",
          "title": "الواجب العلاجي (تثبيت قواعد الاشتقاق الأساسية)",
          "targetAudience": "للطلاب الذين يحتاجون تثبيت قاعدة السلسلة",
          "questions": [
            {
              "number": 1,
              "text": "أوجد مشتقة ص = (3س + 2)⁵ بالنسبة إلى س.",
              "type": "direct",
              "points": 5,
              "difficulty": "easy",
              "expectedAnswer": "صَ = 5(3س + 2)⁴ × 3 = 15(3س + 2)⁴"
            },
            {
              "number": 2,
              "text": "إذا كان س² + ص² = 16، أوجد صَ بدلالة س وَ ص.",
              "type": "direct",
              "points": 5,
              "difficulty": "easy",
              "expectedAnswer": "صَ = -س / ص"
            }
          ],
          "estimatedTimeMinutes": 20,
          "dueDate": "2026-09-04"
        },
        "core": {
          "id": "hw_diff_core_1",
          "type": "core",
          "title": "الواجب الأساسي (الاشتقاق الضمني ومعادلات المماس)",
          "targetAudience": "لجميع طلاب المجموعة",
          "questions": [
            {
              "number": 1,
              "text": "أوجد معادلة المماس للمنحنى س² + 2س ص + ص² = 9 عند النقطة (1، 2).",
              "type": "applied",
              "points": 5,
              "difficulty": "medium",
              "expectedAnswer": "ص - 2 = -1(س - 1) => س + ص = 3"
            },
            {
              "number": 2,
              "text": "أوجد النقاط الواقعة على المنحنى ص² = 4س والتي يكون عندها المماس موازياً للمستقيم 2س - ص + 5 = 0.",
              "type": "applied",
              "points": 5,
              "difficulty": "medium",
              "expectedAnswer": "النقطة هي (1/4، 1)"
            }
          ],
          "estimatedTimeMinutes": 30,
          "dueDate": "2026-09-04"
        },
        "advanced": {
          "id": "hw_diff_adv_1",
          "type": "advanced",
          "title": "الواجب الإثرائي المتقدم (مسائل المتفوقين والتطبيقات الهندسية)",
          "targetAudience": "للطلاب المتفوقين (تحدي التفكير)",
          "questions": [
            {
              "number": 1,
              "text": "أثبت أن مماس المنحنى س^ن + ص^ن = أ^ن عند أي نقطة يصنع مع محوري الإحداثيات مثلثاً تظل مساحته ثابتة عندما ن = 2/3.",
              "type": "thinking",
              "points": 10,
              "difficulty": "hard",
              "expectedAnswer": "إثبات هندسي باستخدام معادلة المماس والاستدلال بمجموع مقطعي المحورين."
            }
          ],
          "estimatedTimeMinutes": 40,
          "dueDate": "2026-09-04"
        }
      },
      "teacherPrivateNotes": "تنبيه الطالب عبدالرحمن للتركيز على مشتقة حاصل الضرب أثناء الاشتقاق الضمني",
      "aiGenerated": true,
      "isLibraryTemplate": true,
      "tags": [
        "تفاضل",
        "3 ثانوي",
        "اشتقاق ضمني",
        "مماس وعمودي"
      ],
      "createdAt": "2026-08-30T12:00:00Z",
      "updatedAt": "2026-08-30T12:00:00Z"
    }
  ],
  "lessonFeedbackRecords": [
    {
      "id": "fb_1",
      "lessonId": "lsn_1",
      "teacherId": "usr_teacher_demo_1",
      "objectivesAchieved": "fully",
      "comprehensionRating": 4,
      "encounteredDifficulties": "تردد بعض الطلاب في تطبيق قاعدة مشتقة حاصل الضرب أثناء الاشتقاق الضمني",
      "studentsNeedingHelp": [
        "std_2"
      ],
      "topPerformingStudents": [
        "std_1",
        "std_4"
      ],
      "teacherNotes": "حصة ممتازة وتفاعل نشط، نحتاج مراجعة 5 دقائق للحصة القادمة لتثبيت مشتقة حاصل الضرب.",
      "nextLessonAiSuggestions": {
        "topicsToReview": [
          "مشتقة حاصل ضرب دالتين صريحتين أو ضمنيتين"
        ],
        "topicsToReexplain": [
          "التعامل مع الحدود التي تحوي متغيرين مضروبين مثل س² ص"
        ],
        "skillsToDevelop": [
          "السرعة في إيجاد معادلة المماس والعمودي بدقة"
        ],
        "suggestedNextObjectives": [
          "أن يطبق الطالب المشتقات العليا للعلاقات الضمنية",
          "أن يحل مسائل المعدلات الزمنية المرتبطة"
        ],
        "suggestedHomework": "واجب علاجي على حاصل ضرب المتغيرات الضمنية وواجب إثرائي على المعدلات الزمنية"
      },
      "recordedAt": "2026-09-01T18:05:00Z"
    }
  ],
  "exams": [
    {
      "id": "ex_1",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "title": "اختبار شهر أغسطس - تفاضل وتطبيقات هندسية",
      "subject": "رياضيات بحتة",
      "type": "monthly",
      "date": "2026-08-28",
      "maxScore": 20,
      "passingScore": 10,
      "topicsCovered": [
        "النهايات",
        "الاتصال",
        "مشتقات الدوال المثلثية"
      ],
      "notes": "اختبار معياري لتقييم الاستيعاب الأساسي للوحدة الأولى",
      "createdAt": "2026-08-20T09:00:00Z"
    },
    {
      "id": "ex_2",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "title": "كويز سريع 1 - الاشتقاق المتسلسل",
      "subject": "رياضيات بحتة",
      "type": "weekly",
      "date": "2026-08-22",
      "maxScore": 10,
      "passingScore": 5,
      "topicsCovered": [
        "قاعدة السلسلة"
      ],
      "createdAt": "2026-08-15T09:00:00Z"
    }
  ],
  "examResults": [
    {
      "id": "res_1",
      "examId": "ex_1",
      "studentId": "std_1",
      "teacherId": "usr_teacher_demo_1",
      "score": 19,
      "percentage": 95,
      "rank": 2,
      "feedback": "إجابة نموذجية ممتازة مع تنظيم رائع للخطوات",
      "gradedAt": "2026-08-29T14:00:00Z"
    },
    {
      "id": "res_2",
      "examId": "ex_1",
      "studentId": "std_2",
      "teacherId": "usr_teacher_demo_1",
      "score": 12,
      "percentage": 60,
      "rank": 4,
      "feedback": "تحتاج لمراجعة حساب مشتقات الدوال المثلثية المركبة",
      "gradedAt": "2026-08-29T14:00:00Z"
    },
    {
      "id": "res_3",
      "examId": "ex_1",
      "studentId": "std_3",
      "teacherId": "usr_teacher_demo_1",
      "score": 20,
      "percentage": 100,
      "rank": 1,
      "feedback": "الدرجة النهائية عن جدارة واستحقاق، أحسنتِ!",
      "gradedAt": "2026-08-29T14:00:00Z"
    },
    {
      "id": "res_4",
      "examId": "ex_1",
      "studentId": "std_4",
      "teacherId": "usr_teacher_demo_1",
      "score": 16.5,
      "percentage": 82.5,
      "rank": 3,
      "feedback": "أداء جيد جدًا وتطور ملحوظ عن الاختبار السابق",
      "gradedAt": "2026-08-29T14:00:00Z"
    }
  ],
  "homework": [
    {
      "id": "hw_1",
      "teacherId": "usr_teacher_demo_1",
      "groupId": "grp_1",
      "title": "واجب 3: مسائل على معادلة المماس والعمودي",
      "description": "حل المسائل من 1 إلى 8 صفحة 52، مع رسم تخطيطي للمنحنى عند النقطة المعطاة.",
      "assignedDate": "2026-08-30",
      "dueDate": "2026-09-03",
      "maxPoints": 10,
      "createdAt": "2026-08-30T17:00:00Z"
    }
  ],
  "homeworkSubmissions": [
    {
      "id": "subm_1",
      "homeworkId": "hw_1",
      "studentId": "std_1",
      "teacherId": "usr_teacher_demo_1",
      "status": "completed",
      "grade": 10,
      "teacherFeedback": "حل دقيق وخطوات واضحة",
      "submissionDate": "2026-09-01"
    },
    {
      "id": "subm_2",
      "homeworkId": "hw_1",
      "studentId": "std_2",
      "teacherId": "usr_teacher_demo_1",
      "status": "late",
      "grade": 6,
      "teacherFeedback": "تم التسليم متأخراً مع نقص في حل المسألة 7 و 8",
      "submissionDate": "2026-09-02"
    },
    {
      "id": "subm_3",
      "homeworkId": "hw_1",
      "studentId": "std_3",
      "teacherId": "usr_teacher_demo_1",
      "status": "completed",
      "grade": 10,
      "teacherFeedback": "ممتاز كامل الدرجة",
      "submissionDate": "2026-08-31"
    },
    {
      "id": "subm_4",
      "homeworkId": "hw_1",
      "studentId": "std_4",
      "teacherId": "usr_teacher_demo_1",
      "status": "submitted",
      "submissionDate": "2026-09-02"
    }
  ],
  "evaluations": [
    {
      "id": "eval_1",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_1",
      "evaluationDate": "2026-08-31",
      "academicPerformance": "excellent",
      "understanding": "excellent",
      "participation": "excellent",
      "homeworkQuality": "very_good",
      "attendanceDiscipline": "excellent",
      "overallProgress": "rapid_progress",
      "teacherNotes": "طالب قيادي وله مستقبل باهر في التخصصات الهندسية",
      "recommendations": "إعطاؤه أسئلة تحدي إضافية من أولمبياد الرياضيات"
    },
    {
      "id": "eval_2",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_2",
      "evaluationDate": "2026-08-31",
      "academicPerformance": "good",
      "understanding": "needs_improvement",
      "participation": "good",
      "homeworkQuality": "needs_improvement",
      "attendanceDiscipline": "needs_improvement",
      "overallProgress": "regressing",
      "teacherNotes": "تراجع مستواه مؤخراً مع تكرار الغياب، يحتاج تواصل فوري مع ولي الأمر",
      "recommendations": "جلسة تقوية فردية ومراجعة مكثفة لقوانين التفاضل"
    }
  ],
  "notes": [
    {
      "id": "not_1",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_2",
      "type": "educational",
      "content": "يعاني من صعوبة في تطبيق قانون مشتقة قسمة دالتين عندما يكون المقام جذرياً.",
      "date": "2026-08-28",
      "time": "17:45",
      "isShareableWithParent": true
    },
    {
      "id": "not_2",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_2",
      "type": "private",
      "content": "ملاحظة خاصة: يبدو مشتتاً خلال الحصة الأخيرة، سأتحقق مما إذا كان هناك ضغط دراسي خارجي.",
      "date": "2026-08-30",
      "time": "18:10",
      "isShareableWithParent": false
    }
  ],
  "behaviorRecords": [
    {
      "id": "beh_1",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_2",
      "type": "missing_homework",
      "description": "لم يقم بتسليم الواجب المطلوب في الموعد المحدد مرتين متتاليتين",
      "teacherActionTaken": "تنبيه شفهي وإعطاء مهلة إضافية 24 ساعة",
      "date": "2026-08-30",
      "severity": "medium",
      "sharedWithParent": false
    }
  ],
  "reports": [
    {
      "id": "rep_1",
      "teacherId": "usr_teacher_demo_1",
      "type": "student",
      "targetId": "std_1",
      "title": "تقرير الأداء الأكاديمي لشهر أغسطس - محمد أحمد",
      "generatedDate": "2026-09-01",
      "period": "أغسطس 2026",
      "summaryText": "أظهر الطالب محمد أداءً استثنائياً خلال هذا الشهر بنسبة حضور 95% ومتوسط درجات اختبارات 92%.",
      "metrics": {
        "attendanceRate": 95,
        "examsAverage": 92,
        "homeworkCompletionRate": 90,
        "rankInGroup": "الثاني"
      },
      "recommendations": [
        "الاستمرار على نفس الوتيرة في حل الواجبات",
        "التدرب على مسائل المستويات العليا لتعزيز السرعة في حل الاختبارات المحددة بزمن"
      ]
    }
  ],
  "notifications": [
    {
      "id": "notif_1",
      "userId": "usr_teacher_demo_1",
      "title": "تنبيه غياب متكرر",
      "message": "الطالب عبدالرحمن العتيبي غاب حصتين متتاليتين في مجموعة 3 ثانوي (أ).",
      "type": "absence_alert",
      "read": false,
      "link": "/students/std_2",
      "createdAt": "2026-09-01T17:00:00Z"
    },
    {
      "id": "notif_2",
      "userId": "usr_teacher_demo_1",
      "title": "حصة قادمة اليوم",
      "message": "لديك حصة \"قواعد الاشتقاق المتقدمة\" لمجموعة 3 ثانوي (أ) الساعة 04:30 م.",
      "type": "lesson_alert",
      "read": false,
      "link": "/schedule",
      "createdAt": "2026-09-02T08:00:00Z"
    },
    {
      "id": "notif_3",
      "userId": "usr_teacher_demo_1",
      "title": "استخدام المساعد الذكي",
      "message": "تم توليد تحضير الدرس بواسطة AI بنجاح وجاهز للمراجعة والطباعة.",
      "type": "system_alert",
      "read": true,
      "createdAt": "2026-08-30T12:05:00Z"
    }
  ],
  "auditLogs": [
    {
      "id": "aud_1788808085777_wmdng",
      "userId": "usr_admin_master_1",
      "userName": "مدير منصة مُعين",
      "action": "LOGIN",
      "entityType": "User",
      "details": "تسجيل دخول ناجح للمنصة",
      "timestamp": "2026-09-07T19:08:05.777Z"
    },
    {
      "id": "aud_1",
      "userId": "usr_teacher_demo_1",
      "userName": "أ. أحمد الشناوي",
      "action": "CREATE_EXAM",
      "entityType": "Exam",
      "entityId": "ex_1",
      "details": "إنشاء اختبار شهر أغسطس لمجموعة 3 ثانوي (أ)",
      "timestamp": "2026-08-20T09:00:00Z"
    },
    {
      "id": "aud_2",
      "userId": "usr_teacher_demo_1",
      "userName": "أ. أحمد الشناوي",
      "action": "MARK_ATTENDANCE",
      "entityType": "Attendance",
      "details": "تسجيل حضور 4 طلاب لمجموعة 3 ثانوي (أ)",
      "timestamp": "2026-09-01T16:35:00Z"
    }
  ],
  "studentLessonBilling": [
    {
      "id": "bil_1",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_1",
      "groupId": "grp_1",
      "lessonId": "les_1",
      "title": "حصة التفاضل والتكامل 1",
      "date": "2026-08-25",
      "amountDue": 100,
      "amountPaid": 100,
      "balance": 0,
      "status": "paid",
      "paymentMethod": "cash",
      "paymentDate": "2026-08-25",
      "notes": "تم السداد نقدًا في بداية الحصة",
      "createdAt": "2026-08-25T16:00:00Z",
      "updatedAt": "2026-08-25T16:00:00Z"
    },
    {
      "id": "bil_2",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_1",
      "groupId": "grp_1",
      "lessonId": "les_2",
      "title": "حصة التفاضل والتكامل 2",
      "date": "2026-09-01",
      "amountDue": 100,
      "amountPaid": 0,
      "balance": 100,
      "status": "unpaid",
      "createdAt": "2026-09-01T16:00:00Z",
      "updatedAt": "2026-09-01T16:00:00Z"
    },
    {
      "id": "bil_3",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_2",
      "groupId": "grp_1",
      "lessonId": "les_1",
      "title": "حصة التفاضل والتكامل 1",
      "date": "2026-08-25",
      "amountDue": 100,
      "amountPaid": 100,
      "balance": 0,
      "status": "paid",
      "paymentMethod": "bank_transfer",
      "paymentDate": "2026-08-25",
      "createdAt": "2026-08-25T16:00:00Z",
      "updatedAt": "2026-08-25T16:00:00Z"
    },
    {
      "id": "bil_4",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_2",
      "groupId": "grp_1",
      "lessonId": "les_2",
      "title": "حصة التفاضل والتكامل 2",
      "date": "2026-09-01",
      "amountDue": 100,
      "amountPaid": 50,
      "balance": 50,
      "status": "partial",
      "paymentMethod": "cash",
      "paymentDate": "2026-09-01",
      "notes": "دفع 50 ومتبقي 50 للحصة القادمة",
      "createdAt": "2026-09-01T16:00:00Z",
      "updatedAt": "2026-09-01T16:00:00Z"
    },
    {
      "id": "bil_5",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_3",
      "groupId": "grp_1",
      "lessonId": "les_1",
      "title": "حصة التفاضل والتكامل 1",
      "date": "2026-08-25",
      "amountDue": 100,
      "amountPaid": 100,
      "balance": 0,
      "status": "paid",
      "paymentMethod": "e_wallet",
      "paymentDate": "2026-08-25",
      "createdAt": "2026-08-25T16:00:00Z",
      "updatedAt": "2026-08-25T16:00:00Z"
    },
    {
      "id": "bil_6",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_3",
      "groupId": "grp_1",
      "lessonId": "les_2",
      "title": "حصة التفاضل والتكامل 2",
      "date": "2026-09-01",
      "amountDue": 100,
      "amountPaid": 0,
      "balance": 100,
      "status": "unpaid",
      "createdAt": "2026-09-01T16:00:00Z",
      "updatedAt": "2026-09-01T16:00:00Z"
    },
    {
      "id": "bil_7",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_4",
      "groupId": "grp_1",
      "lessonId": "les_2",
      "title": "حصة التفاضل والتكامل 2",
      "date": "2026-09-01",
      "amountDue": 100,
      "amountPaid": 0,
      "balance": 100,
      "status": "unpaid",
      "createdAt": "2026-09-01T16:00:00Z",
      "updatedAt": "2026-09-01T16:00:00Z"
    }
  ],
  "paymentTransactions": [
    {
      "id": "txn_1",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_1",
      "groupId": "grp_1",
      "billingId": "bil_1",
      "amount": 100,
      "paymentMethod": "cash",
      "paymentDate": "2026-08-25",
      "notes": "سداد نقدي لحصة التفاضل 1",
      "receiptNumber": "REC-2608-001",
      "recordedBy": "أ. أحمد الشناوي",
      "createdAt": "2026-08-25T16:00:00Z"
    },
    {
      "id": "txn_2",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_2",
      "groupId": "grp_1",
      "billingId": "bil_3",
      "amount": 100,
      "paymentMethod": "bank_transfer",
      "paymentDate": "2026-08-25",
      "notes": "تحويل بنكي",
      "receiptNumber": "REC-2608-002",
      "recordedBy": "أ. أحمد الشناوي",
      "createdAt": "2026-08-25T16:10:00Z"
    },
    {
      "id": "txn_3",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_2",
      "groupId": "grp_1",
      "billingId": "bil_4",
      "amount": 50,
      "paymentMethod": "cash",
      "paymentDate": "2026-09-01",
      "notes": "دفعة جزئية لحصة التفاضل 2",
      "receiptNumber": "REC-2609-001",
      "recordedBy": "أ. أحمد الشناوي",
      "createdAt": "2026-09-01T16:05:00Z"
    },
    {
      "id": "txn_4",
      "teacherId": "usr_teacher_demo_1",
      "studentId": "std_3",
      "groupId": "grp_1",
      "billingId": "bil_5",
      "amount": 100,
      "paymentMethod": "e_wallet",
      "paymentDate": "2026-08-25",
      "notes": "محفظة إلكترونية",
      "receiptNumber": "REC-2608-003",
      "recordedBy": "أ. أحمد الشناوي",
      "createdAt": "2026-08-25T16:15:00Z"
    }
  ],
  "platformSettings": {
    "defaultTrialDays": 7,
    "currency": "SAR",
    "paymentGatewayEnabled": true,
    "supportContact": {
      "whatsapp": "+966501234567",
      "email": "support@mueen.com",
      "phone": "+966501234567"
    }
  },
  "subscriptionPayments": [
    {
      "id": "sp_1",
      "userId": "usr_teacher_demo_1",
      "planId": "pro",
      "billingCycle": "yearly",
      "amount": 1490,
      "currency": "SAR",
      "status": "completed",
      "paymentMethod": "card",
      "provider": "manual",
      "transactionReference": "TXN-MUEEN-PRO-20260815",
      "createdAt": "2026-08-15T00:00:00Z",
      "completedAt": "2026-08-15T00:05:00Z"
    }
  ]
};
export default initialData;
