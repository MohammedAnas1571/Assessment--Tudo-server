import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

function catchAsync(fn: AsyncFunction) {
  return async function asyncHandlerWrapper(req: Request, res: Response, next: NextFunction) {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export default catchAsync;