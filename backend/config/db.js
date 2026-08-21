import mongoose from 'mongoose';
import User from '../models/User.js';
import DetectionRule from '../models/DetectionRule.js';
import SystemSettings from '../models/SystemSettings.js';
import bcrypt from 'bcryptjs';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    await seedDatabase();
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // 1. Seed Settings
    const settingsCount = await SystemSettings.countDocuments();
    if (settingsCount === 0) {
      await SystemSettings.create({ singletonKey: 'global' });
      console.log('Seeded default SystemSettings');
    }

    // 2. Seed Default Rules
    const ruleCount = await DetectionRule.countDocuments();
    if (ruleCount === 0) {
      const defaultRules = [
        { ruleId: 'brute-force', name: 'Brute Force Attack', description: 'Detects multiple failed login attempts from a single IP within a short time window.', severity: 'CRITICAL', enabled: true, threshold: 5, timeWindowMinutes: 10, score: 90 },
        { ruleId: 'port-scan', name: 'Port Scanning', description: 'Detects sequential connections to multiple different ports from the same source IP.', severity: 'HIGH', enabled: true, threshold: 20, timeWindowMinutes: 5, score: 80 },
        { ruleId: 'privilege-esc', name: 'Privilege Escalation', description: 'Detects commands associated with unauthorized privilege escalation.', severity: 'HIGH', enabled: true, threshold: 1, timeWindowMinutes: 1, score: 85 },
        { ruleId: 'unusual-hours', name: 'Unusual Login Hours', description: 'Flags successful or failed logins outside of normal operating hours.', severity: 'MEDIUM', enabled: true, threshold: 1, timeWindowMinutes: 1, score: 50 },
        { ruleId: 'admin-direct', name: 'Admin Direct Login', description: 'Flags direct login to root or administrator accounts instead of standard user escalation.', severity: 'HIGH', enabled: true, threshold: 1, timeWindowMinutes: 1, score: 80 },
        { ruleId: 'audit-cleared', name: 'Audit Log Cleared', description: 'Detects when the system audit or security log is cleared (Event ID 1102).', severity: 'CRITICAL', enabled: true, threshold: 1, timeWindowMinutes: 1, score: 100 },
      ];
      await DetectionRule.insertMany(defaultRules);
      console.log('Seeded default Detection Rules');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

export default connectDB;
