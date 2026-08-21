import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'RESOLVED'],
    default: 'ACTIVE',
    index: true
  },
  source: {
    type: String
  },
  sourceIp: {
    type: String
  },
  user: {
    type: String
  },
  relatedLog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Log'
  },
  threatScore: {
    type: Number,
    min: 0,
    max: 100
  },
  detectionReasons: [{
    type: String
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  detectedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: String
  },
  resolutionNote: {
    type: String
  }
}, {
  timestamps: true
});

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
