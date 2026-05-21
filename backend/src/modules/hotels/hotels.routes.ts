import { Router } from 'express';
import { body } from 'express-validator';
import * as ctrl from './hotels.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/',
  body('clientName').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  body('hotelName').notEmpty().trim(),
  body('price').isNumeric(),
  ctrl.create
);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
