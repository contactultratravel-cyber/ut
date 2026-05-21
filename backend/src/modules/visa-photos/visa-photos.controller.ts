import { Response } from 'express';
import * as svc from './visa-photos.service';
import { AuthRequest } from '../../types/index';

export async function list(req: AuthRequest, res: Response) {
  try {
    const { fromDate, toDate } = req.query as { fromDate?: string; toDate?: string };
    res.json(await svc.listVisaPhotos(fromDate, toDate));
  }
  catch { res.status(500).json({ message: 'Server error' }); }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const { photo, note } = req.body as { photo: string; note?: string };
    if (!photo) { res.status(400).json({ message: 'Photo required' }); return; }
    res.status(201).json(await svc.createVisaPhoto(photo, note));
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function remove(req: AuthRequest, res: Response) {
  try { await svc.deleteVisaPhoto(req.params.id); res.status(204).send(); }
  catch { res.status(500).json({ message: 'Server error' }); }
}
