import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as ctrl from './dashboard.controller';

const router = Router();
router.use(authenticate);
router.get('/', ctrl.getStats);

export default router;
