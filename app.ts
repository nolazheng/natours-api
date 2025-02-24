import express from 'express';
import morgan from 'morgan';
import tourRouter from '@/routes/tour';
import userRouter from '@/routes/user';

// config
const port = 3000;
const baseUrl = '/api/v1';

// create express app
const app = express();

// middleware
app.use(morgan('dev'));
app.use(express.json());

// routes
app.use(`${baseUrl}/tours`, tourRouter);
app.use(`${baseUrl}/users`, userRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
