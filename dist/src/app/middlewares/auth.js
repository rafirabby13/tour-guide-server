"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwtHelper_1 = require("../helpers/jwtHelper");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = require("../errors/AppError");
const auth = (...roles) => {
    return async (req, res, next) => {
        try {
            // const token = req.cookies.get("accessToken");
            const token = await req.cookies?.accessToken;
            // console.log({token})
            if (!token) {
                throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "You are not authorized!");
            }
            const verifyUser = jwtHelper_1.jwtHelper.verifyToken(token, "abcd");
            req.user = verifyUser;
            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new Error("You are not authorized!");
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
exports.default = auth;
