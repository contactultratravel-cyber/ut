import { queryOne } from '../../config/database';

interface CountRow { count: number }

export async function getDashboardStats(fromDate?: string, toDate?: string) {
  if (fromDate && toDate) {
    const [totalClients, totalInvitations, totalTickets, totalHotels, visaGranted] = await Promise.all([
      queryOne<CountRow>('SELECT COUNT(*) AS count FROM clients WHERE created_at BETWEEN ? AND ?', [fromDate, toDate]),
      queryOne<CountRow>('SELECT COUNT(*) AS count FROM invitations WHERE created_at BETWEEN ? AND ?', [fromDate, toDate]),
      queryOne<CountRow>('SELECT COUNT(*) AS count FROM tickets WHERE created_at BETWEEN ? AND ?', [fromDate, toDate]),
      queryOne<CountRow>('SELECT COUNT(*) AS count FROM hotels WHERE created_at BETWEEN ? AND ?', [fromDate, toDate]),
      queryOne<CountRow>("SELECT COUNT(*) AS count FROM clients WHERE status='VISA_GRANTED' AND visa_photo IS NOT NULL AND visa_granted_at BETWEEN ? AND ?", [fromDate, toDate]),
    ]);
    return {
      totalClients:     Number(totalClients?.count     ?? 0),
      totalInvitations: Number(totalInvitations?.count ?? 0),
      totalTickets:     Number(totalTickets?.count     ?? 0),
      totalHotels:      Number(totalHotels?.count      ?? 0),
      visaGranted:      Number(visaGranted?.count      ?? 0),
    };
  }
  const [totalClients, totalInvitations, totalTickets, totalHotels, visaGranted] = await Promise.all([
    queryOne<CountRow>('SELECT COUNT(*) AS count FROM clients'),
    queryOne<CountRow>('SELECT COUNT(*) AS count FROM invitations'),
    queryOne<CountRow>('SELECT COUNT(*) AS count FROM tickets'),
    queryOne<CountRow>('SELECT COUNT(*) AS count FROM hotels'),
    queryOne<CountRow>("SELECT COUNT(*) AS count FROM clients WHERE status='VISA_GRANTED' AND visa_photo IS NOT NULL"),
  ]);
  return {
    totalClients:     Number(totalClients?.count     ?? 0),
    totalInvitations: Number(totalInvitations?.count ?? 0),
    totalTickets:     Number(totalTickets?.count     ?? 0),
    totalHotels:      Number(totalHotels?.count      ?? 0),
    visaGranted:      Number(visaGranted?.count      ?? 0),
  };
}
