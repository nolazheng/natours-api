import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import tourRouter from '@/routes/tour';
import userRouter from '@/routes/user';
import createAppError from './utils/error-handle';
import { handleGlobalError } from './controllers/error';

process.on('uncaughtException', (err: any) => {
  console.error(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

// config
const port = process.env.PORT || 3000;
const baseUrl = '/api/v1';

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then((connect) => {
  console.log('DB connection successful');
});

// create express app
const app = express();

// middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${import.meta.dirname}/public`));

// routes
app.use(`${baseUrl}/tours`, tourRouter);
app.use(`${baseUrl}/users`, userRouter);

app.all('*', (req, res, next) => {
  next(
    createAppError(`Could not find ${req.originalUrl} on this server!`, 404)
  );
});

app.use(handleGlobalError);

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

process.on('unhandledRejection', (err: any) => {
  console.error(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
