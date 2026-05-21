import { query, queryOne, run, uuid } from '../../config/database';
import { Ticket } from '../../types/index';

export async function listTickets(): Promise<Ticket[]> {
  return query<Ticket>('SELECT * FROM tickets ORDER BY created_at DESC');
}

export async function getTicket(id: string): Promise<Ticket | null> {
  return queryOne<Ticket>('SELECT * FROM tickets WHERE id = ?', [id]);
}

export async function createTicket(data: {
  clientName: string; phone: string; destination: string; price: number; createdBy: string;
}): Promise<Ticket | null> {
  const id = uuid();
  await run(
    'INSERT INTO tickets (id, client_name, phone, destination, price, created_by) VALUES (?,?,?,?,?,?)',
    [id, data.clientName, data.phone, data.destination, data.price, data.createdBy]
  );
  return getTicket(id);
}

export async function updateTicket(id: string, data: Partial<{
  clientName: string; phone: string; destination: string; price: number;
}>): Promise<Ticket | null> {
  if (data.clientName  !== undefined) await run('UPDATE tickets SET client_name=? WHERE id=?',  [data.clientName,  id]);
  if (data.phone       !== undefined) await run('UPDATE tickets SET phone=?       WHERE id=?',  [data.phone,       id]);
  if (data.destination !== undefined) await run('UPDATE tickets SET destination=? WHERE id=?',  [data.destination, id]);
  if (data.price       !== undefined) await run('UPDATE tickets SET price=?       WHERE id=?',  [data.price,       id]);
  return getTicket(id);
}

export async function deleteTicket(id: string): Promise<void> {
  await run('DELETE FROM tickets WHERE id = ?', [id]);
}
