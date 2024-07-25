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
exports.signIn = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const userModel_1 = require("../model/userModel");
exports.signIn = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError_1.default("Please provide email and password", 400));
    }
    const admin = yield userModel_1.User.findOne({ email });
    if (!admin) {
        return next(new appError_1.default("User not found please register", 404));
    }
    const isPasswordMatch = yield bcrypt_1.default.compare(password, admin.password);
    if (!isPasswordMatch) {
        return next(new appError_1.default("Invalid email or password", 401));
    }
    const token = jsonwebtoken_1.default.sign({ id: admin._id }, process.env.TOKEN, {
        expiresIn: "5d",
    });
    res
        .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
    })
        .status(200)
        .json({ message: "Login successfully" });
}));
