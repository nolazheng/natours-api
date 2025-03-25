import { getOverview, getTourView } from '@/controllers/view';
import express from 'express';

const router = express.Router();

router.get('/', getOverview);
router.get('/tour/:slug', getTourView);

export default router;
