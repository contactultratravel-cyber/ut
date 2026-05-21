import initSqlJs, { Database } from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DB_PATH = process.env.DB_PATH
  ?? path.join(process.cwd(), '..', 'data', 'ultratravel.db');

let db: Database;

function save() {
  writeFileSync(DB_PATH, Buffer.from(db.export()));
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name    TEXT NOT NULL,
    last_name     TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'EMPLOYEE',
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS clients (
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
    created_by         TEXT,
    created_at         TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS tickets (
    id          TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    phone       TEXT NOT NULL,
    destination TEXT NOT NULL,
    price       REAL NOT NULL,
    created_by  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS hotels (
    id          TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    phone       TEXT NOT NULL,
    hotel_name  TEXT NOT NULL,
    price       REAL NOT NULL,
    created_by  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS invitations (
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
  );
  CREATE TABLE IF NOT EXISTS bons (
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
  );
  CREATE TABLE IF NOT EXISTS dossiers (
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
  );
  CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
  CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);
  CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON invitations(created_at);
`;

export async function initDatabase(): Promise<void> {
  const dir = path.dirname(DB_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const SQL = await initSqlJs({
    locateFile: (file: string) =>
      path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
  });

  if (existsSync(DB_PATH)) {
    db = new SQL.Database(readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run(SCHEMA);
  // Migrations — add columns if they don't exist yet
  try { db.run('ALTER TABLE clients ADD COLUMN whatsapp TEXT'); } catch (_) {}
  try { db.run('ALTER TABLE users ADD COLUMN verification_code TEXT'); } catch (_) {}
  save();
}

export function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params as Parameters<typeof stmt.bind>[0]);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

export function queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | null {
  const rows = query<T>(sql, params);
  return rows[0] ?? null;
}

export function run(sql: string, params: unknown[] = []): void {
  const stmt = db.prepare(sql);
  stmt.bind(params as Parameters<typeof stmt.bind>[0]);
  stmt.step();
  stmt.free();
  save();
}

export function uuid(): string {
  return randomUUID();
}
