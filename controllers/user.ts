import type { Request, Response } from 'express';

export const getAllUsers = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: 'error', message: 'route is not yet defined' });
};

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

export const deleteUser = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: 'error', message: 'route is not yet defined' });
};
