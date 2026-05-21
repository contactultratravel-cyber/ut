import { Router } from 'express';
import { body } from 'express-validator';
import * as ctrl from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  ctrl.login
);

router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('role').isIn(['EMPLOYEE', 'ACCOUNTANT']),
  ctrl.register
);

router.post('/verify-code', ctrl.verifyCode);

router.get('/me', authenticate, ctrl.profile);

// Admin-only user management
router.get('/users', authenticate, requireRole('ADMIN'), ctrl.getUsers);

router.post('/users',
  authenticate,
  requireRole('ADMIN'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('role').isIn(['ADMIN', 'EMPLOYEE', 'ACCOUNTANT']),
  ctrl.createUser
);

router.patch('/users/:id/toggle', authenticate, requireRole('ADMIN'), ctrl.toggleActive);

router.delete('/users/:id', authenticate, requireRole('ADMIN'), ctrl.deleteUser);

export default router;
