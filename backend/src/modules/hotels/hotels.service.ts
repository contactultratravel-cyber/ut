import { query, queryOne, run, uuid } from '../../config/database';
import { Hotel } from '../../types/index';

export async function listHotels(): Promise<Hotel[]> {
  return query<Hotel>('SELECT * FROM hotels ORDER BY created_at DESC');
}

export async function getHotel(id: string): Promise<Hotel | null> {
  return queryOne<Hotel>('SELECT * FROM hotels WHERE id = ?', [id]);
}

export async function createHotel(data: {
  clientName: string; phone: string; hotelName: string; price: number; createdBy: string;
}): Promise<Hotel | null> {
  const id = uuid();
  await run(
    'INSERT INTO hotels (id, client_name, phone, hotel_name, price, created_by) VALUES (?,?,?,?,?,?)',
    [id, data.clientName, data.phone, data.hotelName, data.price, data.createdBy]
  );
  return getHotel(id);
}

export async function updateHotel(id: string, data: Partial<{
  clientName: string; phone: string; hotelName: string; price: number;
}>): Promise<Hotel | null> {
  if (data.clientName !== undefined) await run('UPDATE hotels SET client_name=? WHERE id=?', [data.clientName, id]);
  if (data.phone      !== undefined) await run('UPDATE hotels SET phone=?      WHERE id=?', [data.phone,      id]);
  if (data.hotelName  !== undefined) await run('UPDATE hotels SET hotel_name=? WHERE id=?', [data.hotelName,  id]);
  if (data.price      !== undefined) await run('UPDATE hotels SET price=?      WHERE id=?', [data.price,      id]);
  return getHotel(id);
}

export async function deleteHotel(id: string): Promise<void> {
  await run('DELETE FROM hotels WHERE id = ?', [id]);
}
