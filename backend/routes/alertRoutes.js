import express from 'express';
import { param, query } from 'express-validator';
import { validate } from '../middleware/validation.js';
import { getAlerts, getAlert, resolveAlert } from '../controllers/alertController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  protect,
  getAlerts
);

router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid Alert ID')
  ],
  validate,
  protect,
  getAlert
);

router.post(
  '/:id/resolve',
  [
    param('id').isMongoId().withMessage('Invalid Alert ID')
  ],
  validate,
  protect,
  authorize('ADMIN', 'ANALYST'),
  resolveAlert
);

export default router;
