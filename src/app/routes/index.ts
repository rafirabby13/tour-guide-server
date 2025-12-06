
import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { TourRoutes } from "../modules/tour/tour.routes";
import { BookingRoutes } from "../modules/booking/booking.routes";
import { ReviewRoutes } from "../modules/review/review.routes";

const router = Router()
const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/auth',
        route: authRoutes
    },
    {
        path: '/tour',
        route: TourRoutes
    },
    {
        path: '/booking',
        route: BookingRoutes
    },
    {
        path: '/review',
        route: ReviewRoutes
    }
]

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router