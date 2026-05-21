import { Response } from 'express';
import { getClient } from '../clients/clients.service';
import { generateInvoice, generateContract, generateVoucher } from './documents.service';
import { AuthRequest } from '../../types/index';

async function resolveClient(id: string, res: Response) {
  const client = await getClient(id);
  if (!client) { res.status(404).json({ message: 'Client not found' }); return null; }
  return client;
}

export async function invoice(req: AuthRequest, res: Response): Promise<void> {
  const client = await resolveClient(req.params.id, res);
  if (!client) return;
  generateInvoice(client, res);
}

export async function contract(req: AuthRequest, res: Response): Promise<void> {
  const client = await resolveClient(req.params.id, res);
  if (!client) return;
  generateContract(client, res);
}

export async function voucher(req: AuthRequest, res: Response): Promise<void> {
  const client = await resolveClient(req.params.id, res);
  if (!client) return;
  generateVoucher(client, res);
}
