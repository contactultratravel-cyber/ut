import { Response } from 'express';
import { validationResult } from 'express-validator';
import * as svc from './hotels.service';
import { AuthRequest } from '../../types/index';

export async function list(_req: AuthRequest, res: Response): Promise<void> {
  try { res.json(await svc.listHotels()); }
  catch { res.status(500).json({ message: 'Server error' }); }
}

export async function get(req: AuthRequest, res: Response): Promise<void> {
  try {
    const h = await svc.getHotel(req.params.id);
    if (!h) { res.status(404).json({ message: 'Hotel not found' }); return; }
    res.json(h);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }
  try {
    const h = await svc.createHotel({ ...req.body, createdBy: req.user!.userId });
    res.status(201).json(h);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const h = await svc.updateHotel(req.params.id, req.body);
    if (!h) { res.status(404).json({ message: 'Hotel not found' }); return; }
    res.json(h);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try { await svc.deleteHotel(req.params.id); res.status(204).send(); }
  catch { res.status(500).json({ message: 'Server error' }); }
}
