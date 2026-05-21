import api from './axios';
import { Ticket } from '../types';

export const ticketsApi = {
  list:   ()              => api.get<Ticket[]>('/tickets'),
  get:    (id: string)    => api.get<Ticket>(`/tickets/${id}`),
  create: (data: Omit<Ticket, 'id' | 'created_by' | 'created_at'>) =>
    api.post<Ticket>('/tickets', data),
  update: (id: string, data: Partial<Ticket>) =>
    api.put<Ticket>(`/tickets/${id}`, data),
  delete: (id: string) => api.delete(`/tickets/${id}`),
};
