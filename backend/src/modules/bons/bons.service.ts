import { query, queryOne, run, uuid } from '../../config/database';

export interface Bon {
  id: string; date: string; first_name: string; last_name: string;
  phone?: string; motif?: string; total: number; paid: number;
  agent?: string; created_by?: string; created_at: string; updated_at: string;
}

export function listBons(): Bon[] {
  return query<Bon>('SELECT * FROM bons ORDER BY created_at DESC');
}

export function createBon(data: Omit<Bon,'id'|'created_at'|'updated_at'>, createdBy: string): Bon {
  const id = uuid();
  run(`INSERT INTO bons (id,date,first_name,last_name,phone,motif,total,paid,agent,created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id, data.date, data.first_name, data.last_name, data.phone??null,
     data.motif??null, data.total, data.paid, data.agent??null, createdBy]);
  return queryOne<Bon>('SELECT * FROM bons WHERE id=?', [id])!;
}

export function updateBon(id: string, data: Partial<Bon>): Bon | null {
  const fields: string[] = [];
  const vals: unknown[] = [];
  const map: Record<string, unknown> = {
    date: data.date, first_name: data.first_name, last_name: data.last_name,
    phone: data.phone, motif: data.motif, total: data.total,
    paid: data.paid, agent: data.agent,
  };
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) { fields.push(`${k}=?`); vals.push(v); }
  }
  if (!fields.length) return queryOne<Bon>('SELECT * FROM bons WHERE id=?', [id]);
  fields.push("updated_at=datetime('now')");
  vals.push(id);
  run(`UPDATE bons SET ${fields.join(',')} WHERE id=?`, vals);
  return queryOne<Bon>('SELECT * FROM bons WHERE id=?', [id]);
}

export function deleteBon(id: string): void {
  run('DELETE FROM bons WHERE id=?', [id]);
}
