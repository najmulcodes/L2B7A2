import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${err.stack || err.message}`);

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'An unexpected server error occurred.',
  });
};

export default errorMiddleware;