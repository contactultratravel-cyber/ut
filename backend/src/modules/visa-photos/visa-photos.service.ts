import { query, run, uuid } from '../../config/database';

export interface VisaPhoto {
  id: string;
  photo: string;
  note?: string;
  created_at: string;
}

export async function listVisaPhotos(fromDate?: string, toDate?: string): Promise<VisaPhoto[]> {
  if (fromDate && toDate) {
    return query<VisaPhoto>(
      'SELECT * FROM visa_photos WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC',
      [fromDate, toDate + ' 23:59:59'],
    );
  }
  return query<VisaPhoto>('SELECT * FROM visa_photos ORDER BY created_at DESC');
}

export async function createVisaPhoto(photo: string, note?: string): Promise<VisaPhoto> {
  const id = uuid();
  await run('INSERT INTO visa_photos (id, photo, note) VALUES (?, ?, ?)', [id, photo, note ?? null]);
  const rows = await query<VisaPhoto>('SELECT * FROM visa_photos WHERE id = ?', [id]);
  return rows[0];
}

export async function deleteVisaPhoto(id: string): Promise<void> {
  await run('DELETE FROM visa_photos WHERE id = ?', [id]);
}

export async function countVisaPhotos(): Promise<number> {
  const rows = await query<{ count: number }>('SELECT COUNT(*) AS count FROM visa_photos');
  return Number(rows[0]?.count ?? 0);
}
