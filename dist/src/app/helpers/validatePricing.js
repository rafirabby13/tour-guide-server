import { AppError } from "../errors/AppError";
export const validatePricingOverlaps = (pricings) => {
    for (let i = 0; i < pricings.length; i++) {
        for (let j = i + 1; j < pricings.length; j++) {
            const tier1 = pricings[i];
            const tier2 = pricings[j];
            if ((tier1.minGuests <= tier2.maxGuests && tier1.maxGuests >= tier2.minGuests) ||
                (tier2.minGuests <= tier1.maxGuests && tier2.maxGuests >= tier1.minGuests)) {
                throw new AppError(400, `Pricing tiers overlap: ${tier1.minGuests}-${tier1.maxGuests} and ${tier2.minGuests}-${tier2.maxGuests}`);
            }
        }
    }
};
