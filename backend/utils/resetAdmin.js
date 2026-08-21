import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'change_this_password';

try {
  await mongoose.connect(process.env.MONGO_URI);

  const adminUser = await User.findOne({ role: 'ADMIN' }).sort({ createdAt: 1 });
  if (!adminUser) {
    throw new Error('No existing ADMIN user was found; refusing to create one.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  adminUser.username = username;
  adminUser.passwordHash = passwordHash;
  adminUser.role = 'ADMIN';
  await adminUser.save();

  console.log(`Updated existing admin user ${adminUser._id} with username: ${username}`);
} finally {
  await mongoose.disconnect();
}