import { query, queryOne, run, uuid } from '../../config/database';
import { Hotel } from '../../types/index';

export function listHotels(): Hotel[] {
  return query<Hotel>('SELECT * FROM hotels ORDER BY created_at DESC');
}

export function getHotel(id: string): Hotel | null {
  return queryOne<Hotel>('SELECT * FROM hotels WHERE id = ?', [id]);
}

export function createHotel(data: {
  clientName: string; phone: string; hotelName: string; price: number; createdBy: string;
}): Hotel | null {
  const id = uuid();
  run(
    'INSERT INTO hotels (id, client_name, phone, hotel_name, price, created_by) VALUES (?,?,?,?,?,?)',
    [id, data.clientName, data.phone, data.hotelName, data.price, data.createdBy]
  );
  return getHotel(id);
}

export function updateHotel(id: string, data: Partial<{
  clientName: string; phone: string; hotelName: string; price: number;
}>): Hotel | null {
  if (data.clientName !== undefined) run('UPDATE hotels SET client_name=? WHERE id=?', [data.clientName, id]);
  if (data.phone !== undefined)      run('UPDATE hotels SET phone=?      WHERE id=?', [data.phone,      id]);
  if (data.hotelName !== undefined)  run('UPDATE hotels SET hotel_name=? WHERE id=?', [data.hotelName,  id]);
  if (data.price !== undefined)      run('UPDATE hotels SET price=?      WHERE id=?', [data.price,      id]);
  return getHotel(id);
}

export function deleteHotel(id: string) {
  run('DELETE FROM hotels WHERE id = ?', [id]);
}
