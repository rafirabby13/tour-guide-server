"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingServices = void 0;
const prisma_1 = require("../../shared/prisma");
const AppError_1 = require("../../errors/AppError");
const enums_1 = require("../../../../prisma/generated/prisma/enums");
const transactionId_1 = require("../../helpers/transactionId");
const booking_constant_1 = require("./booking.constant");
const paginationHelper_1 = require("../../helpers/paginationHelper");
const payment_service_1 = require("../payment/payment.service");
const booking_lib_1 = require("./booking.lib");
const updatePastBookings = async () => {
    const now = new Date();
    await prisma_1.prisma.booking.updateMany({
        where: {
            status: enums_1.BookingStatus.CONFIRMED,
            endTime: { lt: now }, // Time has passed
        },
        data: {
            status: enums_1.BookingStatus.COMPLETED,
        },
    });
};
const createBooking = async (payload, touristId) => {
    const { tourId, date, duration, numGuests, startTime } = payload;
    const bookingDate = new Date(date);
    const dateString = bookingDate.toISOString().split("T")[0];
    const startDateTime = new Date(`${dateString}T${startTime}:00`);
    // const startDateTime = new Date(`${date}T${startTime}:00`);
    console.log({ startDateTime });
    // Calculate End Time
    const durationInMs = duration * 60 * 60 * 1000;
    const endDateTime = new Date(startDateTime.getTime() + durationInMs);
    const tour = await prisma_1.prisma.tour.findUnique({
        where: { id: tourId },
        include: {
            tourPricings: true,
            tourAvailabilities: true,
            blockedDates: true,
            guide: {
                include: {
                    user: true
                }
            }
        }
    });
    if (!tour) {
        throw new AppError_1.AppError(404, "Tour not found");
    }
    const isBlocked = tour.blockedDates.some(blocked => {
        const blockedDateOnly = new Date(blocked.blockedDate).toDateString();
        const bookingDateOnly = bookingDate.toDateString();
        return blockedDateOnly === bookingDateOnly;
    });
    if (isBlocked) {
        throw new AppError_1.AppError(400, "Selected date is blocked by the guide");
    }
    const dayOfWeek = bookingDate.getDay();
    const dayAvailability = tour.tourAvailabilities.find(av => av.dayOfWeek === dayOfWeek && av.isActive);
    if (!dayAvailability) {
        throw new AppError_1.AppError(400, "Tour not available on this day of the week");
    }
    // const bookingTimeStr = payload.startTime
    const bookingStartMinutes = (0, booking_lib_1.timeToMinutes)(startTime);
    const bookingEndMinutes = bookingStartMinutes + duration * 60;
    // if (bookingTimeStr < dayAvailability.startTime || bookingTimeStr >= dayAvailability.endTime) {
    //   throw new AppError(400, `Tour only available between ${dayAvailability.startTime} - ${dayAvailability.endTime}`);
    // }
    if (bookingStartMinutes < dayAvailability.startTimeMinutes) {
        throw new AppError_1.AppError(400, "Tour starts too early for this guide's schedule");
    }
    if (bookingEndMinutes > dayAvailability.endTimeMinutes) {
        throw new AppError_1.AppError(400, "Tour duration exceeds guide's working hours");
    }
    const existingBookings = await prisma_1.prisma.booking.count({
        where: {
            tourId,
            date: bookingDate,
            status: {
                in: [enums_1.BookingStatus.PENDING, enums_1.BookingStatus.CONFIRMED]
            }
        }
    });
    if (existingBookings >= dayAvailability.maxBookings) {
        throw new AppError_1.AppError(400, "Tour fully booked for this date and time");
    }
    // console.log({tour})
    const pricing = tour.tourPricings.find(p => numGuests >= p.minGuests && numGuests <= p.maxGuests);
    if (!pricing) {
        throw new AppError_1.AppError(400, `No pricing available for ${numGuests} guests`);
    }
    const totalPrice = Number(pricing.pricePerHour) * duration * numGuests;
    const tourist = await prisma_1.prisma.tourist.findUnique({
        where: { userId: touristId },
        include: {
            user: true
        }
    });
    if (!tourist) {
        throw new AppError_1.AppError(404, "Tourist not found");
    }
    console.log({ bookingDate });
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        // Create booking
        const booking = await tx.booking.create({
            data: {
                date: bookingDate,
                startTime: startDateTime,
                endTime: endDateTime,
                duration,
                numGuests,
                totalPrice,
                tourId,
                touristId: tourist.id,
                guideId: tour.guideId
            },
            include: {
                tour: {
                    include: {
                        guide: true
                    }
                }
            }
        });
        // Generate transaction ID
        const transactionId = (0, transactionId_1.generateTransactionId)();
        // Create payment record
        await tx.payment.create({
            data: {
                amount: totalPrice,
                transactionId,
                bookingId: booking.id,
            }
        });
        // Return booking with payment URL
        return {
            booking: await tx.booking.findUnique({
                where: { id: booking.id },
                include: booking_constant_1.DEFAULT_BOOKING_INCLUDES
            }),
            transactionId
        };
    });
    const paymentSession = await payment_service_1.PaymentService.initiatePayment(result.booking?.id);
    return {
        bookingId: result.booking?.id,
        transactionId: result.transactionId,
        paymentUrl: paymentSession.paymentUrl,
        sessionId: paymentSession.sessionId,
    };
};
const getAllBookings = async (params, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { status, tourId, touristId, startDate, endDate } = params;
    await updatePastBookings();
    const andConditions = [];
    if (status) {
        andConditions.push({ status });
    }
    if (tourId) {
        andConditions.push({ tourId });
    }
    if (touristId) {
        andConditions.push({ touristId });
    }
    if (startDate || endDate) {
        andConditions.push({
            date: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
            }
        });
    }
    const whereConditions = andConditions.length > 0
        ? { AND: andConditions }
        : {};
    const result = await prisma_1.prisma.booking.findMany({
        skip,
        take: limit,
        where: whereConditions,
        include: booking_constant_1.DEFAULT_BOOKING_INCLUDES,
        orderBy: {
            [sortBy]: sortOrder
        }
    });
    const total = await prisma_1.prisma.booking.count({
        where: whereConditions
    });
    return {
        meta: { page, limit, total },
        data: result
    };
};
const getSingleBooking = async (id) => {
    const booking = await prisma_1.prisma.booking.findUnique({
        where: { id },
        include: booking_constant_1.DEFAULT_BOOKING_INCLUDES
    });
    if (!booking) {
        throw new AppError_1.AppError(404, "Booking not found");
    }
    return booking;
};
const getMyBookings = async (touristId, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    console.log({ touristId });
    await updatePastBookings();
    const tourist = await prisma_1.prisma.tourist.findUnique({
        where: { userId: touristId },
    });
    if (!tourist) {
        throw new AppError_1.AppError(404, "Tourist not found");
    }
    console.log({ tourist });
    const result = await prisma_1.prisma.booking.findMany({
        where: { touristId: tourist.id },
        skip,
        take: limit,
        include: booking_constant_1.DEFAULT_BOOKING_INCLUDES,
        orderBy: {
            [sortBy]: sortOrder
        }
    });
    const total = await prisma_1.prisma.booking.count({
        where: { touristId }
    });
    return {
        meta: { page, limit, total },
        data: result
    };
};
const getGuideBookings = async (guideId, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    await updatePastBookings();
    const guide = await prisma_1.prisma.guide.findUnique({
        where: { userId: guideId }
    });
    if (!guide) {
        throw new AppError_1.AppError(404, "Guide not found");
    }
    console.log({ guide });
    const result = await prisma_1.prisma.booking.findMany({
        where: {
            tour: {
                guideId: guide.id
            }
        },
        skip,
        take: limit,
        include: booking_constant_1.DEFAULT_BOOKING_INCLUDES,
        orderBy: {
            [sortBy]: sortOrder
        }
    });
    const total = await prisma_1.prisma.booking.count({
        where: {
            tour: {
                guideId
            }
        }
    });
    return {
        meta: { page, limit, total },
        data: result
    };
};
const calculateRefund = (booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    let refundPercentage = 0;
    let reason = "";
    if (hoursUntilBooking >= booking_constant_1.CANCELLATION_POLICY.FULL_REFUND_HOURS) {
        refundPercentage = booking_constant_1.CANCELLATION_POLICY.FULL_REFUND_PERCENT;
        reason = "Cancelled more than 48 hours before booking";
    }
    else if (hoursUntilBooking >= booking_constant_1.CANCELLATION_POLICY.PARTIAL_REFUND_HOURS) {
        refundPercentage = booking_constant_1.CANCELLATION_POLICY.PARTIAL_REFUND_PERCENT;
        reason = "Cancelled 24-48 hours before booking";
    }
    else {
        refundPercentage = booking_constant_1.CANCELLATION_POLICY.NO_REFUND_PERCENT;
        reason = "Cancelled less than 24 hours before booking";
    }
    const refundAmount = (booking.totalPrice * refundPercentage) / 100;
    const cancellationFee = booking.totalPrice - refundAmount;
    return {
        refundPercentage,
        refundAmount,
        cancellationFee,
        reason
    };
};
const cancelBooking = async (bookingId, userId) => {
    const booking = await prisma_1.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            tourist: {
                include: {
                    user: true
                }
            },
            tour: {
                include: {
                    guide: {
                        include: {
                            user: true
                        }
                    }
                }
            },
            payment: true
        }
    });
    if (!booking) {
        throw new AppError_1.AppError(404, "Booking not found");
    }
    // Check if already cancelled or completed
    if (booking.status === enums_1.BookingStatus.CANCELED_BY_GUIDE ||
        booking.status === enums_1.BookingStatus.CANCELED_BY_TOURIST ||
        booking.status === enums_1.BookingStatus.COMPLETED) {
        throw new AppError_1.AppError(400, "Cannot cancel this booking");
    }
    // Verify authorization
    const isTourist = booking.tourist.userId === userId;
    const isGuide = booking.tour.guide.userId === userId;
    if (!isTourist && !isGuide) {
        throw new AppError_1.AppError(403, "Not authorized to cancel this booking");
    }
    // Calculate refund
    const refundCalc = calculateRefund(booking);
    // If guide cancels, full refund
    if (isGuide) {
        refundCalc.refundPercentage = 100;
        refundCalc.refundAmount = booking.totalPrice;
        refundCalc.cancellationFee = 0;
        refundCalc.reason = "Cancelled by guide - Full refund";
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        // Update booking status
        const updatedBooking = await tx.booking.update({
            where: { id: bookingId },
            data: {
                status: isGuide ? enums_1.BookingStatus.CANCELED_BY_GUIDE : enums_1.BookingStatus.CANCELED_BY_TOURIST
            },
            include: booking_constant_1.DEFAULT_BOOKING_INCLUDES
        });
        // Update payment if refund applicable
        if (refundCalc.refundAmount > 0 && booking.payment) {
            await tx.payment.update({
                where: { id: booking.payment.id },
                data: {
                    status: enums_1.PaymentStatus.REFUNDED
                }
            });
        }
        return {
            booking: updatedBooking,
            refund: refundCalc
        };
    });
    return result;
};
// const handlePaymentSuccess = async (paymentData: any) => {
//   const { val_id, tran_id, amount, value_a: bookingId } = paymentData;
//   // Validate payment with SSLCommerz
//   const validationResponse = await paymentService.validatePayment(val_id);
//   if (validationResponse.status !== 'VALID' && validationResponse.status !== 'VALIDATED') {
//     throw new AppError(400, "Payment validation failed");
//   }
//   const result = await prisma.$transaction(async (tx) => {
//     // Update payment
//     const payment = await tx.payment.findFirst({
//       where: { bookingId }
//     });
//     if (!payment) {
//       throw new AppError(404, "Payment not found");
//     }
//     await tx.payment.update({
//       where: { id: payment.id },
//       data: {
//         status: PaymentStatus.SUCCESS
//       }
//     });
//     // Update booking status
//     const booking = await tx.booking.update({
//       where: { id: bookingId },
//       data: {
//         status: BookingStatus.CONFIRMED
//       },
//       include: DEFAULT_BOOKING_INCLUDES
//     });
//     return booking;
//   });
//   return result;
// };
// const handlePaymentFailed = async (bookingId: string) => {
//   const result = await prisma.$transaction(async (tx) => {
//     const payment = await tx.payment.findFirst({
//       where: { bookingId }
//     });
//     if (payment) {
//       await tx.payment.update({
//         where: { id: payment.id },
//         data: {
//           status: PaymentStatus.FAILED
//         }
//       });
//     }
//     // Keep booking as PENDING - user can retry payment
//     return await tx.booking.findUnique({
//       where: { id: bookingId },
//       include: DEFAULT_BOOKING_INCLUDES
//     });
//   });
//   return result;
// };
const getBookingStats = async (guideId) => {
    const whereCondition = guideId ? {
        tour: {
            guideId
        }
    } : {};
    const [total, pending, confirmed, cancelled, completed] = await Promise.all([
        prisma_1.prisma.booking.count({ where: whereCondition }),
        prisma_1.prisma.booking.count({ where: { ...whereCondition, status: enums_1.BookingStatus.PENDING } }),
        prisma_1.prisma.booking.count({ where: { ...whereCondition, status: enums_1.BookingStatus.CONFIRMED } }),
        prisma_1.prisma.booking.count({
            where: {
                ...whereCondition,
                status: {
                    in: [enums_1.BookingStatus.CANCELED_BY_GUIDE, enums_1.BookingStatus.CANCELED_BY_TOURIST]
                }
            }
        }),
        prisma_1.prisma.booking.count({ where: { ...whereCondition, status: enums_1.BookingStatus.COMPLETED } }),
    ]);
    const totalRevenue = await prisma_1.prisma.booking.aggregate({
        where: {
            ...whereCondition,
            status: {
                in: [enums_1.BookingStatus.CONFIRMED, enums_1.BookingStatus.COMPLETED]
            }
        },
        _sum: {
            totalPrice: true
        }
    });
    return {
        total,
        pending,
        confirmed,
        cancelled,
        completed,
        totalRevenue: totalRevenue._sum.totalPrice || 0
    };
};
exports.BookingServices = {
    createBooking,
    getAllBookings,
    getSingleBooking,
    getMyBookings,
    getGuideBookings,
    cancelBooking,
    getBookingStats
};
