

import { Request } from "express";
import { fileUploader } from "../../helpers/fileUploader";
import { AppError } from "../../errors/AppError";
import { validatePricingOverlaps } from "../../helpers/validatePricing";
import { prisma } from "../../shared/prisma";
import { BlockedDateInput, TourAvailabilityInput, TourPricingInput } from "./tour.interface";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { DEFAULT_TOUR_INCLUDES, tourSearchableFields } from "./tour.constant";
import { Prisma, TourStatus } from "../../../../prisma/generated/prisma/client";
import { timeToMinutes } from "./tour.lib";



const createTour = async (req: Request) => {
  // console.log(req.files)
  if (req.files && Array.isArray(req.files)) {
    const uploadedResult = await fileUploader.uploadMMultipleFilesToCloudinary(req.files)
    // req.body.images = uploadedResult?.secure_url
    uploadedResult.forEach(element => {
      req.body.images.push(element)
    });
    console.log(req.body.images)

  }
  const payload = req.body

  const guideId = req.body.guideId;

  const guide = await prisma.guide.findUnique({
      where:{
        userId: guideId
      }
    });


  if (!guide) {
    throw new AppError(400, "Guide Not found");
  }
  if (!payload.tourPricings || payload.tourPricings.length === 0) {
    throw new AppError(400, "Tour must have at least one pricing tier");
  }

  if (!payload.tourAvailabilities || payload.tourAvailabilities.length === 0) {
    throw new AppError(400, "Tour must have at least one availability slot");
  }

  // validatePricingOverlaps(payload.tourPricings);
 
  console.log({ payload })
  const result = await prisma.$transaction(async (tx) => {
  
    const tour = await tx.tour.create({
      data: {
        guideId:guide.id,
        title: payload.title,
        description: payload.description,
        location: payload.location,
        images: payload.images,
      
      }
    });

    
    await tx.tourAvailability.createMany({
      data: payload.tourAvailabilities.map((slot: TourAvailabilityInput) => ({
        tourId: tour.id,
        startTimeMinutes: timeToMinutes(slot.startTime), 
        endTimeMinutes: timeToMinutes(slot.endTime),
        maxBookings: slot.maxBookings,
        dayOfWeek: slot.dayOfWeek
        

      }))
    });

    
    await tx.tourPricing.createMany({
      data: payload.tourPricings.map((tier: TourPricingInput) => ({
        tourId: tour.id,
        minGuests: tier.minGuests,
        maxGuests: tier.maxGuests,
        pricePerHour: tier.pricePerHour,
      }))
    });

  
    if (payload.blockedDates && payload.blockedDates.length > 0) {
      await tx.blockedDate.createMany({
        data: payload.blockedDates.map((blocked: BlockedDateInput) => ({
          tourId: tour.id,
          guideId,
          blockedDate: new Date(blocked.blockedDate)
        }))
      });
    }

    
    return tx.tour.findUnique({
      where: { id: tour.id },
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        },
        tourAvailabilities: {
          orderBy: { dayOfWeek: 'asc' }
        },
        tourPricings: {
          orderBy: { minGuests: 'asc' }
        },
        blockedDates: {
          where: {
            blockedDate: {
              gte: new Date() 
            }
          },
          orderBy: { blockedDate: 'asc' }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    });
  });




  // return {}
  // return {}
  return result
}

const getAllFromDB = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.TourWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: tourSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive"
        }
      }))
    })
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key]
        }
      }))
    })
  }

  const whereConditions: Prisma.TourWhereInput = andConditions.length > 0 ? {
    AND: andConditions
  } : {}

  const result = await prisma.tour.findMany({
    skip,
    take: limit,

    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder
    },
    include:{
      tourAvailabilities: true,
      tourPricings: true
    }
  });

  const total = await prisma.tour.count({
    where: whereConditions
  });
  return {
    meta: {
      page,
      limit,
      total
    },
    data: result
  };
}
const getSingleFromDB = async (id: string) => {
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      ...DEFAULT_TOUR_INCLUDES,
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      
    }
  });

  if (!tour) {
    throw new AppError(404, "Tour not found");
  }

  return tour;
};

