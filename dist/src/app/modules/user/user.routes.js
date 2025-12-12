"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const fileUploader_1 = require("../../helpers/fileUploader");
const user_validation_1 = require("./user.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const enums_1 = require("../../../../prisma/generated/prisma/enums");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const router = express_1.default.Router();
router.get("/all-users", (0, auth_1.default)(enums_1.UserRole.ADMIN), user_controller_1.UserController.getAllFromDB);
router.get("/top-guides", user_controller_1.UserController.getTopGuides);
router.get("/get/guides", (0, auth_1.default)(enums_1.UserRole.ADMIN), user_controller_1.UserController.getAllGuides);
router.get("/my-profile/me", (0, auth_1.default)(enums_1.UserRole.TOURIST, enums_1.UserRole.GUIDE, enums_1.UserRole.ADMIN), user_controller_1.UserController.getMyProfile);
router.post("/create-tourist", fileUploader_1.fileUploader.upload.single('file'), (req, res, next) => {
    req.body = user_validation_1.CreateTouristSchema.parse(JSON.parse(req.body.data));
    return user_controller_1.UserController.createTourist(req, res, next);
});
router.post("/create-admin", (0, auth_1.default)(enums_1.UserRole.ADMIN), user_controller_1.UserController.createAdmin);
router.post("/create-guide", (0, auth_1.default)(enums_1.UserRole.ADMIN), fileUploader_1.fileUploader.upload.single('file'), (req, res, next) => {
    req.body = user_validation_1.CreateGuideSchema.parse(JSON.parse(req.body.data));
    return user_controller_1.UserController.createGuide(req, res, next);
});
router.patch("/:userId/role", (0, auth_1.default)(enums_1.UserRole.ADMIN), (0, validateRequest_1.default)(user_validation_1.UserValidation.updateUserRoleSchema), user_controller_1.UserController.updateUserRole);
router.patch("/:userId/update-status", (0, auth_1.default)(enums_1.UserRole.ADMIN), user_controller_1.UserController.UpdateUserStatus);
router.delete("/:userId", (0, auth_1.default)(enums_1.UserRole.ADMIN), user_controller_1.UserController.deleteUser);
// Authenticated User Routes
router.patch("/update-profile", (0, auth_1.default)(enums_1.UserRole.TOURIST, enums_1.UserRole.GUIDE, enums_1.UserRole.ADMIN), fileUploader_1.fileUploader.upload.single('file'), (req, res, next) => {
    if (req.body.data) {
        req.body = user_validation_1.UserValidation.updateProfileSchema.parse(JSON.parse(req.body.data));
    }
    return user_controller_1.UserController.updateMyProfile(req, res, next);
});
router.post("/change-password", (0, auth_1.default)(enums_1.UserRole.GUIDE), (0, validateRequest_1.default)(user_validation_1.UserValidation.changePasswordSchema), user_controller_1.UserController.changePassword);
// Get specific user profile (Public or Auth based on your requirement)
router.get("/:userId", user_controller_1.UserController.getUserProfile);
router.post("/become-a-guide", (0, auth_1.default)(enums_1.UserRole.TOURIST), user_controller_1.UserController.becomeAGuide);
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
exports.UserRoutes = router;
