import express from "express";
import { StatsControllers } from "./stats.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../../prisma/generated/prisma/enums";

const router = express.Router();

// Admin Routes
router.get(
    "/dashboard",
    // auth(UserRole.ADMIN),
    StatsControllers.getDashboardStats
);

router.get(
    "/bookings",
    // auth(UserRole.ADMIN),
    StatsControllers.getBookingStats
);

router.get(
    "/payments",
    auth(UserRole.ADMIN),
    StatsControllers.getPaymentStats
);

router.get(
    "/tours",
    auth(UserRole.ADMIN),
    StatsControllers.getTourStats
);

router.get(
    "/users",
    auth(UserRole.ADMIN),
    StatsControllers.getUserStats
);

// Guide Routes
router.get(
    "/my/stats",
    auth(UserRole.GUIDE),
    StatsControllers.getMyGuideStats
);

router.get(
    "/guide/:guideId",
    auth(UserRole.ADMIN, UserRole.GUIDE),
    StatsControllers.getGuideStats
);

// Tourist Routes
router.get(
    "/my-tourist-stats",
    auth(UserRole.TOURIST),
    StatsControllers.getMyTouristStats
);

router.get(
    "/tourist/:touristId",
    auth(UserRole.ADMIN),
    StatsControllers.getTouristStats
);

export const StatsRoutes = router;

