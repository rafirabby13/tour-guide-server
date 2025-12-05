import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Sub-schemas
const tourPricingSchema = z.object({
  minGuests: z.number().int().positive("Min guests must be positive"),
  maxGuests: z.number().int().positive("Max guests must be positive"),
  pricePerHour: z.number().positive("Price must be positive"),
}).refine(
  (data) => data.maxGuests >= data.minGuests,
  { message: "Max guests must be >= min guests" }
);

const tourAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6, "Day must be 0-6"),
  startTime: z.string().regex(timeRegex, "Time must be HH:MM format"),
  endTime: z.string().regex(timeRegex, "Time must be HH:MM format"),
  maxBookings: z.number().int().min(1, "Max bookings must be at least 1").default(1),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: "End time must be after start time" }
);

const blockedDateSchema = z.object({
  blockedDate: z.string().datetime("Must be valid ISO date"),
  startTime: z.string().regex(timeRegex, "Time must be HH:MM").optional(),
  endTime: z.string().regex(timeRegex, "Time must be HH:MM").optional(),
  isAllDay: z.boolean().default(true),
  reason: z.string().max(255, "Reason too long").optional(),
});

// Create Tour
export const createTourSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().min(2, "Location required"),
    
    guideId: z.string().uuid("Invalid guide ID"),
    
    availableDates: z
      .array(z.string().datetime("Must be ISO date"))
      .optional(),
    
    images: z.array(z.string()).default([]),
    
    tourPricings: z
      .array(tourPricingSchema)
      .nonempty("At least one pricing tier required"),
    
    tourAvailabilities: z
      .array(tourAvailabilitySchema)
      .nonempty("At least one availability slot required"),
    
    blockedDates: z.array(blockedDateSchema).optional(),
  })
});

// Update Tour
export const updateTourSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    location: z.string().min(2).optional(),
    
    availableDates: z.array(z.string().datetime()).optional(),
    images: z.array(z.string()).optional(),
    
    tourPricings: z.array(tourPricingSchema).optional(),
    tourAvailabilities: z.array(tourAvailabilitySchema).optional(),
    blockedDates: z.array(blockedDateSchema).optional(),
  })
});

// Get Tours Query
export const getTourQuerySchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    location: z.string().optional(),
    guideId: z.string().uuid().optional(),
    minPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
    maxPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
    minRating: z.string().transform(Number).pipe(z.number().min(0).max(5)).optional(),
    available: z.string().transform(val => val === 'true').optional(),
    page: z.string().transform(Number).pipe(z.number().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().positive()).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
});

// UUID Param
export const uuidParamSchema = z.object({
  
    id: z.string()
  
});

// Check Availability
export const checkAvailabilitySchema = z.object({
  body: z.object({
    date: z.string().datetime("Must be valid ISO date"),
    guestCount: z.number().int().positive("Guest count must be positive"),
    startTime: z.string().regex(timeRegex).optional(),
    endTime: z.string().regex(timeRegex).optional(),
  })
});

export type CreateTourInput = z.infer<typeof createTourSchema>['body'];
export type UpdateTourInput = z.infer<typeof updateTourSchema>['body'];
export type GetTourQuery = z.infer<typeof getTourQuerySchema>['query'];
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>['body'];