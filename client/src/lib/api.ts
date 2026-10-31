import type {
  User,
  ATM,
  ATMDetail,
  Transaction,
  FeatureRecord,
  Prediction,
  RefillRecommendation,
  OverviewData,
  AnalyticsData,
  SystemStatus,
  TrendPoint
} from '../types';

const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('cashflow_iq_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('cashflow_iq_token', token);
}

export function clearStoredToken() {
  localStorage.removeItem('cashflow_iq_token');
  localStorage.removeItem('cashflow_iq_user');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearStoredToken();
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('Session expired. Please sign in again.');
  }

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    return request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  getMe: async () => {
    return request<User>('/auth/me');
  },
  updateProfile: async (name?: string, email?: string) => {
    return request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name, email })
    });
  },
  changePassword: async (current_password: string, new_password: string) => {
    return request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password })
    });
  },
  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      clearStoredToken();
    }
  },

  // Overview
  getOverview: async () => {
    return request<OverviewData>('/overview');
  },

  // ATMs
  getCities: async () => {
    return request<string[]>('/atms/cities');
  },
  getAtms: async (params: { search?: string; city?: string; risk_level?: string; status?: string; page?: number; page_size?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.search) sp.set('search', params.search);
    if (params.city) sp.set('city', params.city);
    if (params.risk_level) sp.set('risk_level', params.risk_level);
    if (params.status) sp.set('status', params.status);
    if (params.page) sp.set('page', params.page.toString());
    if (params.page_size) sp.set('page_size', params.page_size.toString());
    return request<{ items: ATM[]; total: number; page: number; page_size: number; total_pages: number }>(`/atms?${sp.toString()}`);
  },
  getAtmDetails: async (atmId: string) => {
    return request<ATMDetail>(`/atms/${atmId}`);
  },
  getAtmTrend: async (atmId: string, days: number = 14) => {
    return request<TrendPoint[]>(`/atms/${atmId}/trend?days=${days}`);
  },
  getAtmTransactions: async (atmId: string, page: number = 1, pageSize: number = 10) => {
    return request<{ items: Transaction[]; total: number; page: number; page_size: number; total_pages: number }>(`/atms/${atmId}/transactions?page=${page}&page_size=${pageSize}`);
  },
  getAtmPredictions: async (atmId: string, page: number = 1, pageSize: number = 10) => {
    return request<{ items: Prediction[]; total: number; page: number; page_size: number; total_pages: number }>(`/atms/${atmId}/predictions?page=${page}&page_size=${pageSize}`);
  },

  // Predictions
  createPrediction: async (atmId: string, period: string = 'next_7_days') => {
    return request<Prediction>('/predictions', {
      method: 'POST',
      body: JSON.stringify({ atm_id: atmId, prediction_period: period })
    });
  },
  getPredictionHistory: async (params: { search?: string; risk_level?: string; page?: number; page_size?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.search) sp.set('search', params.search);
    if (params.risk_level) sp.set('risk_level', params.risk_level);
    if (params.page) sp.set('page', params.page.toString());
    if (params.page_size) sp.set('page_size', params.page_size.toString());
    return request<{ items: Prediction[]; total: number; page: number; page_size: number; total_pages: number }>(`/predictions?${sp.toString()}`);
  },
  getPrediction: async (predictionId: string) => {
    return request<Prediction>(`/predictions/${predictionId}`);
  },

  // Refills
  getRefills: async (params: { risk_level?: string; review_status?: string; city?: string; search?: string; page?: number; page_size?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.risk_level) sp.set('risk_level', params.risk_level);
    if (params.review_status) sp.set('review_status', params.review_status);
    if (params.city) sp.set('city', params.city);
    if (params.search) sp.set('search', params.search);
    if (params.page) sp.set('page', params.page.toString());
    if (params.page_size) sp.set('page_size', params.page_size.toString());
    return request<{ items: RefillRecommendation[]; total: number; page: number; page_size: number; total_pages: number }>(`/refills?${sp.toString()}`);
  },
  updateRefillReview: async (predictionId: string, review_status: string, review_note?: string) => {
    return request<RefillRecommendation>(`/refills/${predictionId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ review_status, review_note })
    });
  },

  // Data Explorer
  getTransactions: async (params: { search?: string; atm_id?: string; page?: number; page_size?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.search) sp.set('search', params.search);
    if (params.atm_id) sp.set('atm_id', params.atm_id);
    if (params.page) sp.set('page', params.page.toString());
    if (params.page_size) sp.set('page_size', params.page_size.toString());
    return request<{ items: Transaction[]; total: number; page: number; page_size: number; total_pages: number; summary: any }>(`/transactions?${sp.toString()}`);
  },
  getEngineeredFeatures: async (params: { atm_id?: string; page?: number; page_size?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.atm_id) sp.set('atm_id', params.atm_id);
    if (params.page) sp.set('page', params.page.toString());
    if (params.page_size) sp.set('page_size', params.page_size.toString());
    return request<{ items: FeatureRecord[]; total: number; page: number; page_size: number; total_pages: number; summary: any }>(`/features?${sp.toString()}`);
  },

  // Analytics
  getAnalytics: async () => {
    return request<AnalyticsData>('/analytics');
  },

  // System
  getHealth: async () => {
    return request<{ status: string; api: string; database: string; ml_model: string; version: string }>('/health');
  },
  getSystemStatus: async () => {
    return request<SystemStatus>('/system/status');
  }
};
