import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../../prisma/generated/prisma/enums';

const router = express.Router();

// Protected Route: Only the tourist who owns the booking should call this
// (You might want to add validation logic inside the service to ensure ownership)
router.post(
  '/initiate/:bookingId',
  auth(UserRole.TOURIST),
  PaymentController.initiatePayment
);

// We do NOT add the webhook route here usually, 
// because it requires different middleware parsing. 
// See app.ts Step below.

export const PaymentRoutes = router;