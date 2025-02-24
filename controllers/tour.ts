import fs from 'fs';
import type {
  Request,
  RequestHandler,
  RequestParamHandler,
  Response,
} from 'express';

// types
interface Tour {
  id: number;
  name: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  startDates: string[];
}

// tours data
export const tours: Tour[] = JSON.parse(
  fs.readFileSync(
    `${import.meta.dirname}/../dev-data/data/tours-simple.json`,
    'utf-8'
  )
);

export const checkId: RequestParamHandler = (req, res, next, val) => {
  const id = parseInt(req.params.id);
  const tour = tours.find((t) => t.id === id);
  console.log('🚀 ~ id:', id);

  if (!isNaN(id) && (id > tours.length || !tour)) {
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  }
  next();
};

export const checkReqBody: RequestHandler = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
    return;
  }
  next();
};

// GET
export const getAllTours = (req: Request, res: Response): void => {
  res.status(200).json({ status: 'success', data: { tours } });
};

export const getTour = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id);

  const tour = tours.find((t) => t.id === id);
  res.status(200).json({ status: 'success', data: { tour } });
};

// POST
export const createTour = (req: Request, res: Response): void => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({ status: 'success', data: { tour: newTour } });
    }
  );
};

// PATCH
export const updateTour = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id);

  const tour = tours.find((t) => t.id === id);
  if (tour) {
    Object.assign(tour, req.body);
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
        res.status(200).json({ status: 'success', data: { tour } });
      }
    );
  }
};

// DELETE
export const deleteTour = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id);

  const tour = tours.find((t) => t.id === id);
  if (tour) {
    const index = tours.indexOf(tour);
    tours.splice(index, 1);
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
        res.status(204).json({ status: 'success', data: null });
      }
    );
  }
};
