import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, type IUser } from '@/models/user';
import { catchAsyncError } from './error';
import createAppError from '@/utils/error-handle';
import { sendEmail } from '@/utils/email';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('jwt-token', token, cookieOptions);
  user.password = '';
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const filterObj = (obj: { [key: string]: any }, ...allowedFields: string[]) => {
  const newObj: { [key: string]: any } = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

export const signUp = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    });
    createSendToken(newUser, 201, res);

    // res.cookie('jwt', token, {
    //   expires: new Date(
    //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    //   ),
    //   httpOnly: true,
    // });
  }
);

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(createAppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(createAppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

export const protect = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies['jwt-token']) {
      token = req.cookies['jwt-token'];
    }

    if (!token) {
      return next(
        createAppError(
          'You are not logged in! Please log in to get access.',
          401
        )
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        createAppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
    if (decoded.iat && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        createAppError('User has changed password! Please log in again.', 401)
      );
    }

    (req as any).user = currentUser;
    next();
  }
);

// Only for render pages, no errors
export const isLoggedIn = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.cookies['jwt-token']) {
      // 1) verify token
      const decoded = jwt.verify(
        req.cookies['jwt-token'],
        process.env.JWT_SECRET
      ) as jwt.JwtPayload;

      // 2) check if user exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) check if user changed password after token was issued
      if (decoded.iat && currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // User is logged
      res.locals.user = currentUser;
      return next();
    }
    next();
  }
);

export const restrictTo = (...roles: string[]) => {
  return catchAsyncError(async (req, res, next) => {
    if (!roles.includes((req as any).user.role)) {
      return next(
        createAppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  });
};

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(createAppError('There is no user with email address.', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token',
      message,
    });
    res.status(200).json({
      status: 'success',
      resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      createAppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(createAppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

export const updatePassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user from collection
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  const user = await User.findById((req as any).user.id).select('+password');
  if (!user) {
    return next(createAppError('User not found', 404));
  }
  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(createAppError('Your current password is wrong.', 401));
  }
  // 3) If so, update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();
  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

export const updateMe = catchAsyncError(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      createAppError(
        'This route is not for password updates. Please use /update-my-password',
        400
      )
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    (req as any).user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
