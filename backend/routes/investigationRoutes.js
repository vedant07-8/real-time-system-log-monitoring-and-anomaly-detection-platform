import express from 'express';
import { getRelatedLogs, getIpInvestigation } from '../controllers/investigationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/logs/related', protect, authorize('ADMIN', 'ANALYST'), getRelatedLogs);
router.get('/ip/:ip', protect, authorize('ADMIN', 'ANALYST'), getIpInvestigation);

export default router;
