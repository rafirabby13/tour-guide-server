"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewValidation = void 0;
const zod_1 = require("zod");
const createReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        rating: zod_1.z.number()
            .int("Rating must be an integer")
            .min(1, "Rating must be at least 1")
            .max(5, "Rating must be at most 5"),
        comment: zod_1.z.string().optional(),
        bookingId: zod_1.z.string().uuid("Invalid booking ID"),
        tourId: zod_1.z.string().uuid("Invalid tour ID")
    })
});
const updateReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        rating: zod_1.z.number()
            .int("Rating must be an integer")
            .min(1, "Rating must be at least 1")
            .max(5, "Rating must be at most 5")
            .optional(),
        comment: zod_1.z.string().optional()
    })
});
exports.ReviewValidation = {
    createReviewSchema,
    updateReviewSchema
};
