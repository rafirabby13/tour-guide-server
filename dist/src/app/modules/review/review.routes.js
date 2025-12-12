"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("./review.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("../../../../prisma/generated/prisma/client");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const review_validation_1 = require("./review.validation");
const router = express_1.default.Router();
// Tourist Routes
router.post("/create-review", (0, auth_1.default)(client_1.UserRole.TOURIST), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.createReviewSchema), review_controller_1.ReviewControllers.createReview);
router.get("/my-reviews", (0, auth_1.default)(client_1.UserRole.TOURIST), review_controller_1.ReviewControllers.getMyReviews);
router.patch("/:reviewId", (0, auth_1.default)(client_1.UserRole.TOURIST), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.updateReviewSchema), review_controller_1.ReviewControllers.updateReview);
router.delete("/:reviewId", (0, auth_1.default)(client_1.UserRole.TOURIST, client_1.UserRole.ADMIN), review_controller_1.ReviewControllers.deleteReview);
// Public Routes
router.get("/guide/:guideId", review_controller_1.ReviewControllers.getReviewsByGuide);
router.get("/guide/:guideId/stats", review_controller_1.ReviewControllers.getGuideRatingStats);
router.get("/:reviewId", review_controller_1.ReviewControllers.getSingleReview);
// Admin Routes
router.get("/", (0, auth_1.default)(client_1.UserRole.ADMIN), review_controller_1.ReviewControllers.getAllReviews);
exports.ReviewRoutes = router;
