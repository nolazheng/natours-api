import type { Request, Response } from 'express';
import { Tour } from '@/models/tour';
import { createQueryBuilder } from '@/utils/query-builder';
import { catchAsyncError } from './error';
import createAppError from '@/utils/error-handle';

export const aliasTopTours = async (
  req: Request,
  res: Response,
  next: () => void
): Promise<void> => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// GET
export const getAllTours = catchAsyncError(
  async (req, res, next): Promise<void> => {
    const query = createQueryBuilder(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .build();

    const tours = await query;
    res.status(200).json({ status: 'success', data: { tours } });
  }
);

export const getTour = catchAsyncError(
  async (req, res, next): Promise<void> => {
    const id = req.params.id;
    const tour = await Tour.findById(id);
    if (!tour) {
      return next(createAppError('Tour not found', 404));
    }

    res.status(200).json({ status: 'success', data: { tour } });
  }
);

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

// POST
export const createTour = catchAsyncError(
  async (req, res, next): Promise<void> => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { tour: newTour } });
  }
);

// PATCH
export const updateTour = catchAsyncError(
  async (req, res, next): Promise<void> => {
    const id = req.params.id;
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tour) {
      return next(createAppError('Tour not found', 404));
    }
    res.status(200).json({ status: 'success', data: { tour } });
  }
);

// DELETE
export const deleteTour = catchAsyncError(
  async (req, res, next): Promise<void> => {
    const id = req.params.id;
    const tour = await Tour.findByIdAndDelete(id);
    if (!tour) {
      return next(createAppError('Tour not found', 404));
    }
    res.status(204).json({ status: 'success', data: null });
  }
);
