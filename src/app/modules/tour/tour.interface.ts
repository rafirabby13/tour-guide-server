// tour/tour.interface.ts

export interface TourPricingInput {
  minGuests: number;
  maxGuests: number;
  pricePerHour: number;
}

export interface TourAvailabilityInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxBookings: number;
}

export interface BlockedDateInput {
  blockedDate: string | Date;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  reason?: string;
}

export interface CreateTourPayload {
  title: string;
  description: string;
  location: string;
  availableDates?: string[] | Date[];
  images?: string[];
  
  tourPricings: TourPricingInput[];
  tourAvailabilities: TourAvailabilityInput[];
  blockedDates?: BlockedDateInput[];
}

export interface UpdateTourPayload extends Partial<CreateTourPayload> {}

export interface TourSearchFilters {
  location?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}