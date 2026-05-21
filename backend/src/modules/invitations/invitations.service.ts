import { query, queryOne, run, uuid } from '../../config/database';

export interface Invitation {
  id: string;
  nom_invitation: string;
  pays: string;
  date_invitation?: string;
  link?: string;
  prix_invitation: number;
  prix_b2c: number;
  note?: string;
  created_by?: string;
  created_at: string;
}

export async function listInvitations(): Promise<Invitation[]> {
  return query<Invitation>('SELECT * FROM invitations ORDER BY created_at DESC');
}

export async function getInvitation(id: string): Promise<Invitation | null> {
  return queryOne<Invitation>('SELECT * FROM invitations WHERE id = ?', [id]);
}

export async function createInvitation(data: Omit<Invitation, 'id' | 'created_at'>): Promise<Invitation | null> {
  const id = uuid();
  await run(
    `INSERT INTO invitations (id, nom_invitation, pays, date_invitation, link, prix_invitation, prix_b2c, note, created_by)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, data.nom_invitation, data.pays, data.date_invitation ?? null, data.link ?? null,
     data.prix_invitation, data.prix_b2c, data.note ?? null, data.created_by ?? null]
  );
  return getInvitation(id);
}

export async function updateInvitation(id: string, data: Partial<Invitation>): Promise<Invitation | null> {
  const map: Record<string, unknown> = {
    nom_invitation:  data.nom_invitation,
    pays:            data.pays,
    date_invitation: data.date_invitation,
    link:            data.link,
    prix_invitation: data.prix_invitation,
    prix_b2c:        data.prix_b2c,
    note:            data.note,
  };
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [col, val] of Object.entries(map)) {
    if (val !== undefined) { fields.push(`${col} = ?`); values.push(val); }
  }
  if (fields.length === 0) return getInvitation(id);
  values.push(id);
  await run(`UPDATE invitations SET ${fields.join(', ')} WHERE id = ?`, values);
  return getInvitation(id);
}

export async function deleteInvitation(id: string): Promise<void> {
  await run('DELETE FROM invitations WHERE id = ?', [id]);
}
