import { Router } from "express";
import { BookingControllers } from "./booking.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import { BookingValidation } from "./booking.validation";
const router = Router();
router.post("/create-booking", auth(UserRole.TOURIST), validateRequest(BookingValidation.createBookingZodSchema), BookingControllers.createBooking);
router.get("/all-bookings", auth(UserRole.ADMIN), BookingControllers.getAllBookings);
router.get("/my-bookings", auth(UserRole.TOURIST), BookingControllers.getMyBookings);
// Protected routes - Guide
router.get("/guide-bookings", auth(UserRole.GUIDE), BookingControllers.getGuideBookings);
// Protected routes - Tourist/Guide/Admin
router.get("/stats", auth(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN), BookingControllers.getBookingStats);
router.get("/:id", auth(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN), BookingControllers.getSingleBooking);
router.patch("/:bookingId/cancel", auth(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN), BookingControllers.cancelBooking);
export const BookingRoutes = router;
