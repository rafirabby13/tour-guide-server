"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const stats_controller_1 = require("./stats.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const enums_1 = require("../../../../prisma/generated/prisma/enums");
const router = express_1.default.Router();
// Admin Routes
router.get("/dashboard", 
// auth(UserRole.ADMIN),
stats_controller_1.StatsControllers.getDashboardStats);
router.get("/bookings", 
// auth(UserRole.ADMIN),
stats_controller_1.StatsControllers.getBookingStats);
router.get("/payments", (0, auth_1.default)(enums_1.UserRole.ADMIN), stats_controller_1.StatsControllers.getPaymentStats);
router.get("/tours", (0, auth_1.default)(enums_1.UserRole.ADMIN), stats_controller_1.StatsControllers.getTourStats);
router.get("/users", (0, auth_1.default)(enums_1.UserRole.ADMIN), stats_controller_1.StatsControllers.getUserStats);
// Guide Routes
router.get("/my/stats", (0, auth_1.default)(enums_1.UserRole.GUIDE), stats_controller_1.StatsControllers.getMyGuideStats);
router.get("/guide/:guideId", (0, auth_1.default)(enums_1.UserRole.ADMIN, enums_1.UserRole.GUIDE), stats_controller_1.StatsControllers.getGuideStats);
// Tourist Routes
router.get("/my-tourist-stats", (0, auth_1.default)(enums_1.UserRole.TOURIST), stats_controller_1.StatsControllers.getMyTouristStats);
router.get("/tourist/:touristId", (0, auth_1.default)(enums_1.UserRole.ADMIN), stats_controller_1.StatsControllers.getTouristStats);
exports.StatsRoutes = router;
