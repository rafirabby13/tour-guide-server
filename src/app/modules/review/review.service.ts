import { prisma } from "../../shared/prisma";
import httpStatus from "http-status";
import { ICreateReview, IReviewFilters, IUpdateReview } from "./review.interface";
import { Prisma } from "../../../../prisma/generated/prisma/client";
import { IOptions, paginationHelper } from "../../helpers/paginationHelper";
import { reviewSearchableFields } from "./review.constant";
import { AppError } from "../../errors/AppError";


const createReview = async (touristId: string, payload: ICreateReview) => {
    // Validate rating
    if (payload.rating < 1 || payload.rating > 5) {
        throw new AppError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
    }

    // Check if booking exists and belongs to tourist
    const booking = await prisma.booking.findUnique({
        where: {
            id: payload.bookingId
        },
        include: {
            reviews: true,
            tour: true
        }
    });

    if (!booking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    // Check if booking belongs to the tourist
    if (booking.touristId !== touristId) {
        throw new AppError(httpStatus.FORBIDDEN, "You can only review your own bookings");
    }

    // Check if booking is completed
    if (booking.status !== "COMPLETED") {
        throw new AppError(httpStatus.BAD_REQUEST, "You can only review completed tours");
    }

    // Check if review already exists
    if (booking.reviews) {
        throw new AppError(httpStatus.CONFLICT, "Review already exists for this booking");
    }

    // Create review in transaction
    const result = await prisma.$transaction(async (tnx) => {
        // Create review
        const review = await tnx.review.create({
            data: {
                rating: payload.rating,
                comment: payload.comment,
                tourId: booking.tourId,
                touristId: booking.touristId,
                guideId: booking.guideId,
                bookingId: payload.bookingId
            },
            include: {
                tourist: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                },
                guide: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                },
                booking: {
                    select: {
                        id: true,
                        date: true,
                        tour: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            }
        });

        // Update guide's average rating and total reviews
        await updateGuideRating(tnx, booking.guideId);

        return review;
    });

    return result;
};


// ✅ Get Reviews by Guide
const getReviewsByGuide = async (guideId: string, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    // Check if guide exists
    const guide = await prisma.guide.findUnique({
        where: { id: guideId }
    });

    if (!guide) {
        throw new AppError(httpStatus.NOT_FOUND, "Guide not found");
    }

    const result = await prisma.review.findMany({
        where: {
            guideId
        },
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            tourist: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true
                }
            },
            booking: {
                select: {
                    id: true,
                    date: true,
                    tour: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            }
        }
    });

    const total = await prisma.review.count({
        where: { guideId }
    });

    // Calculate rating distribution
    const ratingDistribution = await prisma.review.groupBy({
        by: ['rating'],
        where: { guideId },
        _count: {
            rating: true
        }
    });

    return {
        meta: {
            page,
            limit,
            total
        },
        data: result,
        stats: {
            averageRating: guide.rating,
            totalReviews: guide.totalReviews,
            ratingDistribution
        }
    };
};


// ✅ Get Reviews by Tourist
const getReviewsByTourist = async (touristId: string, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    // Check if tourist exists
    const tourist = await prisma.tourist.findUnique({
        where: { id: touristId }
    });

    if (!tourist) {
        throw new AppError(httpStatus.NOT_FOUND, "Tourist not found");
    }

    const result = await prisma.review.findMany({
        where: {
            touristId
        },
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            guide: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                    city: true,
                    country: true
                }
            },
            booking: {
                select: {
                    id: true,
                    date: true,
                    tour: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            }
        }
    });

    const total = await prisma.review.count({
        where: { touristId }
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


// ✅ Get Single Review
const getSingleReview = async (reviewId: string) => {
    const review = await prisma.review.findUnique({
        where: {
            id: reviewId
        },
        include: {
            tourist: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true
                }
            },
            guide: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                    city: true,
                    country: true
                }
            },
            booking: {
                select: {
                    id: true,
                    date: true,
                    tour: {
                        select: {
                            id: true,
                            title: true,
                            images: true
                        }
                    }
                }
            }
        }
    });

    if (!review) {
        throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    }

    return review;
};


