import express, { NextFunction, Request, Response } from "express"
import { TourController } from "./tour.controller"
import { fileUploader } from "../../helpers/fileUploader"
import { checkAvailabilitySchema, createTourSchema, updateTourSchema, uuidParamSchema } from "./tour.validation"
import validateRequest from "../../middlewares/validateRequest"
import auth from "../../middlewares/auth"
import { UserRole } from "../../../../prisma/generated/prisma/enums"
const router = express.Router()


router.get("/all-tours", TourController.getAllFromDB)
router.get(
    "/:id",
    //   validateRequest(uuidParamSchema),
    TourController.getSingleTour
);
router.post("/create-tour",
    fileUploader.upload.array("files"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = createTourSchema.parse(JSON.parse(req.body.data))
        return TourController.createTour(req, res, next)

    })
router.post(
    "/:id/check-availability",
    validateRequest(uuidParamSchema),
    validateRequest(checkAvailabilitySchema),
    TourController.checkAvailability
);
router.patch("/update-tour/:id",
    fileUploader.upload.array("files"),
    auth(UserRole.GUIDE),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = updateTourSchema.parse(JSON.parse(req.body.data))
        return TourController.updateTour(req, res, next)

    })
router.delete(
    "/:id",
    auth(UserRole.GUIDE),
    TourController.deleteTour
);
router.get(
    "/my/tours",
    auth(UserRole.GUIDE),
    TourController.getMyTours
);
export const TourRoutes = router