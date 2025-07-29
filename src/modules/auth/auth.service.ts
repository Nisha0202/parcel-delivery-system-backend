import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../user/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// Register a new user
export async function registerUser(name: string, email: string, password: string, role: string) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already registered');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role });
  return user;
}

// Login a user and return JWT
export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Email or password incorrect');
  if (user.isBlocked) throw new Error('User blocked');
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Email or password incorrect');
  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '2d' }
  );
  return { user, token };
}

// Verify JWT and return payload
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid token');
  }
}