import { query, queryOne, run, uuid } from '../../config/database';
import { Client } from '../../types/index';

export interface CreateClientInput {
  firstName: string; lastName: string; phone: string; email?: string;
  job?: string; invitationName?: string; country: string; visaType: string;
  routeCode?: string; totalPrice: number; amountPaid: number; createdBy: string;
  whatsapp?: string;
}

function toClient(row: Record<string, unknown>): Client {
  if (!row) return row as Client;
  return {
    ...(row as Client),
    remaining_amount: Number(row.total_price) - Number(row.amount_paid),
    is_active: row.is_active === 1 || row.is_active === true,
  };
}

export function listClients(status?: string): Client[] {
  const rows = status
    ? query<Record<string,unknown>>('SELECT * FROM clients WHERE status = ? ORDER BY created_at DESC', [status])
    : query<Record<string,unknown>>('SELECT * FROM clients ORDER BY created_at DESC');
  return rows.map(toClient);
}

export function getClient(id: string): Client | null {
  const row = queryOne<Record<string,unknown>>('SELECT * FROM clients WHERE id = ?', [id]);
  return row ? toClient(row) : null;
}

export function createClient(data: CreateClientInput): Client | null {
  const id = uuid();
  run(
    `INSERT INTO clients
       (id, first_name, last_name, phone, email, job, invitation_name,
        country, visa_type, route_code, total_price, amount_paid, created_by, whatsapp)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id, data.firstName, data.lastName, data.phone, data.email ?? null,
      data.job ?? null, data.invitationName ?? null,
      data.country, data.visaType, data.routeCode ?? null,
      data.totalPrice, data.amountPaid, data.createdBy, data.whatsapp ?? null,
    ]
  );
  return getClient(id);
}

export function updateClient(id: string, data: Partial<{
  firstName: string; lastName: string; phone: string; email: string;
  job: string; invitationName: string; country: string; visaType: string;
  routeCode: string; totalPrice: number; amountPaid: number; whatsapp: string;
}>): Client | null {
  const map: Record<string, unknown> = {
    first_name: data.firstName, last_name: data.lastName, phone: data.phone,
    email: data.email, job: data.job, invitation_name: data.invitationName,
    country: data.country, visa_type: data.visaType, route_code: data.routeCode,
    total_price: data.totalPrice, amount_paid: data.amountPaid, whatsapp: data.whatsapp,
  };
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [col, val] of Object.entries(map)) {
    if (val !== undefined) { fields.push(`${col} = ?`); values.push(val); }
  }
  if (fields.length === 0) return getClient(id);
  fields.push(`updated_at = datetime('now')`);
  values.push(id);
  run(`UPDATE clients SET ${fields.join(', ')} WHERE id = ?`, values);
  return getClient(id);
}

export function validateStep1(id: string, appointmentDate?: string, appointmentStatus?: string): Client {
  const client = getClient(id);
  if (!client) throw new Error('Client not found');
  if (client.status !== 'NEW') throw new Error('Client must be in NEW status');
  run(
    `UPDATE clients SET status='PROCESSING', appointment_date=?, appointment_status=?,
     updated_at=datetime('now') WHERE id=?`,
    [appointmentDate ?? null, appointmentStatus ?? 'PENDING', id]
  );
  return getClient(id)!;
}

export function updateAppointment(id: string, data: { appointmentDate?: string; appointmentStatus?: string }): Client {
  const client = getClient(id);
  if (!client) throw new Error('Client not found');
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (data.appointmentDate)  { sets.push('appointment_date=?');   vals.push(data.appointmentDate); }
  if (data.appointmentStatus){ sets.push('appointment_status=?'); vals.push(data.appointmentStatus); }
  if (sets.length > 0) {
    sets.push("updated_at=datetime('now')");
    vals.push(id);
    run(`UPDATE clients SET ${sets.join(', ')} WHERE id=?`, vals);
  }
  return getClient(id)!;
}

export function finalValidation(id: string): Client {
  const client = getClient(id);
  if (!client) throw new Error('Client not found');
  if (client.status !== 'PROCESSING') throw new Error('Client must be in PROCESSING status');
  run(`UPDATE clients SET status='COMPLETED', appointment_status='CONFIRMED', updated_at=datetime('now') WHERE id=?`, [id]);
  return getClient(id)!;
}

export function deliverClient(id: string): Client {
  const client = getClient(id);
  if (!client) throw new Error('Client not found');
  if (client.status !== 'COMPLETED') throw new Error('Client must be in COMPLETED status');
  // Mark as delivered and set amount_paid = total_price (payment confirmed received)
  run(
    `UPDATE clients SET status='DELIVERED', amount_paid=total_price, updated_at=datetime('now') WHERE id=?`,
    [id]
  );
  return getClient(id)!;
}

export function deleteClient(id: string) {
  run('DELETE FROM clients WHERE id = ?', [id]);
}
