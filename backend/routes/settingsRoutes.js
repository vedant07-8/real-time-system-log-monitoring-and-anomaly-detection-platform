import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('ADMIN'), getSettings)
  .patch(protect, authorize('ADMIN'), updateSettings);

export default router;
