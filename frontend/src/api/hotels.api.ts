import api from './axios';
import { Hotel } from '../types';

export const hotelsApi = {
  list:   ()              => api.get<Hotel[]>('/hotels'),
  get:    (id: string)    => api.get<Hotel>(`/hotels/${id}`),
  create: (data: Omit<Hotel, 'id' | 'created_by' | 'created_at'>) =>
    api.post<Hotel>('/hotels', data),
  update: (id: string, data: Partial<Hotel>) =>
    api.put<Hotel>(`/hotels/${id}`, data),
  delete: (id: string) => api.delete(`/hotels/${id}`),
};
