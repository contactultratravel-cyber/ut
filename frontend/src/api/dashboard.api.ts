import api from './axios';
import { DashboardStats } from '../types';

export const dashboardApi = {
  getStats: (fromDate?: string, toDate?: string) =>
    api.get<DashboardStats>('/dashboard', { params: fromDate && toDate ? { fromDate, toDate } : {} }),
};
