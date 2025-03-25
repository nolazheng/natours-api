import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from '@/factory/handler';
import { Review } from '@/models/review';
import type { Request, Response, NextFunction } from 'express';

export const setTourUserIds = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.tour) req.body.tour = req.params.id;
  if (!req.body.user) req.body.user = (req as any).user.id;
  next();
};

export const getAllReviews = getAll(Review);
export const getReview = getOne(Review);
export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);
