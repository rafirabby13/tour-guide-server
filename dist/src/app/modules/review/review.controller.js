import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { ReviewServices } from "./review.service";
import { reviewFilterableFields } from "./review.constant";
import pick from "../../helpers/pick";
// Create Review
const createReview = catchAsync(async (req, res) => {
    const touristId = req.user.id;
    const result = await ReviewServices.createReview(touristId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Review created successfully",
        data: result
    });
});
// Get Reviews by Guide
const getReviewsByGuide = catchAsync(async (req, res) => {
    const { guideId } = req.params;
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await ReviewServices.getReviewsByGuide(guideId, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Guide reviews retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
// Get Reviews by Tourist (My Reviews)
const getMyReviews = catchAsync(async (req, res) => {
    const touristId = req.user.id; // From JWT
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await ReviewServices.getReviewsByTourist(touristId, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My reviews retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});
// Get Single Review
const getSingleReview = catchAsync(async (req, res) => {
    const { reviewId } = req.params;
    const result = await ReviewServices.getSingleReview(reviewId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Review retrieved successfully",
        data: result
    });
});
// Get All Reviews (Admin)
const getAllReviews = catchAsync(async (req, res) => {
    const filters = pick(req.query, reviewFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await ReviewServices.getAllReviews(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Reviews retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});
// Update Review
const updateReview = catchAsync(async (req, res) => {
    const { reviewId } = req.params;
    const touristId = req.user.id; // From JWT
    const result = await ReviewServices.updateReview(reviewId, touristId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Review updated successfully",
        data: result
    });
});
// Delete Review
const deleteReview = catchAsync(async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await ReviewServices.deleteReview(reviewId, userId, userRole);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null
    });
});
// Get Guide Rating Stats
const getGuideRatingStats = catchAsync(async (req, res) => {
    const { guideId } = req.params;
    const result = await ReviewServices.getGuideRatingStats(guideId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Guide rating stats retrieved successfully",
        data: result
    });
});
export const ReviewControllers = {
    createReview,
    getReviewsByGuide,
    getMyReviews,
    getSingleReview,
    getAllReviews,
    updateReview,
    deleteReview,
    getGuideRatingStats
};
