import { queryOne } from '../../config/database';

interface Row { val: number }

export async function getStatistics(fromDate?: string, toDate?: string) {
  const from = fromDate ?? '1970-01-01';
  const to   = toDate   ?? new Date().toISOString();

  const [tickets, hotels, clients, invitations, dossiers, reste] = await Promise.all([
    queryOne<Row>('SELECT COALESCE(SUM(price),0) AS val FROM tickets WHERE created_at BETWEEN ? AND ?', [from, to]),
    queryOne<Row>('SELECT COALESCE(SUM(price),0) AS val FROM hotels WHERE created_at BETWEEN ? AND ?', [from, to]),
    queryOne<Row>('SELECT COALESCE(SUM(total_price),0) AS val FROM clients WHERE created_at BETWEEN ? AND ?', [from, to]),
    queryOne<Row>('SELECT COALESCE(SUM(prix_b2c),0) AS val FROM invitations WHERE created_at BETWEEN ? AND ?', [from, to]),
    queryOne<Row>('SELECT COALESCE(SUM(total_price),0) AS val FROM dossiers WHERE created_at BETWEEN ? AND ?', [from, to]),
    queryOne<Row>('SELECT COALESCE(SUM(total_price - amount_paid),0) AS val FROM clients WHERE created_at BETWEEN ? AND ?', [from, to]),
  ]);

  const ticketsRevenue     = Number(tickets?.val     ?? 0);
  const hotelsRevenue      = Number(hotels?.val      ?? 0);
  const clientsRevenue     = Number(clients?.val     ?? 0);
  const invitationsRevenue = Number(invitations?.val ?? 0);
  const dossiersRevenue    = Number(dossiers?.val    ?? 0);
  const restePaiement      = Number(reste?.val       ?? 0);
  const totalRevenue       = ticketsRevenue + hotelsRevenue + clientsRevenue + dossiersRevenue;
  const net                = totalRevenue - restePaiement;

  return {
    ticketsRevenue, hotelsRevenue, clientsRevenue,
    invitationsRevenue, dossiersRevenue,
    totalRevenue, restePaiement, net,
    fromDate: from, toDate: to,
  };
}
