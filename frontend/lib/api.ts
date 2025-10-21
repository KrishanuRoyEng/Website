import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const session = await getSession();
    if (session && (session as any).accessToken) {
      config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
    }
  } catch (error) {
    console.error('Error getting session:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response from API:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const memberApi = {
  getAll: (params?: any) => apiClient.get('/members', { params }),
  getByUserId: (userId: number) => apiClient.get(`/members/user/${userId}`),
  getProfile: () => apiClient.get('/members/profile'),
  getProjects: (memberId: number) => apiClient.get(`/members/${memberId}/projects`),
  getSkills: (memberId: number) => apiClient.get(`/members/${memberId}/skills`),
  update: (id: number, data: any) => apiClient.put(`/members/${id}`, data),
  updateProfile: (data: any) => apiClient.put('/members/profile', data),
  addSkills: (data: any) => apiClient.post('/members/skills', data),
  removeSkill: (skillId: number) => apiClient.delete(`/members/skills/${skillId}`),
};

export const projectApi = {
  getAll: (params?: any) => apiClient.get('/projects', { params }),
  getById: (id: number) => apiClient.get(`/projects/${id}`),
  create: (data: any) => apiClient.post('/projects', data),
  update: (id: number, data: any) => apiClient.put(`/projects/${id}`, data),
  delete: (id: number) => apiClient.delete(`/projects/${id}`),
};

export const eventApi = {
  getAll: (params?: any) => apiClient.get('/events', { params }),
  getById: (id: number) => apiClient.get(`/events/${id}`),
  create: (data: any) => apiClient.post('/events', data),
  update: (id: number, data: any) => apiClient.put(`/events/${id}`, data),
  delete: (id: number) => apiClient.delete(`/events/${id}`),
};

export const skillApi = {
  getAll: () => apiClient.get('/skills'),
  getById: (id: number) => apiClient.get(`/skills/${id}`),
};

export const tagApi = {
  getAll: () => apiClient.get('/tags'),
};

export const authApi = {
  getCurrentUser: () => apiClient.get('/auth/me'),
};

export const adminApi = {
  approveMember: (id: number, data: any) => apiClient.put(`/admin/members/${id}/approve`, data),
  approveProject: (id: number, data: any) => apiClient.put(`/admin/projects/${id}/approve`, data),
  featuredEvent: (id: number, data: any) => apiClient.put(`/admin/events/${id}/featured`, data),
};

export default apiClient;