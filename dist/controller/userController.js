"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signOut = exports.deleteTask = exports.editTask = exports.getTask = exports.updateTaskStatus = exports.getTasks = exports.addTask = exports.googleAuth = exports.signIn = exports.signUp = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const userModel_1 = require("../model/userModel");
const taskModel_1 = require("../model/taskModel");
exports.signUp = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, email, password } = req.body;
    console.log(firstname);
    if (!firstname || !lastname || !email || !password) {
        return next(new appError_1.default("Please provide all details", 400));
    }
    const user = yield userModel_1.User.findOne({ email });
    if (user) {
        return next(new appError_1.default("This email is already in use. Please use another email", 409));
    }
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    yield userModel_1.User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword
    });
    res.status(201).json({
        status: 'success',
        message: "Account created successfully",
    });
}));
exports.signIn = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError_1.default("Please provide email and password", 400));
    }
    const user = yield userModel_1.User.findOne({ email });
    if (!user) {
        return next(new appError_1.default("User not found. Please register", 404));
    }
    const isPasswordMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordMatch) {
        return next(new appError_1.default("Invalid email or password", 401));
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN, {
        expiresIn: "5d",
    });
    console.log(token);
    res
        .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    })
        .status(200)
        .json({ status: 'success', message: "Login successfully", data: user.profilePhoto });
}));
exports.googleAuth = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, email, profilePhoto } = req.body;
    if (!firstname || !lastname || !email) {
        return next(new appError_1.default("Please provide all required fields", 400));
    }
    let user = yield userModel_1.User.findOne({ email });
    if (user) {
        user.profilePhoto = profilePhoto || user.profilePhoto;
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN, {
            expiresIn: "5d",
        });
        res
            .cookie("access_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        })
            .status(200)
            .json({ status: 'success', message: "Login successfully", data: user.profilePhoto });
    }
    else {
        const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        user = yield userModel_1.User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            profilePhoto: profilePhoto,
        });
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN, {
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
}));
exports.addTask = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { description, title } = req.body;
    if (!description || !title) {
        return next(new appError_1.default('Please provide both description and title.', 400));
    }
    const normalizedTitle = title.toLowerCase();
    const existingTask = yield taskModel_1.Task.findOne({ title: normalizedTitle });
    if (existingTask) {
        return next(new appError_1.default("This task already exists", 409));
    }
    const newTask = new taskModel_1.Task({ description, title: normalizedTitle });
    yield newTask.save();
    res.status(201).json({
        status: 'success',
        message: 'Task created successfully',
    });
}));
exports.getTasks = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, sort } = req.query;
    if (!search && !sort) {
        const tasks = yield taskModel_1.Task.find({});
        return res.status(200).json({
            status: 'success',
            data: tasks,
        });
    }
    const query = search ? { title: { $regex: search, $options: 'i' } } : {};
    let sortOption = { createdAt: -1 }.toString();
    if (sort === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        query['createdAt'] = { $gte: oneWeekAgo };
    }
    else if (sort === 'two_weeks') {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        query['createdAt'] = { $gte: twoWeeksAgo };
    }
    const tasks = yield taskModel_1.Task.find(query).sort(sortOption);
    res.status(200).json({
        status: 'success',
        data: tasks,
    });
}));
exports.updateTaskStatus = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const { status } = req.body;
    if (!taskId) {
        return next(new appError_1.default('Task ID is required', 400));
    }
    if (!['Todo', 'InProgress', 'Done'].includes(status)) {
        return next(new appError_1.default('Invalid status', 400));
    }
    const task = yield taskModel_1.Task.findByIdAndUpdate(taskId, { status }, { new: true, runValidators: true });
    if (!task) {
        return next(new appError_1.default('Task not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: task,
    });
}));
exports.getTask = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    if (!taskId) {
        return next(new appError_1.default('Task ID is required', 400));
    }
    const task = yield taskModel_1.Task.findById(taskId);
    if (!task) {
        return next(new appError_1.default('Task not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: task
    });
}));
exports.editTask = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const { title, description, status } = req.body;
    if (!taskId) {
        return next(new appError_1.default('Task ID is required', 400));
    }
    if (!title || !description) {
        return next(new appError_1.default('Title and description are required for update', 400));
    }
    const validStatuses = ['Todo', 'InProgress', 'Done'];
    if (status && !validStatuses.includes(status)) {
        return next(new appError_1.default('Invalid status value', 400));
    }
    const normalizedTitle = title.toLowerCase();
    const existingTask = yield taskModel_1.Task.findOne({ title: normalizedTitle });
    if (existingTask && existingTask._id.toString() !== taskId) {
        return next(new appError_1.default("This task already exists", 409));
    }
    const task = yield taskModel_1.Task.findByIdAndUpdate(taskId, { $set: { title: normalizedTitle, description, status } }, { new: true, runValidators: true });
    if (!task) {
        return next(new appError_1.default('Task not found', 404));
    }
    res.status(200).json({
        status: 'success',
        message: 'Task updated successfully',
    });
}));
exports.deleteTask = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    if (!taskId) {
        return next(new appError_1.default('Task ID is required', 400));
    }
    const task = yield taskModel_1.Task.findByIdAndDelete(taskId);
    if (!task) {
        return next(new appError_1.default('Task not found', 404));
    }
    res.status(200).json({
        status: 'success',
        message: 'Task deleted successfully'
    });
}));
exports.signOut = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("access_token", {
        httpOnly: true,
    });
    res.status(200).json({ message: "Logout successfully" });
}));
