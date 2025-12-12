"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewServices = void 0;
const prisma_1 = require("../../shared/prisma");
const http_status_1 = __importDefault(require("http-status"));
const paginationHelper_1 = require("../../helpers/paginationHelper");
const review_constant_1 = require("./review.constant");
const AppError_1 = require("../../errors/AppError");
const createReview = async (touristId, payload) => {
    // Validate rating
    if (payload.rating < 1 || payload.rating > 5) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "Rating must be between 1 and 5");
    }
    console.log(touristId, payload);
    const tourist = await prisma_1.prisma.tourist.findUnique({
        where: {
            userId: touristId
        }
    });
    const booking = await prisma_1.prisma.booking.findUnique({
        where: {
            id: payload.bookingId
        },
        include: {
            reviews: true,
            tour: true
        }
    });
    const tour = await prisma_1.prisma.tour.findUnique({
        where: {
            id: payload.tourId
        }
    });
    if (!booking) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Booking not found");
    }
    if (!tour) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Tour not found");
    }
    if (!tourist) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Tourist not found");
    }
    // Check if booking belongs to the tourist
    if (booking.touristId !== tourist.id) {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "You can only review your own bookings");
    }
    // Check if booking is completed
    if (booking.status !== "CONFIRMED") {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "You can only review confirme tours");
    }
    const result = await prisma_1.prisma.$transaction(async (tnx) => {
        const review = await tnx.review.create({
            data: {
                rating: payload.rating,
                comment: payload.comment,
                tourId: payload.tourId,
                touristId: tourist.id,
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
        await updateGuideRating(tnx, booking.guideId);
        return review;
    });
    return result;
};
// ✅ Get Reviews by Guide
const getReviewsByGuide = async (guideId, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    // Check if guide exists
    const guide = await prisma_1.prisma.guide.findUnique({
        where: { id: guideId }
    });
    if (!guide) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Guide not found");
    }
    const result = await prisma_1.prisma.review.findMany({
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
    const total = await prisma_1.prisma.review.count({
        where: { guideId }
    });
    // Calculate rating distribution
    const ratingDistribution = await prisma_1.prisma.review.groupBy({
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
const getReviewsByTourist = async (touristId, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    // Check if tourist exists
    const tourist = await prisma_1.prisma.tourist.findUnique({
        where: { id: touristId }
    });
    if (!tourist) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Tourist not found");
    }
    const result = await prisma_1.prisma.review.findMany({
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
    const total = await prisma_1.prisma.review.count({
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
const getSingleReview = async (reviewId) => {
    const review = await prisma_1.prisma.review.findUnique({
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
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Review not found");
    }
    return review;
};
// ✅ Get All Reviews (Admin, with filters)
const getAllReviews = async (params, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;
    const andConditions = [];
    // Search
    if (searchTerm) {
        andConditions.push({
            OR: review_constant_1.reviewSearchableFields.map(field => ({
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
                    equals: filterData[key]
                }
            }))
        });
    }
    const whereConditions = andConditions.length > 0 ? {
        AND: andConditions
    } : {};
    const result = await prisma_1.prisma.review.findMany({
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
    const total = await prisma_1.prisma.review.count({
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
const updateReview = async (reviewId, touristId, payload) => {
    // Validate rating if provided
    if (payload.rating && (payload.rating < 1 || payload.rating > 5)) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, "Rating must be between 1 and 5");
    }
    // Check if review exists
    const review = await prisma_1.prisma.review.findUnique({
        where: { id: reviewId }
    });
    if (!review) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Review not found");
    }
    // Check if review belongs to the tourist
    if (review.touristId !== touristId) {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "You can only update your own reviews");
    }
    // Update review in transaction
    const result = await prisma_1.prisma.$transaction(async (tnx) => {
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
const deleteReview = async (reviewId, userId, userRole) => {
    const review = await prisma_1.prisma.review.findUnique({
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
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Review not found");
    }
    // Check permissions: Tourist can delete own review, Admin can delete any
    if (userRole !== "ADMIN" && review.tourist.userId !== userId) {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, "You can only delete your own reviews");
    }
    // Delete review in transaction
    const result = await prisma_1.prisma.$transaction(async (tnx) => {
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
const updateGuideRating = async (tnx, guideId) => {
    // Calculate average rating
    const reviews = await tnx.review.findMany({
        where: { guideId },
        select: { rating: true }
    });
    console.log({ reviews });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? reviews.reduce((sum, rating) => sum + rating.rating, 0) / totalReviews
        : 0;
    console.log({ averageRating });
    // Update guide
    await tnx.guide.update({
        where: { id: guideId },
        data: {
            rating: Number(averageRating.toFixed(1)),
            totalReviews
        }
    });
};
// ✅ Get Guide Rating Stats
const getGuideRatingStats = async (guideId) => {
    const guide = await prisma_1.prisma.guide.findUnique({
        where: { id: guideId },
        select: {
            rating: true,
            totalReviews: true
        }
    });
    if (!guide) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, "Guide not found");
    }
    // Get rating distribution
    const ratingDistribution = await prisma_1.prisma.review.groupBy({
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
        distribution[item.rating] = item._count.rating;
    });
    return {
        averageRating: guide.rating,
        totalReviews: guide.totalReviews,
        ratingDistribution: distribution
    };
};
exports.ReviewServices = {
    createReview,
    getReviewsByGuide,
    getReviewsByTourist,
    getSingleReview,
    getAllReviews,
    updateReview,
    deleteReview,
    getGuideRatingStats
};
