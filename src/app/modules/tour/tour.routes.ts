import  express, { NextFunction, Request, Response } from "express"
import { TourController } from "./tour.controller"
import { fileUploader } from "../../helpers/fileUploader"
import { createTourSchema } from "./tour.validation"
const router = express.Router()



router.post("/create-tour", 
    fileUploader.upload.array("files"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = createTourSchema.parse(JSON.parse(req.body.data))
        return TourController.createTour(req, res, next)
    
    })

export const TourRoutes = router