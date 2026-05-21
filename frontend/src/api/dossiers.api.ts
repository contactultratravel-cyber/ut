import api from './axios';
import { Dossier } from '../types';

export const dossiersApi = {
  list:   ()                                    => api.get<Dossier[]>('/dossiers'),
  create: (data: Omit<Dossier, 'id' | 'created_at' | 'updated_at' | 'created_by'>) =>
                                                   api.post<Dossier>('/dossiers', data),
  update: (id: string, data: Partial<Dossier>) => api.put<Dossier>(`/dossiers/${id}`, data),
  delete: (id: string)                          => api.delete(`/dossiers/${id}`),
};
