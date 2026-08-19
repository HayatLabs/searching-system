import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';

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
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`) as Error & { statusCode?: number };
  error.statusCode = 404;
  next(error);
});

app.use((error: Error & { statusCode?: number }, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error.statusCode ?? 500;
  const message = error.message || 'Something went wrong';

  console.error(`[${req.method}] ${req.originalUrl}`, error);

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
});

export default app;
