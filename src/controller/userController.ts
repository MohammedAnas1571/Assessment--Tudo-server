import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import { User } from "../model/userModel";


export const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return next(new AppError("Please provide all details", 400));
    }

    const user = await User.findOne({ email });
    if (user) {
      return next(new AppError("This email is already in use. Please use another email", 409));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      status: 'success',
      message: "Account created successfully",
    });
  }
);

export const signIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email })
    if (!user) {
      return next(new AppError("User not found. Please register", 404));
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = jwt.sign({ id: user._id }, process.env.TOKEN as string, {
      expiresIn: "5d",
    });

    res
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({ status: 'success', message: "Login successfully" });
  }
);

export const googleAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstname, lastname, email } = req.body;

    if (!firstname || !lastname || !email) {
      return next(new AppError("Please provide all required fields", 400));
    }

    let user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.TOKEN as string, {
        expiresIn: "5d",
      });

      res
        .cookie("access_token", token, {
          httpOnly: true,
          maxAge: 5 * 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === "production",
        })
        .status(200)
        .json({ status: 'success', message: "Login successfully" });
    } else {
      const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword
      });

      const token = jwt.sign({ id: user._id }, process.env.TOKEN as string, {
        expiresIn: "5d",
      });

      res
        .cookie("access_token", token, {
          httpOnly: true,
          maxAge: 5 * 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === "production",
        })
        .status(200)
        .json({ status: 'success', message: "Account created and login successfully" });
    }
  }
);