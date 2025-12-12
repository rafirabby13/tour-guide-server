"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const auth_service_1 = require("./auth.service");
const login = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthService.login(req.body);
    const { accessToken, refreshToken, needPasswordChange, isVerifiedGuide } = result;
    res.cookie("accessToken", accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60
    });
    res.cookie("refreshToken", refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 90
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "User loggedin successfully!",
        data: {
            needPasswordChange,
            isVerifiedGuide
        }
    });
});
exports.AuthController = {
    login
};
