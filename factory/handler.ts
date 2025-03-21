import { catchAsyncError } from '@/controllers/error';
import createAppError from '@/utils/error-handle';
import { createQueryBuilder } from '@/utils/query-builder';
import { Model, type PopulateOptions } from 'mongoose';

export const deleteOne = (Modal: Model<any>) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Modal.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(createAppError(`No document found with that ID`, 404));
    }
    res.status(204).json({ status: 'success', data: null });
  });

export const updateOne = (Modal: Model<any>) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Modal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(createAppError(`No document found with that ID`, 404));
    }
    res.status(200).json({ status: 'success', data: { data: doc } });
  });

export const createOne = (Modal: Model<any>) =>
  catchAsyncError(async (req, res, next) => {
    const newDoc = await Modal.create(req.body);
    res.status(201).json({ status: 'success', data: { data: newDoc } });
  });

export const getOne = (Model: Model<any>, popOptions?: PopulateOptions) =>
  catchAsyncError(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(createAppError(`No document found with that ID`, 404));
    }
    res.status(200).json({ status: 'success', data: { data: doc } });
  });

export const getAll = (Model: Model<any>) =>
  catchAsyncError(async (req, res, next): Promise<void> => {
    // allow nested GET reviews on tour
    let filter = {};
    if (req.query.tour) filter = { tour: req.params.id };

    const query = createQueryBuilder(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .build();

    const doc = await query;
    res.status(200).json({ status: 'success', data: { data: doc } });
  });
