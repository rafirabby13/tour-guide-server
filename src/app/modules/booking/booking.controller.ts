import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { BookingServices } from "./booking.service";
import { bookingFilterableFields } from "./booking.constant";
import pick from "../../helpers/pick";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const touristId = (req as any).user.id; 
  console.log({touristId})
  const result = await BookingServices.createBooking(req.body, touristId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Booking created successfully. Please complete payment.",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, bookingFilterableFields);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await BookingServices.getAllBookings(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingServices.getSingleBooking(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking retrieved successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const touristId = (req as any).user?.id;
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await BookingServices.getMyBookings(touristId, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My bookings retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getGuideBookings = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user?.id; // Assuming auth middleware sets this
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await BookingServices.getGuideBookings(guideId, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Guide bookings retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const {bookingId} = req.params;
  const userId = (req as any).user?.id;
  console.log(bookingId)
  // const result = await BookingServices.cancelBooking(bookingId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking cancelled successfully",
    data: {},
    // data: result,
  });
});



const getBookingStats = catchAsync(async (req: Request, res: Response) => {
  const guideId = (req as any).user?.id
  const result = await BookingServices.getBookingStats(guideId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking statistics retrieved successfully",
    data: result,
  });
});

export const BookingControllers = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  getMyBookings,
  getGuideBookings,
  cancelBooking,
  getBookingStats
};