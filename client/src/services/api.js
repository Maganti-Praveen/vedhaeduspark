import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('ves_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle 401 responses — skip redirect for auth routes (login/register/forgot)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/forgot') || url.includes('/auth/reset');
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('ves_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  createAdmin: (data) => api.post('/auth/create-admin', data),
};

// Course API
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// E-Book API
export const ebookAPI = {
  getAll: () => api.get('/ebooks'),
  getAdmin: () => api.get('/ebooks/admin'),
  getById: (id) => api.get(`/ebooks/${id}`),
  create: (data) => api.post('/ebooks', data),
  update: (id, data) => api.put(`/ebooks/${id}`, data),
  delete: (id) => api.delete(`/ebooks/${id}`),
  requestAccess: (id, couponCode) => api.post(`/ebooks/${id}/access`, { couponCode }),
  sendEmail: (id, email) => api.post(`/ebooks/${id}/send-email`, { email }),
};

// Resume Tools API
export const resumeAPI = {
  getSaved: () => api.get('/resume/saved'),
  saveData: (data) => api.put('/resume/saved', data),
  atsCheck: (resumeText, jobDescription) => api.post('/resume/ats-check', { resumeText, jobDescription }),
  optimize: (resumeText, jobDescription) => api.post('/resume/optimize', { resumeText, jobDescription }),
  generateSummary: (data) => api.post('/resume/generate-summary', data),
  generatePdf: (data, template) => api.post('/resume/generate-pdf', { data, template }, { responseType: 'blob' }),
};

// Problem API
export const problemAPI = {
  getAll: (params) => api.get('/problems', { params }),
  getTopics: () => api.get('/problems/topics'),
  getById: (id) => api.get(`/problems/${id}`),
  create: (data) => api.post('/problems', data),
  update: (id, data) => api.put(`/problems/${id}`, data),
  delete: (id) => api.delete(`/problems/${id}`),
};

// Judge API
export const judgeAPI = {
  run: (data) => api.post('/judge/run', data),
  submit: (data) => api.post('/judge/submit', data),
};

// Submission API
export const submissionAPI = {
  getAll: (params) => api.get('/submissions', { params }),
  getStats: () => api.get('/submissions/stats'),
};

// Enrollment API
export const enrollmentAPI = {
  getAll: () => api.get('/enrollments'),
  enroll: (courseId, couponCode) => api.post('/enrollments', { courseId, couponCode }),
  updateProgress: (id, progress) => api.put(`/enrollments/${id}/progress`, { progress }),
  completeContent: (id, contentId) => api.put(`/enrollments/${id}/complete-content`, { contentId }),
  uncompleteContent: (id, contentId) => api.put(`/enrollments/${id}/uncomplete-content`, { contentId }),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  sendNotification: (data) => api.post('/admin/send-notification', data),
};

// Coupon API
export const couponAPI = {
  getCourses: () => api.get('/coupons/courses'),
  getByCourse: (courseId) => api.get(`/coupons/${courseId}`),
  generate: (data) => api.post('/coupons/generate', data),
  validate: (code, courseId) => api.post('/coupons/validate', { code, courseId }),
  delete: (id) => api.delete(`/coupons/${id}`),
  sendEmail: (data) => api.post('/coupons/send-email', data),
};

// Upload API
export const uploadAPI = {
  image: (file) => { const fd = new FormData(); fd.append('file', file); return api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); },
  avatar: (file) => { const fd = new FormData(); fd.append('file', file); return api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); },
  pdf: (file) => { const fd = new FormData(); fd.append('file', file); return api.post('/upload/pdf', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); },
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Discussion API
export const discussionAPI = {
  getAll: (params) => api.get('/discussions', { params }),
  getById: (id) => api.get(`/discussions/${id}`),
  create: (data) => api.post('/discussions', data),
  reply: (id, data) => api.post(`/discussions/${id}/reply`, data),
  like: (id) => api.put(`/discussions/${id}/like`),
  likeReply: (id, replyId) => api.put(`/discussions/${id}/replies/${replyId}/like`),
  delete: (id) => api.delete(`/discussions/${id}`),
};

// AI API
export const aiAPI = {
  ask: (data) => api.post('/ai/ask', data),
  codeHint: (data) => api.post('/ai/code-hint', data),
  explain: (data) => api.post('/ai/explain', data),
};

// Certificate API
export const certificateAPI = {
  getAll: () => api.get('/certificates'),
  generate: (enrollmentId) => api.get(`/certificates/${enrollmentId}/generate`, { responseType: 'blob' }),
};

// Jobs API
export const jobAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getCategories: () => api.get('/jobs/categories'),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

// Resources API
export const resourceAPI = {
  getAll: (params) => api.get('/resources', { params }),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

// Review API
export const reviewAPI = {
  getByCourse: (courseId) => api.get(`/reviews/${courseId}`),
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Leaderboard API
export const leaderboardAPI = {
  getAll: () => api.get('/leaderboard'),
};

// Quiz API
export const quizAPI = {
  getAll: () => api.get('/quizzes'),
  getAdmin: () => api.get('/quizzes/admin'),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  submit: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  getAttempts: (id) => api.get(`/quizzes/${id}/attempts`),
};

// Event API
export const eventAPI = {
  getAll: () => api.get('/events'),
  getAdmin: () => api.get('/events/admin'),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  register: (id) => api.post(`/events/${id}/register`),
};

export default api;