const updateIntoDB = async (id: string, req: Request) => {
  const existingTour = await prisma.tour.findUnique({
    where: { id }
  });

  if (!existingTour) {
    throw new AppError(404, "Tour not found");
  }

  // Handle image uploads
  if (req.files && Array.isArray(req.files)) {
    const uploadedResult = await fileUploader.uploadMMultipleFilesToCloudinary(req.files);
    req.body.images = req.body.images || [];
    uploadedResult.forEach(element => {
      req.body.images.push(element);
    });
  }

  const payload = req.body;

  // Validate pricing if provided
  if (payload.tourPricings) {
    validatePricingOverlaps(payload.tourPricings);
  }

  const availableDates = payload.availableDates
    ? payload.availableDates.map((date: string | number | Date) => new Date(date))
    : undefined;

  const result = await prisma.$transaction(async (tx) => {
    // Update main tour
    const updatedTour = await tx.tour.update({
      where: { id },
      data: {
        ...(payload.title && { title: payload.title }),
        ...(payload.description && { description: payload.description }),
        ...(payload.location && { location: payload.location }),
        ...(availableDates && { availableDates }),
        ...(payload.images && { images: payload.images }),
      }
    });

    // Update availabilities if provided
    if (payload.tourAvailabilities) {
      await tx.tourAvailability.deleteMany({
        where: { tourId: id }
      });

      await tx.tourAvailability.createMany({
        data: payload.tourAvailabilities.map((slot: TourAvailabilityInput) => ({
          tourId: id,
          dayOfWeek: slot.dayOfWeek,
          startTimeMinutes: timeToMinutes(slot.startTime),
          
          endTimeMinutes: timeToMinutes(slot.endTime),
          maxBookings: slot.maxBookings,
        }))
      });
    }

    // Update pricings if provided
    if (payload.tourPricings) {
      await tx.tourPricing.deleteMany({
        where: { tourId: id }
      });

      await tx.tourPricing.createMany({
        data: payload.tourPricings.map((tier: TourPricingInput) => ({
          tourId: id,
          minGuests: tier.minGuests,
          maxGuests: tier.maxGuests,
          pricePerHour: tier.pricePerHour,
        }))
      });
    }

    // Update blocked dates if provided
    if (payload.blockedDates) {
      await tx.blockedDate.deleteMany({
        where: { tourId: id }
      });

      await tx.blockedDate.createMany({
        data: payload.blockedDates.map((blocked: BlockedDateInput) => ({
          tourId: id,
          guideId: existingTour.guideId,
          blockedDate: new Date(blocked.blockedDate)
        }))
      });
    }

    return tx.tour.findUnique({
      where: { id },
      include: DEFAULT_TOUR_INCLUDES
    });
  });

  return result;
};

const deleteFromDB = async (id: string) => {
  const tour = await prisma.tour.findUnique({
    where: { id }
  });

  if (!tour) {
    throw new AppError(404, "Tour not found");
  }

  // Check for active bookings
  const activeBookings = await prisma.booking.count({
    where: {
      tourId: id,
      status: {
        in: ['PENDING', 'CONFIRMED']
      }
    }
  });

  if (activeBookings > 0) {
    throw new AppError(400, "Cannot delete tour with active bookings");
  }

  await prisma.tour.delete({
    where: { id }
  });

  return { message: "Tour deleted successfully" };
};


const checkAvailability = async (tourId: string, date: Date, guestCount: number) => {
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: {
      tourPricings: true,
      tourAvailabilities: true,
      blockedDates: {
        where: {
          blockedDate: {
            equals: date
          }
        }
      }
    }
  });

  if (!tour) {
    throw new AppError(404, "Tour not found");
  }

  // Check if date is blocked
  if (tour.blockedDates.length > 0) {
    return {
      available: false,
      reason: "Date is blocked"
    };
  }

  // Check day availability
  const dayOfWeek = date.getDay();
  const dayAvailability = tour.tourAvailabilities.find(
    av => av.dayOfWeek === dayOfWeek && av.isActive
  );

  if (!dayAvailability) {
    return {
      available: false,
      reason: "No availability on this day"
    };
  }

  // Check pricing for guest count
  const pricing = tour.tourPricings.find(
    p => guestCount >= p.minGuests && guestCount <= p.maxGuests
  );

  if (!pricing) {
    return {
      available: false,
      reason: "Guest count not supported",
      supportedRanges: tour.tourPricings.map(p => ({
        min: p.minGuests,
        max: p.maxGuests,
        price: p.pricePerHour
      }))
    };
  }

  // Check existing bookings
  const existingBookings = await prisma.booking.count({
    where: {
      tourId,
      date: date,
      status: {
        in: ['CONFIRMED', 'PENDING']
      }
    }
  });

  if (existingBookings >= dayAvailability.maxBookings) {
    return {
      available: false,
      reason: "Fully booked for this date"
    };
  }

  return {
    available: true,
    pricing: {
      pricePerHour: pricing.pricePerHour,
      minGuests: pricing.minGuests,
      maxGuests: pricing.maxGuests
    },
    availability: {
      spotsRemaining: dayAvailability.maxBookings - existingBookings
    }
  };
};


const getMyTours = async (guideId: string, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  console.log({guideId})
  const guide = await prisma.guide.findUnique({
    where: { userId: guideId }
  });
  if (!guide) {
    throw new AppError(404, "Guide not found");
    
  }

  const result = await prisma.tour.findMany({
    where: { guideId: guide.id },
    skip,
    take: limit,
    include: DEFAULT_TOUR_INCLUDES,
    orderBy: {
      [sortBy]: sortOrder
    }
  });

  const total = await prisma.tour.count({
    where: { guideId }
  });

  return {
    meta: { page, limit, total },
    data: result
  };
};

const updatetourStatus = async (tourId: string, status: TourStatus) => {
  const tour = await prisma.tour.findUnique({
    where: { id: tourId }
  });

  if (!tour) {
    throw new AppError(404, "Tour not found");
  }
  const result = await prisma.tour.update({
    where: {
      id: tourId,

    },
    data: {

      status
    }
  });
  return result
}

export const TourServices = {
  createTour,
  getAllFromDB,
  getSingleFromDB,
  updateIntoDB,
  deleteFromDB,
  checkAvailability,
  getMyTours,
  updatetourStatus
}