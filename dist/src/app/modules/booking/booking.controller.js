"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingControllers = void 0;
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const booking_service_1 = require("./booking.service");
const booking_constant_1 = require("./booking.constant");
const pick_1 = __importDefault(require("../../helpers/pick"));
const createBooking = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user.id;
    // console.log({touristId}, req.body)
    const result = await booking_service_1.BookingServices.createBooking(req.body, touristId);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully. Please complete payment.",
        // data: {},
        data: result,
    });
});
const getAllBookings = (0, catchAsync_1.default)(async (req, res) => {
    const filters = (0, pick_1.default)(req.query, booking_constant_1.bookingFilterableFields);
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await booking_service_1.BookingServices.getAllBookings(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Bookings retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getSingleBooking = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await booking_service_1.BookingServices.getSingleBooking(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Booking retrieved successfully",
        data: result,
    });
});
const getMyBookings = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user?.id;
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await booking_service_1.BookingServices.getMyBookings(touristId, options);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "My bookings retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getGuideBookings = (0, catchAsync_1.default)(async (req, res) => {
    const guideId = req.user?.id; // Assuming auth middleware sets this
    const options = (0, pick_1.default)(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await booking_service_1.BookingServices.getGuideBookings(guideId, options);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Guide bookings retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const cancelBooking = (0, catchAsync_1.default)(async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user?.id;
    console.log(bookingId);
    // const result = await BookingServices.cancelBooking(bookingId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Booking cancelled successfully",
        data: {},
        // data: result,
    });
});
const getBookingStats = (0, catchAsync_1.default)(async (req, res) => {
    const guideId = req.user?.id;
    const result = await booking_service_1.BookingServices.getBookingStats(guideId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Booking statistics retrieved successfully",
        data: result,
    });
});
exports.BookingControllers = {
    createBooking,
    getAllBookings,
    getSingleBooking,
    getMyBookings,
    getGuideBookings,
    cancelBooking,
    getBookingStats
};
