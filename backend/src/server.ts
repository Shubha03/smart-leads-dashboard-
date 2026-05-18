import express, {
  Request,
  Response,
  NextFunction
} from 'express';

import mongoose from 'mongoose';
import cors from 'cors';

import { config } from './config';
import { router } from './routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', router);

app.use(
  (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.status(err.status || 500).json({
      error:
        err.message ||
        'Internal Server Error'
    });
  }
);

mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    app.listen(config.PORT, () => {
      console.log(
        `Server running on port ${config.PORT}`
      );
    });
  })
  .catch((err) => {
    console.error(
      'MongoDB connection error:',
      err
    );
  });