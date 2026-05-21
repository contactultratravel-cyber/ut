import { Router } from 'express';
import { body } from 'express-validator';
import * as ctrl from './clients.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

router.post('/',
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  body('country').notEmpty(),
  body('visaType').isIn(['Tourist Visa','Business Visa','Study Visa','Family Visit Visa']),
  body('totalPrice').isNumeric(),
  body('amountPaid').isNumeric(),
  ctrl.create
);

router.put('/:id', ctrl.update);

// Workflow transitions
router.post('/:id/validate-step1', ctrl.validateStep1);
router.patch('/:id/appointment', ctrl.updateAppointment);
router.post('/:id/final-validation', ctrl.finalValidation);
router.post('/:id/deliver',          ctrl.deliver);

router.delete('/:id', requireRole('ADMIN', 'EMPLOYEE'), ctrl.remove);

export default router;
