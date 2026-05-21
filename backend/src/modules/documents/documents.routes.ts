import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as ctrl from './documents.controller';

const router = Router();
router.use(authenticate);

router.get('/clients/:id/invoice',  ctrl.invoice);
router.get('/clients/:id/contract', ctrl.contract);
router.get('/clients/:id/voucher',  ctrl.voucher);

export default router;
