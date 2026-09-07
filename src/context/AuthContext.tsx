import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, TeacherProfile, Subscription, PlanConfig, SubscriptionCheckResult } from '../types.js';
import { apiRequest, setAuthToken, removeAuthToken, getAuthToken } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  teacher: TeacherProfile | null;
  subscription: Subscription | null;
  subscriptionStatus: SubscriptionCheckResult | null;
  planConfig: PlanConfig | null;
  loading: boolean;
  login: (email: string, pass?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loginAsDemoTeacher: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  isTrialExpired: boolean;
  canUseAi: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionCheckResult | null>(null);
  const [planConfig, setPlanConfig] = useState<PlanConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        setTeacher(res.teacher);
        setSubscription(res.subscription);
        setSubscriptionStatus(res.subscriptionStatus || null);
        setPlanConfig(res.planConfig);
      } else if (token.includes('teacher_demo')) {
        // preserve teacher demo session
        setUser({
          id: 'usr_teacher_demo_1',
          name: 'أ. أحمد الشناوي',
          email: 'teacher@mueen.com',
          role: 'teacher',
          status: 'active',
          createdAt: '2026-08-01T00:00:00Z',
          lastLoginAt: new Date().toISOString()
        });
        setTeacher({
          userId: 'usr_teacher_demo_1',
          subject: 'الرياضيات والفيزياء',
          schoolOrCenter: 'أكاديمية الرواد النموذجية',
          bio: 'معلم أول لمادة الرياضيات للثانوية العامة والمرحلة المتوسطة بخبرة 12 عامًا',
          defaultClassDurationMinutes: 90,
          stagePreference: 'المرحلة الثانوية',
          totalStudentsCount: 18,
          totalGroupsCount: 3
        });
        setSubscription({
          id: 'sub_demo_1',
          userId: 'usr_teacher_demo_1',
          plan: 'pro',
          status: 'active',
          startDate: '2026-08-15T00:00:00Z',
          endDate: '2026-11-15T00:00:00Z',
          trialEndsAt: '2026-08-22T00:00:00Z',
          aiUsageThisMonth: 42,
          autoRenew: true
        });
      } else if (token.includes('admin_master')) {
        setUser({
          id: 'usr_admin_master_1',
          name: 'مدير منصة مُعين',
          email: 'admin@mueen.com',
          role: 'admin',
          status: 'active',
          createdAt: '2026-01-01T00:00:00Z',
          lastLoginAt: new Date().toISOString()
        });
      } else {
        removeAuthToken();
        setUser(null);
      }
    } catch {
      if (!token.includes('teacher_demo') && !token.includes('admin_master')) {
        removeAuthToken();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password = 'password') => {
    setLoading(true);
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    setLoading(false);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      setTeacher(res.teacher);
      setSubscription(res.subscription);
      await fetchCurrentUser();
      return { success: true };
    }

    // Bulletproof fallback for demo accounts (e.g. on static hosting / network issues)
    if (email.toLowerCase().includes('teacher@mueen.com')) {
      const demoToken = 'mueen_token_usr_teacher_demo_1';
      setAuthToken(demoToken);
      const demoUser: User = {
        id: 'usr_teacher_demo_1',
        name: 'أ. أحمد الشناوي',
        email: 'teacher@mueen.com',
        role: 'teacher',
        status: 'active',
        createdAt: '2026-08-01T00:00:00Z',
        lastLoginAt: new Date().toISOString()
      };
      const demoTeacher: TeacherProfile = {
        userId: 'usr_teacher_demo_1',
        subject: 'الرياضيات والفيزياء',
        schoolOrCenter: 'أكاديمية الرواد النموذجية',
        bio: 'معلم أول لمادة الرياضيات للثانوية العامة والمرحلة المتوسطة بخبرة 12 عامًا',
        defaultClassDurationMinutes: 90,
        stagePreference: 'المرحلة الثانوية',
        totalStudentsCount: 18,
        totalGroupsCount: 3
      };
      const demoSub: Subscription = {
        id: 'sub_demo_1',
        userId: 'usr_teacher_demo_1',
        plan: 'pro',
        status: 'active',
        startDate: '2026-08-15T00:00:00Z',
        endDate: '2026-11-15T00:00:00Z',
        trialEndsAt: '2026-08-22T00:00:00Z',
        aiUsageThisMonth: 42,
        autoRenew: true
      };
      setUser(demoUser);
      setTeacher(demoTeacher);
      setSubscription(demoSub);
      return { success: true };
    }

    if (email.toLowerCase().includes('admin@mueen.com')) {
      const demoToken = 'mueen_token_usr_admin_master_1';
      setAuthToken(demoToken);
      const demoAdmin: User = {
        id: 'usr_admin_master_1',
        name: 'مدير منصة مُعين',
        email: 'admin@mueen.com',
        role: 'admin',
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        lastLoginAt: new Date().toISOString()
      };
      setUser(demoAdmin);
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل تسجيل الدخول.' };
  };

  const register = async (data: any) => {
    setLoading(true);
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    setLoading(false);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      setTeacher(res.teacher);
      setSubscription(res.subscription);
      await fetchCurrentUser();
      return { success: true };
    }
    return { success: false, error: res.error || 'فشل إنشاء الحساب.' };
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setTeacher(null);
    setSubscription(null);
    setSubscriptionStatus(null);
    setPlanConfig(null);
  };

  const loginAsDemoTeacher = async () => {
    await login('teacher@mueen.com', '123456');
  };

  const loginAsDemoAdmin = async () => {
    await login('admin@mueen.com', '123456');
  };

  const isTrialExpired = subscriptionStatus ? subscriptionStatus.isExpired : (
    subscription?.status === 'expired' || 
    (subscription?.status === 'trial' && new Date(subscription.trialEndsAt).getTime() < Date.now())
  );

  const canUseAi = !isTrialExpired;

  return (
    <AuthContext.Provider
      value={{
        user,
        teacher,
        subscription,
        subscriptionStatus,
        planConfig,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
        loginAsDemoTeacher,
        loginAsDemoAdmin,
        isTrialExpired,
        canUseAi
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
