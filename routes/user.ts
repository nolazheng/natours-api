import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  restrictTo,
  signUp,
  updateMe,
  updatePassword,
} from '@/controllers/auth';
import {
  deleteMe,
  deleteUser,
  getAllUsers,
  getMeId,
  getUser,
  updateUser,
} from '@/controllers/user';
import express from 'express';

const router = express.Router();
router.post('/login', login);
router.post('/signup', signUp);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(protect);
// !add protect for all routes after this line
router.patch('/update-my-password', updatePassword);
router.get('/me', getMeId, getUser);
router.patch('/update-me', updateMe);
router.patch('/delete-me', deleteMe);

router.use(restrictTo('admin'));
// !add restrictTo admin for all routes after this line
router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
