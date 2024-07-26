"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePhoto: {
        type: String,
        default: "https://img.freepik.com/premium-photo/memoji-happy-man-white-background-emoji_826801-6836.jpg?w=740"
    },
}, { timestamps: true });
const userModel = (0, mongoose_1.model)("User", userSchema);
exports.User = userModel;
