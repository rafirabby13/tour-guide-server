import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { BookingServices } from "./booking.service";

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

// const getAllBookings = catchAsync(async (req: Request, res: Response) => {
//   const filters = pick(req.query, bookingFilterableFields);
//   const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

//   const result = await BookingServices.getAllBookings(filters, options);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Bookings retrieved successfully",
//     meta: result.meta,
//     data: result.data,
//   });
// });

// const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const result = await BookingServices.getSingleBooking(id);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Booking retrieved successfully",
//     data: result,
//   });
// });

// const getMyBookings = catchAsync(async (req: Request, res: Response) => {
//   const touristId = req.user?.touristId;
//   const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

//   const result = await BookingServices.getMyBookings(touristId, options);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "My bookings retrieved successfully",
//     meta: result.meta,
//     data: result.data,
//   });
// });

// const getGuideBookings = catchAsync(async (req: Request, res: Response) => {
//   const guideId = req.user?.guideId; // Assuming auth middleware sets this
//   const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

//   const result = await BookingServices.getGuideBookings(guideId, options);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Guide bookings retrieved successfully",
//     meta: result.meta,
//     data: result.data,
//   });
// });

// const cancelBooking = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const userId = req.user?.id;
//   const userRole = req.user?.role;
//   const { reason } = req.body;

//   const result = await BookingServices.cancelBooking(id, userId, userRole, reason);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Booking cancelled successfully",
//     data: result,
//   });
// });

// // Payment webhook handlers
// const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
//   const paymentData = req.body;
//   const result = await BookingServices.handlePaymentSuccess(paymentData);

//   // Redirect to frontend success page
//   const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//   res.redirect(`${frontendUrl}/booking/success?bookingId=${result.id}`);
// });

// const paymentFail = catchAsync(async (req: Request, res: Response) => {
//   const { value_a: bookingId } = req.body;
//   await BookingServices.handlePaymentFailed(bookingId);

//   // Redirect to frontend fail page
//   const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//   res.redirect(`${frontendUrl}/booking/failed?bookingId=${bookingId}`);
// });

// const paymentCancel = catchAsync(async (req: Request, res: Response) => {
//   const { value_a: bookingId } = req.body;
//   await BookingServices.handlePaymentFailed(bookingId);

//   // Redirect to frontend cancel page
//   const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
//   res.redirect(`${frontendUrl}/booking/cancelled?bookingId=${bookingId}`);
// });

// const paymentIPN = catchAsync(async (req: Request, res: Response) => {
//   // IPN (Instant Payment Notification) from SSLCommerz
//   const paymentData = req.body;
  
//   if (paymentData.status === 'VALID' || paymentData.status === 'VALIDATED') {
//     await BookingServices.handlePaymentSuccess(paymentData);
//   }

//   res.status(200).send('OK');
// });

// const getBookingStats = catchAsync(async (req: Request, res: Response) => {
//   const guideId = req.user?.role === 'GUIDE' ? req.user?.guideId : undefined;
//   const result = await BookingServices.getBookingStats(guideId);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Booking statistics retrieved successfully",
//     data: result,
//   });
// });

export const BookingControllers = {
  createBooking,
//   getAllBookings,
//   getSingleBooking,
//   getMyBookings,
//   getGuideBookings,
//   cancelBooking,
//   paymentSuccess,
//   paymentFail,
//   paymentCancel,
//   paymentIPN,
//   getBookingStats
};