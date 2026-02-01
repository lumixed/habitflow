import { Request, Response, NextFunction } from 'express';

// ─── Custom Error Class ───────────────────────────────────────────────
// Use this anywhere in your routes/services to throw a user-facing error
// with a specific status code.
//
// Example:  throw new AppError('Email already exists', 400);

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Error Handler Middleware ─────────────────────────────────────────
// Express recognizes this as an error handler because it has 4 parameters.
// It MUST be registered after all routes in index.ts.

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If it's our custom error, use the status code we set
  if (err instanceof AppError) {
    console.error(`[${err.statusCode}] ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // For anything else (unexpected errors), return 500
  console.error('[500] Unexpected error:', err);
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};
