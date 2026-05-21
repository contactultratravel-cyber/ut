import { query, queryOne, run, uuid } from '../../config/database';
import { Ticket } from '../../types/index';

export function listTickets(): Ticket[] {
  return query<Ticket>('SELECT * FROM tickets ORDER BY created_at DESC');
}

export function getTicket(id: string): Ticket | null {
  return queryOne<Ticket>('SELECT * FROM tickets WHERE id = ?', [id]);
}

export function createTicket(data: {
  clientName: string; phone: string; destination: string; price: number; createdBy: string;
}): Ticket | null {
  const id = uuid();
  run(
    'INSERT INTO tickets (id, client_name, phone, destination, price, created_by) VALUES (?,?,?,?,?,?)',
    [id, data.clientName, data.phone, data.destination, data.price, data.createdBy]
  );
  return getTicket(id);
}

export function updateTicket(id: string, data: Partial<{
  clientName: string; phone: string; destination: string; price: number;
}>): Ticket | null {
  if (data.clientName !== undefined)  run('UPDATE tickets SET client_name=? WHERE id=?',  [data.clientName,  id]);
  if (data.phone !== undefined)        run('UPDATE tickets SET phone=?       WHERE id=?',  [data.phone,       id]);
  if (data.destination !== undefined)  run('UPDATE tickets SET destination=? WHERE id=?',  [data.destination, id]);
  if (data.price !== undefined)        run('UPDATE tickets SET price=?       WHERE id=?',  [data.price,       id]);
  return getTicket(id);
}

export function deleteTicket(id: string) {
  run('DELETE FROM tickets WHERE id = ?', [id]);
}
