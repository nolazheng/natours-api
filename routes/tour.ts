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

const router = express.Router();

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/stats').get(getTourStats);
router.route('/').get(getAllTours).post(createTour);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;
