import { Response } from 'express';
import * as svc from './statistics.service';
import { AuthRequest } from '../../types/index';

export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fromDate, toDate } = req.query as { fromDate?: string; toDate?: string };
    const stats = await svc.getStatistics(fromDate, toDate);
    res.json(stats);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function verifyPassword(req: AuthRequest, res: Response): Promise<void> {
  const { password } = req.body as { password?: string };
  const correct = process.env.STATS_PASSWORD ?? 'Ultra2026';
  if (password === correct) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, message: 'Mot de passe incorrect' });
  }
}
