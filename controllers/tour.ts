import type { NextFunction, Request, Response } from 'express';
import { Tour } from '@/models/tour';
import { catchAsyncError } from './error';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from '@/factory/handler';
import createAppError from '@/utils/error-handle';

export const aliasTopTours = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

export const getTourStats = catchAsyncError(
  async (req, res, next): Promise<void> => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);
    res.status(200).json({ status: 'success', data: { stats } });
  }
);

export const getMonthlyPlan = catchAsyncError(
  async (req, res, next): Promise<void> => {
    const year = req.params.year;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTourStarts: -1 },
      },
    ]);
    res.status(200).json({ status: 'success', data: { plan } });
  }
);

export const getToursWithin = catchAsyncError(async (req, res, next) => {
  const { distance, latlng, unit } = req.query;

  if (typeof latlng !== 'string' || typeof distance !== 'string')
    return next(createAppError('Invalid query', 400));

  const [lat, lng] = latlng.split(',');
  const radius =
    unit === 'mi' ? Number(distance) / 3963.2 : Number(distance) / 6378.1;

  if (!lat || !lng)
    return next(createAppError('Please provide lat and lng', 400));

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({ status: 'success', data: { data: tours } });
});

export const getDistances = catchAsyncError(async (req, res, next) => {
  const { latlng, unit } = req.query;

  if (typeof latlng !== 'string' || !unit)
    return next(createAppError('Invalid query', 400));

  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.00621371 : 0.001;

  if (!lat || !lng)
    return next(createAppError('Please provide lat and lng', 400));

  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({ status: 'success', data: { data: tours } });
});

export const getAllTours = getAll(Tour);
export const getTour = getOne(Tour, { path: 'reviews' });
export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);
