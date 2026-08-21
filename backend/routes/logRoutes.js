import express from 'express';
import { createLog, getLogs } from '../controllers/logController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('ADMIN'), createLog);
router.get('/', protect, getLogs);
// GET /:id added to get single log
router.get('/:id', protect, async (req, res, next) => {
  try {
    const log = await import('../models/Log.js').then(m => m.default.findById(req.params.id));
    if (!log) return res.status(404).json({ success: false, error: 'Log not found' });
    res.json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
});

export default router;
