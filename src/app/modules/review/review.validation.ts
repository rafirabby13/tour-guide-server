import { z } from "zod";

const createReviewSchema = z.object({
    body: z.object({
        rating: z.number()
            .int("Rating must be an integer")
            .min(1, "Rating must be at least 1")
            .max(5, "Rating must be at most 5"),
        comment: z.string().optional(),
        bookingId: z.string().uuid("Invalid booking ID")
    })
});

const updateReviewSchema = z.object({
    body: z.object({
        rating: z.number()
            .int("Rating must be an integer")
            .min(1, "Rating must be at least 1")
            .max(5, "Rating must be at most 5")
            .optional(),
        comment: z.string().optional()
    })
});

export const ReviewValidation = {
    createReviewSchema,
    updateReviewSchema
};