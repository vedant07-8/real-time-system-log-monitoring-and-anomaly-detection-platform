import express from 'express';
import { getStats, getTimeline } from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getStats);
router.get('/timeline', protect, getTimeline);

export default router;
