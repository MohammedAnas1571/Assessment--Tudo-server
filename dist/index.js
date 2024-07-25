"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mongoDB_1 = require("./db_connection/mongoDB");
const route_1 = __importDefault(require("./router/route"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
(0, mongoDB_1.connectToDatabase)();
app.use("/api", route_1.default);
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.message });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(` Server is running at http://localhost:${port}`);
});
