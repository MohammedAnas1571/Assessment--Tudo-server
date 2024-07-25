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
exports.addTask = exports.googleAuth = exports.signIn = exports.signUp = void 0;
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
    const newUser = yield userModel_1.User.create({
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
    console.log(email);
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
    res
        .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
    })
        .status(200)
        .json({ status: 'success', message: "Login successfully" });
}));
exports.googleAuth = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, email } = req.body;
    if (!firstname || !lastname || !email) {
        return next(new appError_1.default("Please provide all required fields", 400));
    }
    let user = yield userModel_1.User.findOne({ email });
    if (user) {
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN, {
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
    else {
        const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        user = yield userModel_1.User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword
        });
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.TOKEN, {
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
}));
exports.addTask = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { description } = req.body;
    if (!description) {
        return next(new appError_1.default('Please provide description', 400));
    }
    const task = new taskModel_1.Task({ description });
    yield task.save();
    res.status(201).json({
        status: 'success',
        message: "Task created successfully"
    });
}));
