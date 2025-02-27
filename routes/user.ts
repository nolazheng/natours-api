import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  signUp,
  updateMe,
  updatePassword,
} from '@/controllers/auth';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '@/controllers/user';
import express from 'express';

const router = express.Router();
router.post('/login', login);
router.post('/signup', signUp);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/update-my-password', protect, updatePassword);
router.patch('/update-me', protect, updateMe);
router.patch('/delete-me', protect, deleteUser);
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
