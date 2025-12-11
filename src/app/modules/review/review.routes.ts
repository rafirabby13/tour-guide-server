import express from "express";
import { ReviewControllers } from "./review.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../../prisma/generated/prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewValidation } from "./review.validation";

const router = express.Router();

// Tourist Routes
router.post(
    "/create-review",
    auth(UserRole.TOURIST),
    validateRequest(ReviewValidation.createReviewSchema),
    ReviewControllers.createReview
);

router.get(
    "/my-reviews",
    auth(UserRole.TOURIST),
    ReviewControllers.getMyReviews
);

router.patch(
    "/:reviewId",
    auth(UserRole.TOURIST),
    validateRequest(ReviewValidation.updateReviewSchema),
    ReviewControllers.updateReview
);

router.delete(
    "/:reviewId",
    auth(UserRole.TOURIST, UserRole.ADMIN),
    ReviewControllers.deleteReview
);

// Public Routes
router.get(
    "/guide/:guideId",
    ReviewControllers.getReviewsByGuide
);

router.get(
    "/guide/:guideId/stats",
    ReviewControllers.getGuideRatingStats
);

router.get(
    "/:reviewId",
    ReviewControllers.getSingleReview
);

// Admin Routes
router.get(
    "/",
    auth(UserRole.ADMIN),
    ReviewControllers.getAllReviews
);

export const ReviewRoutes = router;