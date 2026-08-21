import Alert from '../models/Alert.js';

export const getAlerts = async (req, res, next) => {
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

    if (req.query.severity) query.severity = req.query.severity;
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;
    
    if (req.query.startDate || req.query.endDate) {
      query.detectedAt = {};
      if (req.query.startDate) {
        const d = new Date(req.query.startDate);
        if (isNaN(d.getTime())) return res.status(400).json({ success: false, error: 'Invalid startDate' });
        query.detectedAt.$gte = d;
      }
      if (req.query.endDate) {
        const d = new Date(req.query.endDate);
        if (isNaN(d.getTime())) return res.status(400).json({ success: false, error: 'Invalid endDate' });
        query.detectedAt.$lte = d;
      }
    }

    const total = await Alert.countDocuments(query);
    const alerts = await Alert.find(query)
      .populate('relatedLog')
      .sort({ detectedAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      alerts: alerts.map(a => ({
        id: a._id,
        timestamp: a.detectedAt,
        type: a.type,
        title: a.title,
        description: a.description,
        severity: a.severity,
        status: a.status,
        source: a.source,
        source_ip: a.sourceIp,
        user: a.user,
        threatScore: a.threatScore,
        detectionReasons: a.detectionReasons,
        resolvedAt: a.resolvedAt,
        resolvedBy: a.resolvedBy,
        resolutionNote: a.resolutionNote,
        relatedLogId: a.relatedLog ? a.relatedLog._id : null
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id).populate('relatedLog');
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: alert._id,
        timestamp: alert.detectedAt,
        type: alert.type,
        anomaly_type: alert.type,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        status: alert.status,
        source: alert.source,
        source_ip: alert.sourceIp,
        user: alert.user,
        threatScore: alert.threatScore,
        detectionReasons: alert.detectionReasons,
        resolvedAt: alert.resolvedAt,
        resolvedBy: alert.resolvedBy,
        resolutionNote: alert.resolutionNote,
        relatedLogId: alert.relatedLog ? alert.relatedLog._id : null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    
    if (alert.status === 'RESOLVED') {
      return res.status(400).json({ success: false, error: 'Alert is already resolved' });
    }
    
    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.user ? req.user.username : 'admin'; // Will be updated when Auth is added
    alert.resolutionNote = req.body.resolutionNote || 'Resolved via dashboard';
    
    await alert.save();
    
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};
