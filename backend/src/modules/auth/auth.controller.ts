import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as authService from './auth.service';
import { AuthRequest } from '../../types/index';

export async function login(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  try {
    const result = await authService.loginUser(req.body.email, req.body.password);
    res.json(result);
  } catch (err: unknown) {
    res.status(401).json({ message: (err as Error).message });
  }
}

export async function profile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await authService.getProfile(req.user!.userId);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await authService.listUsers();
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  try {
    const user = await authService.createUser(req.body);
    res.status(201).json(user);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    await authService.deleteUser(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
}

export async function toggleActive(req: Request, res: Response): Promise<void> {
  try {
    const user = await authService.toggleUserActive(req.params.id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err: unknown) {
    const msg = (err as Error).message;
    if (msg === 'EMAIL_TAKEN') {
      res.status(409).json({ message: 'Cette adresse email est déjà utilisée.' });
    } else {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

export async function verifyCode(req: Request, res: Response): Promise<void> {
  try {
    const { email, code } = req.body as { email: string; code: string };
    await authService.verifyCode(email, code);
    res.json({ ok: true });
  } catch {
    res.status(400).json({ ok: false, message: 'Code invalide ou déjà utilisé.' });
  }
}
