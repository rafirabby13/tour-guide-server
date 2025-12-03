import  express from "express"
import { TourController } from "./tour.controller"
const router = express.Router()



router.post("/create-tour", TourController.createTour)

export const TourRoutes = router