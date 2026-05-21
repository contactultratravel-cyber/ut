-- ============================================================
-- Travel Agency Management System — Database Schema
-- PostgreSQL 15+
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enum types ───────────────────────────────────────────────
CREATE TYPE user_role         AS ENUM ('ADMIN', 'EMPLOYEE', 'ACCOUNTANT');
CREATE TYPE client_status     AS ENUM ('NEW', 'PROCESSING', 'COMPLETED');
CREATE TYPE visa_type         AS ENUM (
  'Tourist Visa', 'Business Visa', 'Study Visa', 'Family Visit Visa'
);
CREATE TYPE appt_status       AS ENUM ('PENDING', 'CONFIRMED');
CREATE TYPE route_code_enum   AS ENUM ('FRA_ORN', 'FRA_ALG', 'FRA_COS', 'FRA_ANBA');

-- ─── users ────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  role          user_role    NOT NULL DEFAULT 'EMPLOYEE',
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── clients ──────────────────────────────────────────────────
CREATE TABLE clients (
  id                 UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name         VARCHAR(100)     NOT NULL,
  last_name          VARCHAR(100)     NOT NULL,
  phone              VARCHAR(50)      NOT NULL,
  email              VARCHAR(255),
  job                VARCHAR(100),
  invitation_name    VARCHAR(100),
  country            VARCHAR(50)      NOT NULL,
  visa_type          visa_type        NOT NULL,
  route_code         route_code_enum,
  total_price        NUMERIC(12,2)    NOT NULL DEFAULT 0,
  amount_paid        NUMERIC(12,2)    NOT NULL DEFAULT 0,
  status             client_status    NOT NULL DEFAULT 'NEW',
  appointment_date   TIMESTAMPTZ,
  appointment_status appt_status,
  created_by         UUID             REFERENCES users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ─── tickets ──────────────────────────────────────────────────
CREATE TABLE tickets (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(200)  NOT NULL,
  phone       VARCHAR(50)   NOT NULL,
  destination VARCHAR(200)  NOT NULL,
  price       NUMERIC(12,2) NOT NULL,
  created_by  UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── hotels ───────────────────────────────────────────────────
CREATE TABLE hotels (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(200)  NOT NULL,
  phone       VARCHAR(50)   NOT NULL,
  hotel_name  VARCHAR(200)  NOT NULL,
  price       NUMERIC(12,2) NOT NULL,
  created_by  UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_clients_status     ON clients(status);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX idx_clients_created_by ON clients(created_by);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_hotels_created_at  ON hotels(created_at DESC);

-- ─── updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
