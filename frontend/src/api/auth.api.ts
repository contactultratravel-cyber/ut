import api from './axios';
import { AuthUser } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password }),

  me: () => api.get<AuthUser>('/auth/me'),

  getUsers: () => api.get<AuthUser[]>('/auth/users'),

  createUser: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => api.post<AuthUser>('/auth/users', data),

  toggleUser: (id: string) => api.patch(`/auth/users/${id}/toggle`),
};
