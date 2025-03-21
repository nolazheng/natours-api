import express from 'express';
import { createReview, getAllReviews } from '@/controllers/review';
import { protect, restrictTo } from '@/controllers/auth';

// merge parameters to get tour id
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('admin', 'user'), createReview);

export default router;
