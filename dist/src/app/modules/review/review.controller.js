"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewControllers = void 0;
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const review_service_1 = require("./review.service");
const review_constant_1 = require("./review.constant");
const pick_1 = __importDefault(require("../../helpers/pick"));
// Create Review
const createReview = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user.id;
    const result = await review_service_1.ReviewServices.createReview(touristId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Review created successfully",
        data: result
    });
});
// Get Reviews by Guide
const getReviewsByGuide = (0, catchAsync_1.default)(async (req, res) => {
    const { guideId } = req.params;
    const options = (0, pick_1.default)(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await review_service_1.ReviewServices.getReviewsByGuide(guideId, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Guide reviews retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
// Get Reviews by Tourist (My Reviews)
const getMyReviews = (0, catchAsync_1.default)(async (req, res) => {
    const touristId = req.user.id; // From JWT
    const options = (0, pick_1.default)(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await review_service_1.ReviewServices.getReviewsByTourist(touristId, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "My reviews retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});
// Get Single Review
const getSingleReview = (0, catchAsync_1.default)(async (req, res) => {
    const { reviewId } = req.params;
    const result = await review_service_1.ReviewServices.getSingleReview(reviewId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Review retrieved successfully",
        data: result
    });
});
// Get All Reviews (Admin)
const getAllReviews = (0, catchAsync_1.default)(async (req, res) => {
    const filters = (0, pick_1.default)(req.query, review_constant_1.reviewFilterableFields);
    const options = (0, pick_1.default)(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await review_service_1.ReviewServices.getAllReviews(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Reviews retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});
// Update Review
const updateReview = (0, catchAsync_1.default)(async (req, res) => {
    const { reviewId } = req.params;
    const touristId = req.user.id; // From JWT
    const result = await review_service_1.ReviewServices.updateReview(reviewId, touristId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Review updated successfully",
        data: result
    });
});
// Delete Review
const deleteReview = (0, catchAsync_1.default)(async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await review_service_1.ReviewServices.deleteReview(reviewId, userId, userRole);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: null
    });
});
// Get Guide Rating Stats
const getGuideRatingStats = (0, catchAsync_1.default)(async (req, res) => {
    const { guideId } = req.params;
    const result = await review_service_1.ReviewServices.getGuideRatingStats(guideId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Guide rating stats retrieved successfully",
        data: result
    });
});
exports.ReviewControllers = {
    createReview,
    getReviewsByGuide,
    getMyReviews,
    getSingleReview,
    getAllReviews,
    updateReview,
    deleteReview,
    getGuideRatingStats
};
