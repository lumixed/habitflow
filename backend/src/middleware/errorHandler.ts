import { Request, Response, NextFunction } from 'express';


export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
    ) => {
    if (err instanceof AppError) {
        console.error(`[${err.statusCode}] ${err.message}`);
        return res.status(err.statusCode).json({
        success: false,
        error: err.message,
        });
    }

    console.error('[500] Unexpected error:', err);
    return res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
};
