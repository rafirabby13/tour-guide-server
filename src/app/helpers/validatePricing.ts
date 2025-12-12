import { AppError } from "../errors/AppError";
import { CreateTourPayload } from "../modules/tour/tour.interface";

export const validatePricingOverlaps = (pricings: CreateTourPayload['tourPricings']) => {
  // 1. Sanity Check: Ensure individual tiers make sense
  pricings.forEach(tier => {
    if (tier.minGuests > tier.maxGuests) {
      throw new AppError(400, `Invalid tier: Min guests (${tier.minGuests}) cannot be greater than Max guests (${tier.maxGuests})`);
    }
  });

  // 2. Overlap Check
  for (let i = 0; i < pricings.length; i++) {
    for (let j = i + 1; j < pricings.length; j++) {
      const tier1 = pricings[i];
      const tier2 = pricings[j];

      // Simplified Overlap Logic
      // Two ranges overlap if (StartA <= EndB) AND (EndA >= StartB)
      const isOverlapping = 
        tier1.minGuests <= tier2.maxGuests && 
        tier1.maxGuests >= tier2.minGuests;

      if (isOverlapping) {
        throw new AppError(
          400, 
          `Pricing tiers overlap: [${tier1.minGuests}-${tier1.maxGuests}] and [${tier2.minGuests}-${tier2.maxGuests}]`
        );
      }
    }
  }
};