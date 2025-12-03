
import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { TourRoutes } from "../modules/tour/tour.routes";

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
    }
]

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router