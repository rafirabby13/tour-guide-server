"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsControllers = void 0;
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const stats_service_1 = require("./stats.service");
// Get Booking Stats
const getBookingStats = (0, catchAsync_1.default)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = startDate && endDate ? {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
    } : undefined;
    const result = await stats_service_1.StatsService.getBookingStats(dateRange);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Booking statistics retrieved successfully",
        data: result
    });
});
// Get Payment Stats
const getPaymentStats = (0, catchAsync_1.default)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = startDate && endDate ? {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
    } : undefined;
    const result = await stats_service_1.StatsService.getPaymentStats(dateRange);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Payment statistics retrieved successfully",
        data: result
    });
});
// Get Tour Stats
const getTourStats = (0, catchAsync_1.default)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = startDate && endDate ? {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
    } : undefined;
    const result = await stats_service_1.StatsService.getTourStats(dateRange);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Tour statistics retrieved successfully",
        data: result
    });
});
// Get User Stats
const getUserStats = (0, catchAsync_1.default)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateRange = startDate && endDate ? {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
    } : undefined;
    const result = await stats_service_1.StatsService.getUserStats(dateRange);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User statistics retrieved successfully",
        data: result
    });
});
// Get Dashboard Stats
const getDashboardStats = (0, catchAsync_1.default)(async (req, res) => {
    const result = await stats_service_1.StatsService.getDashboardStats();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: result
    });
});
// Get Guide Stats
const getGuideStats = (0, catchAsync_1.default)(async (req, res) => {
    const { guideId } = req.params;
    const result = await stats_service_1.StatsService.getGuideStats(guideId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Guide statistics retrieved successfully",
        data: result
    });
});
// Get My Guide Stats (from JWT)
const getMyGuideStats = (0, catchAsync_1.default)(async (req, res) => {
    const guideId = req.user.id; // From JWT
    const result = await stats_service_1.StatsService.getGuideStats(guideId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "My statistics retrieved successfully",
        data: result
    });
});
// Get Tourist Stats
const getTouristStats = (0, catchAsync_1.default)(async (req, res) => {
    const { touristId } = req.params;
    const result = await stats_service_1.StatsService.getTouristStats(touristId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Tourist statistics retrieved successfully",
        data: result
    });
});
// Get My Tourist Stats (from JWT)
const getMyTouristStats = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user.id; // From JWT
    const result = await stats_service_1.StatsService.getTouristStats(touristId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "My statistics retrieved successfully",
        data: result
    });
});
exports.StatsControllers = {
    getBookingStats,
    getPaymentStats,
    getTourStats,
    getUserStats,
    getDashboardStats,
    getGuideStats,
    getMyGuideStats,
    getTouristStats,
    getMyTouristStats
};
