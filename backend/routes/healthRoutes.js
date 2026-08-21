import express from 'express';
import mongoose from 'mongoose';
import os from 'os';
import logMonitorService from '../services/logMonitorService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const startTime = Date.now();

router.get('/', protect, (req, res) => {
  const dbState = mongoose.connection.readyState;
  let dbStatus = 'disconnected';
  if (dbState === 1) dbStatus = 'connected';
  if (dbState === 2) dbStatus = 'connecting';

  // Calculate CPU usage (simple approximation for current process, could be expanded for system wide)
  const cpus = os.cpus();
  
  // OS Memory
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryUsagePercent = (usedMem / totalMem) * 100;

  // Process Memory
  const processMem = process.memoryUsage();
  
  res.json({
    success: true,
    status: 'healthy',
    database: dbStatus,
    monitoring: logMonitorService.status().running,
    platform: logMonitorService.status().platform,
    monitoredSources: logMonitorService.status().sources,
    eventsPerSecond: logMonitorService.status().eventsPerSecond,
    averageLatencyMs: logMonitorService.status().averageLatencyMs,
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    os: {
      platform: os.platform(),
      hostname: os.hostname(),
      memory_usage_percent: memoryUsagePercent.toFixed(2),
      total_memory_mb: Math.round(totalMem / 1024 / 1024),
      free_memory_mb: Math.round(freeMem / 1024 / 1024),
      cpu_cores: cpus.length,
      load_avg: os.loadavg()
    },
    process: {
      heap_used_mb: Math.round(processMem.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(processMem.heapTotal / 1024 / 1024),
      rss_mb: Math.round(processMem.rss / 1024 / 1024)
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
