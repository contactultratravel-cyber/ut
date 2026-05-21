-- Seed file — default admin account
-- Password: Admin@1234  (bcrypt hash generated with rounds=12)
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES (
  'admin@ultratravel.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2JGNbfLZFi',
  'Super',
  'Admin',
  'ADMIN'
)
ON CONFLICT (email) DO NOTHING;
