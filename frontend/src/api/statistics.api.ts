import api from './axios';
import { Statistics } from '../types';

export const statisticsApi = {
  get: (fromDate?: string, toDate?: string) =>
    api.get<Statistics>('/statistics', { params: { fromDate, toDate } }),
};
