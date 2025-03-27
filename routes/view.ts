import { isLoggedIn, protect } from '@/controllers/auth';
import { getLoginForm, getOverview, getTourView } from '@/controllers/view';
import express from 'express';

const router = express.Router();

router.use(isLoggedIn);

router.get('/', getOverview);
router.get('/tour/:slug', getTourView);
router.get('/login', getLoginForm);

export default router;
