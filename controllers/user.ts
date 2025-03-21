import { catchAsyncError } from './error';
import { User } from '@/models/user';
import { deleteOne, getAll, getOne, updateOne } from '@/factory/handler';
import type { Request, Response, NextFunction } from 'express';

export const getAllUsers = getAll(User);
export const getUser = getOne(User);
// DO BOT update passwords here
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);

export const getMeId = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = (req as any).user.id;
  next();
};

export const deleteMe = catchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate((req as any).user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
