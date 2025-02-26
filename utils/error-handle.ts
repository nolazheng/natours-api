import { Error } from 'mongoose';

interface AppError extends Error {
  status: string;
  isOperational: boolean;
  statusCode: number;
}

const createAppError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  error.isOperational = true;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, createAppError);
  }

  return error;
};

export default createAppError;
