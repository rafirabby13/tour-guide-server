"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePricingOverlaps = void 0;
const AppError_1 = require("../errors/AppError");
const validatePricingOverlaps = (pricings) => {
    // 1. Sanity Check: Ensure individual tiers make sense
    pricings.forEach(tier => {
        if (tier.minGuests > tier.maxGuests) {
            throw new AppError_1.AppError(400, `Invalid tier: Min guests (${tier.minGuests}) cannot be greater than Max guests (${tier.maxGuests})`);
        }
    });
    // 2. Overlap Check
    for (let i = 0; i < pricings.length; i++) {
        for (let j = i + 1; j < pricings.length; j++) {
            const tier1 = pricings[i];
            const tier2 = pricings[j];
            // Simplified Overlap Logic
            // Two ranges overlap if (StartA <= EndB) AND (EndA >= StartB)
            const isOverlapping = tier1.minGuests <= tier2.maxGuests &&
                tier1.maxGuests >= tier2.minGuests;
            if (isOverlapping) {
                throw new AppError_1.AppError(400, `Pricing tiers overlap: [${tier1.minGuests}-${tier1.maxGuests}] and [${tier2.minGuests}-${tier2.maxGuests}]`);
            }
        }
    }
};
exports.validatePricingOverlaps = validatePricingOverlaps;
