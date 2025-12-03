import express, { NextFunction, Request, Response } from "express"
import { UserController } from "./user.controller"
import { fileUploader } from "../../helpers/fileUploader"
import { CreateAdminSchema, CreateTouristSchema, UserBaseSchema } from "./user.validation"
import auth from "../../middlewares/auth"
import { UserRole } from "../../../../prisma/generated/prisma/enums"


const router = express.Router()


router.get("/all-users",
    auth(UserRole.ADMIN),
    UserController.getAllFromDB)
router.post("/create-tourist",
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = CreateTouristSchema.parse(JSON.parse(req.body.data))
        return UserController.createTourist(req, res, next)
    }
)
router.post("/create-admin",
    auth(UserRole.ADMIN),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = CreateAdminSchema.parse(JSON.parse(req.body.data))
        return UserController.createAdmin(req, res, next)
    }
)
router.post("/create-guide",
    auth(UserRole.GUIDE),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = CreateTouristSchema.parse(JSON.parse(req.body.data))
        return UserController.createGuide(req, res, next)
    }
)

export const UserRoutes = router