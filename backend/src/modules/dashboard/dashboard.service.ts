import { queryOne } from '../../config/database';

interface CountRow { count: number }

export function getDashboardStats(fromDate?: string, toDate?: string) {
  if (fromDate && toDate) {
    const totalClients     = queryOne<CountRow>('SELECT COUNT(*) AS count FROM clients WHERE created_at BETWEEN ? AND ?', [fromDate, toDate]);
    const totalInvitations = queryOne<CountRow>('SELECT COUNT(*) AS count FROM invitations WHERE created_at BETWEEN ? AND ?', [fromDate, toDate]);
    const totalTickets     = queryOne<CountRow>('SELECT COUNT(*) AS count FROM tickets WHERE created_at BETWEEN ? AND ?', [fromDate, toDate]);
    const totalHotels      = queryOne<CountRow>('SELECT COUNT(*) AS count FROM hotels WHERE created_at BETWEEN ? AND ?', [fromDate, toDate]);
    return {
      totalClients:     Number(totalClients?.count     ?? 0),
      totalInvitations: Number(totalInvitations?.count ?? 0),
      totalTickets:     Number(totalTickets?.count     ?? 0),
      totalHotels:      Number(totalHotels?.count      ?? 0),
    };
  }
  const totalClients     = queryOne<CountRow>('SELECT COUNT(*) AS count FROM clients');
  const totalInvitations = queryOne<CountRow>('SELECT COUNT(*) AS count FROM invitations');
  const totalTickets     = queryOne<CountRow>('SELECT COUNT(*) AS count FROM tickets');
  const totalHotels      = queryOne<CountRow>('SELECT COUNT(*) AS count FROM hotels');
  return {
    totalClients:     Number(totalClients?.count     ?? 0),
    totalInvitations: Number(totalInvitations?.count ?? 0),
    totalTickets:     Number(totalTickets?.count     ?? 0),
    totalHotels:      Number(totalHotels?.count      ?? 0),
  };
}
