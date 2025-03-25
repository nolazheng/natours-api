import type { NextFunction, Request, Response } from 'express';
import { catchAsyncError } from './error';
import { Tour } from '@/models/tour';
import createAppError from '@/utils/error-handle';

export const getOverview = catchAsyncError(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

export const getTourView = catchAsyncError(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });
  if (!tour) {
    return next(createAppError(`No document found with that ID`, 404));
  }

  res.status(200).render('tour', {
    title: req.params.slug,
    tour,
  });
});
