import express, { NextFunction, Request, Response } from "express"
import { TourController } from "./tour.controller"
import { fileUploader } from "../../helpers/fileUploader"
import validateRequest from "../../middlewares/validateRequest"
import auth from "../../middlewares/auth"
import { UserRole } from "../../../../prisma/generated/prisma/enums"
import { createTourZodSchema, updateTourZodSchema } from "./tour.validation"
const router = express.Router()

router.get(
    '/popular/destinations', 
    TourController.getPopularDestinations
);
router.get("/all-tours", TourController.getAllFromDB)
router.get(
    "/:id",
    //   validateRequest(uuidParamSchema),
    TourController.getSingleTour
);
// router.post("/create-tour",
//     // fileUploader.upload.array("files"),
//     TourController.createTour)
router.post("/create-tour",
    fileUploader.upload.array("files"),
    auth(UserRole.GUIDE),
    (req: Request, res: Response, next: NextFunction) => {
        const parsedData = JSON.parse(req.body.data);

        req.body = createTourZodSchema.shape.body.parse(parsedData);
        return TourController.createTour(req, res, next)

    })
router.post(
    "/:id/check-availability",
    // validateRequest(checkAvailabilitySchema),
    TourController.checkAvailability
);
router.patch("/update-tour/:id",
    fileUploader.upload.array("files"),
    auth(UserRole.GUIDE),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = updateTourZodSchema.shape.body.parse(JSON.parse(req.body.data))
        return TourController.updateTour(req, res, next)

    })
router.patch("/update-tour-status",
    auth(UserRole.ADMIN),
    TourController.updatetourStatus)

router.delete(
    "/delete/:id",
    auth(UserRole.GUIDE),
    TourController.deleteTour
);
router.get(
    "/my/tours",
    auth(UserRole.GUIDE),
    TourController.getMyTours
);

export const TourRoutes = router