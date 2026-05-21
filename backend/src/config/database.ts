import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';

const client = createClient({
  url:       process.env.TURSO_DATABASE_URL ?? 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name    TEXT NOT NULL,
    last_name     TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'EMPLOYEE',
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS clients (
    id                 TEXT PRIMARY KEY,
    first_name         TEXT NOT NULL,
    last_name          TEXT NOT NULL,
    phone              TEXT NOT NULL,
    email              TEXT,
    job                TEXT,
    invitation_name    TEXT,
    country            TEXT NOT NULL,
    visa_type          TEXT NOT NULL,
    route_code         TEXT,
    total_price        REAL NOT NULL DEFAULT 0,
    amount_paid        REAL NOT NULL DEFAULT 0,
    status             TEXT NOT NULL DEFAULT 'NEW',
    appointment_date   TEXT,
    appointment_status TEXT,
    whatsapp           TEXT,
    created_by         TEXT,
    created_at         TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS tickets (
    id          TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    phone       TEXT NOT NULL,
    destination TEXT NOT NULL,
    price       REAL NOT NULL,
    created_by  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS hotels (
    id          TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    phone       TEXT NOT NULL,
    hotel_name  TEXT NOT NULL,
    price       REAL NOT NULL,
    created_by  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS invitations (
    id              TEXT PRIMARY KEY,
    nom_invitation  TEXT NOT NULL,
    pays            TEXT NOT NULL,
    date_invitation TEXT,
    link            TEXT,
    prix_invitation REAL NOT NULL DEFAULT 0,
    prix_b2c        REAL NOT NULL DEFAULT 0,
    note            TEXT,
    created_by      TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS bons (
    id         TEXT PRIMARY KEY,
    date       TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name  TEXT NOT NULL,
    phone      TEXT,
    motif      TEXT,
    total      REAL NOT NULL DEFAULT 0,
    paid       REAL NOT NULL DEFAULT 0,
    agent      TEXT,
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS dossiers (
    id          TEXT PRIMARY KEY,
    first_name  TEXT NOT NULL,
    last_name   TEXT NOT NULL,
    phone       TEXT NOT NULL,
    country     TEXT NOT NULL,
    total_price REAL NOT NULL DEFAULT 0,
    note        TEXT,
    created_by  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_clients_status      ON clients(status)`,
  `CREATE INDEX IF NOT EXISTS idx_clients_created_at  ON clients(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_invitations_created ON invitations(created_at)`,
];

export async function initDatabase(): Promise<void> {
  for (const stmt of SCHEMA) {
    await client.execute(stmt);
  }
  // Migrations — safe to run each time
  try { await client.execute('ALTER TABLE clients ADD COLUMN whatsapp TEXT'); } catch (_) {}
  try { await client.execute('ALTER TABLE users ADD COLUMN verification_code TEXT'); } catch (_) {}
}

function toObj<T>(columns: string[], row: Record<string, unknown>): T {
  const obj: Record<string, unknown> = {};
  for (const col of columns) {
    const v = row[col];
    obj[col] = typeof v === 'bigint' ? Number(v) : v;
  }
  return obj as T;
}

export async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await client.execute({ sql, args: params as never[] });
  return result.rows.map(row => toObj<T>(result.columns, row as unknown as Record<string, unknown>));
}

export async function queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function run(sql: string, params: unknown[] = []): Promise<void> {
  await client.execute({ sql, args: params as never[] });
}

export function uuid(): string {
  return randomUUID();
}
