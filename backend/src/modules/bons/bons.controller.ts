import { Response } from 'express';
import * as svc from './bons.service';
import { AuthRequest } from '../../types/index';

export async function list(req: AuthRequest, res: Response) {
  try { res.json(await svc.listBons()); } catch { res.status(500).json({ message: 'Server error' }); }
}
export async function create(req: AuthRequest, res: Response) {
  try { res.status(201).json(await svc.createBon(req.body, req.user!.userId)); }
  catch { res.status(500).json({ message: 'Server error' }); }
}
export async function update(req: AuthRequest, res: Response) {
  try {
    const bon = await svc.updateBon(req.params.id, req.body);
    if (!bon) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(bon);
  } catch { res.status(500).json({ message: 'Server error' }); }
}
export async function remove(req: AuthRequest, res: Response) {
  try { await svc.deleteBon(req.params.id); res.status(204).send(); }
  catch { res.status(500).json({ message: 'Server error' }); }
}
