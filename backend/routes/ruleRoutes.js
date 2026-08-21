import express from 'express';
import { getRules, getRule, updateRule, createRule, deleteRule } from '../controllers/ruleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All rule endpoints require authentication and ADMIN.
router.route('/')
  .get(protect, authorize('ADMIN'), getRules)
  .post(protect, authorize('ADMIN'), createRule);

router.route('/:id')
  .get(protect, authorize('ADMIN'), getRule)
  .patch(protect, authorize('ADMIN'), updateRule)
  .delete(protect, authorize('ADMIN'), deleteRule);

export default router;
