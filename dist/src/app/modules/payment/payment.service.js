"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const index_env_1 = require("../../../config/index.env");
const prisma_1 = require("../../shared/prisma");
const AppError_1 = require("../../errors/AppError");
const enums_1 = require("../../../../prisma/generated/prisma/enums");
const payment_lib_1 = require("./payment.lib");
const initiatePayment = async (bookingId) => {
    // 1. Get Booking Data
    const booking = await prisma_1.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { tour: true, tourist: true },
    });
    if (!booking) {
        throw new AppError_1.AppError(404, 'Booking not found');
    }
    if (booking.paymentStatus === enums_1.PaymentStatus.SUCCESS) {
        throw new AppError_1.AppError(403, 'Booking is already paid');
    }
    // 2. Create Stripe Checkout Session
    const session = await payment_lib_1.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        // customer_email: booking.tourist., 
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: booking.tour.title,
                        description: `Booking for ${booking.date}`,
                        images: booking.tour.images ? [booking.tour.images[0]] : [],
                    },
                    unit_amount: Math.round(booking.totalPrice * 100), // Convert dollars to cents
                },
                quantity: 1,
            },
        ],
        // 3. Metadata is CRUCIAL for the webhook to know which booking to update
        metadata: {
            bookingId: booking.id,
        },
        success_url: `${index_env_1.config.stripe.client_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${index_env_1.config.stripe.client_url}/payment/failed`,
    });
    return {
        paymentUrl: session.url,
        sessionId: session.id,
    };
};
exports.PaymentService = {
    initiatePayment,
};
