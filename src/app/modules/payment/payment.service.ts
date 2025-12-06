import Stripe from 'stripe';
import { config } from '../../../config/index.env';
import { prisma } from '../../shared/prisma';
import { AppError } from '../../errors/AppError';
import { PaymentStatus } from '../../../../prisma/generated/prisma/enums';
import { stripe } from './payment.lib';



const initiatePayment = async (bookingId: string) => {
  // 1. Get Booking Data
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tour: true, tourist: true },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  if (booking.paymentStatus === PaymentStatus.SUCCESS) {
    throw new AppError(403, 'Booking is already paid');
  }

  // 2. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
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
    success_url: `${config.stripe.client_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.stripe.client_url}/payment/failed`,
  });

  return {
    paymentUrl: session.url,
    sessionId: session.id,
  };
};

export const PaymentService = {
  initiatePayment,
};