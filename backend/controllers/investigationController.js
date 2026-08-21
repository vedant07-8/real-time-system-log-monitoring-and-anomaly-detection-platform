import Log from '../models/Log.js';
import Alert from '../models/Alert.js';

export const getRelatedLogs = async (req, res, next) => {
  try {
    const { sourceIp, user, timestamp, windowMinutes = 10 } = req.query;

    if (!timestamp) {
      return res.status(400).json({ success: false, error: 'Timestamp is required' });
    }

    const time = new Date(timestamp);
    const windowMs = parseInt(windowMinutes) * 60 * 1000;
    
    const query = {
      timestamp: {
        $gte: new Date(time.getTime() - windowMs),
        $lte: new Date(time.getTime() + windowMs)
      }
    };

    if (sourceIp) {
      query.sourceIp = sourceIp;
    } else if (user) {
      query.user = user;
    } else {
      return res.status(400).json({ success: false, error: 'sourceIp or user is required' });
    }

    const logs = await Log.find(query).sort({ timestamp: 1 }).limit(500);

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export const getIpInvestigation = async (req, res, next) => {
  try {
    const { ip } = req.params;
    
    const totalEvents = await Log.countDocuments({ sourceIp: ip });
    const totalAnomalies = await Log.countDocuments({ sourceIp: ip, isAnomaly: true });
    
    const alerts = await Alert.find({ sourceIp: ip });
    const totalAlerts = alerts.length;
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
    
    const firstSeenLog = await Log.findOne({ sourceIp: ip }).sort({ timestamp: 1 });
    const lastSeenLog = await Log.findOne({ sourceIp: ip }).sort({ timestamp: -1 });

    const users = await Log.distinct('user', { sourceIp: ip, user: { $ne: null } });
    const sources = await Log.distinct('source', { sourceIp: ip });

    // Aggregate severity distribution
    const severityDist = await Alert.aggregate([
      { $match: { sourceIp: ip } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    const severityDistribution = severityDist.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const timelineRaw = await Log.find({ sourceIp: ip }).sort({ timestamp: -1 }).limit(100);
    const timeline = timelineRaw.sort((a, b) => a.timestamp - b.timestamp);

    res.json({
      success: true,
      data: {
        ip,
        totalEvents,
        totalAnomalies,
        totalAlerts,
        criticalAlerts,
        firstSeen: firstSeenLog ? firstSeenLog.timestamp : null,
        lastSeen: lastSeenLog ? lastSeenLog.timestamp : null,
        users,
        sources,
        severityDistribution,
        timeline,
      }
    });

  } catch (error) {
    next(error);
  }
};
