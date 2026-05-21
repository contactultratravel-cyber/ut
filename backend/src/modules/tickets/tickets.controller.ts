import { Response } from 'express';
import { validationResult } from 'express-validator';
import * as svc from './tickets.service';
import { AuthRequest } from '../../types/index';

export async function list(_req: AuthRequest, res: Response): Promise<void> {
  try { res.json(await svc.listTickets()); }
  catch { res.status(500).json({ message: 'Server error' }); }
}

export async function get(req: AuthRequest, res: Response): Promise<void> {
  try {
    const t = await svc.getTicket(req.params.id);
    if (!t) { res.status(404).json({ message: 'Ticket not found' }); return; }
    res.json(t);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }
  try {
    const t = await svc.createTicket({ ...req.body, createdBy: req.user!.userId });
    res.status(201).json(t);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const t = await svc.updateTicket(req.params.id, req.body);
    if (!t) { res.status(404).json({ message: 'Ticket not found' }); return; }
    res.json(t);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try { await svc.deleteTicket(req.params.id); res.status(204).send(); }
  catch { res.status(500).json({ message: 'Server error' }); }
}
