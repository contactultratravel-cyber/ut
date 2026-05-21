import { Router } from 'express';
import * as ctrl from './visa-photos.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/',     ctrl.list);
router.post('/',    ctrl.create);
router.delete('/:id', ctrl.remove);
export default router;
