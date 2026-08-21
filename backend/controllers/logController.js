import Log from '../models/Log.js';
import logMonitorService from '../services/logMonitorService.js';

export const createLog = async (req, res, next) => {
  try {
    const { timestamp, source, level, message, hostname, sourceIp, user, eventType } = req.body;

    const logEntry = new Log({
      timestamp: timestamp || new Date(),
      source,
      level,
      message,
      hostname,
      sourceIp,
      user,
      eventType
    });

    // We pass it to logMonitorService which handles anomaly detection and broadcasting
    await logMonitorService.processAndBroadcast(logEntry);

    res.status(201).json({
      success: true,
      data: logEntry
    });
  } catch (error) {
    next(error);
  }
};

export const getLogs = async (req, res, next) => {
  try {
    if (req.query.page && isNaN(parseInt(req.query.page, 10))) {
      return res.status(400).json({ success: false, error: 'Invalid page parameter' });
    }
    if (req.query.limit && isNaN(parseInt(req.query.limit, 10))) {
      return res.status(400).json({ success: false, error: 'Invalid limit parameter' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const startIndex = (page - 1) * limit;

    const query = {};

    if (req.query.level) query.level = req.query.level;
    if (req.query.source) query.source = req.query.source;
    if (req.query.severity) query.severity = req.query.severity;
    if (req.query.isAnomaly === 'true' || req.query.anomaly_only === 'true') query.isAnomaly = true;
    if (req.query.isAnomaly === 'false' || req.query.anomaly_only === 'false') query.isAnomaly = false;
    if (req.query.sourceIp) query.sourceIp = req.query.sourceIp;
    if (req.query.user) query.user = req.query.user;
    
    if (req.query.startDate || req.query.endDate) {
      query.timestamp = {};
      if (req.query.startDate) {
        const d = new Date(req.query.startDate);
        if (isNaN(d.getTime())) return res.status(400).json({ success: false, error: 'Invalid startDate' });
        query.timestamp.$gte = d;
      }
      if (req.query.endDate) {
        const d = new Date(req.query.endDate);
        if (isNaN(d.getTime())) return res.status(400).json({ success: false, error: 'Invalid endDate' });
        query.timestamp.$lte = d;
      }
    }

    if (req.query.search) {
      query.message = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Log.countDocuments(query);
    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      logs: logs.map(l => ({
        id: l._id,
        timestamp: l.timestamp,
        source: l.source,
        level: l.level,
        message: l.message,
        source_ip: l.sourceIp,
        user: l.user,
        is_anomaly: l.isAnomaly,
        anomaly_type: l.anomalyType,
        severity: l.severity,
        hostname: l.hostname,
        process: l.process,
        threatScore: l.threatScore,
        detectionReasons: l.detectionReasons,
        metadata: l.metadata
      }))
    });
  } catch (error) {
    next(error);
  }
};
