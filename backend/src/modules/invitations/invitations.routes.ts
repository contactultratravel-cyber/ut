import { Router } from 'express';
import { body } from 'express-validator';
import * as ctrl from './invitations.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/',
  body('nom_invitation').notEmpty().trim(),
  body('pays').notEmpty().trim(),
  body('prix_invitation').isNumeric(),
  body('prix_b2c').isNumeric(),
  ctrl.create
);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
