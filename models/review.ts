import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import validator from 'validator';
import { Document, Model } from 'mongoose';

export interface IReview extends Document {
  rating: string;
  createdAt: string;
  tour: string;
  user: string;
}

interface IReviewModel extends Model<IReview> {}

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

export const Review = mongoose.model<IReview, IReviewModel>(
  'Review',
  reviewSchema
);
