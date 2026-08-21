import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  source: {
    type: String,
    required: true,
    index: true
  },
  level: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  hostname: {
    type: String,
    default: 'unknown'
  },
  sourceIp: {
    type: String,
    index: true
  },
  user: {
    type: String
  },
  eventType: {
    type: String
  },
  process: {
    type: String
  },
  isAnomaly: {
    type: Boolean,
    default: false,
    index: true
  },
  anomalyType: {
    type: String
  },
  severity: {
    type: String,
    index: true
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
  }
}, {
  timestamps: true
});

const Log = mongoose.model('Log', logSchema);

export default Log;
