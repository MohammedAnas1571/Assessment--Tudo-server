import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import { User } from "../model/userModel";
import { Task } from "../model/taskModel";


export const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstname, lastname, email, password } = req.body;
    console.log(firstname)

    if (!firstname || !lastname || !email || !password) {
      return next(new AppError("Please provide all details", 400));
    }

    const user = await User.findOne({ email });
    if (user) {
      return next(new AppError("This email is already in use. Please use another email", 409));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
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

    const user = await User.findOne({ email });
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
    console.log(token)
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'


      })
      .status(200)
      .json({ status: 'success', message: "Login successfully", data: user.profilePhoto });
  }
);

export const googleAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstname, lastname, email, profilePhoto } = req.body;

    if (!firstname || !lastname || !email) {
      return next(new AppError("Please provide all required fields", 400));
    }

    let user = await User.findOne({ email });

    if (user) {

      user.profilePhoto = profilePhoto || user.profilePhoto;
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.TOKEN as string, {
        expiresIn: "5d",
      });

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none'


        })
        .status(200)
        .json({ status: 'success', message: "Login successfully" });
    } else {
      const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        profilePhoto: profilePhoto || 'path/to/default-avatar.png', // Default avatar
      });

      const token = jwt.sign({ id: user._id }, process.env.TOKEN as string, {
        expiresIn: "5d",
      });

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none'

        })
        .status(200)
        .json({ status: 'success', message: "Account created and login successfully", data: user.profilePhoto });
    }
  }
);



export const addTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { description, title } = req.body;

  if (!description || !title) {
    return next(new AppError('Please provide both description and title.', 400));
  }

  const normalizedTitle = title.toLowerCase();
  const existingTask = await Task.findOne({ title: normalizedTitle });

  if (existingTask) {
    return next(new AppError("This task already exists", 409));
  }

  const newTask = new Task({ description, title: normalizedTitle });
  await newTask.save();

  res.status(201).json({
    status: 'success',
    message: 'Task created successfully',
  });
});


export const getTasks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { search, sort } = req.query;

  if (!search && !sort) {
    const tasks = await Task.find({});
    return res.status(200).json({
      status: 'success',
      data: tasks,
    });
  }

  const query: { [key: string]: any } = search ? { title: { $regex: search, $options: 'i' } } : {};


  let sortOption = { createdAt: -1 }.toString()
  if (sort === 'week') {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    query['createdAt'] = { $gte: oneWeekAgo };
  } else if (sort === 'two_weeks') {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    query['createdAt'] = { $gte: twoWeeksAgo };
  }

  const tasks = await Task.find(query).sort(sortOption);

  res.status(200).json({
    status: 'success',
    data: tasks,
  });
});



export const updateTaskStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!taskId) {
    return next(new AppError('Task ID is required', 400));
  }

  if (!['Todo', 'InProgress', 'Done'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true, runValidators: true });

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: task,
  });
});


export const getTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;

  if (!taskId) {
    return next(new AppError('Task ID is required', 400));
  }

  const task = await Task.findById(taskId);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: task
  });
});



export const editTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;
  const { title, description, status } = req.body;

  if (!taskId) {
    return next(new AppError('Task ID is required', 400));
  }

  if (!title || !description) {
    return next(new AppError('Title and description are required for update', 400));
  }

  const validStatuses = ['Todo', 'InProgress', 'Done'];
  if (status && !validStatuses.includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  const normalizedTitle = title.toLowerCase();
  const existingTask = await Task.findOne({ title: normalizedTitle });

  if (existingTask && existingTask._id.toString() !== taskId) {
    return next(new AppError("This task already exists", 409));
  }

  const task = await Task.findByIdAndUpdate(
    taskId,
    { $set: { title: normalizedTitle, description, status } },
    { new: true, runValidators: true }
  );

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Task updated successfully',

  });
});
export const deleteTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;

  if (!taskId) {
    return next(new AppError('Task ID is required', 400));
  }
  const task = await Task.findByIdAndDelete(taskId);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Task deleted successfully'
  });
});


export const signOut = catchAsync(async (req, res, next) => {
  res.clearCookie("access_token", {
    httpOnly: true,
  });
  res.status(200).json({ message: "Logout successfully" });
});