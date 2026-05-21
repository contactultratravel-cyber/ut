import { Response } from 'express';
import { validationResult } from 'express-validator';
import * as svc from './invitations.service';
import { AuthRequest } from '../../types/index';

export async function list(_req: AuthRequest, res: Response): Promise<void> {
  try { res.json(await svc.listInvitations()); }
  catch { res.status(500).json({ message: 'Server error' }); }
}

export async function get(req: AuthRequest, res: Response): Promise<void> {
  try {
    const inv = await svc.getInvitation(req.params.id);
    if (!inv) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(inv);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }
  try {
    const inv = await svc.createInvitation({ ...req.body, created_by: req.user!.userId });
    res.status(201).json(inv);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const inv = await svc.updateInvitation(req.params.id, req.body);
    if (!inv) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(inv);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try { await svc.deleteInvitation(req.params.id); res.status(204).send(); }
  catch { res.status(500).json({ message: 'Server error' }); }
}
