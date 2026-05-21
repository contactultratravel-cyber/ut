import { Response } from 'express';
import * as svc from './dossiers.service';
import { AuthRequest } from '../../types/index';

export async function list(req: AuthRequest, res: Response) {
  try { res.json(svc.listDossiers()); } catch { res.status(500).json({ message: 'Server error' }); }
}
export async function create(req: AuthRequest, res: Response) {
  try { res.status(201).json(svc.createDossier(req.body, req.user!.userId)); }
  catch { res.status(500).json({ message: 'Server error' }); }
}
export async function update(req: AuthRequest, res: Response) {
  try {
    const d = svc.updateDossier(req.params.id, req.body);
    if (!d) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(d);
  } catch { res.status(500).json({ message: 'Server error' }); }
}
export async function remove(req: AuthRequest, res: Response) {
  try { svc.deleteDossier(req.params.id); res.status(204).send(); }
  catch { res.status(500).json({ message: 'Server error' }); }
}
