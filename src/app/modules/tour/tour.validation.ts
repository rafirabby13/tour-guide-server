import { z } from "zod";

// --- Helpers ---

// Regex for HH:MM time format
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Helper to convert "09:30" -> 570 (minutes)
const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper to check if end time is after start time
const isValidTimeRange = (data: { startTime: string; endTime: string }) => {
  return timeToMinutes(data.endTime) > timeToMinutes(data.startTime);
};

// --- Sub-Schemas ---

const tourPricingSchema = z.object({
  minGuests: z.number().int().min(1, "Min guests must be at least 1"),
  maxGuests: z.number().int().min(1, "Max guests must be at least 1"),
  pricePerHour: z.number().positive("Price must be a positive number"),
}).refine((data) => data.maxGuests >= data.minGuests, {
  message: "Max guests must be greater than or equal to min guests",
  path: ["maxGuests"],
});

const tourAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6, "Day must be 0 (Sunday) to 6 (Saturday)"),
  
  // We accept string "HH:MM" from frontend and transform to minutes for backend
  startTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
  
  maxBookings: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
}).refine(isValidTimeRange, {
  message: "End time must be after start time",
  path: ["endTime"],
});

const blockedDateSchema = z.object({
  blockedDate: z.string().datetime("Must be a valid ISO date string"),
  // Uncomment and add validation if you re-enable these fields in Prisma
  // reason: z.string().optional(),
  // isAllDay: z.boolean().default(true),
});

// --- Main Schemas ---

export const createTourZodSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title is too short").max(255),
    description: z.string().min(10, "Description is too short"),
    location: z.string().min(2, "Location is required"),
    images: z.array(z.string().url()).default([]),
    
    // Status is optional on create, defaults to DRAFT in Prisma
    status: z.enum(["BLOCKED", "DRAFT", "PUBLISHED"]).optional(),

    guideId: z.string().uuid("Invalid Guide ID"),

    tourPricings: z.array(tourPricingSchema).nonempty("At least one pricing tier is required"),
    
    tourAvailabilities: z.array(tourAvailabilitySchema).nonempty("At least one availability slot is required"),
    
    blockedDates: z.array(blockedDateSchema).optional(),
  }),
});

export const updateTourZodSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().min(10).optional(),
    location: z.string().min(2).optional(),
    images: z.array(z.string().url()).optional(),
    status: z.enum(["BLOCKED", "DRAFT", "PUBLISHED"]).optional(),
    
    // For updates, we usually replace the entire arrays or handle them via specific endpoints.
    // Assuming full replacement logic here:
    tourPricings: z.array(tourPricingSchema).optional(),
    tourAvailabilities: z.array(tourAvailabilitySchema).optional(),
    blockedDates: z.array(blockedDateSchema).optional(),
  }),
});

// --- Types for your Code ---
// Export these to use in your Frontend Forms or Backend Controllers
export type CreateTourInput = z.infer<typeof createTourZodSchema>['body'];
export type UpdateTourInput = z.infer<typeof updateTourZodSchema>['body'];