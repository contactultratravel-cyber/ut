import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { initDatabase } from './config/database';
import { ensureAdminExists } from './modules/auth/auth.service';

import authRoutes       from './modules/auth/auth.routes';
import clientRoutes     from './modules/clients/clients.routes';
import ticketRoutes     from './modules/tickets/tickets.routes';
import hotelRoutes      from './modules/hotels/hotels.routes';
import statisticsRoutes from './modules/statistics/statistics.routes';
import dashboardRoutes  from './modules/dashboard/dashboard.routes';
import documentRoutes    from './modules/documents/documents.routes';
import invitationRoutes  from './modules/invitations/invitations.routes';
import bonRoutes         from './modules/bons/bons.routes';
import dossierRoutes     from './modules/dossiers/dossiers.routes';
import visaPhotoRoutes   from './modules/visa-photos/visa-photos.routes';

const app = express();

// ─── Security ─────────────────────────────────────────────────
app.use(helmet());
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (_req.method === 'OPTIONS') { res.status(200).end(); return; }
  next();
});

// ─── Rate limiting ────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use(limiter);

// ─── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',       authLimiter, authRoutes);
app.use('/api/clients',    clientRoutes);
app.use('/api/tickets',    ticketRoutes);
app.use('/api/hotels',     hotelRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/dashboard',  dashboardRoutes);
app.use('/api/documents',   documentRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/bons',        bonRoutes);
app.use('/api/dossiers',    dossierRoutes);
app.use('/api/visa-photos', visaPhotoRoutes);

// ─── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ─── Global error handler ─────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 4000);

(async () => {
  await initDatabase();
  await ensureAdminExists();
  app.listen(PORT, () => console.log(`✓ Server running on http://localhost:${PORT}`));
})();

export default app;
