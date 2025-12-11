import { Request, Response } from 'express';
import { config } from '../../../config/index.env';
import { prisma } from '../../shared/prisma';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { PaymentService } from './payment.service';
import httpStatus from 'http-status';
import { stripe } from './payment.lib';
import Stripe from 'stripe';
import { BookingStatus, PaymentStatus } from '../../../../prisma/generated/prisma/enums';



// 1. Initiate Payment Controller
const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  console.log(bookingId)
  const result = await PaymentService.initiatePayment(bookingId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment session initiated',
    // data: {},
    data: result,
  });
});

// 2. Webhook Controller (The tricky part)
const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      config.stripe.stripe_webhook_secret as string
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event

  console.log("🔥 Webhook HIT");
  console.log("Event type:", event.type);
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log({ session })
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      // Use Transaction to update both Booking and Payment tables safely
      await prisma.$transaction(async (tx) => {
        // Update Booking Status
        console.log("booking id from webhook event....", { bookingId })
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: PaymentStatus.SUCCESS,
            status: BookingStatus.CONFIRMED,
          },
        });


        await tx.payment.update({
          where: { bookingId },
          data: {
            status: PaymentStatus.SUCCESS,
            paymentGatewayData: session as any, // Store full json for debugging
          },
        });
      });
    }
  }

  res.json({ received: true });
};

export const PaymentController = {
  initiatePayment,
  handleWebhook,
};