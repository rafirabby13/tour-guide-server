import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { StatsService } from "./stats.service";

// Get Booking Stats
const getBookingStats = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    
    const dateRange = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
    } : undefined;
    
    const result = await StatsService.getBookingStats(dateRange);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Booking statistics retrieved successfully",
        data: result
    });
});

// Get Payment Stats
const getPaymentStats = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    
    const dateRange = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
    } : undefined;
    
    const result = await StatsService.getPaymentStats(dateRange);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment statistics retrieved successfully",
        data: result
    });
});

// Get Tour Stats
const getTourStats = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    
    const dateRange = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
    } : undefined;
    
    const result = await StatsService.getTourStats(dateRange);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour statistics retrieved successfully",
        data: result
    });
});

// Get User Stats
const getUserStats = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    
    const dateRange = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
    } : undefined;
    
    const result = await StatsService.getUserStats(dateRange);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User statistics retrieved successfully",
        data: result
    });
});

// Get Dashboard Stats
const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const result = await StatsService.getDashboardStats();
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: result
    });
});

// Get Guide Stats
const getGuideStats = catchAsync(async (req: Request, res: Response) => {
    const { guideId } = req.params;
    
    const result = await StatsService.getGuideStats(guideId);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Guide statistics retrieved successfully",
        data: result
    });
});

// Get My Guide Stats (from JWT)
const getMyGuideStats = catchAsync(async (req: Request, res: Response) => {
    const guideId = req.user.guideId; // From JWT
    
    const result = await StatsService.getGuideStats(guideId);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My statistics retrieved successfully",
        data: result
    });
});

// Get Tourist Stats
const getTouristStats = catchAsync(async (req: Request, res: Response) => {
    const { touristId } = req.params;
    
    const result = await StatsService.getTouristStats(touristId);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tourist statistics retrieved successfully",
        data: result
    });
});

// Get My Tourist Stats (from JWT)
const getMyTouristStats = catchAsync(async (req: Request, res: Response) => {
    const touristId = req.user.touristId; // From JWT
    
    const result = await StatsService.getTouristStats(touristId);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My statistics retrieved successfully",
        data: result
    });
});

export const StatsControllers = {
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