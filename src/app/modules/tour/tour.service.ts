

import { Request } from "express";
import { fileUploader } from "../../helpers/fileUploader";
import { AppError } from "../../errors/AppError";
import { validatePricingOverlaps } from "../../helpers/validatePricing";
import { prisma } from "../../shared/prisma";
import { BlockedDateInput, TourAvailabilityInput, TourPricingInput } from "./tour.interface";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { tourSearchableFields } from "./tour.constant";
import { Prisma } from "../../../../prisma/generated/prisma/client";



const createTour = async (req: Request) => {
    console.log(req.files)
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

    if (!payload.tourPricings || payload.tourPricings.length === 0) {
        throw new AppError(400, "Tour must have at least one pricing tier");
    }

    if (!payload.tourAvailabilities || payload.tourAvailabilities.length === 0) {
        throw new AppError(400, "Tour must have at least one availability slot");
    }

    validatePricingOverlaps(payload.tourPricings);
    const availableDates = payload.availableDates
        ? payload.availableDates.map((date: string | number | Date) => new Date(date))
        : [];
    console.log({ payload })
    const result = await prisma.$transaction(async (tx) => {
        // 1. Create tour
        const tour = await tx.tour.create({
            data: {
                guideId,
                title: payload.title,
                description: payload.description,
                location: payload.location,
                availableDates,
                images: payload.images,
            }
        });

        // 2. Create tour availabilities
        await tx.tourAvailability.createMany({
            data: payload.tourAvailabilities.map((slot: TourAvailabilityInput) => ({
                tourId: tour.id,
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime,
                maxBookings: slot.maxBookings,
            }))
        });

        // 3. Create tour pricings
        await tx.tourPricing.createMany({
            data: payload.tourPricings.map((tier: TourPricingInput) => ({
                tourId: tour.id,
                minGuests: tier.minGuests,
                maxGuests: tier.maxGuests,
                pricePerHour: tier.pricePerHour,
            }))
        });

        // 4. Create blocked dates if provided
        if (payload.blockedDates && payload.blockedDates.length > 0) {
            await tx.blockedDate.createMany({
                data: payload.blockedDates.map((blocked: BlockedDateInput) => ({
                    tourId: tour.id,
                    guideId,
                    blockedDate: new Date(blocked.blockedDate),
                    startTime: blocked.startTime,
                    endTime: blocked.endTime,
                    isAllDay: blocked.isAllDay,
                    reason: blocked.reason,
                }))
            });
        }
 
        // 5. Return complete tour with relations
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
                            gte: new Date() // Only future blocked dates
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

export const TourServices = {
    createTour,
    getAllFromDB
}