import { Response } from 'express';
import * as svc from './dashboard.service';
import { AuthRequest } from '../../types/index';

export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fromDate, toDate } = req.query as { fromDate?: string; toDate?: string };
    res.json(await svc.getDashboardStats(fromDate, toDate));
  } catch { res.status(500).json({ message: 'Server error' }); }
}
