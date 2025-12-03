import express, { NextFunction, Request, Response } from "express"
import { UserController } from "./user.controller"
import { fileUploader } from "../../helpers/fileUploader"
import { CreateTouristSchema, UserBaseSchema } from "./user.validation"


const router = express.Router()

router.post("/create-tourist",
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
       req.body = CreateTouristSchema.parse(JSON.parse(req.body.data))
       return UserController.createTourist(req, res, next)
    }
)

export const UserRoutes = router