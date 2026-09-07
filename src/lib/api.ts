// Typed API Client with High-Performance Memory Cache & In-Flight Request Deduplication

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('mueen_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('mueen_token', token);
  clearApiCache();
}

export function removeAuthToken(): void {
  localStorage.removeItem('mueen_token');
  clearApiCache();
}

// In-memory cache for fast GET responses
interface CacheEntry {
  data: any;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 6000; // 6 seconds TTL for ultra-fast tab switches without stale data

export function clearApiCache(endpointPrefix?: string): void {
  if (!endpointPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(endpointPrefix)) {
      memoryCache.delete(key);
    }
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string; [key: string]: any }> {
  const method = (options.method || 'GET').toUpperCase();
  const token = getAuthToken();

  // Handle Cache for GET requests
  if (method === 'GET' && !options.headers) {
    const cacheKey = `${endpoint}_${token || 'guest'}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    // Deduplicate in-flight GET requests
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          code: data.code,
          subscription: data.subscription,
          error: data.error || `خطأ (${res.status}): تعذر إتمام الطلب.`
        };
      }

      // If GET request, store in memory cache
      if (method === 'GET' && !options.headers && data.success) {
        const cacheKey = `${endpoint}_${token || 'guest'}`;
        memoryCache.set(cacheKey, { data, timestamp: Date.now() });
      }

      // If mutation (POST/PUT/DELETE), invalidate relevant cache
      if (method !== 'GET') {
        clearApiCache();
      }

      return data;
    } catch (err: any) {
      console.error(`API Error on ${endpoint}:`, err);
      return {
        success: false,
        error: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.'
      };
    } finally {
      if (method === 'GET') {
        const cacheKey = `${endpoint}_${token || 'guest'}`;
        inFlightRequests.delete(cacheKey);
      }
    }
  })();

  if (method === 'GET' && !options.headers) {
    const cacheKey = `${endpoint}_${token || 'guest'}`;
    inFlightRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

// ==========================================
// SUBSCRIPTION & COMMERCIAL API HELPERS
// ==========================================

export async function fetchSubscriptionStatus() {
  return apiRequest('/subscriptions/status');
}

export async function fetchSubscriptionCurrent() {
  return apiRequest('/subscriptions/current');
}

export async function createSubscriptionCheckout(planId: string, billingCycle: 'monthly' | 'yearly', paymentMethod?: string) {
  return apiRequest('/subscriptions/checkout', {
    method: 'POST',
    body: JSON.stringify({ planId, billingCycle, paymentMethod })
  });
}

export async function verifySubscriptionPayment(transactionReference: string, paymentMethod?: string) {
  return apiRequest('/subscriptions/verify-payment', {
    method: 'POST',
    body: JSON.stringify({ transactionReference, paymentMethod })
  });
}

// ==========================================
// STUDENT LESSON BILLING & FINANCIAL HELPERS
// ==========================================

export async function fetchTeacherFinancialOverview() {
  return apiRequest('/billing/teacher/overview');
}

export async function fetchGroupBilling(groupId: string) {
  return apiRequest(`/billing/groups/${groupId}`);
}

export async function fetchStudentFinancialSummary(studentId: string) {
  return apiRequest(`/billing/students/${studentId}`);
}

export const fetchStudentBillingLedger = fetchStudentFinancialSummary;

export async function recordStudentPayment(payload: {
  studentId: string;
  groupId?: string;
  amount: number;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
  billingId?: string;
}) {
  return apiRequest('/billing/record-payment', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateBillingChargeStatus(chargeId: string, status: string, notes?: string) {
  return apiRequest(`/billing/charges/${chargeId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes })
  });
}

export async function createManualCharge(payload: {
  studentId: string;
  groupId?: string;
  title: string;
  amountDue: number;
  date?: string;
  notes?: string;
}) {
  return apiRequest('/billing/charges/manual', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getBillingWhatsAppReminder(studentId: string, customMessage?: string) {
  return apiRequest('/billing/send-reminder', {
    method: 'POST',
    body: JSON.stringify({ studentId, customMessage })
  });
}

export async function fetchBillingReports(filters?: {
  groupId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (filters?.groupId) query.set('groupId', filters.groupId);
  if (filters?.startDate) query.set('startDate', filters.startDate);
  if (filters?.endDate) query.set('endDate', filters.endDate);
  if (filters?.status) query.set('status', filters.status);
  return apiRequest(`/billing/reports?${query.toString()}`);
}

// ==========================================
// ADMIN SUBSCRIPTION MANAGEMENT HELPERS
// ==========================================

export async function fetchAdminSubscriptions(status?: string, search?: string) {
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (search) query.set('search', search);
  return apiRequest(`/admin/subscriptions?${query.toString()}`);
}

export async function adminExtendSubscription(subId: string, days: number) {
  return apiRequest(`/admin/subscriptions/${subId}/extend`, {
    method: 'POST',
    body: JSON.stringify({ days })
  });
}

export async function adminActivateSubscription(subId: string, planId: string, months: number = 12) {
  return apiRequest(`/admin/subscriptions/${subId}/activate`, {
    method: 'POST',
    body: JSON.stringify({ planId, months })
  });
}

export async function fetchPlatformSettings() {
  return apiRequest('/admin/platform-settings');
}

export async function updatePlatformSettings(settings: any) {
  return apiRequest('/admin/platform-settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  });
}

export async function fetchAdminSubscriptionPayments() {
  return apiRequest('/admin/subscription-payments');
}

