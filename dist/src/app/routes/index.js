"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = require("../modules/user/user.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const tour_routes_1 = require("../modules/tour/tour.routes");
const booking_routes_1 = require("../modules/booking/booking.routes");
const review_routes_1 = require("../modules/review/review.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const stats_routes_1 = require("../modules/stats/stats.routes");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/user',
        route: user_routes_1.UserRoutes
    },
    {
        path: '/auth',
        route: auth_routes_1.authRoutes
    },
    {
        path: '/tour',
        route: tour_routes_1.TourRoutes
    },
    {
        path: '/booking',
        route: booking_routes_1.BookingRoutes
    },
    {
        path: '/review',
        route: review_routes_1.ReviewRoutes
    },
    {
        path: '/payment',
        route: payment_routes_1.PaymentRoutes
    },
    {
        path: '/stats',
        route: stats_routes_1.StatsRoutes
    }
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
