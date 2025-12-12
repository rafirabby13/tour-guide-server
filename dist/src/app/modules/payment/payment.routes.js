"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const enums_1 = require("../../../../prisma/generated/prisma/enums");
const router = express_1.default.Router();
// Protected Route: Only the tourist who owns the booking should call this
// (You might want to add validation logic inside the service to ensure ownership)
router.post('/initiate/:bookingId', (0, auth_1.default)(enums_1.UserRole.TOURIST), payment_controller_1.PaymentController.initiatePayment);
// We do NOT add the webhook route here usually, 
// because it requires different middleware parsing. 
// See app.ts Step below.
exports.PaymentRoutes = router;