// ✅ Get All Reviews (Admin, with filters)
const getAllReviews = async (params: IReviewFilters, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.ReviewWhereInput[] = [];

    // Search
    if (searchTerm) {
        andConditions.push({
            OR: reviewSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        });
    }

    // Filters
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        });
    }

    const whereConditions: Prisma.ReviewWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {};

    const result = await prisma.review.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            tourist: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true
                }
            },
            guide: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true
                }
            },
            booking: {
                select: {
                    id: true,
                    date: true,
                    tour: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            }
        }
    });

    const total = await prisma.review.count({
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


// ✅ Update Review
const updateReview = async (
    reviewId: string,
    touristId: string,
    payload: IUpdateReview
) => {
    // Validate rating if provided
    if (payload.rating && (payload.rating < 1 || payload.rating > 5)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    }

    // Check if review belongs to the tourist
    if (review.touristId !== touristId) {
        throw new AppError(httpStatus.FORBIDDEN, "You can only update your own reviews");
    }

    // Update review in transaction
    const result = await prisma.$transaction(async (tnx) => {
        // Update review
        const updatedReview = await tnx.review.update({
            where: { id: reviewId },
            data: payload,
            include: {
                tourist: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                },
                guide: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true
                    }
                },
                booking: {
                    select: {
                        id: true,
                        date: true,
                        tour: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            }
        });

        // Recalculate guide's average rating if rating changed
        if (payload.rating) {
            await updateGuideRating(tnx, review.guideId);
        }

        return updatedReview;
    });

    return result;
};


// ✅ Delete Review
const deleteReview = async (reviewId: string, userId: string, userRole: string) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: {
            tourist: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!review) {
        throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    }

    // Check permissions: Tourist can delete own review, Admin can delete any
    if (userRole !== "ADMIN" && review.tourist.userId !== userId) {
        throw new AppError(httpStatus.FORBIDDEN, "You can only delete your own reviews");
    }

    // Delete review in transaction
    const result = await prisma.$transaction(async (tnx) => {
        // Delete review
        await tnx.review.delete({
            where: { id: reviewId }
        });

        // Recalculate guide's average rating
        await updateGuideRating(tnx, review.guideId);

        return { message: "Review deleted successfully" };
    });

    return result;
};


// ✅ Helper: Calculate and Update Guide Rating
const updateGuideRating = async (tnx: any, guideId: string) => {
    // Calculate average rating
    const reviews = await tnx.review.findMany({
        where: { guideId },
        select: { rating: true }
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? reviews.reduce((sum: number, review: number) => sum + review, 0) / totalReviews
        : 0;

    // Update guide
    await tnx.guide.update({
        where: { id: guideId },
        data: {
            averageRating: Number(averageRating.toFixed(1)),
            totalReviews
        }
    });
};


// ✅ Get Guide Rating Stats
const getGuideRatingStats = async (guideId: string) => {
    const guide = await prisma.guide.findUnique({
        where: { id: guideId },
        select: {
            rating: true,
            totalReviews: true
        }
    });

    if (!guide) {
        throw new AppError(httpStatus.NOT_FOUND, "Guide not found");
    }

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
        by: ['rating'],
        where: { guideId },
        _count: {
            rating: true
        }
    });

    // Format distribution as object
    const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    };

    ratingDistribution.forEach(item => {
        distribution[item.rating as keyof typeof distribution] = item._count.rating;
    });

    return {
        averageRating: guide.rating,
        totalReviews: guide.totalReviews,
        ratingDistribution: distribution
    };
};


export const ReviewServices = {
    createReview,
    getReviewsByGuide,
    getReviewsByTourist,
    getSingleReview,
    getAllReviews,
    updateReview,
    deleteReview,
    getGuideRatingStats
};