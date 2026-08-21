import express from 'express';
import { getStatus, startMonitor, stopMonitor, getSources, createTestLog } from '../controllers/monitorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status', protect, getStatus);
router.post('/start', protect, authorize('ADMIN'), startMonitor);
router.post('/stop', protect, authorize('ADMIN'), stopMonitor);
router.get('/sources', protect, getSources);
router.post('/test-log', protect, authorize('ADMIN'), createTestLog);

export default router;
