import { query, queryOne, run, uuid } from '../../config/database';

export interface Dossier {
  id: string; first_name: string; last_name: string; phone: string;
  country: string; total_price: number; note?: string;
  created_by?: string; created_at: string; updated_at: string;
}

export async function listDossiers(): Promise<Dossier[]> {
  return query<Dossier>('SELECT * FROM dossiers ORDER BY created_at DESC');
}

export async function createDossier(data: Omit<Dossier,'id'|'created_at'|'updated_at'>, createdBy: string): Promise<Dossier> {
  const id = uuid();
  await run(`INSERT INTO dossiers (id,first_name,last_name,phone,country,total_price,note,created_by)
       VALUES (?,?,?,?,?,?,?,?)`,
    [id, data.first_name, data.last_name, data.phone, data.country,
     data.total_price, data.note??null, createdBy]);
  return (await queryOne<Dossier>('SELECT * FROM dossiers WHERE id=?', [id]))!;
}

export async function updateDossier(id: string, data: Partial<Dossier>): Promise<Dossier | null> {
  const fields: string[] = [];
  const vals: unknown[] = [];
  const map: Record<string, unknown> = {
    first_name: data.first_name, last_name: data.last_name, phone: data.phone,
    country: data.country, total_price: data.total_price, note: data.note,
  };
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) { fields.push(`${k}=?`); vals.push(v); }
  }
  if (!fields.length) return queryOne<Dossier>('SELECT * FROM dossiers WHERE id=?', [id]);
  fields.push("updated_at=datetime('now')");
  vals.push(id);
  await run(`UPDATE dossiers SET ${fields.join(',')} WHERE id=?`, vals);
  return queryOne<Dossier>('SELECT * FROM dossiers WHERE id=?', [id]);
}

export async function deleteDossier(id: string): Promise<void> {
  await run('DELETE FROM dossiers WHERE id=?', [id]);
}
