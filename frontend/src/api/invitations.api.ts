import api from './axios';
import { Invitation } from '../types';

export const invitationsApi = {
  list:   ()              => api.get<Invitation[]>('/invitations'),
  get:    (id: string)    => api.get<Invitation>(`/invitations/${id}`),
  create: (data: Omit<Invitation, 'id' | 'created_by' | 'created_at'>) =>
    api.post<Invitation>('/invitations', data),
  update: (id: string, data: Partial<Invitation>) =>
    api.put<Invitation>(`/invitations/${id}`, data),
  delete: (id: string) => api.delete(`/invitations/${id}`),
};
