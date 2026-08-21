import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['ADMIN', 'ANALYST', 'VIEWER'],
    default: 'VIEWER',
  }
}, { timestamps: true });

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Exclude passwordHash from JSON
UserSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.passwordHash;
    return ret;
  }
});

export default mongoose.model('User', UserSchema);
