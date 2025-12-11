import { prisma } from "../../shared/prisma";
import { AppError } from "../../errors/AppError";
import { BookingQueryParams, CreateBookingPayload, RefundCalculation } from "./booking.interface";
import { BookingStatus, PaymentStatus } from "../../../../prisma/generated/prisma/enums";
import { generateTransactionId } from "../../helpers/transactionId";
import { CANCELLATION_POLICY, DEFAULT_BOOKING_INCLUDES } from "./booking.constant";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { Prisma } from "../../../../prisma/generated/prisma/client";
import { PaymentService } from "../payment/payment.service";
import { timeToMinutes } from "./booking.lib";


const updatePastBookings = async () => {
  const now = new Date();
  await prisma.booking.updateMany({
    where: {
      status: BookingStatus.CONFIRMED,
      endTime: { lt: now }, // Time has passed
    },
    data: {
      status: BookingStatus.COMPLETED,
    },
  });
};
const createBooking = async (payload: CreateBookingPayload, touristId: string) => {
  const { tourId, date, duration, numGuests, startTime } = payload;
  const bookingDate = new Date(date);
  const dateString = bookingDate.toISOString().split("T")[0];
  const startDateTime = new Date(`${dateString}T${startTime}:00`);
  // const startDateTime = new Date(`${date}T${startTime}:00`);
  console.log({ startDateTime })
  // Calculate End Time
  const durationInMs = duration * 60 * 60 * 1000;
  const endDateTime = new Date(startDateTime.getTime() + durationInMs);

  const tour = await prisma.tour.findUnique({
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
    throw new AppError(404, "Tour not found");
  }

  const isBlocked = tour.blockedDates.some(blocked => {
    const blockedDateOnly = new Date(blocked.blockedDate).toDateString();
    const bookingDateOnly = bookingDate.toDateString();
    return blockedDateOnly === bookingDateOnly;
  });

  if (isBlocked) {
    throw new AppError(400, "Selected date is blocked by the guide");
  }

  const dayOfWeek = bookingDate.getDay();
  const dayAvailability = tour.tourAvailabilities.find(
    av => av.dayOfWeek === dayOfWeek && av.isActive
  );

  if (!dayAvailability) {
    throw new AppError(400, "Tour not available on this day of the week");
  }


  // const bookingTimeStr = payload.startTime
  const bookingStartMinutes = timeToMinutes(startTime);
  const bookingEndMinutes = bookingStartMinutes + duration * 60;

  // if (bookingTimeStr < dayAvailability.startTime || bookingTimeStr >= dayAvailability.endTime) {
  //   throw new AppError(400, `Tour only available between ${dayAvailability.startTime} - ${dayAvailability.endTime}`);
  // }
  if (bookingStartMinutes < dayAvailability.startTimeMinutes) {
    throw new AppError(400, "Tour starts too early for this guide's schedule");
  }

  if (bookingEndMinutes > dayAvailability.endTimeMinutes) {
    throw new AppError(400, "Tour duration exceeds guide's working hours");
  }

  const existingBookings = await prisma.booking.count({
    where: {
      tourId,
      date: bookingDate,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
      }
    }
  });

  if (existingBookings >= dayAvailability.maxBookings) {
    throw new AppError(400, "Tour fully booked for this date and time");
  }
  // console.log({tour})
  const pricing = tour.tourPricings.find(
    p => numGuests >= p.minGuests && numGuests <= p.maxGuests
  );

  if (!pricing) {
    throw new AppError(400, `No pricing available for ${numGuests} guests`);
  }

  const totalPrice = Number(pricing.pricePerHour) * duration * numGuests;

  const tourist = await prisma.tourist.findUnique({
    where: { userId: touristId },
    include: {
      user: true
    }
  });

  if (!tourist) {
    throw new AppError(404, "Tourist not found");
  }
  console.log({ bookingDate })
  const result = await prisma.$transaction(async (tx) => {
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
    const transactionId = generateTransactionId();

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
        include: DEFAULT_BOOKING_INCLUDES
      }),
      transactionId
    };
  });
  const paymentSession = await PaymentService.initiatePayment(result.booking?.id as string);

  return {
    bookingId: result.booking?.id,
    transactionId: result.transactionId,
    paymentUrl: paymentSession.paymentUrl,
    sessionId: paymentSession.sessionId,
  };
};

const getAllBookings = async (params: BookingQueryParams, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { status, tourId, touristId, startDate, endDate } = params;
  await updatePastBookings()
  const andConditions: Prisma.BookingWhereInput[] = [];

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

  const whereConditions: Prisma.BookingWhereInput = andConditions.length > 0
    ? { AND: andConditions }
    : {};

  const result = await prisma.booking.findMany({
    skip,
    take: limit,
    where: whereConditions,
    include: DEFAULT_BOOKING_INCLUDES,
    orderBy: {
      [sortBy]: sortOrder
    }
  });

  const total = await prisma.booking.count({
    where: whereConditions
  });

  return {
    meta: { page, limit, total },
    data: result
  };
};

