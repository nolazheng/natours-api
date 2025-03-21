import { catchAsyncError } from './error';
import { Review } from '@/models/review';

export const getAllReviews = catchAsyncError(
  async (req, res, next): Promise<void> => {
    let filter = {};
    if (req.query.tour) filter = { tour: req.params.id };
    const reviews = await Review.find(filter);

    res
      .status(200)
      .json({ status: 'success', results: reviews.length, data: { reviews } });
  }
);

export const createReview = catchAsyncError(
  async (req, res, next): Promise<void> => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = (req as any).user.id;

    const newReview = await Review.create(req.body);

    res.status(201).json({ status: 'success', data: { review: newReview } });
  }
);
