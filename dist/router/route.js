"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const router = express_1.default.Router();
router.post("/sign-in", userController_1.signIn);
router.post("/sign-up", userController_1.signUp);
router.post("/goolgeAuth", userController_1.googleAuth);
router.post("/tasks", userController_1.addTask);
exports.default = router;
