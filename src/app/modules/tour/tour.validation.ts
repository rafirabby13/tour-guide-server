import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // 00:00 - 23:59

// ------- Pricing -------
const tourPricingSchema = z.object({
  minGuests: z.number().int().positive(),
  maxGuests: z.number().int().positive(),
  pricePerHour: z.number().positive(),
});

// ------- Weekly Availability -------
const tourAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, "Time must be HH:MM"),
  endTime: z.string().regex(timeRegex, "Time must be HH:MM"),
  maxBookings: z.number().int().min(1).default(1),
});

// ------- Blocked Dates -------
const blockedDateSchema = z.object({
  blockedDate: z.string().datetime("Must be valid ISO date"),
  startTime: z.string().regex(timeRegex, "Time must be HH:MM").optional(),
  endTime: z.string().regex(timeRegex, "Time must be HH:MM").optional(),
  isAllDay: z.boolean().default(true),
  reason: z.string().optional(),
});

// ------- MAIN TOUR SCHEMA -------
export const createTourSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(2),

  guideId: z.string().uuid(),

  availableDates: z
    .array(z.string().datetime("Must be ISO date"))
    .optional(),

  images: z.array(z.string().url()).default([]),

  tourPricings: z.array(tourPricingSchema).nonempty(),

  tourAvailabilities: z.array(tourAvailabilitySchema).optional(),

  blockedDates: z.array(blockedDateSchema).optional(),
});

export type CreateTourInput = z.infer<typeof createTourSchema>;
