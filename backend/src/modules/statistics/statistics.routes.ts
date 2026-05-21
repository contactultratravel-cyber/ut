import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as ctrl from './statistics.controller';

const router = Router();
router.use(authenticate);
router.use(requireRole('ADMIN', 'ACCOUNTANT'));

router.get('/', ctrl.getStats);
router.post('/verify-password', ctrl.verifyPassword);

export default router;
