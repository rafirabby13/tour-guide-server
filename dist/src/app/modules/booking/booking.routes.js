"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRoutes = void 0;
const express_1 = require("express");
const booking_controller_1 = require("./booking.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const enums_1 = require("../../../../prisma/generated/prisma/enums");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const booking_validation_1 = require("./booking.validation");
const router = (0, express_1.Router)();
router.post("/create-booking", (0, auth_1.default)(enums_1.UserRole.TOURIST), (0, validateRequest_1.default)(booking_validation_1.BookingValidation.createBookingZodSchema), booking_controller_1.BookingControllers.createBooking);
router.get("/all-bookings", (0, auth_1.default)(enums_1.UserRole.ADMIN), booking_controller_1.BookingControllers.getAllBookings);
router.get("/my-bookings", (0, auth_1.default)(enums_1.UserRole.TOURIST), booking_controller_1.BookingControllers.getMyBookings);
// Protected routes - Guide
router.get("/guide-bookings", (0, auth_1.default)(enums_1.UserRole.GUIDE), booking_controller_1.BookingControllers.getGuideBookings);
// Protected routes - Tourist/Guide/Admin
router.get("/stats", (0, auth_1.default)(enums_1.UserRole.TOURIST, enums_1.UserRole.GUIDE, enums_1.UserRole.ADMIN), booking_controller_1.BookingControllers.getBookingStats);
router.get("/:id", (0, auth_1.default)(enums_1.UserRole.TOURIST, enums_1.UserRole.GUIDE, enums_1.UserRole.ADMIN), booking_controller_1.BookingControllers.getSingleBooking);
router.patch("/:bookingId/cancel", (0, auth_1.default)(enums_1.UserRole.TOURIST, enums_1.UserRole.GUIDE, enums_1.UserRole.ADMIN), booking_controller_1.BookingControllers.cancelBooking);
exports.BookingRoutes = router;
