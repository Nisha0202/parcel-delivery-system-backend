import { Request, Response } from 'express';
import User from './user.model';

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await User.find();
  res.json({ success: true, data: users });
};

export const blockUser = async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
  if (!user) 
    return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

export const unblockUser = async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
  if (!user) 
    return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};