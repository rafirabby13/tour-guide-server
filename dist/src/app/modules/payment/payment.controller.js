"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const index_env_1 = require("../../../config/index.env");
const prisma_1 = require("../../shared/prisma");
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const payment_service_1 = require("./payment.service");
const http_status_1 = __importDefault(require("http-status"));
const payment_lib_1 = require("./payment.lib");
const enums_1 = require("../../../../prisma/generated/prisma/enums");
// 1. Initiate Payment Controller
const initiatePayment = (0, catchAsync_1.default)(async (req, res) => {
    const { bookingId } = req.params;
    console.log(bookingId);
    const result = await payment_service_1.PaymentService.initiatePayment(bookingId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Payment session initiated',
        // data: {},
        data: result,
    });
});
// 2. Webhook Controller (The tricky part)
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = payment_lib_1.stripe.webhooks.constructEvent(req.body, sig, index_env_1.config.stripe.stripe_webhook_secret);
    }
    catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle the event
    console.log("🔥 Webhook HIT");
    console.log("Event type:", event.type);
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log({ session });
        const bookingId = session.metadata?.bookingId;
        if (bookingId) {
            // Use Transaction to update both Booking and Payment tables safely
            await prisma_1.prisma.$transaction(async (tx) => {
                // Update Booking Status
                console.log("booking id from webhook event....", { bookingId });
                await tx.booking.update({
                    where: { id: bookingId },
                    data: {
                        paymentStatus: enums_1.PaymentStatus.SUCCESS,
                        status: enums_1.BookingStatus.CONFIRMED,
                    },
                });
                await tx.payment.update({
                    where: { bookingId },
                    data: {
                        status: enums_1.PaymentStatus.SUCCESS,
                        paymentGatewayData: session, // Store full json for debugging
                    },
                });
            });
        }
    }
    res.json({ received: true });
};
exports.PaymentController = {
    initiatePayment,
    handleWebhook,
};
