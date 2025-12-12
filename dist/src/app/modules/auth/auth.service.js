"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../../shared/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const enums_1 = require("../../../../prisma/generated/prisma/enums");
const jwtHelper_1 = require("../../helpers/jwtHelper");
const index_env_1 = require("../../../config/index.env");
const login = async (payload) => {
    console.log({ payload });
    const user = await prisma_1.prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: enums_1.UserStatus.ACTIVE
        },
        include: {
            guide: true
        }
    });
    console.log({ user });
    const isCorrectPassword = await bcryptjs_1.default.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new Error("Password is incorrect!");
    }
    const accessToken = jwtHelper_1.jwtHelper.generateToken({ email: user.email, role: user.role, id: user.id }, index_env_1.config.jwt_secret, "10h");
    const refreshToken = jwtHelper_1.jwtHelper.generateToken({ email: user.email, role: user.role, id: user.id }, index_env_1.config.jwt_refresh_sercret, "90d");
    return {
        accessToken,
        refreshToken,
        needPasswordChange: user.needPasswordChange,
        isVerifiedGuide: user.guide ? user.guide.isVerified : false,
    };
};
exports.AuthService = {
    login
};
