import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import authRoutes from './modules/auth/auth.routes';
import issuesRoutes from './modules/issues/issues.routes';
import errorMiddleware from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ success: true, message: 'DevPulse API is running.' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Route not found.' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorMiddleware(err, req, res, next);
});

export default app;