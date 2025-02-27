import type { Request, Response } from 'express';
import { catchAsyncError } from './error';
import { User } from '@/models/user';

export const getAllUsers = catchAsyncError(
  async (req, res, next): Promise<void> => {
    const query = User.find();

    const users = await query;
    res.status(200).json({ status: 'success', data: { users } });
  }
);

export const createUser = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: 'error', message: 'route is not yet defined' });
};

export const getUser = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: 'error', message: 'route is not yet defined' });
};

export const updateUser = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: 'error', message: 'route is not yet defined' });
};

export const deleteUser = catchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate((req as any).user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
