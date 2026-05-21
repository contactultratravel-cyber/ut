import api from './axios';
import { Bon } from '../types';

export const bonsApi = {
  list:   ()                              => api.get<Bon[]>('/bons'),
  create: (data: Omit<Bon, 'id' | 'created_at' | 'updated_at' | 'created_by'>) =>
                                             api.post<Bon>('/bons', data),
  update: (id: string, data: Partial<Bon>) => api.put<Bon>(`/bons/${id}`, data),
  delete: (id: string)                    => api.delete(`/bons/${id}`),
};
