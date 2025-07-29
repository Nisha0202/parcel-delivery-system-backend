import mongoose from 'mongoose';

export type UserRole = 'admin' | 'sender' | 'receiver';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'sender', 'receiver'], required: true },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema);