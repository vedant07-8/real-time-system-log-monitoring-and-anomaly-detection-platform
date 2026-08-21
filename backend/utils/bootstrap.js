import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const bootstrapAdmin = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found in the database. Bootstrapping initial admin user...');
      
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPasswordPlain = process.env.ADMIN_PASSWORD || 'change_this_password';
      
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPasswordPlain, salt);
      
      const adminUser = new User({
        username: adminUsername,
        passwordHash: passwordHash,
        role: 'ADMIN'
      });
      
      await adminUser.save();
      console.log(`Initial admin user created successfully. Username: ${adminUsername}`);
    }
  } catch (error) {
    console.error('Error bootstrapping admin user:', error);
  }
};
