export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const email = (body.email || '').toLowerCase().trim();
  const isAdmin = email.includes('admin');

  const user = isAdmin
    ? {
        id: 'usr_admin_master_1',
        name: 'مدير منصة مُعين',
        email: 'admin@mueen.com',
        role: 'admin',
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        lastLoginAt: new Date().toISOString()
      }
    : {
        id: 'usr_teacher_demo_1',
        name: 'أ. أحمد الشناوي',
        email: email || 'teacher@mueen.com',
        role: 'teacher',
        status: 'active',
        createdAt: '2026-08-01T00:00:00Z',
        lastLoginAt: new Date().toISOString()
      };

  const teacher = isAdmin
    ? null
    : {
        userId: user.id,
        subject: 'الرياضيات والفيزياء',
        schoolOrCenter: 'أكاديمية الرواد النموذجية',
        bio: 'معلم أول لمادة الرياضيات للثانوية العامة والمرحلة المتوسطة بخبرة 12 عامًا',
        defaultClassDurationMinutes: 90,
        stagePreference: 'المرحلة الثانوية',
        totalStudentsCount: 18,
        totalGroupsCount: 3
      };

  const subscription = isAdmin
    ? null
    : {
        id: 'sub_demo_1',
        userId: user.id,
        plan: 'pro',
        status: 'active',
        startDate: '2026-08-15T00:00:00Z',
        endDate: '2026-11-15T00:00:00Z',
        trialEndsAt: '2026-08-22T00:00:00Z',
        aiUsageThisMonth: 42,
        autoRenew: true
      };

  return res.status(200).json({
    success: true,
    token: `mueen_token_${user.id}`,
    user,
    teacher,
    subscription
  });
}
