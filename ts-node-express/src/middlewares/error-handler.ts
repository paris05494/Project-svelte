import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

/**
 * Custom error class for operational errors in the application.
 * These errors are expected and can be handled gracefully (e.g., sending specific HTTP status codes).
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        console.error('ERROR', err);
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err,
        });
    } else {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            console.error('ERROR', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong',
            });
        }
    }
};
