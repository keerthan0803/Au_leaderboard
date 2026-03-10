import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth APIs
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const googleLogin = (data) => api.post('/auth/google', data);
export const getMe = () => api.get('/auth/me');

// Student APIs
export const getStudentProfile = () => api.get('/student/profile');
export const updateCodingProfiles = (data) => api.put('/student/coding-profiles', data);
export const uploadResume = (data) => api.post('/student/resume', data);
export const refreshPerformanceData = () => api.post('/student/refresh-data');

// Faculty APIs
export const getAllStudents = () => api.get('/faculty/students');
export const getStudentById = (id) => api.get(`/faculty/students/${id}`);

// Leaderboard APIs
export const getLeaderboard = () => api.get('/leaderboard');

export default api;
