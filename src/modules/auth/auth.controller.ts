import { Request, Response } from 'express';
import User from '../user/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { hashPassword } from '../../utils/hashPassword';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!['sender', 'receiver'].includes(role)) {
    return res.status(422).json({ success: false, message: 'Invalid role' });
  }
  const exists = await User.findOne({ email });
  if (exists) 
    return res.status(409).json({ success: false, message: 'Email already registered' });

  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed, role });
  res.status(201).json({ success: true, data: user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) 
    return res.status(401).json({ success: false, message: 'Email or password incorrect' });
  if (user.isBlocked) 
    return res.status(403).json({ success: false, message: 'User blocked' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) 
    return res.status(401).json({ success: false, message: 'Email or password incorrect' });

  const token = jwt.sign(
  { i: user._id.toString(), r: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);

  res.json({ success: true, token, data: { id: user._id, name: user.name, role: user.role } });
};