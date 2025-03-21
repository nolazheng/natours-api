import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import mongoose from 'mongoose';
import tourRouter from '@/routes/tour';
import userRouter from '@/routes/user';
import reviewRouter from '@/routes/review';
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

// security HTTP headers
app.use(helmet());

// dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// parse JSON request body
app.use(
  express.json({
    limit: '100kb',
  })
);

// data sanitization against SQL injection
app.use(mongoSanitize());

// xss
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// serve static files from the public folder (public/images, public/css etc.)
app.use(express.static(`${import.meta.dirname}/public`));

// routes
app.use(`${baseUrl}/tours`, tourRouter);
app.use(`${baseUrl}/users`, userRouter);
app.use(`${baseUrl}/reviews`, reviewRouter);

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
