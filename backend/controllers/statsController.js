import Log from '../models/Log.js';
import Alert from '../models/Alert.js';

export const getStats = async (req, res, next) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [
      totalLogs,
      totalAnomalies,
      totalAlerts,
      activeAlerts,
      resolvedAlerts,
      logsLastHour,
      anomaliesLastHour,
      alertsLastHour,
      activeSeverityCountsArray,
      allSeverityCountsArray,
      sourceCountsArray,
      topIpsArray
    ] = await Promise.all([
      Log.countDocuments(),
      Log.countDocuments({ isAnomaly: true }),
      Alert.countDocuments(),
      Alert.countDocuments({ status: 'ACTIVE' }),
      Alert.countDocuments({ status: 'RESOLVED' }),
      Log.countDocuments({ timestamp: { $gte: oneHourAgo } }),
      Log.countDocuments({ timestamp: { $gte: oneHourAgo }, isAnomaly: true }),
      Alert.countDocuments({ createdAt: { $gte: oneHourAgo } }),
      Alert.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Alert.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Log.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Log.aggregate([
        { $match: { isAnomaly: true, sourceIp: { $ne: null } } },
        { $group: { _id: '$sourceIp', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    const activeSeverityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    activeSeverityCountsArray.forEach(s => {
      if (activeSeverityCounts[s._id] !== undefined) {
        activeSeverityCounts[s._id] = s.count;
      }
    });

    const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    allSeverityCountsArray.forEach(s => {
      if (severityCounts[s._id] !== undefined) {
        severityCounts[s._id] = s.count;
      }
    });

    const sourceCounts = {};
    sourceCountsArray.forEach(s => {
      sourceCounts[s._id] = s.count;
    });

    const topAnomalyIps = {};
    topIpsArray.forEach(s => {
      topAnomalyIps[s._id] = s.count;
    });

    const anomalyRate = totalLogs > 0 ? ((totalAnomalies / totalLogs) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      stats: {
        totalLogs,
        logsLastHour,
        totalAnomalies,
        anomaliesLastHour,
        anomalyRate,
        totalAlerts,
        activeAlerts,
        resolvedAlerts,
        alertsLastHour,
        criticalActiveAlerts: activeSeverityCounts.CRITICAL,
        highActiveAlerts: activeSeverityCounts.HIGH,
        mediumActiveAlerts: activeSeverityCounts.MEDIUM,
        lowActiveAlerts: activeSeverityCounts.LOW,
        severity_counts: severityCounts, // overall for charts
        source_counts: sourceCounts,
        top_anomaly_ips: topAnomalyIps
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTimeline = async (req, res, next) => {
  try {
    if (req.query.hours && isNaN(parseInt(req.query.hours, 10))) {
      return res.status(400).json({ success: false, error: 'Invalid hours parameter' });
    }
    const hours = parseInt(req.query.hours, 10) || 24;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Group logs by hour
    const pipeline = [
      { $match: { timestamp: { $gte: startTime } } },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
            hour: { $hour: '$timestamp' }
          },
          total: { $sum: 1 },
          anomalies: { $sum: { $cond: ['$isAnomaly', 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ];

    const results = await Log.aggregate(pipeline);

    const timeline = results.map(r => ({
      timestamp: new Date(r._id.year, r._id.month - 1, r._id.day, r._id.hour).toISOString(),
      total: r.total,
      anomalies: r.anomalies
    }));

    res.json({
      success: true,
      timeline
    });
  } catch (error) {
    next(error);
  }
};
