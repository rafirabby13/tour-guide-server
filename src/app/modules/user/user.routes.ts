import express, { NextFunction, Request, Response } from "express"
import { UserController } from "./user.controller"
import { fileUploader } from "../../helpers/fileUploader"
import { CreateAdminSchema, CreateGuideSchema, CreateTouristSchema, UserBaseSchema, UserValidation } from "./user.validation"
import auth from "../../middlewares/auth"
import { UserRole } from "../../../../prisma/generated/prisma/enums"
import validateRequest from "../../middlewares/validateRequest"


const router = express.Router()


router.get("/all-users",
    auth(UserRole.ADMIN),
    UserController.getAllFromDB)
router.get(
    "/my-profile/me",
    auth(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN),
    UserController.getMyProfile
);
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
    auth(UserRole.ADMIN),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = CreateGuideSchema.parse(JSON.parse(req.body.data))
        return UserController.createGuide(req, res, next)
    }
)
router.patch(
    "/:userId/role",
    auth(UserRole.ADMIN),
    validateRequest(UserValidation.updateUserRoleSchema),
    UserController.updateUserRole
);

router.patch(
    "/:userId/update-status",
    auth(UserRole.ADMIN),
    UserController.UpdateUserStatus
);

router.delete(
    "/:userId",
    auth(UserRole.ADMIN),
    UserController.deleteUser
);

// Authenticated User Routes


router.patch(
    "/update-profile",
    auth(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = UserValidation.updateProfileSchema.parse(JSON.parse(req.body.data));
        }
        return UserController.updateMyProfile(req, res, next);
    }
);

router.post(
    "/change-password",
    auth(UserRole.GUIDE),
    validateRequest(UserValidation.changePasswordSchema),
    UserController.changePassword
);

// Get specific user profile (Public or Auth based on your requirement)
router.get(
    "/:userId",
    UserController.getUserProfile
);

// Admin can update any user
// router.patch(
//     "/:userId",
//     auth(UserRole.ADMIN),
//     fileUploader.upload.single('file'),
//     (req: Request, res: Response, next: NextFunction) => {
//         if (req.body.data) {
//             req.body = UserValidation.updateProfileSchema.parse(JSON.parse(req.body.data));
//         }
//         return UserController.updateUserProfile(req, res, next);
//     }
// );
export const UserRoutes = router