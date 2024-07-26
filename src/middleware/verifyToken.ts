import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const verifyToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
  console.log(req.cookies)
  const token = req.cookies?.access_token;
  console.log(token)

  if (!token) {
    return next(new AppError("Access denied. Please sign in to continue.", 401));
  }

  try {
    const user = jwt.verify(token, process.env.TOKEN as string) as UserPayload;
    req.user = user;
    next();
  } catch (err) {
    return next(new AppError("Session expired or invalid. Please sign in again.", 401));
  }
});