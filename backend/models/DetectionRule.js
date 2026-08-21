import mongoose from 'mongoose';

const DetectionRuleSchema = new mongoose.Schema({
  ruleId: { type: String, required: true, unique: true }, // e.g. 'brute-force'
  name: { type: String, required: true },
  description: { type: String },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  enabled: { type: Boolean, default: true },
  threshold: { type: Number, default: 5 }, // Meaning varies by rule
  timeWindowMinutes: { type: Number, default: 10 },
  score: { type: Number, default: 50 },
}, { timestamps: true });

export default mongoose.model('DetectionRule', DetectionRuleSchema);
