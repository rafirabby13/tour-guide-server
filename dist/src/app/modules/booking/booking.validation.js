"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingValidation = exports.getBookingsQuerySchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../../../prisma/generated/prisma/enums");
const createBookingZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        tourId: zod_1.z.string().uuid({
            message: "Tour ID must be a valid UUID",
        }),
        date: zod_1.z.string().refine((val) => {
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
        startTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
            message: "Start time must be in HH:MM format (24-hour)",
        }),
        duration: zod_1.z.number().positive({
            message: "Duration must be a positive number",
        }).max(24, {
            message: "Duration cannot exceed 24 hours"
        }),
        numGuests: zod_1.z.number().int({
            message: "Number of guests must be an integer",
        }).min(1, {
            message: "At least 1 guest is required",
        }),
    }),
});
exports.getBookingsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.nativeEnum(enums_1.BookingStatus).optional(),
        tourId: zod_1.z.string().uuid().optional(),
        touristId: zod_1.z.string().uuid().optional(),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
        page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().positive()).optional(),
        limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().positive()).optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    })
});
exports.BookingValidation = {
    createBookingZodSchema,
    getBookingsQuerySchema: exports.getBookingsQuerySchema
};
