import logMonitorService from '../services/logMonitorService.js';
import { getConnectedClientsCount } from '../websocket/websocket.js';
import mongoose from 'mongoose';
import Log from '../models/Log.js';

export const getStatus = (req, res) => {
  res.json({
    success: true,
    data: {
      ...logMonitorService.status(),
      mode: process.env.LOG_SOURCE_MODE || 'windows',
      wsClients: getConnectedClientsCount(),
      mongodbConnected: mongoose.connection.readyState === 1
    }
  });
};

export const startMonitor = async (req, res, next) => {
  try {
    await logMonitorService.start();
    res.json({
      success: true,
      message: 'Monitoring started',
      data: logMonitorService.status()
    });
  } catch (error) {
    next(error);
  }
};

export const stopMonitor = (req, res, next) => {
  try {
    logMonitorService.stop();
    res.json({
      success: true,
      message: 'Monitoring stopped',
      data: logMonitorService.status()
    });
  } catch (error) {
    next(error);
  }
};

export const getSources = (req, res) => {
  res.json({
    success: true,
    sources: logMonitorService.monitoredSources
  });
};

export const createTestLog = async (req, res, next) => {
  try {
    const testLog = new Log({
      timestamp: req.body.timestamp || new Date(),
      source: req.body.source || 'Test/Debug',
      level: req.body.level || 'CRITICAL',
      message: req.body.message || 'This is a test log injected via the API to verify the real-time pipeline.',
      hostname: req.body.hostname || 'test-server',
      sourceIp: req.body.sourceIp || '127.0.0.1',
      user: req.body.user || 'test-admin',
      eventType: req.body.eventType || 'PipelineTest',
      process: req.body.process || undefined,
      metadata: req.body.metadata || undefined
    });
    
    // Inject into pipeline directly
    await logMonitorService.processAndBroadcast(testLog, Date.now());

    res.json({ success: true, message: 'Test log injected successfully into the pipeline.' });
  } catch (error) {
    next(error);
  }
};
