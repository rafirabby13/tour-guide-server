import { z } from "zod";

const createBookingZodSchema = z.object({
  body: z.object({
    tourId: z.string().uuid({
      message: "Tour ID must be a valid UUID",
    }),

    date: z.string().refine((val) => {
      // Validate string is a valid date (YYYY-MM-DD or ISO)
      return !isNaN(Date.parse(val));
    }, {
      message: "Invalid date format. Please use YYYY-MM-DD or ISO 8601",
    }).refine((val) => {
      // Optional: Ensure booking is for the future
      return new Date(val) > new Date();
    }, {
      message: "Booking date must be in the future",
    }),

    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Start time must be in HH:MM format (24-hour)",
    }),

    duration: z.number().positive({
      message: "Duration must be a positive number",
    }).max(24, { 
      message: "Duration cannot exceed 24 hours" 
    }),

    numGuests: z.number().int({
      message: "Number of guests must be an integer",
    }).min(1, {
      message: "At least 1 guest is required",
    }),
  }),
});

export const BookingValidation = {
  createBookingZodSchema,
};