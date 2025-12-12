"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourRoutes = void 0;
const express_1 = __importDefault(require("express"));
const tour_controller_1 = require("./tour.controller");
const fileUploader_1 = require("../../helpers/fileUploader");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const enums_1 = require("../../../../prisma/generated/prisma/enums");
const tour_validation_1 = require("./tour.validation");
const router = express_1.default.Router();
router.get('/popular/destinations', tour_controller_1.TourController.getPopularDestinations);
router.get("/all-tours", tour_controller_1.TourController.getAllFromDB);
router.get("/:id", 
//   validateRequest(uuidParamSchema),
tour_controller_1.TourController.getSingleTour);
// router.post("/create-tour",
//     // fileUploader.upload.array("files"),
//     TourController.createTour)
router.post("/create-tour", fileUploader_1.fileUploader.upload.array("files"), (0, auth_1.default)(enums_1.UserRole.GUIDE), (req, res, next) => {
    const parsedData = JSON.parse(req.body.data);
    req.body = tour_validation_1.createTourZodSchema.shape.body.parse(parsedData);
    return tour_controller_1.TourController.createTour(req, res, next);
});
router.post("/:id/check-availability", 
// validateRequest(checkAvailabilitySchema),
tour_controller_1.TourController.checkAvailability);
router.patch("/update-tour/:id", fileUploader_1.fileUploader.upload.array("files"), (0, auth_1.default)(enums_1.UserRole.GUIDE), (req, res, next) => {
    req.body = tour_validation_1.updateTourZodSchema.shape.body.parse(JSON.parse(req.body.data));
    return tour_controller_1.TourController.updateTour(req, res, next);
});
router.patch("/update-tour-status", (0, auth_1.default)(enums_1.UserRole.ADMIN), tour_controller_1.TourController.updatetourStatus);
router.delete("/delete/:id", (0, auth_1.default)(enums_1.UserRole.GUIDE), tour_controller_1.TourController.deleteTour);
router.get("/my/tours", (0, auth_1.default)(enums_1.UserRole.GUIDE), tour_controller_1.TourController.getMyTours);
exports.TourRoutes = router;
