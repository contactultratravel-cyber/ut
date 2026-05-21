import { Response } from 'express';
import { validationResult } from 'express-validator';
import * as svc from './clients.service';
import { AuthRequest } from '../../types/index';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status } = req.query as { status?: string };
    const clients = await svc.listClients(status);
    res.json(clients);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function get(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = await svc.getClient(req.params.id);
    if (!client) { res.status(404).json({ message: 'Client not found' }); return; }
    res.json(client);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  try {
    const client = await svc.createClient({ ...req.body, createdBy: req.user!.userId });
    res.status(201).json(client);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = await svc.updateClient(req.params.id, req.body);
    if (!client) { res.status(404).json({ message: 'Client not found' }); return; }
    res.json(client);
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function validateStep1(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = await svc.validateStep1(req.params.id, req.body.appointmentDate, req.body.appointmentStatus);
    res.json(client);
  } catch (err) { res.status(400).json({ message: (err as Error).message }); }
}

export async function updateAppointment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = await svc.updateAppointment(req.params.id, req.body);
    res.json(client);
  } catch (err) { res.status(400).json({ message: (err as Error).message }); }
}

export async function finalValidation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = await svc.finalValidation(req.params.id);
    res.json(client);
  } catch (err) { res.status(400).json({ message: (err as Error).message }); }
}

export async function deliver(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = await svc.deliverClient(req.params.id);
    res.json(client);
  } catch (err) { res.status(400).json({ message: (err as Error).message }); }
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    await svc.deleteClient(req.params.id);
    res.status(204).send();
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function grantVisa(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = await svc.grantVisa(req.params.id);
    res.json(client);
  } catch (err) { res.status(400).json({ message: (err as Error).message }); }
}

export async function uploadVisaPhoto(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { photo } = req.body as { photo: string };
    if (!photo) { res.status(400).json({ message: 'Photo required' }); return; }
    await svc.setVisaPhoto(req.params.id, photo);
    res.json({ ok: true });
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function deleteVisaPhoto(req: AuthRequest, res: Response): Promise<void> {
  try {
    await svc.clearVisaPhoto(req.params.id);
    res.json({ ok: true });
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function uploadPassport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { photo } = req.body as { photo: string };
    if (!photo) { res.status(400).json({ message: 'Photo required' }); return; }
    await svc.setPassportPhoto(req.params.id, photo);
    res.json({ ok: true });
  } catch { res.status(500).json({ message: 'Server error' }); }
}

export async function deletePassport(req: AuthRequest, res: Response): Promise<void> {
  try {
    await svc.clearPassportPhoto(req.params.id);
    res.json({ ok: true });
  } catch { res.status(500).json({ message: 'Server error' }); }
}
