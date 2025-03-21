import express from 'express';
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getTourStats,
  updateTour,
} from '@/controllers/tour';
import { protect, restrictTo } from '@/controllers/auth';
import reviewRouter from '@/routes/review';

const router = express.Router();

router.use('/:id/reviews', reviewRouter);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/stats').get(getTourStats);
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

export default router;
