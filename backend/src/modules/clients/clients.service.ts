import { query, queryOne, run, uuid } from '../../config/database';
import { Client } from '../../types/index';

export interface CreateClientInput {
  firstName: string; lastName: string; phone: string; email?: string;
  job?: string; invitationName?: string; country: string; visaType: string;
  routeCode?: string; totalPrice: number; amountPaid: number; createdBy: string;
  whatsapp?: string;
}

function toClient(row: Record<string, unknown>): Client {
  if (!row) return row as unknown as Client;
  return {
    ...(row as unknown as Client),
    remaining_amount: Number(row.total_price) - Number(row.amount_paid),
    is_active: row.is_active === 1 || row.is_active === true,
  } as Client;
}

export async function listClients(status?: string): Promise<Client[]> {
  const rows = status
    ? await query<Record<string,unknown>>('SELECT * FROM clients WHERE status = ? ORDER BY created_at DESC', [status])
    : await query<Record<string,unknown>>('SELECT * FROM clients ORDER BY created_at DESC');
  return rows.map(toClient);
}

export async function getClient(id: string): Promise<Client | null> {
  const row = await queryOne<Record<string,unknown>>('SELECT * FROM clients WHERE id = ?', [id]);
  return row ? toClient(row) : null;
}

export async function createClient(data: CreateClientInput): Promise<Client | null> {
  const id = uuid();
  await run(
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

export async function updateClient(id: string, data: Partial<{
  firstName: string; lastName: string; phone: string; email: string;
  job: string; invitationName: string; country: string; visaType: string;
  routeCode: string; totalPrice: number; amountPaid: number; whatsapp: string;
}>): Promise<Client | null> {
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
  await run(`UPDATE clients SET ${fields.join(', ')} WHERE id = ?`, values);
  return getClient(id);
}

export async function validateStep1(id: string, appointmentDate?: string, appointmentStatus?: string): Promise<Client> {
  const client = await getClient(id);
  if (!client) throw new Error('Client not found');
  if (client.status !== 'NEW') throw new Error('Client must be in NEW status');
  await run(
    `UPDATE clients SET status='PROCESSING', appointment_date=?, appointment_status=?,
     updated_at=datetime('now') WHERE id=?`,
    [appointmentDate ?? null, appointmentStatus ?? 'PENDING', id]
  );
  return (await getClient(id))!;
}

export async function updateAppointment(id: string, data: { appointmentDate?: string; appointmentStatus?: string }): Promise<Client> {
  const client = await getClient(id);
  if (!client) throw new Error('Client not found');
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (data.appointmentDate)  { sets.push('appointment_date=?');   vals.push(data.appointmentDate); }
  if (data.appointmentStatus){ sets.push('appointment_status=?'); vals.push(data.appointmentStatus); }
  if (sets.length > 0) {
    sets.push("updated_at=datetime('now')");
    vals.push(id);
    await run(`UPDATE clients SET ${sets.join(', ')} WHERE id=?`, vals);
  }
  return (await getClient(id))!;
}

export async function finalValidation(id: string): Promise<Client> {
  const client = await getClient(id);
  if (!client) throw new Error('Client not found');
  if (client.status !== 'PROCESSING') throw new Error('Client must be in PROCESSING status');
  await run(`UPDATE clients SET status='COMPLETED', appointment_status='CONFIRMED', updated_at=datetime('now') WHERE id=?`, [id]);
  return (await getClient(id))!;
}

export async function deliverClient(id: string): Promise<Client> {
  const client = await getClient(id);
  if (!client) throw new Error('Client not found');
  if (client.status !== 'COMPLETED') throw new Error('Client must be in COMPLETED status');
  await run(
    `UPDATE clients SET status='DELIVERED', amount_paid=total_price, updated_at=datetime('now') WHERE id=?`,
    [id]
  );
  return (await getClient(id))!;
}

export async function deleteClient(id: string): Promise<void> {
  await run('DELETE FROM clients WHERE id = ?', [id]);
}

export async function grantVisa(id: string): Promise<Client> {
  await run(
    `UPDATE clients SET status='VISA_GRANTED', visa_granted_at=datetime('now'), updated_at=datetime('now') WHERE id=?`,
    [id]
  );
  return (await getClient(id))!;
}

export async function setVisaPhoto(id: string, photo: string): Promise<void> {
  await run("UPDATE clients SET visa_photo = ?, updated_at = datetime('now') WHERE id = ?", [photo, id]);
}

export async function clearVisaPhoto(id: string): Promise<void> {
  await run("UPDATE clients SET visa_photo = NULL, updated_at = datetime('now') WHERE id = ?", [id]);
}

export async function setPassportPhoto(id: string, photo: string): Promise<void> {
  await run("UPDATE clients SET passport_photo = ?, updated_at = datetime('now') WHERE id = ?", [photo, id]);
}

export async function clearPassportPhoto(id: string): Promise<void> {
  await run("UPDATE clients SET passport_photo = NULL, updated_at = datetime('now') WHERE id = ?", [id]);
}
