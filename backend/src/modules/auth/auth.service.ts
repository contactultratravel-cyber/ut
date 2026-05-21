import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne, run, uuid } from '../../config/database';
import { User, JwtPayload } from '../../types/index';
import { sendRegistrationCode } from '../../services/email.service';

export async function loginUser(email: string, password: string) {
  const user = queryOne<User>(
    'SELECT * FROM users WHERE email = ? AND is_active = 1',
    [email.toLowerCase().trim()]
  );

  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid credentials');

  const payload: JwtPayload = { userId: user.id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) ?? '7d',
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    },
  };
}

export function getProfile(userId: string) {
  return queryOne<Omit<User, 'password_hash'>>(
    'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE id = ?',
    [userId]
  );
}

export function listUsers() {
  return query<Omit<User, 'password_hash'>>(
    'SELECT id, email, first_name, last_name, role, is_active, verification_code, created_at FROM users ORDER BY created_at DESC'
  );
}

export async function registerUser(data: {
  email: string; password: string;
  firstName: string; lastName: string; role: string;
}) {
  const existing = queryOne('SELECT id FROM users WHERE email = ?', [data.email.toLowerCase().trim()]);
  if (existing) throw new Error('EMAIL_TAKEN');

  const hash = await bcrypt.hash(data.password, 12);
  const id   = uuid();
  const code = String(Math.floor(100000 + Math.random() * 900000));

  run(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, verification_code)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [id, data.email.toLowerCase().trim(), hash, data.firstName, data.lastName, data.role, code]
  );

  const adminEmail = process.env.GMAIL_USER ?? 'contact.ultratravel@gmail.com';
  await sendRegistrationCode({
    toAdmin:       adminEmail,
    employeeName:  `${data.firstName} ${data.lastName}`,
    employeeEmail: data.email,
    role:          data.role,
    code,
  });

  return { email: data.email, firstName: data.firstName, code };
}

export function verifyCode(email: string, code: string) {
  const user = queryOne<User>(
    'SELECT * FROM users WHERE email = ? AND verification_code = ? AND is_active = 0',
    [email.toLowerCase().trim(), code]
  );
  if (!user) throw new Error('INVALID_CODE');
  run(
    `UPDATE users SET is_active = 1, verification_code = NULL, updated_at = datetime('now') WHERE id = ?`,
    [user.id]
  );
  return { ok: true };
}

export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}) {
  const hash = await bcrypt.hash(data.password, 12);
  const id   = uuid();
  run(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, data.email.toLowerCase().trim(), hash, data.firstName, data.lastName, data.role]
  );
  return queryOne<Omit<User, 'password_hash'>>(
    'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE id = ?',
    [id]
  );
}

export function toggleUserActive(userId: string) {
  run('UPDATE users SET is_active = CASE WHEN is_active=1 THEN 0 ELSE 1 END WHERE id = ?', [userId]);
  return queryOne<User>(
    'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = ?',
    [userId]
  );
}

export async function ensureAdminExists() {
  const exists = queryOne('SELECT id FROM users WHERE email = ?', ['admin@ultratravel.com']);
  if (!exists) {
    await createUser({
      email:     'admin@ultratravel.com',
      password:  'Admin@1234',
      firstName: 'Super',
      lastName:  'Admin',
      role:      'ADMIN',
    });
    console.log('Default admin created: admin@ultratravel.com / Admin@1234');
  }
}
