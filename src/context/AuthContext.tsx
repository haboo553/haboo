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
      } else {
        removeAuthToken();
        setUser(null);
      }
    } catch {
      removeAuthToken();
      setUser(null);
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
