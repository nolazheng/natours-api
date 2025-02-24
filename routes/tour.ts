import express from 'express';
import {
  checkId,
  checkReqBody,
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
} from '@/controllers/tour';

const router = express.Router();

router.param('id', checkId);

router.route('/').get(getAllTours).post(checkReqBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;
