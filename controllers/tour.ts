import type { Request, Response } from 'express';
import { Tour } from '@/models/tour';
import { createQueryBuilder } from '@/utils/query-builder';

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
export const getAllTours = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = createQueryBuilder(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .build();

    // if (req.query.page) {
    //   const totalDocs = await Tour.countDocuments();
    //   if (page > Math.ceil(totalDocs / limit)) {
    //     res.status(404).json({ status: 'fail', message: 'Page not found' });
    //     return;
    //   }
    // }

    const tours = await query;
    res.status(200).json({ status: 'success', data: { tours } });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err });
  }
};

export const getTour = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  try {
    const tour = await Tour.findOne({ _id: id });
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err });
  }
};

export const getTourStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err });
  }
};

export const getMonthlyPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err });
  }
};

// POST
export const createTour = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

// PATCH
export const updateTour = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tour) {
      res.status(404).json({ status: 'fail', message: 'Tour not found' });
    }
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

// DELETE
export const deleteTour = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const tour = await Tour.findByIdAndDelete(id);
    if (!tour) {
      res.status(404).json({ status: 'fail', message: 'Tour not found' });
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};