const getSingleBooking = async (id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: DEFAULT_BOOKING_INCLUDES
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  return booking;
};

const getMyBookings = async (touristId: string, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  console.log({ touristId })
  await updatePastBookings()
  const tourist = await prisma.tourist.findUnique({
    where: { userId: touristId },
  });
  if (!tourist) {
    throw new AppError(404, "Tourist not found");
  }

  console.log({ tourist })


  const result = await prisma.booking.findMany({
    where: { touristId: tourist.id },
    skip,
    take: limit,
    include: DEFAULT_BOOKING_INCLUDES,
    orderBy: {
      [sortBy]: sortOrder
    }
  });

  const total = await prisma.booking.count({
    where: { touristId }
  });

  return {
    meta: { page, limit, total },
    data: result
  };
};

const getGuideBookings = async (guideId: string, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  await updatePastBookings()
  const guide = await prisma.guide.findUnique({
    where: { userId: guideId }
  });
  if (!guide) {
    throw new AppError(404, "Guide not found");
  }
  console.log({ guide })
  const result = await prisma.booking.findMany({
    where: {
      tour: {
        guideId: guide.id
      }
    },
    skip,
    take: limit,
    include: DEFAULT_BOOKING_INCLUDES,
    orderBy: {
      [sortBy]: sortOrder
    }
  });

  const total = await prisma.booking.count({
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

const calculateRefund = (booking: any): RefundCalculation => {
  const now = new Date();
  const bookingDate = new Date(booking.date);
  const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  let refundPercentage = 0;
  let reason = "";

  if (hoursUntilBooking >= CANCELLATION_POLICY.FULL_REFUND_HOURS) {
    refundPercentage = CANCELLATION_POLICY.FULL_REFUND_PERCENT;
    reason = "Cancelled more than 48 hours before booking";
  } else if (hoursUntilBooking >= CANCELLATION_POLICY.PARTIAL_REFUND_HOURS) {
    refundPercentage = CANCELLATION_POLICY.PARTIAL_REFUND_PERCENT;
    reason = "Cancelled 24-48 hours before booking";
  } else {
    refundPercentage = CANCELLATION_POLICY.NO_REFUND_PERCENT;
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

const cancelBooking = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
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
    throw new AppError(404, "Booking not found");
  }

  // Check if already cancelled or completed
  if (booking.status === BookingStatus.CANCELED_BY_GUIDE ||
    booking.status === BookingStatus.CANCELED_BY_TOURIST ||
    booking.status === BookingStatus.COMPLETED) {
    throw new AppError(400, "Cannot cancel this booking");
  }

  // Verify authorization
  const isTourist = booking.tourist.userId === userId;
  const isGuide = booking.tour.guide.userId === userId;

  if (!isTourist && !isGuide) {
    throw new AppError(403, "Not authorized to cancel this booking");
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

  const result = await prisma.$transaction(async (tx) => {
    // Update booking status
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: isGuide ? BookingStatus.CANCELED_BY_GUIDE : BookingStatus.CANCELED_BY_TOURIST
      },
      include: DEFAULT_BOOKING_INCLUDES
    });

    // Update payment if refund applicable
    if (refundCalc.refundAmount > 0 && booking.payment) {
      await tx.payment.update({
        where: { id: booking.payment.id },
        data: {
          status: PaymentStatus.REFUNDED
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

const getBookingStats = async (guideId?: string) => {
  const whereCondition = guideId ? {
    tour: {
      guideId
    }
  } : {};

  const [total, pending, confirmed, cancelled, completed] = await Promise.all([
    prisma.booking.count({ where: whereCondition }),
    prisma.booking.count({ where: { ...whereCondition, status: BookingStatus.PENDING } }),
    prisma.booking.count({ where: { ...whereCondition, status: BookingStatus.CONFIRMED } }),
    prisma.booking.count({
      where: {
        ...whereCondition,
        status: {
          in: [BookingStatus.CANCELED_BY_GUIDE, BookingStatus.CANCELED_BY_TOURIST]
        }
      }
    }),
    prisma.booking.count({ where: { ...whereCondition, status: BookingStatus.COMPLETED } }),
  ]);

  const totalRevenue = await prisma.booking.aggregate({
    where: {
      ...whereCondition,
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
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

export const BookingServices = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  getMyBookings,
  getGuideBookings,
  cancelBooking,
  getBookingStats
};