"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourServices = void 0;
const fileUploader_1 = require("../../helpers/fileUploader");
const AppError_1 = require("../../errors/AppError");
const validatePricing_1 = require("../../helpers/validatePricing");
const prisma_1 = require("../../shared/prisma");
const paginationHelper_1 = require("../../helpers/paginationHelper");
const tour_constant_1 = require("./tour.constant");
const tour_lib_1 = require("./tour.lib");
const createTour = async (req) => {
    // console.log(req.files)
    if (req.files && Array.isArray(req.files)) {
        const uploadedResult = await fileUploader_1.fileUploader.uploadMMultipleFilesToCloudinary(req.files);
        // req.body.images = uploadedResult?.secure_url
        uploadedResult.forEach(element => {
            req.body.images.push(element);
        });
        console.log(req.body.images);
    }
    const payload = req.body;
    const guideId = req.body.guideId;
    const guide = await prisma_1.prisma.guide.findUnique({
        where: {
            userId: guideId
        }
    });
    if (!guide) {
        throw new AppError_1.AppError(400, "Guide Not found");
    }
    if (!payload.tourPricings || payload.tourPricings.length === 0) {
        throw new AppError_1.AppError(400, "Tour must have at least one pricing tier");
    }
    if (!payload.tourAvailabilities || payload.tourAvailabilities.length === 0) {
        throw new AppError_1.AppError(400, "Tour must have at least one availability slot");
    }
    // validatePricingOverlaps(payload.tourPricings);
    console.log({ payload });
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const tour = await tx.tour.create({
            data: {
                guideId: guide.id,
                title: payload.title,
                description: payload.description,
                location: payload.location,
                images: payload.images,
            }
        });
        await tx.tourAvailability.createMany({
            data: payload.tourAvailabilities.map((slot) => ({
                tourId: tour.id,
                startTimeMinutes: (0, tour_lib_1.timeToMinutes)(slot.startTime),
                endTimeMinutes: (0, tour_lib_1.timeToMinutes)(slot.endTime),
                maxBookings: slot.maxBookings,
                dayOfWeek: slot.dayOfWeek
            }))
        });
        await tx.tourPricing.createMany({
            data: payload.tourPricings.map((tier) => ({
                tourId: tour.id,
                minGuests: tier.minGuests,
                maxGuests: tier.maxGuests,
                pricePerHour: tier.pricePerHour,
            }))
        });
        if (payload.blockedDates && payload.blockedDates.length > 0) {
            await tx.blockedDate.createMany({
                data: payload.blockedDates.map((blocked) => ({
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
    return result;
};
const getAllFromDB = async (params, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, minPrice, maxPrice, ...filterData } = params;
    console.log({ searchTerm });
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: tour_constant_1.tourSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: filterData[key]
                }
            }))
        });
    }
    if (minPrice || maxPrice) {
        andConditions.push({
            tourPricings: {
                some: {
                    pricePerHour: {
                        gte: minPrice ? Number(minPrice) : 0,
                        lte: maxPrice ? Number(maxPrice) : 1000000
                    }
                }
            }
        });
    }
    const whereConditions = andConditions.length > 0 ? {
        AND: andConditions
    } : {};
    const result = await prisma_1.prisma.tour.findMany({
        skip,
        take: limit,
        where: whereConditions,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            tourAvailabilities: true,
            tourPricings: true
        }
    });
    const total = await prisma_1.prisma.tour.count({
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
};
const getSingleFromDB = async (id) => {
    const tour = await prisma_1.prisma.tour.findUnique({
        where: { id },
        include: {
            ...tour_constant_1.DEFAULT_TOUR_INCLUDES,
            reviews: {
                orderBy: { createdAt: 'desc' },
                take: 10
            },
        }
    });
    if (!tour) {
        throw new AppError_1.AppError(404, "Tour not found");
    }
    return tour;
};
const updateIntoDB = async (id, req) => {
    const existingTour = await prisma_1.prisma.tour.findUnique({
        where: { id }
    });
    if (!existingTour) {
        throw new AppError_1.AppError(404, "Tour not found");
    }
    // Handle image uploads
    if (req.files && Array.isArray(req.files)) {
        const uploadedResult = await fileUploader_1.fileUploader.uploadMMultipleFilesToCloudinary(req.files);
        req.body.images = req.body.images || [];
        uploadedResult.forEach(element => {
            req.body.images.push(element);
        });
    }
    const payload = req.body;
    // Validate pricing if provided
    if (payload.tourPricings) {
        (0, validatePricing_1.validatePricingOverlaps)(payload.tourPricings);
    }
    const availableDates = payload.availableDates
        ? payload.availableDates.map((date) => new Date(date))
        : undefined;
    const result = await prisma_1.prisma.$transaction(async (tx) => {
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
                data: payload.tourAvailabilities.map((slot) => ({
                    tourId: id,
                    dayOfWeek: slot.dayOfWeek,
                    startTimeMinutes: (0, tour_lib_1.timeToMinutes)(slot.startTime),
                    endTimeMinutes: (0, tour_lib_1.timeToMinutes)(slot.endTime),
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
                data: payload.tourPricings.map((tier) => ({
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
                data: payload.blockedDates.map((blocked) => ({
                    tourId: id,
                    guideId: existingTour.guideId,
                    blockedDate: new Date(blocked.blockedDate)
                }))
            });
        }
        return tx.tour.findUnique({
            where: { id },
            include: tour_constant_1.DEFAULT_TOUR_INCLUDES
        });
    });
    return result;
};
const deleteFromDB = async (id) => {
    const tour = await prisma_1.prisma.tour.findUnique({
        where: { id }
    });
    if (!tour) {
        throw new AppError_1.AppError(404, "Tour not found");
    }
    // Check for active bookings
    const activeBookings = await prisma_1.prisma.booking.count({
        where: {
            tourId: id,
            status: {
                in: ['PENDING', 'CONFIRMED']
            }
        }
    });
    if (activeBookings > 0) {
        throw new AppError_1.AppError(400, "Cannot delete tour with active bookings");
    }
    await prisma_1.prisma.tour.delete({
        where: { id }
    });
    return { message: "Tour deleted successfully" };
};
const checkAvailability = async (tourId, date, guestCount) => {
    const tour = await prisma_1.prisma.tour.findUnique({
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
        throw new AppError_1.AppError(404, "Tour not found");
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
    const dayAvailability = tour.tourAvailabilities.find(av => av.dayOfWeek === dayOfWeek && av.isActive);
    if (!dayAvailability) {
        return {
            available: false,
            reason: "No availability on this day"
        };
    }
    // Check pricing for guest count
    const pricing = tour.tourPricings.find(p => guestCount >= p.minGuests && guestCount <= p.maxGuests);
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
    const existingBookings = await prisma_1.prisma.booking.count({
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
const getMyTours = async (guideId, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    console.log({ guideId });
    const guide = await prisma_1.prisma.guide.findUnique({
        where: { userId: guideId }
    });
    if (!guide) {
        throw new AppError_1.AppError(404, "Guide not found");
    }
    const result = await prisma_1.prisma.tour.findMany({
        where: { guideId: guide.id },
        skip,
        take: limit,
        include: tour_constant_1.DEFAULT_TOUR_INCLUDES,
        orderBy: {
            [sortBy]: sortOrder
        }
    });
    const total = await prisma_1.prisma.tour.count({
        where: { guideId }
    });
    return {
        meta: { page, limit, total },
        data: result
    };
};
const updatetourStatus = async (tourId, status) => {
    const tour = await prisma_1.prisma.tour.findUnique({
        where: { id: tourId }
    });
    if (!tour) {
        throw new AppError_1.AppError(404, "Tour not found");
    }
    const result = await prisma_1.prisma.tour.update({
        where: {
            id: tourId,
        },
        data: {
            status
        }
    });
    return result;
};
const getPopularDestinations = async () => {
    // 1. Group tours by location to count them
    const groupResult = await prisma_1.prisma.tour.groupBy({
        by: ['location'], // Grouping by the existing 'location' field
        _count: {
            id: true, // Count number of tours in this location
        },
        where: {
            status: 'PUBLISHED', // Only show active tours
            isDeleted: false, // Exclude deleted tours
        },
        orderBy: {
            _count: {
                id: 'desc', // Sort by most popular (highest count first)
            },
        },
        take: 6, // Limit to top 6 destinations
    });
    // 2. Fetch a representative image for each location
    const resultsWithImages = await Promise.all(groupResult.map(async (group) => {
        // Find one published tour from this location to grab an image
        const representativeTour = await prisma_1.prisma.tour.findFirst({
            where: {
                location: group.location,
                status: 'PUBLISHED',
                isDeleted: false,
                images: { isEmpty: false } // Ensure it has at least one image
            },
            select: { images: true }
        });
        const slug = group.location
            .toLowerCase()
            .replace(/ /g, '_') // Replace spaces with underscores
            .replace(/,/g, '') // Remove commas
            .replace(/[^a-z0-9_]/g, '');
        // Format the data for the frontend
        return {
            name: group.location, // e.g., "Kyoto, Japan"
            count: group._count.id, // e.g., 42
            // Use the first image found, or a fallback if none exist
            image: representativeTour?.images[0] || "https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg",
            slug: slug // Use this for the search link
        };
    }));
    return resultsWithImages;
};
exports.TourServices = {
    createTour,
    getAllFromDB,
    getSingleFromDB,
    updateIntoDB,
    deleteFromDB,
    checkAvailability,
    getMyTours,
    updatetourStatus,
    getPopularDestinations
};
