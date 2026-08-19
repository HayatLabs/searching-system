import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import ApiError from './ApiError';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/ping', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'web-discovery-engine is running successfully',
  });
});

app.use((req, _res, next) => {
  const err = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(err);
});

app.use((error: any, req: Request, res: Response, _next: NextFunction) => {
  const err = ApiError.from(error);
  const statusCode = err.statusCode ?? 500;
  const message = err.message || 'Something went wrong';

  console.error(`[${req.method}] ${req.originalUrl}`, error);

  const payload: any = {
    success: false,
    status: statusCode,
    message,
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
    if (err.details) payload.details = err.details;
  }

  res.status(statusCode).json(payload);
});

export default app;
