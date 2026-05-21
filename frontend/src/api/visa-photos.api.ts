import api from './axios';
import { VisaPhoto } from '../types';

export const visaPhotosApi = {
  list: (fromDate?: string, toDate?: string) =>
    api.get<VisaPhoto[]>('/visa-photos', { params: { fromDate, toDate } }),

  create: (photo: string, note?: string) =>
    api.post<VisaPhoto>('/visa-photos', { photo, note }),

  remove: (id: string) =>
    api.delete(`/visa-photos/${id}`),
};
