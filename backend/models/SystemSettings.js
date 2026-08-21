import mongoose from 'mongoose';

const SystemSettingsSchema = new mongoose.Schema({
  singletonKey: { type: String, default: 'global', unique: true },
  monitoredChannels: {
    security: { type: Boolean, default: true },
    system: { type: Boolean, default: true },
    application: { type: Boolean, default: false },
    setup: { type: Boolean, default: false },
  },
  retentionDays: { type: Number, default: 30 },
}, { timestamps: true });

export default mongoose.model('SystemSettings', SystemSettingsSchema);
