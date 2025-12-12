"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourController = void 0;
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const tour_service_1 = require("./tour.service");
const pick_1 = __importDefault(require("../../helpers/pick"));
const tour_constant_1 = require("./tour.constant");
const createTour = (0, catchAsync_1.default)(async (req, res, next) => {
    console.log("object", req.files);
    console.log("object", req.body);
    const result = await tour_service_1.TourServices.createTour(req);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Tour created",
        // data: {}
        data: result
    });
});
const getAllFromDB = (0, catchAsync_1.default)(async (req, res) => {
    const filters = (0, pick_1.default)(req.query, tour_constant_1.tourFilterableFields); // searching , filtering
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]); // pagination and sorting
    const result = await tour_service_1.TourServices.getAllFromDB(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tours retrive successfully!",
        meta: result.meta,
        data: result.data
    });
});
const getSingleTour = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await tour_service_1.TourServices.getSingleFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tour retrieved successfully",
        data: result,
    });
});
const updateTour = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await tour_service_1.TourServices.updateIntoDB(id, req);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tour updated successfully",
        data: result,
    });
});
const deleteTour = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await tour_service_1.TourServices.deleteFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tour deleted successfully",
        data: result,
    });
});
const checkAvailability = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { date, guestCount } = req.body;
    const result = await tour_service_1.TourServices.checkAvailability(id, new Date(date), guestCount);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Availability checked successfully",
        data: result,
    });
});
const getMyTours = (0, catchAsync_1.default)(async (req, res) => {
    const guideId = req.user.id;
    console.log("..................", { guideId });
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await tour_service_1.TourServices.getMyTours(guideId, options);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "My tours retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const updatetourStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { tourId, status } = req.body;
    const result = await tour_service_1.TourServices.updatetourStatus(tourId, status);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Tours status updated successfully",
        data: result,
    });
});
const getPopularDestinations = (0, catchAsync_1.default)(async (req, res) => {
    const result = await tour_service_1.TourServices.getPopularDestinations();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Popular destinations retrieved successfully",
        data: result,
    });
});
exports.TourController = {
    createTour,
    getAllFromDB,
    getSingleTour,
    updateTour,
    deleteTour,
    checkAvailability,
    getMyTours,
    updatetourStatus,
    getPopularDestinations
};
