import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import ApiError from './ApiError';
import rootRouter from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/ping', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'web-discovery-engine is running successfully',
  });
});

app.use(rootRouter);


export default app;
