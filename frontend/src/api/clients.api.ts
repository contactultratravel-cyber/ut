import api from './axios';
import { Client } from '../types';

export const clientsApi = {
  list: (status?: string) =>
    api.get<Client[]>('/clients', { params: status ? { status } : {} }),

  get: (id: string) => api.get<Client>(`/clients/${id}`),

  create: (data: Partial<Client> & { firstName: string; lastName: string }) =>
    api.post<Client>('/clients', data),

  update: (id: string, data: Partial<Client>) =>
    api.put<Client>(`/clients/${id}`, data),

  validateStep1: (id: string, appointmentDate?: string, appointmentStatus?: string) =>
    api.post<Client>(`/clients/${id}/validate-step1`, { appointmentDate, appointmentStatus }),

  updateAppointment: (id: string, data: { appointmentDate?: string; appointmentStatus?: string }) =>
    api.patch<Client>(`/clients/${id}/appointment`, data),

  finalValidation: (id: string) =>
    api.post<Client>(`/clients/${id}/final-validation`),

  deliver: (id: string) =>
    api.post<Client>(`/clients/${id}/deliver`),

  delete: (id: string) => api.delete(`/clients/${id}`),

  uploadPassport: (id: string, photo: string) =>
    api.post(`/clients/${id}/passport`, { photo }),

  deletePassport: (id: string) =>
    api.delete(`/clients/${id}/passport`),
};
