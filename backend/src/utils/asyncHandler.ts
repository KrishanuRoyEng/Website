import { Request, Response, NextFunction } from 'express';

type ExpressAsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

/**
 * Wraps an asynchronous Express route handler to automatically catch errors 
 * and pass them to Express's central error handler (`next(error)`).
 * This eliminates the need for repetitive try/catch blocks in every controller method.
 */
export const asyncHandler = (fn: ExpressAsyncHandler) => 
    (req: Request, res: Response, next: NextFunction) => {
        // Promise.resolve ensures the result of 'fn(req, res, next)' is a promise,
        // even if the function doesn't use 'await'.
        Promise.resolve(fn(req, res, next)).catch(next);
    };