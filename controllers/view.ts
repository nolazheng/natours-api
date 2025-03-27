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

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: req.params.slug,
      tour,
    });
});

export const getLoginForm = catchAsyncError(async (req, res) => {
  res.status(200).render('login');
});
