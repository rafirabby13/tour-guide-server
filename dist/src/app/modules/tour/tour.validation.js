"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTourZodSchema = exports.createTourZodSchema = void 0;
const zod_1 = require("zod");
// --- Helpers ---
// Regex for HH:MM time format
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
// Helper to convert "09:30" -> 570 (minutes)
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};
// Helper to check if end time is after start time
const isValidTimeRange = (data) => {
    return timeToMinutes(data.endTime) > timeToMinutes(data.startTime);
};
// --- Sub-Schemas ---
const tourPricingSchema = zod_1.z.object({
    minGuests: zod_1.z.number().int().min(1, "Min guests must be at least 1"),
    maxGuests: zod_1.z.number().int().min(1, "Max guests must be at least 1"),
    pricePerHour: zod_1.z.number().positive("Price must be a positive number"),
}).refine((data) => data.maxGuests >= data.minGuests, {
    message: "Max guests must be greater than or equal to min guests",
    path: ["maxGuests"],
});
const tourAvailabilitySchema = zod_1.z.object({
    dayOfWeek: zod_1.z.number().int().min(0).max(6, "Day must be 0 (Sunday) to 6 (Saturday)"),
    // We accept string "HH:MM" from frontend and transform to minutes for backend
    startTime: zod_1.z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
    endTime: zod_1.z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
    maxBookings: zod_1.z.number().int().min(1).default(1),
    isActive: zod_1.z.boolean().default(true),
}).refine(isValidTimeRange, {
    message: "End time must be after start time",
    path: ["endTime"],
});
const blockedDateSchema = zod_1.z.object({
    blockedDate: zod_1.z.string().datetime("Must be a valid ISO date string"),
    // Uncomment and add validation if you re-enable these fields in Prisma
    // reason: z.string().optional(),
    // isAllDay: z.boolean().default(true),
});
// --- Main Schemas ---
exports.createTourZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, "Title is too short").max(255),
        description: zod_1.z.string().min(10, "Description is too short"),
        location: zod_1.z.string().min(2, "Location is required"),
        images: zod_1.z.array(zod_1.z.string().url()).default([]),
        // Status is optional on create, defaults to DRAFT in Prisma
        status: zod_1.z.enum(["BLOCKED", "DRAFT", "PUBLISHED"]).optional(),
        guideId: zod_1.z.string().uuid("Invalid Guide ID"),
        tourPricings: zod_1.z.array(tourPricingSchema).nonempty("At least one pricing tier is required"),
        tourAvailabilities: zod_1.z.array(tourAvailabilitySchema).nonempty("At least one availability slot is required"),
        blockedDates: zod_1.z.array(blockedDateSchema).optional(),
    }),
});
exports.updateTourZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).max(255).optional(),
        description: zod_1.z.string().min(10).optional(),
        location: zod_1.z.string().min(2).optional(),
        images: zod_1.z.array(zod_1.z.string().url()).optional(),
        status: zod_1.z.enum(["BLOCKED", "DRAFT", "PUBLISHED"]).optional(),
        // For updates, we usually replace the entire arrays or handle them via specific endpoints.
        // Assuming full replacement logic here:
        tourPricings: zod_1.z.array(tourPricingSchema).optional(),
        tourAvailabilities: zod_1.z.array(tourAvailabilitySchema).optional(),
        blockedDates: zod_1.z.array(blockedDateSchema).optional(),
    }),
});
