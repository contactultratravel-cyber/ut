import { Response } from 'express';
import * as svc from './dossiers.service';
import { AuthRequest } from '../../types/index';

export async function list(req: AuthRequest, res: Response) {
  try { res.json(await svc.listDossiers()); } catch { res.status(500).json({ message: 'Server error' }); }
}
export async function create(req: AuthRequest, res: Response) {
  try { res.status(201).json(await svc.createDossier(req.body, req.user!.userId)); }
  catch { res.status(500).json({ message: 'Server error' }); }
}
export async function update(req: AuthRequest, res: Response) {
  try {
    const d = await svc.updateDossier(req.params.id, req.body);
    if (!d) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(d);
  } catch { res.status(500).json({ message: 'Server error' }); }
}
export async function remove(req: AuthRequest, res: Response) {
  try { await svc.deleteDossier(req.params.id); res.status(204).send(); }
  catch { res.status(500).json({ message: 'Server error' }); }
}
